import { Component } from '@angular/core';
@Component({
  standalone: true,
  template: `
    <section class="wrap" style="padding:40px 0">
      <h2>Payment successful 🎉</h2>
      <p>Thanks! You’ll receive an email receipt from Stripe.</p>
    </section>
  `
})
export class SuccessComponent {}
