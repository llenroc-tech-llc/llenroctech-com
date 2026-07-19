# Portfolio gallery architecture

The public `/portfolio` route is lazy loaded from `app.routes.ts`. `PortfolioPageComponent` composes the owned-work galleries, trusted technologies, the secondary marketplace gallery, and the final CTA. `PortfolioCardComponent` is shared with the compact homepage Featured Work section.

All Llenroc-owned content is defined in `portfolio.data.ts` using `PortfolioProject`. Supported sections are `featured`, `templates`, and `innovation`; supported statuses are Live, Live Demo, Live Concept Demo, In Development, Coming Soon, Research, Design Concept, and Private Case Study. Cards are data-driven: add or update one object, provide only a verified public URL, and select the correct status. Future case studies can use `caseStudyUrl` without changing card markup.

Public content must remain factual. A concept is never a client engagement, future capability is never described as complete, and private repository URLs are never published. External links require HTTPS, descriptive text, a new-tab indication, and `noopener noreferrer`.

Route metadata includes the requested title, description, canonical URL, Open Graph fields, Twitter card, CollectionPage, and BreadcrumbList. Marketplace items are intentionally excluded from owned-work structured data.
