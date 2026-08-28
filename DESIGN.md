# Design

## Theme

**A filed record, kept in a dark room.**

The operator watches this at a desk with the lights low, for hours, and returns to it at odd times to
answer one consequential question. Dark is not a stylistic default here — it is the ambient condition of
the room, and it lets the one thing that needs attention be the only bright thing on screen.

The visual language is **dossier structure, never dossier costume**: filed records with a fixed field
grammar, rules quoted next to the values that crossed them, monospace where a value must be trusted
character-for-character, and hairline rules that separate entries the way a ledger separates lines. What
we take from the hackathon's spy framing is the *filing system* — labelled fields, cited authority,
records that survive the session. What we refuse is the theatre: no crosshairs, no redaction bars, no
ACCESS GRANTED stamps.

Color strategy: **Restrained.** A near-black ground, two neutral surface layers, and gold reserved almost
entirely for one job — an action that needs a human. Gold on this ground reads as brass and paper rather
than as warning, which is exactly the register: this is authority, not alarm. Red is kept back for
genuine failure, so that when it appears it means something.

## Color

Values are the hackathon site's own tokens, sampled from the live page, extended with the semantic roles
a console needs. Neutrals carry a faint cool cast (the ground is `#08090d`, not `#000000`) so gold reads
warm against them without either being tinted for its own sake.

### Ground and surfaces

| Token | Value | Use |
|---|---|---|
| `--ground` | `#08090d` | Page background. The room. |
| `--surface` | `#0f1014` | Panels, the timeline body, table backgrounds. |
| `--surface-raised` | `#18181b` | Cards, drawers, the top bar. One step toward the viewer. |
| `--surface-inset` | `#141417` | Wells: code blocks, raw-evidence `<pre>`, inputs. |
| `--line` | `#ffffff1a` | Default hairline. Separates records; never decorates. |
| `--line-strong` | `#ffffff2e` | Panel edges, focused inputs, table header rules. |

Three surface steps is the ceiling. A card inside a card is a structural error, not a depth cue.

### Ink

| Token | Value | Contrast on `--surface` | Use |
|---|---|---|---|
| `--ink` | `#fafafa` | 17.4:1 | Primary text, values, headings. |
| `--ink-muted` | `#a1a1aa` | 7.4:1 | Labels, secondary prose, timestamps. |
| `--ink-faint` | `#71717b` | 4.0:1 | **Non-text only** — disabled glyphs, hairline icons, decorative marks. Never body copy. |

`--ink-faint` fails AA for text by design; it exists so the temptation to use it for labels is named and
refused. Labels use `--ink-muted`.

### Semantic roles

| Token | Value | Meaning |
|---|---|---|
| `--authority` | `#d6ab32` | **An action awaits a human.** Approval cards, the pending badge, the wake-trigger banner. |
| `--authority-dim` | `#8a6a33` | Borders and rules on authority surfaces. |
| `--authority-wash` | `#1c1610` | Fill behind authority regions. |
| `--allowed` | `#4ade80` | Submitted, online, gate passed, market open. |
| `--denied` | `#ff6568` | Denied by the guard, service offline, conflict. |
| `--parked` | `#7dd3fc` | Parked for a human — deliberately *not* red. A park is a correct outcome, not a failure. |
| `--neutral-state` | `#a1a1aa` | Prepared, deduplicated, informational. |

**Parked in cyan is the deliberate call.** The list of parked actions is, per PRODUCT.md, the most
valuable artifact of a session. Coloring it like an error teaches the operator to dread the thing they
should be reading first.

Gold is spent on approvals and nothing else. It never appears as a chart color, a link, a hover, or a
heading accent. Its scarcity is what makes a pending decision impossible to miss on a dense screen.

### Never color alone

Every state carries a text label and a distinct marker shape alongside its hue:

- submitted → filled disc + `SUBMITTED`
- denied → open ring with a bar + `DENIED`
- parked → hollow square + `PARKED`
- prepared / deduplicated → hairline dash + label
- conflict → doubled ring + `CONFLICT`

The approve/deny control pairs a check with the word *Approve* and a slash with the word *Deny*. Neither
is ever a bare colored button.

## Typography

Two families on a real contrast axis — humanist sans against a grotesque mono — not two similar sanses.

| Role | Family | Notes |
|---|---|---|
| Interface, headings, prose | **Inter** | Matches the hackathon site. `font-feature-settings: "cv05", "ss03"` for a single-storey ℓ and disambiguated I/l. |
| Values, labels, identifiers | **Geist Mono** | Also from the site. Carries every number an operator might quote, every ID, every rule name. |

**The mono rule, which does most of the work here:** anything the operator could be asked to *repeat* —
a price, a quantity, a percentage, a client order ID, an intent ID, a fingerprint, a timestamp, a rule
name, a limit — is set in Geist Mono with tabular figures. Anything that is *explanation* — rationale,
headings, prose, button labels — is Inter. The typeface itself tells the operator which characters are
load-bearing, and tabular figures make a column of prices scan as a column.

```css
--font-ui: "Inter", system-ui, sans-serif;
--font-mono: "Geist Mono", ui-monospace, "SF Mono", Menlo, monospace;
font-variant-numeric: tabular-nums; /* on every numeric element */
```

### Scale

Fixed rem steps at a ~1.2 ratio. No `clamp()` on interface type — a heading that shrinks inside a panel
looks broken, not responsive.

