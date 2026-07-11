import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GsapRevealDirective } from '../../../directives/gsap-reveal.directive';
import { SupabaseService, DbPost } from '../../../services/supabase.service';

@Component({
  selector: 'app-blog-section',
  standalone: true,
  imports: [CommonModule, RouterLink, GsapRevealDirective],
  templateUrl: './blog-section.component.html',
  styleUrls: ['./blog-section.component.scss'],
})
export class BlogSectionComponent implements OnInit {
  private supa = inject(SupabaseService);
  private router = inject(Router);

  pageSize = 4;
  currentPage = signal(1);
  posts = signal<DbPost[]>([]);
  admin = signal(false);

  constructor() {
    this.load();
  }

  async ngOnInit() {
    try {
      this.admin.set(await this.supa.isAdmin());
    } catch {
      this.admin.set(false);
    }
  }

  async load() {
    try {
      const list = await this.supa.getPosts('llenroctech');
      this.posts.set(list);
      // keep current page valid after deletes
      const total = this.totalPages();
      if (this.currentPage() > total) this.currentPage.set(total);
    } catch (e) {
      console.error('Failed to load posts', e);
    }
  }

  addPost() {
    this.router.navigate(['/blog-single', 'new']);
  }

  async deletePost(p: DbPost) {
    if (!this.admin()) return;
    if (!confirm(`Delete post "${p.title}"?`)) return;
    try {
      await this.supa.deletePost(p.id);
      this.posts.update(list => list.filter(x => x.id !== p.id));
      const total = this.totalPages();
      if (this.currentPage() > total) this.currentPage.set(total);
    } catch (e) {
      console.error('Delete failed', e);
      alert('Delete failed.');
    }
  }

  async devLogin() {
    const email = window.prompt('Admin email:');
    const password = email ? window.prompt('Password:') : null;
    if (!email || !password) return;

    try {
      await this.supa.signIn(email, password);
      this.admin.set(await this.supa.isAdmin());
      if (!this.admin()) {
        alert('Signed in, but this user is not in the admins table.');
      }
    } catch (e: any) {
      console.error(e);
      alert('Sign-in failed.');
    }
  }

  async devLogout() {
    await this.supa.signOut();
    this.admin.set(false);
  }

  // ---------- pagination helpers ----------
  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.posts().length / this.pageSize)),
  );

  visible = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.posts().slice(start, start + this.pageSize);
  });

  pageBar = computed<(number | '…')[]>(() => {
    const total = this.totalPages();
    const cur = this.currentPage();
    const out: (number | '…')[] = [];
    for (let p = 1; p <= total; p++) {
      const isEdge = p <= 2 || p > total - 2;
      const near = Math.abs(p - cur) <= 1;
      if (isEdge || near) out.push(p);
      else if (out[out.length - 1] !== '…') out.push('…');
    }
    return out;
  });

  goTo(p: number) {
    if (p >= 1 && p <= this.totalPages() && p !== this.currentPage()) {
      this.currentPage.set(p);
    }
  }
  prev() { this.goTo(this.currentPage() - 1); }
  next() { this.goTo(this.currentPage() + 1); }
}
