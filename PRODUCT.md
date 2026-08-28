# Product

## Register

product

## Users

**Primary: the operator.** A person who has written a mandate — a versioned YAML document naming which
equities an agent may touch, how large a position may get, how much may be lost in a day, and which
conditions must wake them. They are not at the desk continuously. They step away, and the agent keeps
working inside the boundary they authored. When the agent reaches something irreversible, the operator is
pulled back to make one decision, with the evidence already assembled.

Their job on any given screen: **answer "should this be allowed to happen" in seconds, with proof.** Not
to read logs, not to supervise a chat, not to trade. To exercise authority they already delegated in
writing, at the one moment the delegation runs out.

**Secondary: a hackathon judge, three minutes.** Opens the project cold, has seen twenty others tonight,
and is scoring six equally-weighted criteria — one of which is "does the agent stop for a human before
anything irreversible." They need to see the stop happen, understand it without narration, and believe
the numbers are real.

The two audiences want the same thing at different speeds. The operator needs density and calm across a
long session. The judge needs the safety gate to be unmissable in the first ten seconds. The interface
serves the operator, and stages the approval moment as an event so the judge cannot miss it.

## Product Purpose

MANDATE answers one question: **who has the right to press the button right now, when you are not at the
desk.**

It is not a trading bot and does not sell returns. A model proposes an order; deterministic code decides
whether that order is authorized against a human-authored mandate. Orders outside the mandate are denied
and parked for a person. Every decision — prepared, submitted, denied, deduplicated, parked — is written
to a durable journal with a fingerprint of the exact mandate that governed it, so an auditor can tell
decisions made before a human changed the rules from decisions made after.

Success looks like: the operator trusts the agent enough to leave, because they know exactly where it
will stop. And the list of what the agent *parked* — the gap between what the human anticipated and what
actually happened — is the most valuable artifact of the session, because tomorrow's mandate is written
from it.

Paper trading only. Not investment advice.

## Brand Personality

**Accountable. Exact. Unhurried.**

Voice is that of a compliance record, not a product. It states what happened and under which rule. It
never congratulates, never reassures, never says "successfully." A denial is reported as flatly as an
approval, because the point of the system is that both are legitimate outcomes.

Numbers are quoted at the precision they were computed with, not rounded for comfort. When data is
missing the interface says so and shows a degraded state rather than displaying a stale value as live —
failing visibly is a feature, not an error path.

Emotional goal: **the calm of a well-kept ledger.** The operator should feel that nothing is happening
behind their back. The judge should feel that this was built by someone who has thought about what
happens when it goes wrong.

## Anti-references

- **The trading-bot dashboard.** Neon green P&L, candlestick charts, rocket iconography, big "TOTAL
  PROFIT" hero number. This product does not sell returns and must not look like it does. If the first
  thing on screen is a profit figure, the originality criterion is lost.
- **The AI-chat wrapper.** A message stream with tool calls collapsed inside it and two raw JSON
  approval buttons at the bottom. TrueForge already ships a better chat than we would build; a copy of it
  is a worse copy. The stock chat stays, in its own tab, unimitated.
- **Bond-costume kitsch.** Crosshairs, fingerprint scanners, "ACCESS GRANTED" stamps, redaction bars over
  live data. The hackathon's spy framing is a real design language when read as *dossier structure* —
  filed records, labelled fields, rule citations. Read as costume it undermines a product whose entire
  claim is seriousness.
- **The SaaS marketing shell.** Gradient hero, tracked uppercase eyebrow above every section, three
  identical feature cards, glassmorphic panels. This is an instrument, not a landing page.
- **False confidence.** Progress spinners with no state, "everything is fine" green when a service is
  actually unreachable, rounded-off numbers that hide precision. Any element that implies certainty the
  system does not have is a bug.

## Design Principles

**1. The stop is the product.** Every other element on screen exists to make one decision answerable.
The approval card is not a modal interruption bolted onto a dashboard — it is the largest, most composed
thing in the interface, and the dashboard is the context that justifies it. When nothing is pending, its
absence should be felt as calm, not as emptiness.

**2. Show the rule, not the verdict.** Never state that something was denied without naming the limit,
the projected value, and the headroom that was crossed. Never state that something was allowed without
showing which authority permitted it. A number without its provenance is a claim; a number with its rule
is evidence. This is what separates the product from a model saying "looks safe to me."

**3. Irreversibility must be legible before the click, not after.** The interface distinguishes actions
that can be taken back from actions that cannot, and spends its strongest visual weight on the
difference. An executed paper order cannot be recalled — the design says so at the moment of decision,
in the same breath as the terms of the order.

**4. Degrade loudly.** When the guard is restarting, a feed is stale, or a source returned an error, the
interface shows the gap rather than the last good value. Visible partial failure earns more trust than
seamless uncertainty, and it is honest about what the operator is actually authorizing.

**5. Density is respect.** The operator reads this for hours. Information belongs at the density of a
ledger — tight, aligned, scannable — with hierarchy carried by structure and typography rather than by
decoration, whitespace inflation, or color used for its own sake.

## Accessibility & Inclusion

- **WCAG 2.2 AA.** Body text ≥4.5:1 against its surface; large and bold text ≥3:1. The muted gray on
  dark card is the failure mode to guard against — verify, don't assume.
- **Never color alone.** Approve/deny, allowed/denied, online/offline, and every journal outcome carry a
  text label or shape in addition to hue. Red/green discrimination must not be required to operate the
  safety gate. This is a hard requirement, not a nicety: the product's core interaction is a
  consequential binary choice.
- **Keyboard complete.** Every control reachable and operable by keyboard, with a visible focus ring that
  meets 3:1 against its background. The approval action must never be reachable only by pointer.
- **Motion is optional.** `prefers-reduced-motion: reduce` replaces every transition with a crossfade or
  an instant state change. Nothing pulses, blinks, or animates on a loop; a live-data indicator conveys
  freshness through a timestamp, not through movement.
- **Screen-reader truth.** Pending approvals, degraded state, and service outages are announced through
  live regions. Decorative iconography is hidden; meaningful iconography is labelled.
- **No timing pressure.** Nothing that requires a decision expires on its own or auto-dismisses. The
  operator sets the pace of their own authority.
