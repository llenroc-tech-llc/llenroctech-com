import { ElementRef } from '@angular/core';
import { GsapService } from '../services/gsap.service';
import { GsapRevealDirective } from './gsap-reveal.directive';

describe('GsapRevealDirective', () => {
  it('should create an instance', () => {
    const element = document.createElement('div');
    const gsapService = jasmine.createSpyObj<GsapService>('GsapService', [
      'animateReveal',
    ]);
    const directive = new GsapRevealDirective(
      new ElementRef(element),
      gsapService,
    );
    expect(directive).toBeTruthy();
  });
});
