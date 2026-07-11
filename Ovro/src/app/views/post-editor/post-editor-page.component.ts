// src/app/views/post-editor/post-editor-page.component.ts
import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PostEditorComponent } from '../../layout/components/post-editor/post-editor.component';
import { SupabaseService, DbPost } from '../../services/supabase.service';

@Component({
  selector: 'app-post-editor-page',
  standalone: true,
  imports: [CommonModule, PostEditorComponent],
  templateUrl: './post-editor-page.component.html',
  styleUrls: ['./post-editor-page.component.scss'],
})
export class PostEditorPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private supa = inject(SupabaseService);

  post = signal<DbPost | null>(null);
  loading = signal(true);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const p = await this.supa.getPostById(id);
      if (!p) {
        alert('Post not found');
        this.router.navigate(['/index-2'], { fragment: 'list-item-7' });
        return;
      }
      this.post.set(p);
    }
    this.loading.set(false);
  }
}
