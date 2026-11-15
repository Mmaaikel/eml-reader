# EML Reader

Open `.eml` email files right in your browser. The file is parsed and shown on your own device: nothing is uploaded, and remote images in the email are blocked until you choose to load them.

You can read the message (formatted or plain text), inspect and copy its headers, and preview or download attachments: PDFs, images, text files, and emails attached to emails.

Fork of [matiboux/eml-reader](https://github.com/matiboux/eml-reader), redesigned and rebuilt with React.


## Stack

- [React](https://react.dev/) 19 + [Vite](https://vite.dev/), TypeScript
- [Tailwind CSS](https://tailwindcss.com/) 4, with [Iconify](https://iconify.design/) icons
- [postal-mime](https://github.com/postalsys/postal-mime) to parse emails, [pdf.js](https://mozilla.github.io/pdf.js/) for PDF previews
- [i18next](https://www.i18next.com/) for interface text (English, in `app/src/i18n/en.ts`)
- [Vitest](https://vitest.dev/) and [Playwright](https://playwright.dev/) for tests

The app lives in `app/`. Design decisions are recorded in `app/DESIGN.md` and product context in `app/PRODUCT.md`.


## Getting started

### Local development

Requires Node.js 24 and pnpm.

```sh
cd app
pnpm install
pnpm dev
```

The site is available at [http://localhost:4321](http://localhost:4321).

### Development with Docker

```sh
docker compose watch
# or: docker compose up -d
```

Using `watch`, file changes are synced and rebuilt. The site is available at [http://localhost:8080](http://localhost:8080).

### Production build

```sh
cd app
pnpm build     # type check, then build to app/dist/
pnpm preview   # serve the build locally
```

Or run the production image (nginx serving the static build):

```sh
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

The site is available at [http://localhost:8080](http://localhost:8080).


## Configuration

Set these at build time (in `.env`, as Docker build arguments, or as GitHub repository variables for the workflows):

| Variable | Purpose |
|---|---|
| `SITE_URL` | Public URL of the site, e.g. `https://example.com`. Needed for the canonical URL and link-preview image. |
| `BASE_PATH` | Path the site is served under, e.g. `/eml-reader/`. Defaults to `/`. |
| `ASSETS_PREFIX` | Optional URL prefix for built assets (e.g. a CDN). |
| `GITHUB_REPOSITORY_URL` | Repository linked in the footer. Defaults to this fork. |
| `GITHUB_SHA` / `VERSION_TAG` | Version shown in the footer. |


## Tests and checks

```sh
make check      # TypeScript
make test-unit  # Vitest: email parsing
make test-e2e   # Playwright: builds the app and drives it in a browser
make ci         # everything, plus Docker lint, dependency audit and secrets scan
```

Playwright needs its browser once: `cd app && pnpm exec playwright install chromium`.


## License

Original work copyright (c) 2024-2025 [Matiboux](https://github.com/matiboux) ([matiboux.me](https://matiboux.me)).
Modifications copyright (c) 2026 [Maikel](https://github.com/Mmaaikel).

Licensed under the [MIT License](https://opensource.org/license/MIT). You can see a copy in the [LICENSE](LICENSE) file.
