---
name: EML Reader
description: A local-only .eml reader where the email is a letter laid on a collector's stockbook page and attachments are mounted beside it as stamps.
colors:
  book-900: "#0f1715"
  book-800: "#16201e"
  book-700: "#212c29"
  book-600: "#34433f"
  book-500: "#4f5f5b"
  book-400: "#74827e"
  book-300: "#a3afac"
  book-200: "#cfd7d4"
  book-100: "#e7ecea"
  paper: "#ffffff"
  ultramarine: "#23408e"
  ultramarine-light: "#8fa6e6"
  carmine: "#c0283a"
  carmine-light: "#f08a95"
  carmine-bright: "#e04a5a"
  carmine-wash: "#fbeef0"
  olive: "#5b6a2b"
  olive-light: "#b9c77f"
  glassine: "rgb(214 226 232 / 0.12)"
  glassine-fade: "rgb(214 226 232 / 0.07)"
typography:
  display:
    fontFamily: "Barlow Semi Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1.1
  headline:
    fontFamily: "Barlow Semi Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.15
  headline-compact:
    fontFamily: "Barlow Semi Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.15
  denomination:
    fontFamily: "Barlow Semi Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "\"tnum\""
  postmark:
    fontFamily: "Barlow Semi Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.05
  postmark-ring:
    fontFamily: "Barlow Semi Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    letterSpacing: "0.12em"
  postmark-ring-compact:
    fontFamily: "Barlow Semi Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "9px"
    fontWeight: 600
    letterSpacing: "0.08em"
  label:
    fontFamily: "Barlow Semi Condensed, Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    letterSpacing: "0.14em"
  body-large:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  ui:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
  small:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  meta:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
rounded:
  sheet: "3px"
  control: "4px"
  postmark: "9999px"
spacing:
  perf: "6px"
  gutter-sm: "16px"
  gutter-md: "32px"
  gutter-lg: "40px"
  stage-gap: "40px"
  rail: "300px"
  topbar: "64px"
  page-max: "1280px"
components:
  button-primary:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.paper}"
    typography: "{typography.body-large}"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "#1e3679"
  button-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.book-800}"
    typography: "{typography.ui}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  button-paper-hover:
    backgroundColor: "{colors.book-100}"
  button-outline-dark:
    textColor: "{colors.book-100}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  button-outline-dark-hover:
    backgroundColor: "{colors.book-700}"
  letter-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.book-800}"
    rounded: "{rounded.sheet}"
    padding: "0 44px 40px"
  tab:
    textColor: "{colors.book-500}"
    typography: "{typography.ui}"
    padding: "10px 16px"
  tab-active:
    textColor: "{colors.book-800}"
  segmented:
    backgroundColor: "{colors.book-100}"
    rounded: "{rounded.control}"
    padding: "2px"
  segmented-option-active:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.book-800}"
    rounded: "{rounded.sheet}"
    padding: "6px 12px"
  stamp-face:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.book-800}"
    padding: "10px 12px 12px"
  remote-notice:
    backgroundColor: "{colors.book-100}"
    textColor: "{colors.book-700}"
    typography: "{typography.small}"
    padding: "12px 16px"
  locale-option:
    textColor: "{colors.book-300}"
    typography: "{typography.meta}"
    rounded: "{rounded.sheet}"
    padding: "4px 8px"
  locale-option-current:
    backgroundColor: "{colors.book-600}"
    textColor: "{colors.paper}"
  modal:
    backgroundColor: "{colors.book-800}"
    rounded: "{rounded.sheet}"
  viewer-toolbar:
    backgroundColor: "{colors.book-900}"
    textColor: "{colors.book-100}"
    height: "48px"
---

# Design System: EML Reader

## Overview

**Creative North Star: "Stockbook & Postmark"**

The page is a collector's stockbook opened on a dark green-grey leaf. The email is a white letter laid on top of a small stack of sheets; its attachments are mounted in a glassine strip beside it as perforated stamps, each printed in one engraved ink for its kind and carrying its file size as the denomination. A single circular postmark, struck at an angle onto the letter, carries the local-only promise and the moment the file was opened. Everything else is flat, quiet, and squared to the page.

