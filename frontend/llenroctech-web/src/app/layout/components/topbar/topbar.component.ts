import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './topbar.component.html',
  styles: ``,
  providers: [],
})
export class TopbarComponent {
  get isLightMode(): boolean {
    return this.themeService.theme() === 'light';
  }
  isSidebarVisible: boolean = false;
  isOverlayActive: boolean = false;
  currentSection = 'list-item-1';
  constructor(
    private renderer: Renderer2,
    private readonly themeService: ThemeService,
  ) {}

  // Click handler for links
  onNavClick(id: string, ev?: Event) {
    ev?.preventDefault();

    // If you have a fixed header, offset here
    const OFFSET = 80; // px (tweak to your header height)
    const el = document.getElementById(id);
    if (el) {
      const top = window.scrollY + el.getBoundingClientRect().top - OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
      this.setActiveLink(id);
    }
  }

  scrollToId(id: string, ev?: Event) {
    ev?.preventDefault();
    const el = document.getElementById(id.startsWith('#') ? id.slice(1) : id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleTheme(event: Event) {
    this.themeService.setTheme(
      (event.target as HTMLInputElement).checked ? 'light' : 'dark',
    );
  }

  setActiveLink(link: string): void {
    this.currentSection = link;
  }

  toggleSidebar() {
    this.isSidebarVisible = !this.isSidebarVisible;
    this.isOverlayActive = this.isSidebarVisible;

    if (this.isSidebarVisible) {
      this.renderer.addClass(document.body, 'on-side');
    } else {
      this.renderer.removeClass(document.body, 'on-side');
    }
  }

  closeSidebar() {
    this.isSidebarVisible = false;
    this.isOverlayActive = false;
    this.renderer.removeClass(document.body, 'on-side');
  }
}
