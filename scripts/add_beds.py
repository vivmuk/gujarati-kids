#!/usr/bin/env python3
"""
Lay the story music bed under films that were built before the bed existed.

Video is stream-copied, so this costs seconds per film and never touches the
pictures. Already-beded films are skipped by checking for a loud second audio
stream — simpler and safer: films built with a bed are always newer than the
bed file itself, so mtime comparison decides.

Usage:
  python3 scripts/add_beds.py            # every film older than the bed
  python3 scripts/add_beds.py --all      # re-lay the bed on every film
"""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "public" / "videos"
BED = ROOT / "public" / "audio" / "bed-story.mp3"


def seconds(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    try:
        return float(out)
    except ValueError:
        return 0.0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true")
    args = ap.parse_args()

    if not BED.exists():
        print("no bed at", BED)
        return 1

    bed_time = BED.stat().st_mtime
    films = sorted(VIDEOS.glob("story-*.mp4"))
    todo = [f for f in films if args.all or f.stat().st_mtime < bed_time]
    print(f"{len(films)} films, {len(todo)} need the bed")

    for n, film in enumerate(todo, 1):
        total = seconds(film)
        fade_at = max(0.0, total - 3.0)
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
            out = Path(tmp.name)
        try:
            subprocess.run(
                ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                 "-i", str(film), "-stream_loop", "-1", "-i", str(BED),
                 "-filter_complex",
                 f"[1:a]aresample=48000,volume=0.16,afade=t=in:st=0:d=2.5,"
                 f"afade=t=out:st={fade_at:.3f}:d=3[bed];"
                 f"[0:a][bed]amix=inputs=2:duration=first:normalize=0[a]",
                 "-map", "0:v", "-map", "[a]",
                 "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
                 "-movflags", "+faststart", str(out)],
                check=True,
            )
            out.replace(film)
            print(f"  [{n}/{len(todo)}] ✓ {film.name}")
        except subprocess.CalledProcessError as exc:
            print(f"  [{n}/{len(todo)}] ✗ {film.name}: {exc}")
        finally:
            out.unlink(missing_ok=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
