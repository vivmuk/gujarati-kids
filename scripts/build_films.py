#!/usr/bin/env python3
"""
Build narrated story films locally — no API calls.

The Venice-generated per-shot clips cost money and minutes per story, so 42 of
48 stories had no film at all. This builder assembles a real film from assets
that are already on disk: the story's own illustrations, its Gujarati narration,
and (when present) a synthesised moral line and a music bed.

Per film:
  TITLE   framed cover art, Gujarati title + English subtitle, title narration
  BEAT 1..N  one slow Ken Burns move on that line's illustration, held exactly
             as long as its narration, with a beat of silence after
  MORAL   the story's lesson, Gujarati then English (needs story-<id>-moral.mp3)

Usage:
  python3 scripts/build_films.py                # every story missing a film
  python3 scripts/build_films.py --force <id>   # rebuild one
  python3 scripts/build_films.py --list         # what is missing, no work
"""

from __future__ import annotations

import argparse
import html
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUB = ROOT / "public"
AUDIO = PUB / "audio"
GEN = PUB / "images" / "gen"
VIDEOS = PUB / "videos"
CARDS = ROOT / ".cache" / "cards"

OUT_W = 720
OUT_H = 720
FPS = 25
RENDER = 1600          # supersample, then downscale: kills zoompan jitter
ZOOM = 0.14            # total zoom travel per shot
HOLD = 1.15            # quiet beat after each narrated line
FADE = 0.35

CREAM = "#f6efdd"
INDIGO = "#1d3c6e"
SAFFRON = "#ef5a23"

GU_FONT = "Noto Sans Gujarati"
EN_FONT = "Liberation Sans"


def sh(*args: str) -> None:
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def ffmpeg(*args: str) -> None:
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args],
        check=True,
    )


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


def pango_markup(text: str, family: str, size: int, colour: str, weight: str = "bold") -> str:
    return (
        f'<span font_family="{family}" font_weight="{weight}" foreground="{colour}" '
        f'font_size="{size * 1024}">{html.escape(text)}</span>'
    )


def text_png(markup: str, out: Path) -> Path:
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as fh:
        fh.write(markup)
        src = fh.name
    try:
        sh("magick", "-background", "none", "-density", "96", f"pango:@{src}", str(out))
    finally:
        os.unlink(src)
    return out


def png_size(path: Path) -> tuple[int, int]:
    out = subprocess.run(
        ["magick", "identify", "-format", "%w %h", str(path)],
        check=True, capture_output=True, text=True,
    ).stdout.split()
    return int(out[0]), int(out[1])


