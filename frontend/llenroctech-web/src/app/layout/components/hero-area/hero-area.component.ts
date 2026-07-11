import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Testimonial } from '../../../model/testimonial.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-hero-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-area.component.html',
  styleUrls: ['./hero-area.component.scss']
})
export class HeroAreaComponent implements OnInit {
  @Input() totalReviews?: number;
  @Input() testimonials: Testimonial[] = [];

  /** Allow parent to override, but default from env */
  @Input() writeReviewUrl = '';

  ngOnInit(): void {
     if (!this.writeReviewUrl && environment?.googlePlaceId) {
      this.writeReviewUrl =
        `https://search.google.com/local/writereview?placeid=${encodeURIComponent(environment.googlePlaceId)}`;
    }
  }

  get reviewCount(): number {
    return this.testimonials?.length ?? 0;
  }

  get averageRating(): number {
    if (!this.testimonials?.length) return 0;
    const sum = this.testimonials.reduce((a, t) => a + (t.rating ?? 0), 0);
    return sum / this.testimonials.length;
  }



  formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}m+`;
    if (n >= 1_000)    return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k+`;
    return `${n}`;
  }

  /** first 3 for the stack */
  get topAvatars(): Testimonial[] {
    return (this.testimonials ?? []).slice(0, 3);
  }

  /** Initials + color for letter avatars */
  getInitial(name?: string): string {
    const n = (name ?? '').trim();
    return n ? n[0]!.toUpperCase() : '?';
  }

  private palette = [
    '#2563eb', '#db2777', '#16a34a', '#f59e0b',
    '#7c3aed', '#dc2626', '#0ea5e9', '#10b981'
  ];
  getColor(letter: string): string {
    const code = letter.charCodeAt(0) || 65;
    return this.palette[code % this.palette.length];
  }

  get reviewTotal(): number {
    return (this.totalReviews ?? this.reviewCount) ?? 0;
  }

  /** Optional: fallback if you keep a button somewhere else */
  onWriteReview() {
    if (!this.writeReviewUrl) return;
    // using a real <a> is preferred; this is just a safety valve
    window.open(this.writeReviewUrl, '_blank', 'noopener');
  }

  /** Hide broken images, letter avatar shows underneath */
  onImgError(img: Event) {
    const el = img.target as HTMLImageElement;
    el.style.display = 'none';
  }
}
