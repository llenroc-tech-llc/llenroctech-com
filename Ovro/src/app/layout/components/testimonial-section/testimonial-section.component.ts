import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subject, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Testimonial {
  author: string;
  text: string;
  source?: string;
  rating?: number;
}

@Component({
  selector: 'app-testimonial-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-section.component.html',
  styleUrls: ['./testimonial-section.component.scss'],
})
export class TestimonialSectionComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @ViewChild('rail', { static: false }) railRef?: ElementRef<HTMLDivElement>;
  @ViewChild('viewport', { static: false }) viewportRef?: ElementRef<HTMLDivElement>;

  @Input() testimonials: Testimonial[] = [];
  @Input() eyebrow = 'Testimonial';
  @Input() showWriteReview = false;
  @Input() reviewUrl?: string;
  @Input() hideWhenEmpty = true;

  /** Show the section even when there are no testimonials */
  @Input() preview = false;

  /** Autoscroll config */
  @Input() autoScroll = true;
  @Input() scrollIntervalMs = 20000; // 20s

  private destroy$ = new Subject<void>();
  private paused = false;
  private initialized = false; // ensure we only init once per render

  hasOverflow = false;
  five = Array(5).fill(0);

  // paging state: exactly 2-up (1-up on small screens)
  private currentIndex = 0;
  private cardsPerPage = 2;

  ngOnInit(): void {
    //   if (this.testimonials.length === 0) {
    //   this.testimonials = [
    //     { author: 'Alex P.',   source: 'Google',   text: 'Cornell made this effortless and fast.' },
    //     { author: 'Jamie R.',  source: 'LinkedIn', text: 'Clean code, great communication.' },
    //     { author: 'Morgan S.', source: 'Google',   text: 'Delivered ahead of schedule.' },
    //      { author: 'Alex P.',   source: 'Google',   text: 'Cornell made this effortless and fast.' },
    //     { author: 'Jamie R.',  source: 'LinkedIn', text: 'Clean code, great communication.' },
    //     { author: 'Morgan S.', source: 'Google',   text: 'Delivered ahead of schedule.' },
    //   ];
    // }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If data arrived and the view is currently rendered (preview || has data),
    // try to initialize or recompute.
    if (changes['testimonials']) {
      queueMicrotask(() => this.tryInitOrRefresh());
    }
    if (changes['preview']) {
      queueMicrotask(() => this.tryInitOrRefresh());
    }
  }

  ngAfterViewInit(): void {
    // First render pass
    queueMicrotask(() => this.tryInitOrRefresh());
  }

  /** Initialize once when DOM nodes exist, or refresh layout if already initialized */
  private tryInitOrRefresh(): void {
    const rail = this.railRef?.nativeElement;
    const vp = this.viewportRef?.nativeElement;

    // Only act when the template is actually rendered:
    if (!(this.preview || (this.testimonials?.length ?? 0) > 0)) return;

    if (rail && vp) {
      if (!this.initialized) {
        this.initialized = true;
        this.initCarousel();
      } else {
        this.recomputeLayout();
        this.scrollToIndex(this.currentIndex, false);
      }
    }
  }

  private initCarousel(): void {
    this.recomputeLayout();

    fromEvent(window, 'resize')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.recomputeLayout();
        this.scrollToIndex(this.currentIndex, false);
      });

    if (this.autoScroll) {
      interval(this.scrollIntervalMs)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          if (!this.paused && this.hasOverflow) this.scrollByPage(1);
        });
    }
  }

  private recomputeLayout(): void {
    const rail = this.railRef?.nativeElement;
    const vp = this.viewportRef?.nativeElement;
    if (!rail || !vp) return;

    this.hasOverflow = rail.scrollWidth > vp.clientWidth + 8;

    // 2-up normally, 1-up on small screens
    this.cardsPerPage = vp.clientWidth < 700 ? 1 : 2;

    const len = this.getCards().length;
    if (len === 0) {
      this.currentIndex = 0;
      return;
    }
    this.currentIndex = Math.min(this.currentIndex, Math.max(0, len - this.cardsPerPage));
  }

  private getCards(): HTMLElement[] {
    const rail = this.railRef?.nativeElement;
    return rail ? Array.from(rail.querySelectorAll<HTMLElement>('.ts-card')) : [];
  }

  private scrollToIndex(index: number, smooth = true): void {
    const vp = this.viewportRef?.nativeElement;
    const cards = this.getCards();
    if (!vp || cards.length === 0) return;

    const len = cards.length;
    const maxStart = Math.max(0, len - this.cardsPerPage);
    const clamped = Math.max(0, Math.min(index, maxStart));
    const left = cards[clamped].offsetLeft;

    vp.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
    this.currentIndex = clamped;
  }

  scrollByPage(direction: 1 | -1): void {
    const len = this.getCards().length;
    if (len === 0) return;

    const next = this.currentIndex + this.cardsPerPage * direction;
    if (next > len - this.cardsPerPage) this.scrollToIndex(0);
    else if (next < 0) this.scrollToIndex(len - this.cardsPerPage);
    else this.scrollToIndex(next);
  }

  pauseAutoScroll(): void { this.paused = true; }
  resumeAutoScroll(): void { this.paused = false; }

  initials(name?: string): string {
    if (!name) return 'C';
    return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
