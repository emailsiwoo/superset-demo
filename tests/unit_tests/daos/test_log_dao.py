# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
from __future__ import annotations

from datetime import datetime, timedelta
from unittest.mock import patch

import pytest
from sqlalchemy.orm.session import Session

from superset.daos.log import LogDAO
from superset.models.core import Log
from superset.models.dashboard import Dashboard
from superset.models.slice import Slice


@pytest.fixture(autouse=True)
def _create_tables(session: Session) -> None:
    Dashboard.metadata.create_all(session.get_bind())
    Slice.metadata.create_all(session.get_bind())
    Log.metadata.create_all(session.get_bind())


def _create_dashboard(
    session: Session,
    title: str | None,
    slug: str | None = None,
) -> Dashboard:
    dashboard = Dashboard(
        dashboard_title=title,
        slug=slug,
        published=True,
    )
    session.add(dashboard)
    session.flush()
    return dashboard


def _create_slice(
    session: Session,
    name: str | None,
) -> Slice:
    slc = Slice(
        slice_name=name,
        datasource_type="table",
        viz_type="table",
    )
    session.add(slc)
    session.flush()
    return slc


def _create_log(
    session: Session,
    user_id: int,
    dashboard_id: int | None = None,
    slice_id: int | None = None,
    action: str = "log",
    json_str: str = '{"event_name": "mount_dashboard"}',
    dttm: datetime | None = None,
) -> Log:
    log = Log(
        action=action,
        user_id=user_id,
        dashboard_id=dashboard_id,
        slice_id=slice_id,
        json=json_str,
        dttm=dttm or datetime.now(),
    )
    session.add(log)
    session.flush()
    return log


@patch("superset.daos.log.get_user_id", return_value=1)
def test_recent_activity_excludes_null_dashboard_title(
    mock_get_user_id: object,
    session: Session,
) -> None:
    """Entries with a NULL dashboard_title should be excluded from results."""
    titled_dash = _create_dashboard(session, title="My Dashboard", slug="my-dash")
    null_title_dash = _create_dashboard(session, title=None, slug="no-title")

    _create_log(session, user_id=1, dashboard_id=titled_dash.id)
    _create_log(session, user_id=1, dashboard_id=null_title_dash.id)
    session.commit()

    results = LogDAO.get_recent_activity(
        actions=["mount_dashboard"],
        distinct=False,
        page=0,
        page_size=50,
    )

    titles = [r["item_title"] for r in results]
    assert "My Dashboard" in titles
    assert None not in titles


@patch("superset.daos.log.get_user_id", return_value=1)
def test_recent_activity_excludes_empty_dashboard_title(
    mock_get_user_id: object,
    session: Session,
) -> None:
    """Entries with an empty-string dashboard_title should be excluded."""
    titled_dash = _create_dashboard(session, title="Valid Title", slug="valid")
    empty_title_dash = _create_dashboard(session, title="", slug="empty")

    _create_log(session, user_id=1, dashboard_id=titled_dash.id)
    _create_log(session, user_id=1, dashboard_id=empty_title_dash.id)
    session.commit()

    results = LogDAO.get_recent_activity(
        actions=["mount_dashboard"],
        distinct=False,
        page=0,
        page_size=50,
    )

    titles = [r["item_title"] for r in results]
    assert "Valid Title" in titles
    assert "" not in titles


@patch("superset.daos.log.get_user_id", return_value=1)
def test_recent_activity_excludes_null_slice_name(
    mock_get_user_id: object,
    session: Session,
) -> None:
    """Entries with a NULL slice_name should be excluded from results."""
    named_slice = _create_slice(session, name="My Chart")
    null_name_slice = _create_slice(session, name=None)

    _create_log(
        session,
        user_id=1,
        slice_id=named_slice.id,
        json_str='{"event_name": "mount_explorer"}',
    )
    _create_log(
        session,
        user_id=1,
        slice_id=null_name_slice.id,
        json_str='{"event_name": "mount_explorer"}',
    )
    session.commit()

    results = LogDAO.get_recent_activity(
        actions=["mount_explorer"],
        distinct=False,
        page=0,
        page_size=50,
    )

    titles = [r["item_title"] for r in results]
    assert "My Chart" in titles
    # Null-named slices should be excluded entirely
    item_types = [r["item_type"] for r in results]
    assert item_types.count("slice") == 1


@patch("superset.daos.log.get_user_id", return_value=1)
def test_recent_activity_distinct_excludes_null_titles(
    mock_get_user_id: object,
    session: Session,
) -> None:
    """The distinct=True code path should also exclude null/empty titles."""
    titled_dash = _create_dashboard(session, title="Good Dashboard", slug="good")
    null_title_dash = _create_dashboard(session, title=None, slug="bad")

    _create_log(
        session,
        user_id=1,
        dashboard_id=titled_dash.id,
        dttm=datetime.now() - timedelta(days=1),
    )
    _create_log(
        session,
        user_id=1,
        dashboard_id=null_title_dash.id,
        dttm=datetime.now() - timedelta(days=2),
    )
    session.commit()

    results = LogDAO.get_recent_activity(
        actions=["mount_dashboard"],
        distinct=True,
        page=0,
        page_size=50,
    )

    titles = [r["item_title"] for r in results]
    assert "Good Dashboard" in titles
    assert None not in titles