| Step | Size / line-height | Use |
|---|---|---|
| `--text-2xs` | 10px / 1.4, mono, `0.14em` tracking, uppercase | Field labels inside records. |
| `--text-xs` | 11px / 1.5 | Timestamps, chips, table cells. |
| `--text-sm` | 12px / 1.55 | Secondary prose, rationale. |
| `--text-base` | 13px / 1.6 | Body. The console's default. |
| `--text-md` | 15px / 1.4 | Panel headings. |
| `--text-lg` | 18px / 1.3 | The decision summary line. |
| `--text-xl` | 24px / 1.2, `-0.02em` | Account equity, the one large figure. |

13px base is deliberate: this is an instrument read at a fixed desk distance, and the density serves the
operator. Nothing goes below 10px, and 10px is reserved for uppercase mono labels where tracking keeps it
legible.

**No tracked uppercase eyebrow above every section.** Uppercase mono labels appear *inside* records as
field names — the dossier field grammar — and never as a decorative kicker over a heading. That
distinction is the difference between a filing system and the 2023 landing-page reflex.

## Spacing & Layout

A 4px base scale: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 48`.

Density is deliberate and not uniform. Records inside the timeline sit at 12–14px vertical rhythm; the
approval region breathes at 20–24px because it is the one place the operator should slow down. That
contrast in rhythm is itself the hierarchy — the interface physically relaxes at the moment of decision.

- **Grid:** `repeat(auto-fit, minmax(280px, 1fr))` for metric rows; a two-column `minmax(0,1fr) 380px`
  main/aside split above 1200px, stacking below.
- **Alignment:** every numeric column right-aligned with tabular figures. Labels left, values right, rule
  between — the ledger convention, because it is the fastest to scan.
- **Radii:** `--radius-sm: 3px` for chips and inputs, `--radius: 4px` for panels and buttons. Nothing
  rounder. This is a record, not a consumer app; near-square corners read as filed rather than friendly.
- **No shadows for elevation.** Depth comes from the surface ladder and hairlines. A single soft shadow
  is permitted on the settings drawer and on nothing else, because it genuinely floats above the page.
- **Z-index scale, semantic:** `--z-sticky: 20`, `--z-drawer-backdrop: 40`, `--z-drawer: 50`,
  `--z-toast: 60`. Never an arbitrary 999.

## Components

### The decision card

The largest, most composed element in the product. Its structure is fixed:

1. **Terms, in mono, at `--text-lg`** — `BUY 23 NVDA · LIMIT $183.40`. What will happen, quoted exactly.
2. **The irreversibility line** — plain Inter, `--ink`, not red, not shouted: *An executed paper order
   cannot be recalled.* Stated once, calmly, because a shouted warning is one the operator learns to
   skip.
3. **The rule that permits it** — mandate limits with used / limit / headroom, in mono, right-aligned.
   Per principle 2, the authority is shown, not asserted.
4. **The agent's rationale** — Inter, `--ink-muted`, the only prose in the card.
5. **Provenance** — session, intent ID, mandate fingerprint, in `--text-2xs` mono.
6. **The control** — Approve / Deny, side by side, equal visual weight. Deny is never styled as the
   lesser option; both are legitimate.

Raw tool JSON stays behind a `<details>`. It is evidence, available on demand, not the primary reading.

### The journal record

The dossier field grammar applied to history. Each entry: a state marker, an action in mono, an outcome
label, a timestamp, the rationale in Inter, and — when the outcome is `denied` — the breached rule
quoted as `limit / projected / headroom` rather than summarized in prose.

### States

Every interactive element ships default, hover, focus-visible, active, disabled, and where relevant
loading and error. Focus rings are 2px `--authority` at 3:1 minimum against their background, offset 2px,
and never removed.

Loading uses skeleton rows matching the shape of the content they replace — never a spinner over a panel.
The one exception is the manual refresh control, where a rotating glyph is the affordance itself.

Empty states teach: *"No decisions have been recorded yet. The agent writes here when it prepares,
submits, parks, or is denied an order."* Never a bare "nothing here."

### Degraded mode

When the guard is unreachable, panels backed by live broker data render an explicit em-dash placeholder
with a `DEGRADED` label and the reason, rather than the last known value. The distinction between *stale*
and *live* is drawn in the interface itself, per principle 4.

## Motion

150–250ms, `ease-out-quart` (`cubic-bezier(0.22, 1, 0.36, 1)`). Motion conveys state change and nothing
else.

- **Approval arrival:** a new decision card fades and rises 6px over 240ms. This is the single most
  important state change in the product and is the one place motion is allowed to draw the eye.
- **Approve / deny resolution:** the card settles to 62% opacity over 200ms and the outcome label
  crossfades in. The record stays on screen — decisions are not swept away.
- **Tab and filter changes:** 150ms crossfade.
- **Nothing loops.** No pulsing dots, no breathing glows, no marquees. Freshness is communicated by a
  timestamp that counts, not by movement — an operator watching for hours must never be pulsed at.

`@media (prefers-reduced-motion: reduce)` replaces every transition with a ≤80ms opacity change and
removes all transforms.

## Iconography & Marks

Stroked, 1.75px, 18px box, `currentColor`, square-ish terminals to match the near-square radii. One
family throughout; no filled icons mixed with stroked.

State markers are geometric primitives rather than icons — disc, ring, square, dash — so they remain
distinguishable at 6px and without color.

**Favicon and app identity:** the mark is a filled disc inside an open bracket — the agent held inside a
boundary — in `--authority` on `--ground`. It works at 16px because it is two shapes. The document title
carries pending state (`(2) MANDATE · Operator Console`) so an operator with the tab in the background
learns that a decision is waiting without switching to it.
