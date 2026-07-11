import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommentApiService, CommentItem } from '../../../services/comment-api.service';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss'],
})
export class CommentsComponent implements OnInit {
  @Input({ required: true }) slug!: string;

  private api  = inject(CommentApiService);
  private fb   = inject(FormBuilder);
  private supa = inject(SupabaseService);               

  comments = signal<CommentItem[]>([]);
  loading  = signal(true);
  error    = signal<string | null>(null);
  posting  = signal(false);
  admin    = signal(false);

  private myIdsKey = 'myCommentIds';
  myIds = new Set<string>(JSON.parse(localStorage.getItem(this.myIdsKey) || '[]'));

  form = this.fb.group({
    author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(60)]],
    text:   ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]],
  });

  async ngOnInit() {
    try {
      const list = await this.api.list(this.slug);
      this.comments.set(list);
    } catch (e: any) {
      this.error.set(e?.message || 'Failed to load comments');
    } finally {
      this.loading.set(false);
    }

    try {
      if (typeof this.supa.isAdmin === 'function') {
        this.admin.set(await this.supa.isAdmin());
      }
    } catch { this.admin.set(false); }
  }

  isInvalid(ctrl: string) {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  async submit() {
    if (this.form.invalid || this.posting()) return;
    this.posting.set(true);
    try {
      const { author, text } = this.form.value as { author: string; text: string };
      const added = await this.api.add(this.slug, author, text);
      this.comments.update(cs => [added, ...cs]);
      this.form.reset();
      this.myIds.add(added.id);
      localStorage.setItem(this.myIdsKey, JSON.stringify([...this.myIds]));
    } catch (e) {
      console.error(e);
      alert('Could not post comment.');
    } finally {
      this.posting.set(false);
    }
  }

  async remove(id: string) {
    if (!this.admin() && !this.myIds.has(id)) return;
    if (!confirm('Delete this comment?')) return;
    try {
      await this.api.remove(this.slug, id); // calls delete_comment RPC
      this.comments.update(cs => cs.filter(c => c.id !== id));
      if (this.myIds.delete(id)) {
        localStorage.setItem(this.myIdsKey, JSON.stringify([...this.myIds]));
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Delete failed.');
    }
  }

  mine(id: string) { return this.myIds.has(id); }

  initial(name: string) {
    const n = (name || '').trim();
    return n ? n[0].toUpperCase() : '?';
  }

  colorFor(name: string) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return `hsl(${h}, 80%, 45%)`;
  }
}
