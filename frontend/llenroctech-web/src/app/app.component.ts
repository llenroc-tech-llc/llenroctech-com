import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import aos from 'aos';
import { CursorDirective } from './directives/cursor.directive';
import { filter } from 'rxjs';
import { AiAssistantDrawerComponent } from './layout/components/ai-assistant-drawer/ai-assistant-drawer.component';
import { SiteFooterComponent } from './layout/components/site-footer/site-footer.component';
import { ThemeService } from './services/theme.service';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CursorDirective,
    AiAssistantDrawerComponent,
    SiteFooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'llenroc-angular';
  pathLength: number = 0;
  strokeDashOffset: number = 0;
  offset: number = 50;
  duration: number = 550;
  constructor(
    private router: Router,
    private readonly themeService: ThemeService,
  ) {}

  ngOnInit() {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => aos.init());
    });
    const pathElement = document.querySelector(
      '.progress-circle path',
    ) as SVGPathElement;
    if (pathElement) {
      this.pathLength = pathElement.getTotalLength();
      pathElement.style.strokeDasharray = `${this.pathLength} ${this.pathLength}`;
      this.strokeDashOffset = this.pathLength;
    }

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url = e.urlAfterRedirects || e.url || '';
        document.body.classList.toggle(
          'show-bg-video',
          url === '/' || url.startsWith('/blog/'),
        );
      });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scroll = window.pageYOffset || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const progress = this.pathLength - (scroll * this.pathLength) / height;
    this.strokeDashOffset = progress;
    this.toggleActiveClass(scroll > this.offset);
  }

  toggleActiveClass(isActive: boolean) {
    const progressWrap = document.querySelector('.progress-wrap');
    if (progressWrap) {
      progressWrap.classList.toggle('active-progress', isActive);
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
