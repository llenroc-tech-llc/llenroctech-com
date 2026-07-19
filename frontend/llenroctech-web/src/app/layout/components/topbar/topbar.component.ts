import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './topbar.component.html',
  styles: ``,
    providers: [],
})
export class TopbarComponent {
  isLightMode: boolean = false; // Tracks the current theme mode
  isSidebarVisible: boolean = false;
  isOverlayActive: boolean = false;
  currentSection = 'list-item-1';
  constructor(private renderer: Renderer2){}
  ngOnInit() {
    // Check the saved theme in localStorage and initialize the theme
    const savedTheme = localStorage.getItem('theme');
    this.isLightMode = savedTheme === 'light';
    this.updateBodyClass(); // Apply the saved theme on page load
  }

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
    this.isLightMode = (event.target as HTMLInputElement).checked;
    localStorage.setItem('theme', this.isLightMode ? 'light' : 'dark');
    this.updateBodyClass();
  }

  updateBodyClass() {
    if (this.isLightMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  }

  
  setActiveLink(link: string): void {
    this.currentSection = link
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
