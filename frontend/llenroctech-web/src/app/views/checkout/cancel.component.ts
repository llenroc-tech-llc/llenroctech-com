import { Component } from '@angular/core';
@Component({
  standalone: true,
  template: `
    <section class="wrap" style="padding:40px 0">
      <h2>Payment canceled</h2>
      <p>No charge was made. You can try again anytime.</p>
    </section>
  `
})
export class CancelComponent {}
