import {
  Component, HostListener, Renderer2,
  OnInit, AfterViewInit, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import aos from 'aos';

import { GsapRevealDirective } from '../../../directives/gsap-reveal.directive';
import { CounterDirective } from '../../../directives/counter.directive';
import { ClassManagerService } from '../../../services/classmanaer.service';

import { ContactComponent } from '../contact/contact.component';
import { HeroAreaComponent } from '../hero-area/hero-area.component';
import { AboutAreaComponent } from '../about-area/about-area.component';
import { ServiceSectionComponent } from '../service-section/service-section.component';
import { SkillSectionComponent } from '../skill-section/skill-section.component';
// import { PortfolioSectionComponent } from '../portfolio-section/portfolio-section.component';
import { BlogSectionComponent } from '../blog-section/blog-section.component';
import { DesignModelSectionComponent } from '../design-model-section/design-model-section.component';

import { Testimonial } from '../../../model/testimonial.model';
import { TestimonialService } from '../../../services/testimonial.service';
import { take } from 'rxjs';
import { CheckoutService } from '../../../services/checkout.service';
import { TestimonialSectionComponent } from '../testimonial-section/testimonial-section.component';
// import { LlenrocTemplatesComponent } from '../llenroc-templates/llenroc-templates.component';
import { environment } from '../../../../environments/environment';
import { AiAssistantStateService } from '../../../services/ai-assistant-state.service';

interface HomeTopicLink {
  label: string;
  route?: string;
  externalUrl?: string;
  externalLabel?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    GsapRevealDirective,
    ContactComponent,
    HeroAreaComponent,
    AboutAreaComponent,
    ServiceSectionComponent,
    SkillSectionComponent,
    // PortfolioSectionComponent,
    TestimonialSectionComponent,
    DesignModelSectionComponent,
    // LlenrocTemplatesComponent,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, AfterViewInit {
  readonly aiPlatformTopics: HomeTopicLink[] = [
    { label: 'Overview', route: '/ai-platform/overview' },
    { label: 'Architecture', route: '/ai-platform/architecture' },
    { label: 'AI Agents', route: '/ai-platform/agents' },
    { label: 'MCP Servers', route: '/ai-platform/mcp' },
    { label: 'GraphQL', route: '/ai-platform/graphql' },
    { label: 'RAG', route: '/ai-platform/rag' },
    { label: 'Enterprise Integrations', route: '/ai-platform/integrations' },
    { label: 'Roadmap', route: '/ai-platform/roadmap' },
    { label: 'GitHub', externalUrl: 'https://github.com/llenroc-tech-llc', externalLabel: 'Visit Llenroc Tech on GitHub (opens in a new tab)' },
    { label: 'Demo', route: '/ai-platform/demo' },
  ];

  readonly knowledgeTopics: HomeTopicLink[] = [
    { label: 'AI Research', route: '/knowledge/ai-research' },
    { label: 'Spring Boot', route: '/knowledge/spring-boot' },
    { label: 'Angular', route: '/knowledge/angular' },
    { label: 'GraphQL', route: '/knowledge/graphql' },
    { label: 'Enterprise Architecture', route: '/knowledge/enterprise-architecture' },
    { label: 'Case Studies', route: '/knowledge/case-studies' },
    { label: 'White Papers', route: '/knowledge/white-papers' },
    { label: 'Government Research', route: '/knowledge/government-research' },
    { label: 'Grant Research', route: '/knowledge/grant-research' },
    { label: 'Blogs', route: '/knowledge/blogs' },
  ];

  currentSection = 'list-item-1';
  year = new Date().getFullYear();
  isModelOpen = false;
  stripePayLink = 'https://buy.stripe.com/your_payment_link'; // TODO: replace
  invoiceLink = '/contact';

  pageClass = '';

  sectionIds = [
    'list-item-1','list-item-2','list-item-3','list-item-4',
    'list-item-5','list-item-6','list-item-7','list-item-8',
    'list-item-9', 'list-item-10', 'list-item-11', 'list-item-12',
    'list-item-13', 'list-item-14'
  ];

  myTestimonials: Testimonial[] = [];
  writeReviewUrl = environment?.googlePlaceId
    ? `https://search.google.com/local/writereview?placeid=${encodeURIComponent(environment.googlePlaceId)}`
    : '';

  get reviewTotal(): number {
    return this.myTestimonials.length;
  }

  get averageRating(): number {
    if (!this.reviewTotal) return 0;
    return this.myTestimonials.reduce((sum, item) => sum + (item.rating ?? 0), 0) / this.reviewTotal;
  }

  openReview(): void {
    if (this.writeReviewUrl) window.open(this.writeReviewUrl, '_blank', 'noopener');
  }

  constructor(
    private renderer: Renderer2,
    public classManager: ClassManagerService,
    private cdr: ChangeDetectorRef,
    private testimonialSvc: TestimonialService,
    private checkout: CheckoutService,
    public aiAssistant: AiAssistantStateService
  ) {}

  ngOnInit() {
    this.pageClass = this.classManager.getClass();

    this.testimonialSvc.getAll().pipe(take(1)).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.myTestimonials = data;
        } else {
          this.myTestimonials = [];
        }
      },
      error: () => {
        this.myTestimonials = [];
      }
    });
  }

  ngAfterViewInit() {
    aos.init({ once: true });
    // sync class on next tick if it changes
    queueMicrotask(() => {
      const next = this.classManager.getClass();
      if (next !== this.pageClass) {
        this.pageClass = next;
        this.cdr.detectChanges();
      }
    });


    const setSBW = () => {
  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--sbw', `${sbw}px`);
};
setSBW();
window.addEventListener('resize', setSBW);

  }

  openModel() { this.isModelOpen = true; }
  closeModel() { this.isModelOpen = false; }

  @HostListener('window:scroll', [])
  onScroll(): void { this.checkActiveSection(); }

  checkActiveSection(): void {
    for (const id of this.sectionIds) {
      const section = document.getElementById(id);
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top >= 0 && rect.top <= window.innerHeight / 3) {
          this.currentSection = id;
          break;
        }
      }
    }
  }

  setActiveLink(sectionId: string): void { this.currentSection = sectionId; }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    window.scrollTo({ top, behavior: 'smooth' });
    this.setActiveLink(id);
  }

  payNow(amount: number) {
    if (!amount || amount < 1) return;
    this.checkout.pay(amount).catch(console.error);
  }

  openAiDrawer(trigger?: HTMLElement): void { this.aiAssistant.open(trigger); }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null;
    const isTyping = target?.matches('input, textarea, select, [contenteditable="true"]');
    if (e.key === '/' && !isTyping && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      this.openAiDrawer();
    }
  }
}
