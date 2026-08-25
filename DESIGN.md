# Design

<!-- impeccable:design-schema 1 -->

Recorded from the built world, not from intention. Where this file and the code
disagree, the code is right and this file is stale.

## The world

**Riso-Folk.** A Gujarati primer printed as a two-colour risograph zine, where
the interface is made of the same ink as the illustrations inside it. It refuses
the rounded-card pastel grid that kids' apps default to.

Two plates: **saffron** and **indigo**, printed on **cream paper** with visible
fibre grain. Hard ink keylines. Flat offset shadows — the second plate sitting
proud of the first, never a blur. Halftone dot screens over flooded fields.
Ajrakh block-print lozenges as rules and borders.

This is binding, not a preference: the 716 generated illustrations were produced
in this style (`docs/STYLE_GUIDE.md` owns the generation prompts), so the chrome
either belongs to the same print run or it frames someone else's pictures.

## Tokens

All of it lives in `src/app/globals.css`. There is one set. Nothing defines a
colour, a radius, a duration, or a space value anywhere else.

### Ink

| Token | Value | Use |
|---|---|---|
| `--ink-saffron` | `#ef5a23` | Flooded fields, the first plate |
| `--ink-saffron-deep` | `#c8390f` | **Any saffron surface carrying small text** |
| `--ink-saffron-pale` | `#f7cf9f` | Secondary marks on indigo |
| `--ink-indigo` | `#1d3c6e` | The second plate; primary structural field |
| `--ink-indigo-deep` | `#12294e` | — |
| `--ink-indigo-pale` | `#b9c9e0` | Map ground |
| `--ink-pink` | `#d6336c` | Recording state |
| `--ink-leaf` | `#1f7a5a` | Learned / correct |
| `--ink-key` | `#241c12` | Keylines, primary text |

**The saffron rule.** Nothing light passes 4.5:1 on `--ink-saffron` — pure white
is only 3.35:1. So:

- Small text on a saffron field prints **dark** (`--text-on-saffron`, 4.93:1).
  This is the riso move anyway: a dark plate over the saffron one.
- Any *control* whose label is small and light uses `--ink-saffron-deep`
  (5.10:1) instead — primary buttons, the Guju button, chat user bubbles.
- Large display text (≥22px bold) may stay white on saffron; 3.35:1 clears the
  3:1 large-text floor.

`--text-on-ink-2` (80% white) is for **indigo only** — 7.48:1 there, 2.64:1 on
saffron.

### Paper

`--paper #fffdf7` · `--paper-cream #f6efdd` (the ground) · `--paper-sunk #efe5cd`
(recessed surfaces, meter tracks, inert states).

### Text

`--text-1 #241c12` · `--text-2 #6c5a42` (5.76:1 on cream) · `--text-3 #8a7a63`.
Tinted from the ink, never grey.

### Structure

- Keylines: `--key` 2.5px, `--key-thin` 2px, always `--ink-key`.
- Lift: `--lift-1/2/3` = 2/4/6px offset, **zero blur**, in a named ink.
  `--shadow-float` (real offset + blur) is reserved for overlays, which leave
  the paper.
- Radii: 10 / 14 / 18 / 24 / pill.
- Space: 4px base, `--s-1` … `--s-12`.
- Type: fixed rem scale at ~1.2 ratio, `--t-2xs` … `--t-4xl`. Not fluid — this
  is product UI viewed at a consistent distance.
- Motion: `--dur-1/2/3` = 140/200/320ms.

### Type faces

`--font-ui: 'Space Grotesk', 'Noto Sans Gujarati', 'Nunito', system-ui`
`--font-gujarati: 'Noto Sans Gujarati', system-ui`

Noto Sans Gujarati **must stay in the UI stack**. Latin resolves to Space
Grotesk first; Gujarati falls through to Noto. Drop it and every Gujarati string
outside `.rf-gujarati` silently renders in whatever face the OS picks.

`.rf-gujarati` also sets `line-height: 1.45` — matras sit above the shirorekha
and need the air.

## Components

`src/components/ui.tsx` owns the vocabulary. A control defined there is never
re-implemented inline; that is exactly how this app previously ended up with
three card decks, three pronunciation panels, and seven speak buttons.

