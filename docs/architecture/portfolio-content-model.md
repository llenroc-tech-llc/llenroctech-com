# Portfolio content model

`PortfolioProject` is the single source of truth for Llenroc Tech projects. To add a project or template, add one object to `PORTFOLIO_PROJECTS`, assign a unique ID and section, use a supported status, and set `sortOrder`. Add `liveUrl` only after verification; omit it for unavailable demos so the card renders a noninteractive availability label. Use `internalRoute` for Llenroc pages.

Template concepts require a repository-supported screenshot and the `Design Concept` status. Marketplace templates use the separate `MarketplaceTemplate` model because their ownership and labels differ.
