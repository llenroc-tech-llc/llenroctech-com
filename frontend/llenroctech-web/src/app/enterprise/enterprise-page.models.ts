export interface EnterpriseCard {
  title: string;
  description: string;
  route: string;
  icon: string;
  status?: string;
}

export interface DevelopmentPageData {
  title: string;
  description: string;
  area: string;
  areaRoute: string;
  status: 'In Development' | 'Planned' | 'Research in Progress';
  expectations: string[];
}
