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

from datetime import datetime, timezone

from superset.models.dashboard import Dashboard


def test_dashboard_link_escapes_slug() -> None:
    """dashboard_link must HTML-escape the user-controlled slug in the href.

    The slug can carry markup via the import path (which does not run the REST
    API's slug sanitization), so the rendered FAB list-view link must escape it.
    """
    dash = Dashboard()
    dash.id = 1
    dash.dashboard_title = "My Dashboard"
    dash.slug = '"><script>alert(1)</script>'

    link = str(dash.dashboard_link())

    # The injected script tag / attribute breakout must be escaped away.
    assert "<script>" not in link
    assert '"><script' not in link
    # The legitimate anchor markup is still present.
    assert link.startswith("<a href=")
    assert "My Dashboard" in link


def test_dashboard_link_renders_plain_slug() -> None:
    """A normal slug renders a working link."""
    dash = Dashboard()
    dash.id = 7
    dash.dashboard_title = "Sales"
    dash.slug = "sales"

    link = str(dash.dashboard_link())

    assert "/superset/dashboard/sales/" in link
    assert "Sales" in link


def test_dashboard_data_last_modified_time_naive_datetime() -> None:
    """Dashboard.data treats naive changed_on as UTC when computing the epoch.

    Calling .timestamp() on a naive datetime assumes the local timezone, which
    produces wrong results on servers not set to UTC. The fix explicitly treats
    naive datetimes as UTC before calling .timestamp().
    """
    dash = Dashboard()
    dash.id = 1
    dash.dashboard_title = "Test"
    dash.published = False
    dash.is_managed_externally = False
    # Naive datetime — no tzinfo
    dash.changed_on = datetime(2025, 1, 1, 0, 0, 0)

    data = dash.data
    expected = datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc).timestamp()
    assert data["last_modified_time"] == expected


def test_dashboard_data_last_modified_time_aware_datetime() -> None:
    """Dashboard.data preserves the timezone of an already-aware changed_on."""
    dash = Dashboard()
    dash.id = 2
    dash.dashboard_title = "Aware"
    dash.published = False
    dash.is_managed_externally = False
    aware_dt = datetime(2025, 6, 15, 12, 30, 45, tzinfo=timezone.utc)
    dash.changed_on = aware_dt

    data = dash.data
    expected = aware_dt.replace(microsecond=0).timestamp()
    assert data["last_modified_time"] == expected
