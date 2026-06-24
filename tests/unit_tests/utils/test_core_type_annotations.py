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
import ast
from pathlib import Path

import pytest

CORE_PY = Path(__file__).resolve().parents[3] / "superset" / "utils" / "core.py"


def _get_public_functions() -> list[tuple[str, int]]:
    """Return (name, lineno) for every public top-level function in core.py."""
    tree = ast.parse(CORE_PY.read_text())
    return [
        (node.name, node.lineno)
        for node in ast.iter_child_nodes(tree)
        if isinstance(node, ast.FunctionDef) and not node.name.startswith("_")
    ]


def _get_all_functions() -> list[tuple[str, int]]:
    """Return (name, lineno) for every function/method in core.py."""
    tree = ast.parse(CORE_PY.read_text())
    results: list[tuple[str, int]] = []
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            results.append((node.name, node.lineno))
    return results


@pytest.mark.parametrize(
    "func_name,lineno",
    _get_public_functions(),
    ids=[name for name, _ in _get_public_functions()],
)
def test_public_functions_have_return_type(func_name: str, lineno: int) -> None:
    """Every public function in superset.utils.core must have a return type annotation."""
    tree = ast.parse(CORE_PY.read_text())
    for node in ast.iter_child_nodes(tree):
        if (
            isinstance(node, ast.FunctionDef)
            and node.name == func_name
            and node.lineno == lineno
        ):
            assert node.returns is not None, (
                f"{func_name} (line {lineno}) is missing a return type annotation"
            )
            return
    pytest.fail(f"Could not find function {func_name} at line {lineno}")


@pytest.mark.parametrize(
    "func_name,lineno",
    _get_all_functions(),
    ids=[f"{name}_L{lineno}" for name, lineno in _get_all_functions()],
)
def test_all_functions_have_return_type(func_name: str, lineno: int) -> None:
    """Every function (public, private, method) in core.py must have a return type."""
    tree = ast.parse(CORE_PY.read_text())
    for node in ast.walk(tree):
        if (
            isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
            and node.name == func_name
            and node.lineno == lineno
        ):
            assert node.returns is not None, (
                f"{func_name} (line {lineno}) is missing a return type annotation"
            )
            return
    pytest.fail(f"Could not find function {func_name} at line {lineno}")


def test_no_optional_import_in_core() -> None:
    """typing.Optional should not be imported; use X | None syntax instead."""
    tree = ast.parse(CORE_PY.read_text())
    for node in ast.walk(tree):
        if isinstance(node, ast.ImportFrom) and node.module == "typing":
            imported_names = [alias.name for alias in node.names]
            assert "Optional" not in imported_names, (
                "typing.Optional is imported in core.py; use X | None syntax instead"
            )


def test_no_optional_annotations_in_core() -> None:
    """No function signature should use Optional[X]; use X | None instead."""
    tree = ast.parse(CORE_PY.read_text())
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            if node.returns:
                ret_str = ast.unparse(node.returns)
                assert "Optional" not in ret_str, (
                    f"{node.name} (line {node.lineno}) uses Optional in return type; "
                    f"use X | None instead"
                )
            for arg in node.args.args + node.args.kwonlyargs:
                if arg.annotation:
                    ann_str = ast.unparse(arg.annotation)
                    assert "Optional" not in ann_str, (
                        f"{node.name} (line {node.lineno}) parameter '{arg.arg}' "
                        f"uses Optional; use X | None instead"
                    )


def test_public_function_count() -> None:
    """Guard against accidentally removing public functions."""
    funcs = _get_public_functions()
    assert len(funcs) >= 70, (
        f"Expected at least 70 public functions, found {len(funcs)}"
    )
