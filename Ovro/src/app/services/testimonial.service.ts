// src/app/services/testimonial.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take } from 'rxjs/operators';
import { Testimonial } from '../model/testimonial.model';

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private http = inject(HttpClient);

  getAll(placeId?: string): Observable<Testimonial[]> {
    let params = new HttpParams();
    if (placeId) params = params.set('placeId', placeId);

    return this.http.get<Testimonial[]>('/api/testimonials', { params }).pipe(
      map((data: any) => (Array.isArray(data) ? data : [])),
      catchError(() => of<Testimonial[]>([])),
      shareReplay(1)
    );
  }

  getWriteReviewLink(placeId?: string): Observable<string> {
    let params = new HttpParams().set('meta', '1');
    if (placeId) params = params.set('placeId', placeId);

    return this.http
      .get<{ writeReviewUrl: string }>('/api/testimonials', { params })
      .pipe(
        map((m: any) => m?.writeReviewUrl ?? ''),
        catchError(() => of(''))
      );
  }

  /** Utility to poll reviews a few times after the user comes back from leaving a review */
  refreshAfterReview(placeId?: string): Observable<Testimonial[]> {
    // poll 6 times every 10s (≈ 1 minute) then complete
    return timer(0, 10000).pipe(
      take(6),
      switchMap(() => this.getAll(placeId).pipe(take(1)))
    );
  }
}