| Component | Contract |
|---|---|
| `PlayButton` | The large round "hear it". Shows load %, and a retry state when a clip failed. |
| `SpeakButton` | The compact card-level speak control. **44px, always.** |
| `SpeakGlyph` | The audio glyph itself; owns the loading/playing/failed states. |
| `SectionHeader` | The flooded banner opening every section. Full width; picks readable text for its ground. |
| `Chip` / `SegTabs` | Filters and mode switches. `.rf-seg` caps at 560px — a control, not a banner. |
| `Meter` | Fills by `scaleX`, never by animating width. Sunk track so empty reads as "none yet". |
| `ProgressRing` | Ring gauge with the count in the middle. |
| `LearnedStamp` | A stamp hitting paper. Carries a check glyph, never colour alone. |
| `Overlay` | Focus trap, focus restore, scroll lock, Escape, swipe. |
| `Deck` | The one swipeable card deck. Words, phrases, and story parts all use it. |
| `SayItBack` | Pronunciation practice. The floor is "have another go". |
| `EmptyState` | Teaches the interface rather than saying "nothing here". |
| `Art` | Illustration that degrades to a drawn mark, never a broken image. |
| `Confetti` | Returns `null` under reduced motion. |

## Icons

`src/components/Icon.tsx`. One 24×24 board, 2px stroke, round caps and joins,
`currentColor`, block-print geometry. `aria-hidden` unless given a `title`.

**No emoji anywhere in the chrome.** `CATEGORY_ICON` maps every word and phrase
category to a drawn mark so nothing can fall back to a glyph.

## Motion

One authored moment: **`.rf-press`**. Pressing anything pushes it into the paper
and its offset ink pass collapses underneath. Everything pressable moves this
way, and nothing else has a bespoke press.

Beyond that, motion conveys state only — `rf-pop` (correct), `rf-rise` (a panel
arriving), `rf-stamp` (learned), `rf-listening` (recording), `rf-think` (Guju).
No page-load choreography; this is product UI, and a child is mid-task.

`prefers-reduced-motion` is honoured in CSS, and SMIL animation — which the CSS
block cannot reach — is gated in JS via `usePrefersReducedMotion`.

## Shell

Structural, not fluid. The layout **restructures** at each step:

| Width | Navigation | Content |
|---|---|---|
| `< 768` | Bottom tab bar (5), Guju on a floating button | 1–2 columns |
| `≥ 768` | 84px icon rail, all 8 destinations | 2–3 columns |
| `≥ 1120` | 248px labelled sidebar | 3–5 columns, word row wraps |

The Guju button is hidden on the chat screen — it covered the Send button and
was redundant there.

**`min-width: 0` on every grid and flex child.** Grid items default to
`min-width: auto`, which once let a single horizontal scroller stretch the whole
document to 965px on a 390px phone.

## Rules that are not obvious

1. **Audio is the product.** Anything visible is hearable in one tap, and a clip
   that will not play says so on the control that was tapped.
2. **Never punish.** No shake, no red scold, no lockout. A wrong quiz answer
   goes neutral while the right one stays lit. Results are countable stars, not
   a percentage a four-year-old cannot read.
3. **Meaning never depends on colour alone.**
4. **44px minimum**, larger where a child is the target.
5. **Canvas takes real colour values** — a CSS custom property in `strokeStyle`
   silently falls back to black.
6. **Icon-only controls always carry an accessible name.**

## Known gaps

- **The illustrations are not all in this world.** Newly generated art is
  on-style; a share of the older word images are naturalistic or stock-like, and
  several carry baked-in captions illegible below ~120px. This is the largest
  remaining gap between the interface and its content, and it is a regeneration
  job. See PRODUCT.md.
- **The Quiz tab is unusable by a pre-reader** — answer options are English or
  roman text and are never spoken.
- **No parent controls** — no reset progress, no audio speed, no mute.
- Two quiz components (`QuizSection`, `StoryQuiz`) still differ in tile size and
  border weight, though they now behave the same.
- `rf-label` is used as a section heading in several places; the heading outline
  is not yet correct.
