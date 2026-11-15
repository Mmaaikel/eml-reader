# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone without a mail client at hand: mostly non-technical people who received a `.eml` file (as an attachment, an export, or a download) and simply want to read the message, and possibly open or save one of its attachments. They arrive once, drop a file, read, and leave. Headers and technical detail are a secondary need, reached on purpose.

## Product Purpose

Open a `.eml` file in the browser and show it as a readable email: sender, recipients, subject, date, the HTML or plain-text body, and its attachments (with in-page preview for PDFs and PNG/JPEG/GIF images, download for everything else). Success is the visitor reading their message within seconds of choosing the file, without installing anything.

## Positioning

Everything happens locally in the browser. No file is uploaded, nothing is processed on a server, no cookies, no tracking of the content. For people opening private mail on an unfamiliar tool, that is the reason to trust this one.

## Operating Context

- One-shot use: open the page, choose or drop one `.eml` file, read, maybe open an attachment, close the tab.
- Desktop and mobile browsers; files often come from a downloads folder or another app's share sheet.
- Email HTML is untrusted third-party content rendered inside an iframe.
- Attachments can be untrusted; the visitor is warned before opening them.

## Capabilities and Constraints

- Stack: Astro 7 + Svelte 5 components, Tailwind CSS 4, Iconify (mdi, twemoji) icons, nanostores. Static site (GitHub Pages / nginx Docker image).
- Parsing via `eml-parse-js`; PDF preview via `pdfjs-dist` (page navigation; zoom controls exist but are not implemented).
- Views: email (header fields + HTML/plain-text toggle when both exist), headers list, attachments list, attachment modal.
- Inline `cid:` images are resolved from attachments into the HTML body.
- Locales: English (default) and French; every user-facing string must exist in both.
- This is the owner's fork; name and branding may change. Current name: "EML Reader".

## Brand Commitments

- The privacy promise ("nothing leaves your device") stays prominent.
- The stacked-paper motif (the email shown as a sheet on top of a small stack, one more sheet when there are attachments) stays as an identity element.
- Upstream credits/footer and flag-icon language switch are not binding.

## Evidence on Hand

- No sample `.eml` fixtures in the repo beyond tests in `test/`; no screenshots, testimonials, or usage numbers. Do not invent any.

## Product Principles

1. The message is the hero: the visitor came to read an email, everything else steps back.
2. Trust is shown, not claimed in fine print: the local-only promise is visible at the moment of choosing a file.
3. Zero learning: one obvious action (drop or choose a file), familiar email conventions after.
4. Detail on request: headers and raw metadata are one deliberate step away, never in the way.

## Accessibility & Inclusion

No product-specific standard established; meet WCAG 2.2 AA as the floor (keyboard access, visible focus, Escape closes dialogs, sufficient contrast).
