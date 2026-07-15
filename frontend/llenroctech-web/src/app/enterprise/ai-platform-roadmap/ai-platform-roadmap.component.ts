import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({ selector: 'app-ai-platform-roadmap', standalone: true, imports: [RouterLink], templateUrl: './ai-platform-roadmap.component.html' })
export class AiPlatformRoadmapComponent {
  readonly phases = [
    { title: 'Foundation', text: 'Establish core architecture, engineering standards, security boundaries, observability foundations, and development environments.' },
    { title: 'Platform Services', text: 'Develop reusable services for models, prompts, tools, retrieval, evaluation, identity, and platform operations.' },
    { title: 'Intelligent Workflows', text: 'Explore task-oriented agents, orchestration, human approval, durable workflows, and operational feedback loops.' },
    { title: 'Enterprise Integrations', text: 'Expand connectivity across APIs, events, databases, SaaS platforms, and established enterprise systems.' },
    { title: 'Governance and Scale', text: 'Strengthen policy controls, auditability, evaluation, reliability, capacity management, and scalable operations.' },
  ];
}
