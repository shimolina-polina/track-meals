#!/usr/bin/env python3
"""Inject a release signing config into an Expo-generated Android build.gradle.

Expo prebuild generates ``android/app/build.gradle`` with a ``debug`` signing
config only, and the ``release`` build type reuses ``signingConfigs.debug``.
This script inserts a ``release`` signing config that reads credentials from
Gradle properties (populated in CI from GitHub secrets) and wires it into the
``release`` build type.

Usage: python3 scripts/ci-configure-signing.py [path/to/build.gradle]
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

DEFAULT_GRADLE_PATH = "android/app/build.gradle"

RELEASE_SIGNING_CONFIG = """
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
            }
        }
"""


def _find_block(text: str, header: str, start: int) -> tuple[int, int]:
    """Return (content_start, content_end) of a brace block beginning at start."""
    depth = 1
    i = start
    while i < len(text) and depth:
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
        i += 1
    if depth != 0:
        raise ValueError(f"Unbalanced braces while scanning block: {header}")
    return start, i - 1


def configure(path: Path) -> None:
    text = path.read_text()

    if "signingConfigs {" not in text:
        raise SystemExit("signingConfigs block not found in build.gradle")

    if "signingConfigs.release" in text:
        raise SystemExit(
            "Release signing appears configured already; inspect build.gradle"
        )

    text, count = re.subn(
        r"(signingConfigs\s*\{)",
        r"\1" + RELEASE_SIGNING_CONFIG,
        text,
        count=1,
    )
    if count != 1:
        raise SystemExit("Failed to insert the release signingConfig")

    match = re.search(r"buildTypes\s*\{", text)
    if not match:
        raise SystemExit("buildTypes block not found in build.gradle")

    build_types_start, build_types_end = _find_block(text, "buildTypes", match.end())
    build_types = text[build_types_start:build_types_end]

    release_match = re.search(r"\brelease\s*\{", build_types)
    if not release_match:
        raise SystemExit("release build type not found in build.gradle")

    release_start, release_end = _find_block(build_types, "release", release_match.end())
    release_block = build_types[release_start:release_end]

    release_block = re.sub(
        r"signingConfig\s+signingConfigs\.debug",
        "signingConfig signingConfigs.release",
        release_block,
    )
    if "signingConfig signingConfigs.release" not in release_block:
        release_block = (
            "\n            signingConfig signingConfigs.release" + release_block
        )

    build_types = (
        build_types[:release_start] + release_block + build_types[release_end:]
    )
    text = text[:build_types_start] + build_types + text[build_types_end:]

    path.write_text(text)
    print("Release signing configured")


def main() -> None:
    gradle_path = Path(sys.argv[1] if len(sys.argv) > 1 else DEFAULT_GRADLE_PATH)
    if not gradle_path.is_file():
        raise SystemExit(f"build.gradle not found at {gradle_path}")
    configure(gradle_path)


if __name__ == "__main__":
    main()
