export type PortfolioStatus = 'Live' | 'Live Demo' | 'Live Concept Demo' | 'In Development' | 'Coming Soon' | 'Research' | 'Design Concept' | 'Private Case Study';
export type PortfolioSection = 'featured' | 'templates' | 'innovation';

export interface PortfolioProject {
  id: string; title: string; category: string; section: PortfolioSection; status: PortfolioStatus;
  summary: string; description?: string; image?: string; imageAlt?: string; technologies: string[];
  liveUrl?: string; internalRoute?: string; caseStudyUrl?: string; featured?: boolean; external?: boolean;
  disclaimer?: string; roadmap?: string[]; sortOrder?: number;
}

export interface MarketplaceTemplate {
  id: string; name: string; author?: string; category: string; framework?: string; description?: string;
  thumbnailUrl?: string; previewUrl?: string; marketplaceUrl: string; priceDisplay?: string; tags?: string[];
  source: 'Envato' | 'ThemeForest'; lastVerifiedAt?: string;
}
