import { Route, Routes } from '@angular/router';
import { DevelopmentPageData } from './enterprise-page.models';

const developmentRoute = (path: string, page: DevelopmentPageData): Route => ({
  path,
  title: `${page.title} | Llenroc Tech`,
  data: page,
  loadComponent: () => import('./development-status-page/development-status-page.component').then(m => m.DevelopmentStatusPageComponent),
});

export const ENTERPRISE_ROUTES: Routes = [
  {
    path: 'knowledge',
    loadComponent: () => import('./enterprise-page-layout/enterprise-page-layout.component').then(m => m.EnterprisePageLayoutComponent),
    children: [
      { path: '', title: 'Knowledge Center | Llenroc Tech', loadComponent: () => import('./knowledge-center/knowledge-center.component').then(m => m.KnowledgeCenterComponent) },
      developmentRoute('ai-research', { title: 'AI Research', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'Research in Progress', description: 'A developing collection focused on applied AI research, responsible evaluation, technical experiments, and practical enterprise use cases.', expectations: ['Applied AI research', 'Model evaluation', 'Responsible AI', 'Enterprise use cases', 'Technical experiments'] }),
      developmentRoute('spring-boot', { title: 'Spring Boot', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'In Development', description: 'Enterprise Java guidance for designing, securing, testing, and operating maintainable Spring Boot services.', expectations: ['Enterprise API patterns', 'Security', 'Data access', 'Testing', 'Deployment'] }),
      developmentRoute('angular', { title: 'Angular', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'In Development', description: 'Practical guidance for building accessible, scalable, and maintainable enterprise Angular applications.', expectations: ['Enterprise front-end architecture', 'State management', 'Accessibility', 'Performance', 'Testing'] }),
      developmentRoute('graphql', { title: 'GraphQL', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'In Development', description: 'Enterprise GraphQL patterns covering durable schemas, distributed graphs, secure access, and effective client integration.', expectations: ['Schema design', 'Federation', 'API gateways', 'Security', 'Client integration'] }),
      developmentRoute('enterprise-architecture', { title: 'Enterprise Architecture', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'In Development', description: 'Architecture resources for connecting business priorities with secure, resilient, and evolvable technology systems.', expectations: ['Solution architecture', 'Integration patterns', 'Security architecture', 'Cloud design', 'Architecture decision records'] }),
      developmentRoute('case-studies', { title: 'Case Studies', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'Planned', description: 'Structured technical case studies designed to explain challenges, architectural choices, delivery approaches, and transferable lessons.', expectations: ['Business challenge', 'Technical approach', 'Architecture', 'Delivery outcomes', 'Lessons learned'] }),
      developmentRoute('white-papers', { title: 'White Papers', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'Planned', description: 'Long-form enterprise analysis addressing technology strategy, modernization, applied AI, cloud systems, and governance.', expectations: ['Enterprise technology analysis', 'AI adoption', 'Software modernization', 'Cloud architecture', 'Security and governance'] }),
      developmentRoute('government-research', { title: 'Government Research', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'Research in Progress', description: 'Research into public-sector technology priorities, policy, cybersecurity, procurement, and responsible digital modernization.', expectations: ['Federal technology priorities', 'Procurement research', 'Cybersecurity', 'AI policy', 'Digital modernization'] }),
      developmentRoute('grant-research', { title: 'Grant Research', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'Research in Progress', description: 'A structured research area for identifying and analyzing technology-focused funding programs and planning considerations.', expectations: ['Relevant technology grants', 'Eligibility research', 'Program analysis', 'Application planning', 'Funding opportunities'] }),
      developmentRoute('blogs', { title: 'Blogs', area: 'Knowledge Center', areaRoute: '/knowledge', status: 'In Development', description: 'A developing publication stream for engineering perspectives, architecture discussions, applied AI updates, and company news.', expectations: ['Engineering insights', 'Architecture discussions', 'AI updates', 'Project lessons', 'Llenroc Tech news'] }),
    ],
  },
  {
    path: 'ai-platform',
    loadComponent: () => import('./enterprise-page-layout/enterprise-page-layout.component').then(m => m.EnterprisePageLayoutComponent),
    children: [
      { path: '', title: 'AI Platform | Llenroc Tech', loadComponent: () => import('./ai-platform/ai-platform.component').then(m => m.AiPlatformComponent) },
      { path: 'overview', title: 'AI Platform Overview | Llenroc Tech', loadComponent: () => import('./ai-platform-overview/ai-platform-overview.component').then(m => m.AiPlatformOverviewComponent) },
      developmentRoute('architecture', { title: 'AI Platform Architecture', area: 'AI Platform', areaRoute: '/ai-platform', status: 'In Development', description: 'A developing architectural view of the platform layers, service boundaries, controls, and operational foundations.', expectations: ['Platform layers', 'Service boundaries', 'Security', 'Observability', 'Integration patterns'] }),
      developmentRoute('agents', { title: 'AI Agents', area: 'AI Platform', areaRoute: '/ai-platform', status: 'In Development', description: 'A planned capability area for secure, task-oriented agents that use enterprise tools within governed workflows.', expectations: ['Task-oriented agents', 'Tool integration', 'Human oversight', 'Workflow orchestration', 'Agent security'] }),
      developmentRoute('mcp', { title: 'MCP Servers', area: 'AI Platform', areaRoute: '/ai-platform', status: 'In Development', description: 'A developing integration layer for standardized, controlled access to tools, resources, and enterprise capabilities.', expectations: ['Tool and resource access', 'Standardized integrations', 'Security boundaries', 'Enterprise connectors', 'Agent interoperability'] }),
      developmentRoute('graphql', { title: 'GraphQL Integration', area: 'AI Platform', areaRoute: '/ai-platform', status: 'In Development', description: 'A planned graph integration layer for connecting platform capabilities with enterprise APIs and distributed services.', expectations: ['Schema design', 'Federation', 'API orchestration', 'Authorization', 'Client and service integration'] }),
      developmentRoute('rag', { title: 'Retrieval-Augmented Generation', area: 'AI Platform', areaRoute: '/ai-platform', status: 'In Development', description: 'A developing approach to grounding AI workflows in approved, relevant, and access-controlled enterprise knowledge.', expectations: ['Retrieval pipelines', 'Vector search', 'Source grounding', 'Evaluation', 'Access control'] }),
      developmentRoute('integrations', { title: 'Enterprise Integrations', area: 'AI Platform', areaRoute: '/ai-platform', status: 'Planned', description: 'A planned integration portfolio connecting intelligent workflows to the systems and data enterprises already operate.', expectations: ['APIs', 'Events', 'Databases', 'SaaS platforms', 'Legacy systems'] }),
      { path: 'roadmap', title: 'AI Platform Roadmap | Llenroc Tech', loadComponent: () => import('./ai-platform-roadmap/ai-platform-roadmap.component').then(m => m.AiPlatformRoadmapComponent) },
      developmentRoute('demo', { title: 'AI Platform Demo', area: 'AI Platform', areaRoute: '/ai-platform', status: 'In Development', description: 'A planned demonstration experience for exploring platform concepts, intelligent workflows, agents, and enterprise integrations.', expectations: ['Interactive platform demonstrations', 'Guided workflows', 'Architecture walkthroughs', 'AI agent examples', 'Integration examples'] }),
    ],
  },
];
