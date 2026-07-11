// src/app/pages/checkout/checkout-success.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-checkout-success',
  imports: [RouterLink],
  template: `
    <section class="container mx-auto p-6 text-center">
      <h1 class="text-2xl font-bold mb-2">Payment successful 🎉</h1>
      <p class="mb-6">Thanks! You’ll get a receipt by email.</p>
      <a class="vl-btn1" routerLink="/">Back to Home</a>
    </section>
  `
})
export class CheckoutSuccessComponent {}
