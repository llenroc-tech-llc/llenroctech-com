// src/app/layout/components/blog-section/post-editor.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService, DbPost, PostInput } from '../../../services/supabase.service';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-editor.component.html',
  styleUrls: ['./post-editor.component.scss']
})
export class PostEditorComponent {
  @Input() post: DbPost | null = null;
  @Output() saved = new EventEmitter<DbPost>();

  private fb = inject(FormBuilder);
  private supa = inject(SupabaseService);
  private router = inject(Router);

  saving = false;

  form = this.fb.group({
    title: ['', Validators.required],
    slug: [''],
    category: [''],
    author: [''],
    author_avatar: [''],
    hero_image_url: [''],
    minutes: [3],
    published_at: [''],
    excerpt: [''],
    content_html: [''],
  });

  ngOnInit() {
    if (this.post) {
      const { title, slug, category, author, author_avatar, hero_image_url, minutes, published_at, excerpt, content_html } = this.post;
      this.form.patchValue({ title, slug, category, author, author_avatar, hero_image_url, minutes, published_at, excerpt, content_html });
    }
  }

  async save() {
    if (this.form.invalid) return;
    this.saving = true;
    try {
      const val = this.form.value as PostInput;
      if (val.published_at) val.published_at = new Date(val.published_at).toISOString();

      const savedPost = this.post
        ? await this.supa.updatePost(this.post.id, val)
        : await this.supa.createPost('llenroctech', val);

      this.saved.emit(savedPost);
      await this.router.navigate(['/blog-single', savedPost.slug]);
    } finally {
      this.saving = false;
    }
  }

  async cancelEdit() {
    if (this.post) {
      await this.router.navigate(['/blog-single', this.post.slug]);
    } else {
      await this.router.navigate(['/index-2'], { fragment: 'list-item-7' });
    }
  }
}
