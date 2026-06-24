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
import flask
import flask_sqlalchemy
import pytest


def test_flask_version_is_3x():
    major = int(flask.__version__.split(".")[0])
    assert major >= 3, f"Flask must be 3.x or later, got {flask.__version__}"


def test_flask_sqlalchemy_version_is_3x():
    major = int(flask_sqlalchemy.__version__.split(".")[0])
    assert major >= 3, (
        f"Flask-SQLAlchemy must be 3.x or later, got {flask_sqlalchemy.__version__}"
    )


def test_deprecated_flask_imports_removed():
    """Verify removed Flask 2.x APIs are no longer importable."""
    with pytest.raises(ImportError):
        from flask import Markup  # noqa: F401

    with pytest.raises(ImportError):
        from flask.json import JSONEncoder  # noqa: F401


def test_flask_sqlalchemy_basequery_removed():
    """BaseQuery was removed from top-level flask_sqlalchemy in 3.x."""
    assert not hasattr(flask_sqlalchemy, "BaseQuery")
