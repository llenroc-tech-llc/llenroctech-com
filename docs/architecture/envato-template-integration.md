# Envato template integration

## History

The integration first appears in commit `4af94d2` (`chore: migrate website to company repository`) in `netlify/functions/envato-templates.ts`, `services/envato.service.ts`, and `layout/components/portfolio-section/`. It searched the supported ThemeForest discovery API for Angular terms and category modifiers. A separate `assets/llenroc-templates.json` contained Llenroc work. No collection behavior was found and no literal credential was discovered in tracked history.

## Current architecture

The browser calls only `/.netlify/functions/envato-templates`. The Netlify Function reads `ENVATO_PERSONAL_TOKEN`, applies a 6.5-second timeout, requests a curated Angular/business search, validates HTTPS URLs and ThemeForest marketplace hosts, normalizes only UI fields, and returns at most nine items. Responses use a six-hour shared cache with stale-while-revalidate; failures are not cached and expose no upstream details. The portfolio remains usable during loading, empty, malformed, timeout, and upstream-failure states.

Local development requires `ENVATO_PERSONAL_TOKEN` in an uncommitted Netlify environment. Never place it in Angular environment files, assets, browser storage, documentation, or logs. Rotate it in Envato and the deployment provider if compromise is suspected; then redeploy the function. Disable the section by removing `<app-marketplace-gallery>` or leave the token unset to exercise the safe unavailable state.

Items are design inspiration only. Curate six to nine current Angular items relevant to SaaS, business, dashboard, nonprofit, fitness, or professional-services work; exclude duplicates, broken links, unrelated frameworks, and weak/outdated designs. No packages are downloaded, no ThemeForest HTML is scraped, and marketplace items are never represented as Llenroc work.
