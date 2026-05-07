"""Lightweight factory-structure check.

Verifies that the repository follows the Software Factory layout:
- AGENTS.md, SDD.md, DESIGN.md, ROLES.md exist
- specs/use-cases/ contains at least one spec
- mcp/policy.md exists
- apps/service/ and apps/web/ exist

Run with: python scripts/validate_factory.py
Exits non-zero on failure so CI can gate merges.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

REQUIRED_FILES = [
    "AGENTS.md",
    "SDD.md",
    "DESIGN.md",
    "ROLES.md",
    "README.md",
    "mcp/policy.md",
]

REQUIRED_DIRS = [
    "specs/use-cases",
    "plans",
    "apps/service",
    "apps/web",
    ".agents/skills",
    "docs",
    "evals",
]


def main() -> int:
    failures: list[str] = []

    for rel in REQUIRED_FILES:
        if not (ROOT / rel).is_file():
            failures.append(f"missing file: {rel}")

    for rel in REQUIRED_DIRS:
        if not (ROOT / rel).is_dir():
            failures.append(f"missing directory: {rel}")

    specs = list((ROOT / "specs/use-cases").glob("use-case-*.md")) if (ROOT / "specs/use-cases").is_dir() else []
    if not specs:
        failures.append("specs/use-cases/ contains no use-case-*.md files")

    if failures:
        print("Factory validation FAILED:")
        for f in failures:
            print(f"  - {f}")
        return 1

    print(f"Factory validation OK ({len(specs)} specs found).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
