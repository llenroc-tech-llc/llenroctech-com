import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { ClassManagerService } from '../../services/classmanaer.service';
@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styles: ``
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  videoSrc = '';
  private loadVideo = () => this.scheduleVideo();

  constructor(private classManager: ClassManagerService) {
    this.classManager.setClass('main-hero-area2');
  }

  ngAfterViewInit() {
    if (document.readyState === 'complete') {
      this.scheduleVideo();
    } else {
      window.addEventListener('load', this.loadVideo, { once: true });
    }
  }

  ngOnDestroy() {
    window.removeEventListener('load', this.loadVideo);
  }

  private scheduleVideo() {
    const showVideo = () => {
      this.videoSrc = 'assets/img/video/video1.mp4';
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(showVideo, { timeout: 2000 });
    } else {
      globalThis.setTimeout(showVideo, 500);
    }
  }
}