Density is calm and operational: one letter, one rail, generous margins, nothing competing with the message. The palette is one neutral ramp plus three inks, and the inks are rationed: ultramarine marks what is active, carmine marks PDFs and warnings, olive marks every other file. Physical objects (sheets, stamps, postmark) are the only things allowed to tilt or cast shadow; the page structure around them stays strictly orthogonal.

The world rejects the mail-client split pane and the white SaaS card holding a file input.

**Key Characteristics:**
- Dark stockbook ground built from a single 9-step green-grey ramp; no other neutrals.
- White paper sheets stacked with slight rotation; one more sheet when attachments exist.
- Three engraved inks, each with a fixed meaning, and light variants reserved for the dark ground.
- Perforated stamps with one ink per attachment kind and size as the denomination.
- One circular postmark per view, and it is the only circle.
- Structural rules only at 0° and 90°.
- Barlow for reading, Barlow Semi Condensed for subjects, denominations, postmark, and labels.

## Colors

One green-grey ramp for everything neutral, white paper, and three engraved inks that each mean exactly one thing.

### Primary
- **Engraved Ultramarine** (ultramarine): the active ink. Primary buttons, the selected tab underline, links and link-like actions on paper, the postmark, image stamps, text selection, and the image-viewer modal's top edge. Used on paper (white) only for text.
- **Pale Ultramarine** (ultramarine-light): ultramarine's voice on the dark ground. The global focus ring and the drag-and-drop target outline and icon.

### Secondary
- **Engraved Carmine** (carmine): PDFs and warnings on paper. The PDF stamp ink and denomination, the PDF modal's top edge, the parse-error icon and title.
- **Pale Carmine** (carmine-light): the warning icon beside the attachment trust notice on the dark ground.
- **Bright Carmine** (carmine-bright): the "Reader" half of the wordmark on the dark ground; the only display use of carmine.
- **Carmine Wash** (carmine-wash): the pale ground of the parse-error message on the blank sheet; never used elsewhere.

### Tertiary
- **Engraved Olive** (olive): every attachment that is neither PDF nor image (documents, CSV, nested emails, unknown files). Stamp ink, denomination, and the modal's top edge.
- **Pale Olive** (olive-light): the privacy shield icon in the top bar and the file icon in the download viewer; olive on the dark ground signals "safe, local".

### Neutral
- **Stockbook Black** (book-900): viewer toolbars, modal backdrop (80%), drag overlay (82%), scrollbar track.
- **Stockbook Leaf** (book-800): the page ground and modal body; also the darkest text colour on paper (subject, headings, field values).
- **Deep Leaf** (book-700): hairlines on the ground (top bar, footer), viewer canvas behind previewed pages, toolbar hover, body text in plain-text emails.
- **Slate Leaf** (book-600): dashed slot outlines, scrollbar thumb, current-locale fill, header-name labels on paper, lede text.
- **Mid Slate** (book-500): secondary text on paper (field labels, inactive tabs, hints, stamp meta).
- **Muted Slate** (book-400): decorative-only marks on paper (recipient separators, idle copy icons) and the disabled-stamp ink. Not for readable text on paper.
- **Pale Slate** (book-300): secondary text on the ground (rail title, footer text, drop hint, locale options); the second backing sheet.
- **Mist** (book-200): primary-ish text on the ground (privacy line, trust warning); the first backing sheet; hairlines on paper.
- **Fog** (book-100): main text on the ground; tinted surfaces on paper (remote notice, segmented track, hover fills).
- **Letter White** (paper): letter sheets, stamp faces, previewed pages, paper buttons, and text on ink fills.

### Named Rules
**The Single Ramp Rule.** The nine book steps plus paper white are the only neutrals. No Tailwind greys, no ad-hoc hex greys; tints are built by mixing a book step with transparency.

**The Ink Has A Meaning Rule.** Ultramarine is active, carmine is PDF or warning, olive is every other file. An ink never appears as decoration without that meaning.

