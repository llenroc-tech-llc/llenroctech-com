import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skill-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skill-section.component.html',
  styleUrl: './skill-section.component.scss'
})
export class SkillSectionComponent {
  technologyGroups = [
    {
      title: 'Enterprise Development',
      description: 'The foundation for secure, scalable enterprise applications.',
      icon: 'fa-solid fa-code',
      technologies: [
        'Java 21', 'Spring Boot', 'Spring Security', 'Spring Data JPA',
        'GraphQL', 'REST APIs', 'Angular', 'TypeScript', 'Ionic',
        'SQL', 'PostgreSQL', 'MySQL'
      ]
    },
    {
      title: 'AI Engineering',
      description: 'Intelligent systems and agentic workflows built for real business use.',
      icon: 'fa-solid fa-brain',
      technologies: [
        'OpenAI', 'Azure OpenAI', 'AI Agents', 'Agentic Workflows',
        'MCP (Model Context Protocol)', 'Retrieval Augmented Generation (RAG)',
        'Prompt Engineering', 'Tool Calling', 'AI Evaluation', 'AI Safety'
      ]
    },
    {
      title: 'Enterprise Integration',
      description: 'Connected platforms, identity, messaging, and business systems.',
      icon: 'fa-solid fa-diagram-project',
      technologies: [
        'GraphQL', 'REST', 'Event-driven Architecture', 'Kafka', 'RabbitMQ',
        'OAuth2', 'OpenID Connect', 'SAML', 'Azure AD', 'Microsoft Graph',
        'Payment APIs', 'SharePoint', 'Salesforce (future)'
      ]
    },
    {
      title: 'Cloud & DevOps',
      description: 'Reliable cloud delivery, automation, and modern infrastructure.',
      icon: 'fa-solid fa-cloud',
      technologies: [
        'Azure', 'AWS', 'Docker', 'Kubernetes', 'GitHub Actions',
        'Jenkins', 'Netlify', 'Azure Functions', 'CI/CD'
      ]
    },
    {
      title: 'Observability',
      description: 'Visibility into application health, behavior, and performance.',
      icon: 'fa-solid fa-chart-line',
      technologies: [
        'OpenTelemetry', 'Grafana', 'Sentry', 'Elastic', 'Logging',
        'Metrics', 'Distributed Tracing'
      ]
    }
  ];
}