def card(art: Path, out: Path, title: str, subtitle: str | None, band: int = 250) -> Path:
    """A riso book-plate: full-bleed art, cream band across the foot with the
    Gujarati title in indigo and the English gloss in saffron."""
    out.parent.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix="card-"))
    try:
        gu = text_png(pango_markup(title, GU_FONT, 56, INDIGO), tmp / "gu.png")
        en = text_png(pango_markup(subtitle.upper(), EN_FONT, 22, SAFFRON, "normal"), tmp / "en.png") if subtitle else None

        # Both lines are fitted to the plate. A moral in English is often wider
        # than the frame, and a clipped subtitle is worse than a small one.
        def fit(image: Path) -> tuple[int, int]:
            width, height = png_size(image)
            limit = OUT_W - 56
            if width > limit:
                sh("magick", str(image), "-resize", f"{limit}x", str(image))
                width, height = png_size(image)
            return width, height

        gu_w, gu_h = fit(gu)
        en_w, en_h = fit(en) if en else (0, 0)

        block = gu_h + (12 + en_h if en else 0)
        top = max(12, (band - block) // 2)

        plate = tmp / "plate.png"
        sh(
            "magick", "-size", f"{OUT_W}x{band}", f"xc:{CREAM}",
            "-fill", INDIGO, "-draw", f"rectangle 0,0 {OUT_W},5",
            "-fill", SAFFRON, "-draw", f"rectangle 0,7 {OUT_W},10",
            str(plate),
        )
        sh("magick", str(plate), str(gu), "-gravity", "north",
           "-geometry", f"+0+{top}", "-composite", str(plate))
        if en:
            sh("magick", str(plate), str(en), "-gravity", "north",
               "-geometry", f"+0+{top + gu_h + 12}", "-composite", str(plate))

        sh(
            "magick", str(art),
            "-resize", f"{OUT_W}x{OUT_H}^", "-gravity", "center", "-extent", f"{OUT_W}x{OUT_H}",
            str(plate), "-gravity", "northwest",
            "-geometry", f"+0+{OUT_H - band}", "-compose", "over", "-composite",
            str(out),
        )
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    return out


def segment(art: Path, narration: Path, out: Path, *, pad_after: float = HOLD,
            zoom_in: bool = True, min_seconds: float = 2.6) -> float:
    """One shot: slow zoom on the still, narration laid over it."""
    length = max(min_seconds, seconds(narration) + pad_after)
    frames = max(2, round(length * FPS))
    step = ZOOM / frames
    zoom = f"min(1+{step:.6f}*on,{1 + ZOOM:.3f})" if zoom_in else f"max({1 + ZOOM:.3f}-{step:.6f}*on,1)"
    fade_out = max(0.0, length - FADE)
    vf = (
        f"[0:v]scale={RENDER}:{RENDER}:force_original_aspect_ratio=increase,"
        f"crop={RENDER}:{RENDER},"
        f"zoompan=z='{zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
        f":d={frames}:s={RENDER}x{RENDER}:fps={FPS},"
        f"scale={OUT_W}:{OUT_H}:flags=lanczos,setsar=1,format=yuv420p,"
        f"fade=t=in:st=0:d={FADE},fade=t=out:st={fade_out:.3f}:d={FADE}[v];"
        f"[1:a]aresample=48000,apad=whole_dur={length:.3f},atrim=0:{length:.3f},"
        f"afade=t=out:st={max(0.0, length - 0.25):.3f}:d=0.25[a]"
    )
    ffmpeg(
        "-i", str(art), "-i", str(narration),
        "-filter_complex", vf, "-map", "[v]", "-map", "[a]",
        "-t", f"{length:.3f}",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-ar", "48000",
        str(out),
    )
    return length


def build(story: dict, force: bool = False) -> bool:
    sid = story["id"]
    final = VIDEOS / f"story-{sid}.mp4"
    if final.exists() and not force:
        return False

    hero = GEN / f"story-{sid}.webp"
    title_audio = AUDIO / f"story-{sid}-title.mp3"
    if not hero.exists() or not title_audio.exists():
        print(f"  ! {sid}: missing art or title audio — skipped")
        return False

    lines = story.get("lines", [])
    work = Path(tempfile.mkdtemp(prefix=f"film-{sid}-"))
    try:
        cover = card(hero, CARDS / f"story-{sid}-cover.png",
                     story.get("titleGujarati", ""), story.get("titleEnglish"))
        cover_tmp = work / "seg-000.mp4"
        segment(cover, title_audio, cover_tmp, pad_after=1.6, zoom_in=True, min_seconds=4.0)
        segs: list[Path] = [cover_tmp]

        for i in range(len(lines)):
            art = GEN / f"story-{sid}-line{i}.webp"
            narr = AUDIO / f"story-{sid}-line{i}.mp3"
            if not art.exists() or not narr.exists():
                print(f"  ! {sid}: line {i} missing an asset — skipped")
                continue
            seg_path = work / f"seg-{i + 1:03d}.mp4"
            segment(art, narr, seg_path, zoom_in=(i % 2 == 0))
            segs.append(seg_path)

        moral_audio = AUDIO / f"story-{sid}-moral.mp3"
        if moral_audio.exists() and story.get("moralGujarati"):
            last_art = GEN / f"story-{sid}-line{len(lines) - 1}.webp"
            plate = card(last_art if last_art.exists() else hero,
                         CARDS / f"story-{sid}-moral.png",
                         story["moralGujarati"], story.get("moralEnglish"), band=290)
            moral_seg = work / "seg-999.mp4"
            segment(plate, moral_audio, moral_seg, pad_after=2.0,
                    zoom_in=False, min_seconds=5.0)
            segs.append(moral_seg)

        listing = work / "concat.txt"
        listing.write_text("".join(f"file '{s.as_posix()}'\n" for s in segs))

        joined = work / "joined.mp4"
        ffmpeg("-f", "concat", "-safe", "0", "-i", str(listing),
               "-c:v", "libx264", "-preset", "veryfast", "-crf", "21",
               "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
               "-movflags", "+faststart", str(joined))

        bed = AUDIO / "bed-story.mp3"
        VIDEOS.mkdir(parents=True, exist_ok=True)
        if bed.exists():
            total = seconds(joined)
            fade_at = max(0.0, total - 3.0)
            ffmpeg("-i", str(joined), "-stream_loop", "-1", "-i", str(bed),
                   "-filter_complex",
                   f"[1:a]aresample=48000,volume=0.16,afade=t=in:st=0:d=2.5,"
                   f"afade=t=out:st={fade_at:.3f}:d=3[bed];"
                   f"[0:a][bed]amix=inputs=2:duration=first:normalize=0[a]",
                   "-map", "0:v", "-map", "[a]",
                   "-c:v", "copy", "-c:a", "aac", "-b:a", "128k",
                   "-movflags", "+faststart", str(final))
        else:
            shutil.copyfile(joined, final)

        dur = seconds(final)
        mb = final.stat().st_size / 1048576
        print(f"  ✓ story-{sid}.mp4 — {dur:.0f}s, {mb:.1f} MB, {len(segs)} shots")
        return True
    finally:
        shutil.rmtree(work, ignore_errors=True)


def write_film_index() -> None:
    """The film player must never mount a <video> that 404s, and the browser
    cannot stat the public folder — so the set of films on disk is written out
    as a module the app imports."""
    ids = sorted(p.stem.removeprefix("story-") for p in VIDEOS.glob("story-*.mp4"))
    out = ROOT / "src" / "data" / "filmIds.ts"
    body = (
        "// Generated by scripts/build_films.py — do not edit by hand.\n"
        "// Every story id that has a film in public/videos.\n"
        "export const FILM_IDS: string[] = [\n"
        + "".join(f"  '{i}',\n" for i in ids)
        + "];\n\n"
        "export const STORY_FILMS = new Set<string>(FILM_IDS);\n"
    )
    out.write_text(body)
    print(f"film index → {out.relative_to(ROOT)} ({len(ids)} films)")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--list", action="store_true")
    args = ap.parse_args()

    catalogue = json.loads((ROOT / ".cache" / "stories.json").read_text())
    chosen = [s for s in catalogue if not args.ids or s["id"] in args.ids]
    if not chosen:
        print("no such story id")
        return 1

    missing = [s for s in chosen if args.force or not (VIDEOS / f"story-{s['id']}.mp4").exists()]
    print(f"{len(chosen)} stories selected, {len(missing)} need a film")
    if args.list:
        for s in missing:
            print(f"  {s['id']:<30} {len(s.get('lines', []))} lines  {s.get('titleEnglish')}")
        return 0

    built = 0
    for n, story in enumerate(missing, 1):
        print(f"[{n}/{len(missing)}] {story['id']}")
        try:
            if build(story, force=args.force):
                built += 1
        except subprocess.CalledProcessError as exc:
            err = (exc.stderr or b"").decode()[-400:] if exc.stderr else str(exc)
            print(f"  ✗ {story['id']} failed: {err}")
        except Exception as exc:  # keep going: one bad story must not stop the run
            print(f"  ✗ {story['id']} failed: {exc}")

    print(f"\nbuilt {built} film(s)")
    write_film_index()
    return 0


if __name__ == "__main__":
    sys.exit(main())
