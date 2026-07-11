// Ovro/src/app/services/google-reviews.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface GoogleReviewRaw {
  author_name: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description?: string;
  text?: string;
}

export interface GoogleReviewsResponse {
  reviews: GoogleReviewRaw[];
}

export interface Testimonial {
  rating: number;
  text: string;
  author: string;
  company: string;
  avatarSrc?: string;
}

export interface ReviewsAggregate {
  testimonials: Testimonial[];
  averageRating: number;
  totalReviews: number;
}

@Injectable({ providedIn: 'root' })
export class GoogleReviewsService {
  private endpoint = '/api/google-reviews';
  constructor(private http: HttpClient) {}

  aggregate(): Observable<ReviewsAggregate> {
    return this.http.get<GoogleReviewsResponse>(this.endpoint).pipe(
      map((resp) => {
        const testimonials: Testimonial[] = (resp.reviews ?? []).map(r => ({
          rating: r.rating ?? 5,
          text: r.text ?? '',
          author: r.author_name ?? 'Anonymous',
          company: 'Google',
          avatarSrc: r.profile_photo_url
        }));
        const total = testimonials.length;
        const avg = total ? testimonials.reduce((s, t) => s + (t.rating || 0), 0) / total : 0;
        return { testimonials, averageRating: avg, totalReviews: total };
      })
    );
  }
}
