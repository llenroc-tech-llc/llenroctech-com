// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ContactMessageInput } from '../model/contact-message-input';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

declare global { interface Window { __sb?: SupabaseClient } }

export interface DbPost {
  id: string;
  site_id: string;
  slug: string;
  title: string;
  category?: string;
  author?: string;
  author_avatar?: string;
  hero_image_url?: string;
  minutes?: number;
  published_at?: string;  // ISO
  excerpt?: string;
  content_html?: string;
}

export type PostInput = {
  title: string;
  slug?: string;
  category?: string;
  author?: string;
  author_avatar?: string;
  hero_image_url?: string;
  minutes?: number;
  published_at?: string;   // ISO
  excerpt?: string;
  content_html?: string;
};

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
  // Swallow noisy lock errors from Supabase Auth (harmless)
  window.addEventListener(
    'unhandledrejection',
    (ev) => {
      const r = ev.reason;
      if (
        r &&
        (r.name === 'NavigatorLockAcquireTimeoutError' ||
         /Navigator LockManager lock/.test(r?.message ?? ''))
      ) {
        ev.preventDefault();
      }
    },
    { once: true }
  );

  this.supabase =
    window.__sb ??
    createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  window.__sb = this.supabase;
}


  get client(): SupabaseClient { return this.supabase; }

  // --- auth helpers (used for admin) ---
  async signIn(email: string, password: string) {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }
  async signOut() { await this.supabase.auth.signOut(); }

async isAdmin(): Promise<boolean> {
  try {
    const { data, error } = await this.supabase.rpc('is_admin');
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}
  // --- contact persistence (unchanged) ---
  async submitContact(msg: ContactMessageInput): Promise<{ ok: true }> {
    const { error } = await this.supabase.from('contact_messages').insert([{
      name: msg.name, email: msg.email, phone: msg.phone ?? null,
      subject: msg.subject ?? null, budget: msg.budget ?? null, message: msg.message
    }]);
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  // --- storage helpers ---
  /** Uploads a file to the 'blog' storage bucket and returns a public URL */
 async uploadPublicImage(file: File, folder = 'heroes', bucket = 'blog'): Promise<string> {
  const safeName = file.name.replace(/\s+/g, '-').toLowerCase();
  const rand = (crypto as any)?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  const filePath = `${folder}/${Date.now()}-${rand}-${safeName}`;

  const { error: upErr } = await this.supabase
    .storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'application/octet-stream',
    });

  if (upErr) throw upErr;

  const { data } = this.supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

  // --- blog reads ---
  async getSiteId(siteSlug = 'llenroctech'): Promise<string | null> {
    const { data } = await this.supabase.from('sites').select('id').eq('slug', siteSlug).single();
    return data?.id ?? null;
  }

  async getPosts(siteSlug = 'llenroctech'): Promise<DbPost[]> {
    const siteId = await this.getSiteId(siteSlug);
    if (!siteId) return [];
    const { data, error } = await this.supabase
      .from('posts')
      .select('*')
      .eq('site_id', siteId)
      .order('published_at', { ascending: false });
    if (error) throw error;
    return (data || []) as DbPost[];
  }

  async getPostBySlug(slug: string, siteSlug = 'llenroctech'): Promise<DbPost | null> {
    const siteId = await this.getSiteId(siteSlug);
    if (!siteId) return null;
    const { data } = await this.supabase.from('posts').select('*').eq('site_id', siteId).eq('slug', slug).single();
    return (data as DbPost) ?? null;
  }

  async getPostById(id: string): Promise<DbPost | null> {
    const { data, error } = await this.supabase.from('posts').select('*').eq('id', id).single();
    if (error) return null;
    return data as DbPost;
  }

  // --- blog writes ---
  private slugify(s: string): string {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120);
  }

  async createPost(siteSlug: string, input: PostInput): Promise<DbPost> {
    const siteId = await this.getSiteId(siteSlug);
    if (!siteId) throw new Error('Site not found');

    const row = {
      ...input,
      slug: input.slug ? this.slugify(input.slug) : this.slugify(input.title),
      site_id: siteId,
      published_at: input.published_at ?? new Date().toISOString(),
    };

    const { data, error } = await this.supabase.from('posts').insert([row]).select('*').single();
    if (error) throw error;
    return data as DbPost;
  }

  async updatePost(id: string, patch: Partial<PostInput>): Promise<DbPost> {
    const upd: any = { ...patch };
    if (upd.slug) upd.slug = this.slugify(upd.slug);

    const { data, error } = await this.supabase.from('posts').update(upd).eq('id', id).select('*').single();
    if (error) throw error;
    return data as DbPost;
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await this.supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
  }
}