**The Ground Variant Rule.** Base inks carry text and icons on paper; their light or bright variants carry text and icons on the dark ground. Base inks may appear on the ground only as non-text bars (the modal's ink edge).

## Typography

**Display Font:** Barlow Semi Condensed (with Barlow, ui-sans-serif, system-ui)
**Body Font:** Barlow (with ui-sans-serif, system-ui)

**Character:** A sturdy, slightly mechanical grotesque with its condensed sibling for anything that would be printed or struck: subjects read like typeset headlines, sizes like stamp values, the postmark like an inked die. Both are self-hosted (Barlow 400/600, Semi Condensed 600/700); the email body iframe receives Barlow 400/600 so plain-text mail matches the page.

### Hierarchy
- **Display** (Semi Condensed 600, 36px mobile / 48px from 640px, line-height 1.1, max 16ch, balanced): the empty-state title on the blank sheet.
- **Headline** (Semi Condensed 600, 26px mobile / 34px from 640px, line-height 1.15, balanced): the email subject.
- **Denomination** (Semi Condensed 700, 22px, line-height 1, tabular): file size on a stamp, printed in the stamp's ink.
- **Postmark** (Semi Condensed 700 uppercase, 16px mobile / 22px; ring lines 600 uppercase 9px/11px, tracking 0.08em/0.12em): only inside the postmark.
- **Wordmark** (Semi Condensed 700, 22px, tracking 0.01em): top bar only.
- **Label** (Semi Condensed 600 uppercase, 13px, tracking 0.14em; footer headings 15px, 0.1em): section titles on the dark ground, such as the attachment rail title. A label is the heading of its section, never a line above another heading.
- **Body Large** (Barlow 400, 18px, line-height 1.625, max 56ch): the empty-state lede.
- **Body** (Barlow 400, 16px; 15px under 640px, line-height 1.65): header fields, plain-text email at 17px/1.6 within 72ch.
- **UI** (Barlow 600, 15px): tabs, buttons, attachment link, stamp file names, viewer file titles.
- **Small** (Barlow 400, 14px): hints, notices, footer, warnings.
- **Meta** (Barlow 400, 13px): stamp kind and action line, locale options (600).

### Named Rules
**The Struck Type Rule.** Semi Condensed is for what would be printed or stamped: subjects, display titles, denominations, the postmark, labels, the wordmark. Reading text, controls, and field values are always Barlow.

**The Tabular Numbers Rule.** Sizes, counts, and times use tabular figures.

## Layout

A centred page up to 1280px wide with side gutters of 16px, 32px from 640px, and 40px from 1024px. A 64px top bar (wordmark left; privacy line, language switch, and open-file button right) sits over a hairline in book-700. The stage below has 32px vertical padding (40px from 640px) and, from 1024px, a two-column grid: the letter stack in a fluid column and a fixed 300px attachment rail, separated by 40px. The footer is pinned to the bottom of the page with a book-700 hairline and two columns from 640px.

The letter sheet pads 20px horizontally on mobile and 44px from 640px. The rail is sticky at 24px from the top on desktop. The stage clips horizontal overflow with a 1rem margin so tilted sheets never cause sideways scroll.

**Responsive behaviour.**
- Under 1024px the rail drops below the letter; the stamp strip becomes two columns between 640px and 1024px and a single column otherwise.
- Under 768px the privacy line leaves the top bar and becomes its own strip under it, with the same shield icon and a hairline.
- Under 640px the open-file button switches to its short label, the postmark shrinks (about 116px instead of 132px) and drops its cancellation bars, and the header fields clear below the postmark rather than wrapping beside it.
- The empty-state rail (ghost stamp slots) is shown from 1024px only.
- Viewer toolbars in the modal grow to 64px and stack their side groups under 900px, and hide secondary controls under 600px.

## Elevation & Depth

Depth is physical, not interface. The ground and all chrome are flat; only paper objects cast shadows, and each kind of object has one shadow. Backing sheets imply depth by rotation and offset, not by shadow.

### Shadow Vocabulary
- **Laid sheet** (`box-shadow: 0 18px 40px rgb(0 0 0 / 0.35)`): the letter sheet, empty or loaded.
- **Previewed page** (`box-shadow: 0 12px 30px rgb(0 0 0 / 0.35)`): PDF pages and text sheets inside the viewer.
- **Mounted stamp** (`filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.3))`, lifting to `drop-shadow(0 8px 12px rgb(0 0 0 / 0.4))` on hover): drop-shadow follows the perforated silhouette.
- **Pressed-in segment** (`box-shadow: 0 1px 2px rgb(15 23 21 / 0.18)`): the selected segmented option and the paper button inside the remote notice.
- **Modal** (`box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)`): the attachment viewer.

### Named Rules
**The Only Paper Casts Rule.** Sheets, stamps, and previewed pages cast shadows; bars, rails, notices, and buttons on the ground do not.

**The Paper Stack Rule.** The letter always sits on one backing sheet (book-200, rotated about -1.5°, offset -6px/6px); when the email has attachments a second sheet appears beneath it (book-300, rotated 1.2°, offset 8px/4px).

## Shapes

Paper corners are barely softened (3px) on sheets, the wordmark tile, the modal, and segmented options; controls use 4px. Everything else is square: the glassine strip, dashed slots, viewer toolbars, and toolbar buttons.

Stamps have no radius at all; their edge is a perforation made from a 6px dot grid, so the silhouette reads as torn paper rather than a rounded card.

### Named Rules
**The One Circle Rule.** The postmark is the only circle in the system, and there is at most one per view. Perforation holes are part of the stamp edge, not shapes of their own.

**The Square Page Rule.** Structural rules (hairlines, borders, dividers, tab underlines, dashed slots) run only at 0° and 90°. Rotation belongs to physical objects: backing sheets, the postmark with its cancellation bars, the stamp's hover tilt, and the lay-down motion.

**The Dashed Means Empty Rule.** A dashed outline (1.5px book-600 on the ground, 2px ultramarine-light while dragging) marks a slot waiting for something: ghost stamps, the drop-another-file hint, the drag target.

## Components

### Buttons
Few, solid, and plain; ink only on the primary.
- **Shape:** softened corners (4px).
- **Primary:** ultramarine fill, white Barlow 600 text at 18px, 12px/20px padding, leading icon. Used once per view for the main action (choose a file, download). Hover darkens toward black (ultramarine mixed 85% with black); active nudges down 1px; busy state drops to 80% opacity with a progress cursor.
- **Paper button:** white fill, book-800 text at 15px/600, 8px/14px padding; hover fills book-100. Used on the dark ground for "Open another file", and on paper (with the pressed-in segment shadow and ultramarine text) for the remote-content toggle.
- **Outline on dark:** 1px book-500 border, book-100 text; hover fills book-700. Secondary action in the download viewer.
- **Viewer toolbar buttons:** square, 40-48px, transparent on book-900, hover book-700, pressed book-600, disabled at 50% opacity.

### Tabs
- **Style:** Barlow 600 15px, book-500 at rest, book-800 on hover and when selected; the selected tab carries a 3px ultramarine underline drawn on the book-200 hairline.
- **Focus:** the focus ring switches to ultramarine and is inset 2px so it stays on the paper.
- **Keyboard:** arrow keys move between Message and Headers.

### Segmented control
- **Style:** book-100 track with 2px padding and 4px radius; options are 14px Barlow 600, book-500; the selected option is a white 3px-radius segment with book-800 text and the pressed-in segment shadow.

### Navigation (language switch)
- **Style:** a 1px book-600 bordered group (4px radius, 2px padding); options are 13px Barlow 600, slightly tracked, book-300, brightening to book-100 on hover; the current locale is a book-600 fill with white text.

### Letter sheet
- **Corner Style:** 3px.
- **Background:** paper white, text book-800.
- **Shadow Strategy:** laid-sheet shadow; sits on the paper stack.
- **Internal structure:** tabs, then the letterhead (postmark floated top right, subject, From/To/Cc/Date in a 3.5rem label column, then a toolbar with the attachment link and segmented control), closed by a book-200 hairline; the body iframe follows, sized to its content.

### Stamp (signature)
The attachment, mounted. Size is the denomination.
- **Edge:** a 6px perforation ring cut from a radial dot grid around a white face; drop-shadow follows the perforations.
- **Face:** white, 10px/12px/12px padding; a 6px ink bar across the top; file name (15px Barlow 600, up to two lines) beside the denomination (22px Semi Condensed 700 in the ink, tabular); a meta line beneath (13px, book-500) reading "Kind · Action".
- **Ink per kind:** PDF carmine, image ultramarine, everything else olive. The same ink colours the viewer modal's 4px top edge, so the stamp and its opened view are one object.
- **Hover:** lifts 2px and tilts -0.6° with a deeper drop-shadow (180ms, exponential ease-out).
- **Focus:** global ring, offset 4px so it clears the perforations.
- **Disabled (empty file):** ink becomes book-400, the stamp is greyscaled at 70% opacity, the name is struck through, and it neither lifts nor tilts.
- **Mount:** the strip is a glassine pocket: a faint translucent blue-white wash with a brighter top edge, 14px/16px padding, 16px between stamps.

### Postmark (signature)
- **Form:** a circle (about 116px mobile, 132px from 640px) with a 3px ultramarine ring, rotated -8°, floated top right of the letter.
- **Content:** "Opened locally" ring line, the open date (or "No upload" in the empty state) struck large, and the time (or "This device") below.
- **Cancellation bars:** from 640px, two 3px parallel bars at 18% opacity run left from the ring behind it, rotating with the postmark.
- **Motion:** strikes onto the sheet after the letter lands (see motion).

### States and notices
- **Focus ring:** 2px ultramarine-light outline, 2px offset, everywhere by default; tabs use ultramarine inset so the ring reads on paper.
- **Error (parse failure):** the carmine-wash ground on the blank sheet with a carmine alert icon and carmine semibold title, book-700 explanation, and the raw error detail in small book-500.
- **Remote-content notice:** a book-100 band on paper (14px book-700 text, image-off icon in book-500) stating whether remote images are blocked, with a paper button toggling them. Never coloured as a warning; it reports a protection.
- **Trust warning:** on the ground under the strip, 14px book-200 with a carmine-light shield icon.
- **Drag overlay:** the whole viewport dims to book-900 at 82% and shows a dashed ultramarine-light target with a large tray icon.

### Attachment viewer (modal)
- **Frame:** book-800 body, 1px book-700 border, 3px radius, 4px ink edge on top matching the stamp, max 1000px wide, over a book-900 backdrop at 80%.
- **Toolbar:** 48px book-900 bar with file title, page/zoom controls, size, download, and close.
- **Canvas:** book-700 behind previewed pages; images sit on a 20px book-600/book-700 checkerboard; text attachments render as a white sheet up to 80ch.

### Browser surfaces
- **Selection:** ultramarine with white text (PDF text layer: ultramarine at 35%).
- **Scrollbar:** book-600 thumb on a book-900 track; `color-scheme: dark` on the page.
- **Focus:** as above.

### Motion
One easing for anything that lands or settles, exponential ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`); plain ease-out at 150ms for colour and state changes.
- **Lay-down** (520ms): the letter rises 18px and settles from a 0.8° tilt when an email opens.
- **Cancel** (420ms, 180ms delay): the postmark strikes from 1.25× scale and -14° to its resting -8°, fading in.
- **Mount stagger** (420ms, starting at 260ms, +70ms per stamp): each stamp rises 10px into the strip.
- **Rise** (260ms): the modal settles 12px; backdrops fade in over 120-140ms.
- **Reduced motion:** under `prefers-reduced-motion: reduce`, every animation and transition collapses to 0.01ms; objects appear in their final state.

## Do's and Don'ts

### Do:
- **Do** take every neutral from the nine book steps or paper white; build tints by giving a book step transparency.
- **Do** give each attachment kind its fixed ink (PDF carmine, image ultramarine, other olive) on the stamp bar, denomination, and the viewer's top edge.
- **Do** use the light or bright ink variant for text and icons on the dark ground, and the base ink on paper.
- **Do** set subjects, display titles, denominations, labels, and the postmark in Barlow Semi Condensed; everything readable in Barlow.
- **Do** keep the postmark as the single circle per view, struck at -8° with a 3px ring.
- **Do** keep hairlines, borders, and underlines at 0° or 90°; let only sheets, stamps, and the postmark rotate.
- **Do** use exponential ease-out for anything that lands, and honour reduced motion by removing it.
- **Do** mark empty slots with a dashed book-600 outline.

### Don't:
- **Don't** introduce a neutral outside the book ramp, or use Tailwind's default greys.
- **Don't** use an ink without its meaning: no carmine accents that are not PDFs or warnings, no olive outside non-PDF, non-image files and the local/safe signal.
- **Don't** add a second circle: no round avatars, pill badges, circular icon buttons, or a second postmark.
- **Don't** draw rules at diagonals or put shadows on chrome; depth belongs to paper.
- **Don't** give stamps rounded corners or a plain border; their edge is perforated.
- **Don't** put base ultramarine, carmine, or olive text on the dark ground.
- **Don't** stack an uppercase label above a heading; labels are headings of their own section.
