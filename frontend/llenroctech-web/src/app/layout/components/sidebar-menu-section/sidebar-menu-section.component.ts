import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-sidebar-menu-section',
  imports: [CommonModule],
  templateUrl: './sidebar-menu-section.component.html',
  styleUrl: './sidebar-menu-section.component.scss'
})
export class SidebarMenuSectionComponent {
  year = new Date().getFullYear();
  currentSection = 'list-item-1';

  sectionIds = [
    'list-item-1','list-item-2','list-item-3','list-item-4',
    'list-item-5','list-item-6','list-item-7','list-item-8',
    'list-item-9', 'list-item-10'
  ];

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
}
