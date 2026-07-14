import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EnterpriseCard } from '../enterprise-page.models';

@Component({ selector: 'app-ai-platform', standalone: true, imports: [RouterLink], templateUrl: './ai-platform.component.html' })
export class AiPlatformComponent {
  readonly areas: EnterpriseCard[] = [
    { title: 'Platform Overview', description: 'Vision, platform capabilities, and the distinction between current and planned work.', route: '/ai-platform/overview', icon: 'fa-compass' },
    { title: 'Architecture', description: 'Platform layers, service boundaries, security, observability, and integration patterns.', route: '/ai-platform/architecture', icon: 'fa-layer-group' },
    { title: 'AI Agents', description: 'Task-oriented agents, tool integration, oversight, orchestration, and agent security.', route: '/ai-platform/agents', icon: 'fa-robot' },
    { title: 'MCP Servers', description: 'Standardized tool and resource access for secure, interoperable enterprise agents.', route: '/ai-platform/mcp', icon: 'fa-server' },
    { title: 'GraphQL Integration', description: 'Graph-based API integration across platform and enterprise services.', route: '/ai-platform/graphql', icon: 'fa-diagram-project' },
    { title: 'Retrieval-Augmented Generation', description: 'Grounded retrieval pipelines, evaluation, vector search, and access controls.', route: '/ai-platform/rag', icon: 'fa-magnifying-glass' },
    { title: 'Enterprise Integrations', description: 'Connections spanning APIs, events, databases, SaaS platforms, and legacy systems.', route: '/ai-platform/integrations', icon: 'fa-plug' },
    { title: 'Platform Roadmap', description: 'Directional phases guiding platform research, engineering, governance, and scale.', route: '/ai-platform/roadmap', icon: 'fa-route' },
    { title: 'Platform Demo', description: 'Planned guided demonstrations of agents, workflows, architecture, and integrations.', route: '/ai-platform/demo', icon: 'fa-display' },
  ];
}
