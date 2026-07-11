import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleReviewsService, ReviewsAggregate } from '../../services/google-reviews.service';

@Component({
  selector: 'app-reviews-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews-feed.component.html',
  styleUrls: ['./reviews-feed.component.scss']
})
export class ReviewsFeedComponent implements OnInit {
  loading = signal(true);
  error = signal<string | null>(null);
  total = signal(0);
  average = signal(0);
  reviews = signal<ReviewsAggregate['testimonials']>([]);

  constructor(private api: GoogleReviewsService) {}

  ngOnInit() {
    this.api.fetch().subscribe({
      next: (data) => {
        this.reviews.set(data.testimonials);
        this.total.set(data.totalReviews);
        this.average.set(data.averageRating);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(String(err?.message ?? err));
        this.loading.set(false);
      }
    });
  }

  stars(n: number): number[] { return Array(Math.round(n)).fill(0); }
}