import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EnterpriseCard } from '../enterprise-page.models';

@Component({ selector: 'app-knowledge-center', standalone: true, imports: [RouterLink], templateUrl: './knowledge-center.component.html' })
export class KnowledgeCenterComponent {
  readonly categories: EnterpriseCard[] = [
    { title: 'AI Research', description: 'Applied research, evaluation, responsible AI, and enterprise use cases.', route: '/knowledge/ai-research', icon: 'fa-brain' },
    { title: 'Spring Boot', description: 'Enterprise API patterns, security, persistence, testing, and deployment.', route: '/knowledge/spring-boot', icon: 'fa-leaf' },
    { title: 'Angular', description: 'Scalable front-end architecture, accessibility, performance, and testing.', route: '/knowledge/angular', icon: 'fa-code' },
    { title: 'GraphQL', description: 'Schema design, federation, API gateways, security, and client integration.', route: '/knowledge/graphql', icon: 'fa-diagram-project' },
    { title: 'Enterprise Architecture', description: 'Solution design, integration patterns, cloud strategy, and decision records.', route: '/knowledge/enterprise-architecture', icon: 'fa-building' },
    { title: 'Case Studies', description: 'Technical approaches, architectures, delivery outcomes, and lessons learned.', route: '/knowledge/case-studies', icon: 'fa-briefcase' },
    { title: 'White Papers', description: 'Analysis of AI adoption, modernization, cloud architecture, and governance.', route: '/knowledge/white-papers', icon: 'fa-file-lines' },
    { title: 'Government Research', description: 'Federal technology priorities, cybersecurity, AI policy, and modernization.', route: '/knowledge/government-research', icon: 'fa-landmark' },
    { title: 'Grant Research', description: 'Technology grants, eligibility, program analysis, and funding opportunities.', route: '/knowledge/grant-research', icon: 'fa-magnifying-glass-dollar' },
    { title: 'Blogs', description: 'Engineering insights, architecture discussions, AI updates, and company news.', route: '/knowledge/blogs', icon: 'fa-pen-nib' },
  ];
}
