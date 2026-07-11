import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

import { GsapRevealDirective } from '../../directives/gsap-reveal.directive';
import { TopbarComponent } from '../../layout/components/topbar/topbar.component';
import { ContactComponent } from '../../layout/components/contact/contact.component';
import { CommentsComponent } from '../../layout/components/comments/comments.component';
import { SupabaseService, DbPost, PostInput } from '../../services/supabase.service';
import { ClassManagerService } from '../../services/classmanaer.service';

type WriteMode = 'text' | 'html';

@Component({
  selector: 'app-blog-single',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    GsapRevealDirective,
    TopbarComponent,
    ContactComponent,
    CommentsComponent,
  ],
  templateUrl: './blog-single.component.html',
  styleUrls: ['./blog-single.component.scss'],
})
export class BlogSingleComponent {
  // DI
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supa = inject(SupabaseService);
  private sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);

  // Misc
  year = new Date().getFullYear();
  slug = '';
  todayIso = new Date().toISOString(); // fallback if you still reference it

  // Signals used in the template
  post = signal<DbPost | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  isCreate = signal(false);
  isEdit = signal(false);
  isAdmin = signal(false);
  uploadingHero = signal(false);
  writeMode = signal<WriteMode>('text');

  safeHtml: SafeHtml | null = null;

  // Reactive form
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      title: ['', Validators.required],
      slug: [''],
      category: [''],
      author: [''],
      author_avatar: [''],
      hero_image_url: [''],
      minutes: [3],
      // MUST be yyyy-MM-ddTHH:mm (no timezone) for <input type="datetime-local">
      published_at: [''],
      excerpt: [''],
      content_text: [''],  // plain text authoring
      content_html: [''],  // raw HTML authoring
    });


    // If anything "tz-ish" slips into published_at, normalize it to datetime-local
    this.form.get('published_at')!.valueChanges.subscribe((v: string) => {
      if (!v) return;
      // already OK?
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return;
      // contains tz/seconds → coerce
      if (/[zZ+]/.test(v) || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
        const fixed = this.isoToLocalInput(v);
        if (fixed && fixed !== v) {
          this.form.get('published_at')!.patchValue(fixed, { emitEvent: false });
        }
      }
    });
  }

  // ===== Helpers (DOM/SSR-safe) =====

  /** Remove inline style attributes without DOMParser */
  private stripInlineStyles(html?: string | null): string {
    if (!html) return '';
    return html.replace(/\sstyle="[^"]*"/gi, '').replace(/\sstyle='[^']*'/gi, '');
  }

  /** HTML → readable text */
  private htmlToText(html?: string | null): string {
    if (!html) return '';
    let s = html;
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(/<\/(p|div|h[1-6]|li)>/gi, '\n');
    s = s.replace(/<\/?[^>]+>/g, '');
    s = s.replace(/&nbsp;/gi, ' ')
         .replace(/&amp;/gi, '&')
         .replace(/&lt;/gi, '<')
         .replace(/&gt;/gi, '>');
    return s.replace(/\n{3,}/g, '\n\n').trim();
  }

  private escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** Text → HTML (paragraphs + <br>) */
  private textToHtml(plain?: string | null): string {
    if (!plain) return '';
    const esc = this.escapeHtml(plain.trim());
    return esc.split(/\n{2,}/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('\n');
  }

  /** ISO (with tz) → datetime-local string (no tz) */
  private isoToLocalInput(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /** datetime-local → ISO UTC (for DB) */
  private localInputToIso(local?: string | null): string | null {
    if (!local) return null;
    const d = new Date(local); // interpreted as local time
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  /** Editor preview (no DatePipe) */
  displayEditDate(): string {
    const v = (this.form.value.published_at as string) || '';
    if (!v) return '';
    const iso = this.localInputToIso(v);
    if (!iso) return '';
    try {
      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        .format(new Date(iso));
    } catch {
      return '';
    }
  }

  get previewHtml(): SafeHtml | null {
    try {
      const raw = this.writeMode() === 'text'
        ? this.textToHtml(this.form.value.content_text || '')
        : (this.form.value.content_html || '');
      const cleaned = this.stripInlineStyles(raw);
      return this.sanitizer.bypassSecurityTrustHtml(cleaned);
    } catch {
      return this.sanitizer.bypassSecurityTrustHtml('');
    }
  }

  // ===== Lifecycle =====

  // blog-single.component.ts
ngAfterViewInit(){
  const vid = document.querySelector<HTMLVideoElement>('video.body-overlay');
  if (vid){
    vid.muted = true;
    vid.setAttribute('playsinline','true');
    vid.play().catch(()=>{ /* ignore */ });
  }
}


  async ngOnInit() {
    try {
      this.isAdmin.set(await this.supa.isAdmin().catch(() => false));
    } catch {
      this.isAdmin.set(false);
    }

    const segments = this.route.snapshot.url?.map(s => s.path) ?? [];

    if (segments.includes('new')) {
      this.isCreate.set(true);
      this.writeMode.set('text');
      this.loading.set(false);
      return;
    }

    if (segments.includes('edit')) {
      this.isEdit.set(true);
      this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
      await this.loadForEdit(this.slug);
      return;
    }

    // VIEW
    try {
      this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
      if (!this.slug) { this.error.set('Missing slug'); return; }

      const p = await this.supa.getPostBySlug(this.slug, 'llenroctech');
      if (!p) { this.error.set('not_found'); return; }

      this.post.set(p);
      const cleaned = this.stripInlineStyles(p.content_html || '');
      this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(cleaned);
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to load post');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadForEdit(slug: string) {
    try {
      if (!slug) { this.error.set('Missing slug'); return; }
      const p = await this.supa.getPostBySlug(slug, 'llenroctech');
      if (!p) { this.error.set('not_found'); return; }

      this.post.set(p);

      const {
        title, category, author, author_avatar,
        hero_image_url, minutes, published_at, excerpt, content_html
      } = p;

      const content_text = this.htmlToText(content_html || '');

      this.form.patchValue({
        title: title ?? '',
        slug: p.slug ?? '',
        category: category ?? '',
        author: author ?? '',
        author_avatar: author_avatar ?? '',
        hero_image_url: hero_image_url ?? '',
        minutes: minutes ?? 3,
        // Convert ISO → datetime-local (no tz)
        published_at: this.isoToLocalInput(published_at),
        excerpt: excerpt ?? '',
        content_text,
        content_html: content_html ?? '',
      });

      this.writeMode.set('text');
    } catch (e: any) {
      this.error.set(e?.message || 'Failed');
    } finally {
      this.loading.set(false);
    }
  }

  // ===== View toolbar =====
  async startEdit() {
    if (!this.post()) return;
    await this.router.navigate(['/blog-single', this.post()!.slug, 'edit']);
  }

  async remove() {
    if (!this.post() || !confirm('Delete this post?')) return;
    try {
      await this.supa.deletePost(this.post()!.id);
      await this.router.navigate(['/index-2'], { fragment: 'list-item-7' });
    } catch (e) {
      alert('Delete failed');
      console.error(e);
    }
  }

  // ===== Editor actions =====
  private async afterSaveNavigateHome() {
    await this.router.navigate(['/index-2'], { fragment: 'list-item-7' });
    setTimeout(() => {
      const el = document.getElementById('list-item-7');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  async save() {
    if (this.form.invalid) return;

    try {
      const val: any = { ...this.form.value };

      // datetime-local → ISO for DB
      if (val.published_at) {
        const iso = this.localInputToIso(val.published_at);
        val.published_at = iso ?? new Date().toISOString();
      }

      if (this.writeMode() === 'text') {
        val.content_html = this.textToHtml(val.content_text || '');
      }
      delete val.content_text;

      if (this.isCreate()) {
        await this.supa.createPost('llenroctech', val as PostInput);
      } else {
        if (!this.post()) throw new Error('Post not loaded');
        await this.supa.updatePost(this.post()!.id, val as Partial<PostInput>);
      }

      await this.afterSaveNavigateHome();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Save failed.');
    }
  }

  async cancel() {
    if (this.isCreate()) {
      await this.router.navigate(['/index-2'], { fragment: 'list-item-7' });
    } else if (this.post()) {
      await this.router.navigate(['/blog-single', this.post()!.slug]);
    } else {
      await this.router.navigate(['/index-2'], { fragment: 'list-item-7' });
    }
  }

  // ===== Hero upload (Storage: 'blog') =====
  async onHeroSelect(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      this.uploadingHero.set(true);
      const url = await this.supa.uploadPublicImage(file, 'heroes', 'blog');
      this.form.patchValue({ hero_image_url: url });
    } catch (e: any) {
      console.error('Upload error:', e?.message || e);
      alert(e?.message || 'Image upload failed.');
    } finally {
      this.uploadingHero.set(false);
      input.value = '';
    }
  }

  // Smooth scroll helper (for contact CTA)
  scrollToInScroller(id: string, scroller: HTMLElement, ev?: Event) {
    ev?.preventDefault();
    const target = document.getElementById(id);
    if (!target || !scroller) return;
    scroller.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' });
  }
}
