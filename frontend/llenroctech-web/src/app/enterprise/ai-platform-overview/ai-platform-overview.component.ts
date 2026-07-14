import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({ selector: 'app-ai-platform-overview', standalone: true, imports: [RouterLink], templateUrl: './ai-platform-overview.component.html' })
export class AiPlatformOverviewComponent {
  readonly capabilities = [
    { title: 'AI Agents', text: 'Task-oriented agent patterns that connect reasoning, tools, workflows, and human oversight.' },
    { title: 'Grounded Knowledge', text: 'Retrieval-augmented generation patterns designed to ground responses in approved enterprise sources.' },
    { title: 'MCP Servers', text: 'Standardized access to tools and resources with deliberate security and integration boundaries.' },
    { title: 'GraphQL & APIs', text: 'A connected integration layer spanning graph-based interfaces and established enterprise APIs.' },
    { title: 'Enterprise Integration', text: 'Planned connectivity for events, databases, SaaS products, and existing business systems.' },
    { title: 'Operational Foundation', text: 'Security, observability, governance, and scalability treated as platform-level concerns.' },
  ];
}
