// comment-api.service.ts
import { Injectable } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class CommentApiService {
  constructor(private supa: SupabaseService) {}

  /** local token -> hashed with slug to become owner_hash stored in DB */
  private ownerKey = 'commentOwnerToken';

  private ensureOwnerToken(): string {
    let t = localStorage.getItem(this.ownerKey);
    if (!t) {
      t = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(this.ownerKey, t);
    }
    return t;
  }

  private async ownerHash(slug: string): Promise<string> {
    const token = this.ensureOwnerToken();
    const data = new TextEncoder().encode(`${token}::${slug}`);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)]
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async list(slug: string): Promise<CommentItem[]> {
    const { data, error } = await this.supa.client
      .from('comments_public') // use the view; or switch to 'comments' if needed
      .select('id, author, body, created_at')
      .eq('slug', slug)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data ?? []).map((r: any) => ({
      id: r.id,
      author: r.author,
      text: r.body,
      createdAt: Date.parse(r.created_at),
    }));
  }

  async add(slug: string, author: string, text: string): Promise<CommentItem> {
    const owner_hash = await this.ownerHash(slug);
    const { data, error } = await this.supa.client
      .from('comments')
      .insert([{ slug, author, body: text, owner_hash }]) // column is owner_hash
      .select('id, author, body, created_at')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      author: data.author,
      text: data.body,
      createdAt: Date.parse(data.created_at),
    };
  }

  async remove(slug: string, id: string): Promise<void> {
    const owner_hash = await this.ownerHash(slug);
    const { error } = await this.supa.client.rpc('delete_comment', {
      p_id: id,
      p_owner_hash: owner_hash, // matches RPC signature
    });
    if (error) throw error;
  }
}
