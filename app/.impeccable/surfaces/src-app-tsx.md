---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components/Reader.tsx","src/components/EmptyState.tsx"]
---

# Reader screen (index, EN + FR)

Mode: Operate. Audience: people without a mail client opening one .eml file. Task: choose or drop a file, read the message, maybe preview or save an attachment, occasionally inspect headers. States: empty, dragging, parse error, loaded (HTML / plain text), headers view, attachment modal (PDF, image, download).

## Direction contract

THESIS: The email is a letter laid on a collector's stockbook page; attachments are mounted beside it as stamps. Refuses the mail-client split pane and the white SaaS card with a file input.

OWN-WORLD: Dark stockbook ground (#16201e) on one 9-step green-grey ramp; white letter sheets stacked with slight rotation; engraved inks: ultramarine #23408e (primary/active), carmine #c0283a (PDF + warnings), olive (other files). Barlow for text, Barlow Semi Condensed for subjects, denominations, postmark. Perforated stamp edges; glassine strip; one circular postmark. Rules only at 0°/90°.

STORY: Visitor sees immediately that the file stays on their device, drops it, reads the letter like mail, and sees enclosures at a glance by kind and size.

FIRST VIEWPORT: Top bar: wordmark left, privacy line + language + "Open another file" right. Left: letter stack (tabs Message/Headers, subject at 34px, From/To/Date rows, postmark top-right "Opened locally" + date, body iframe). Right 300px rail: "Enclosed · n attachments" over a glassine strip of stamps (name, kind, size as denomination), trust warning, drop hint. Empty state: the same stage holding a blank sheet as the drop target with the postmark carrying the privacy promise.

FORM: Stockbook & Postmark, candidate 5 of 7 grounded list, seed:e577d201e2944e86. Signature move: attachments as perforated stamps with size as denomination on one fixed ink-per-kind system; the postmark stamping the local-only promise.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
