// src/app/pages/checkout/checkout-cancel.component.ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-checkout-cancel',
  imports: [RouterLink],
  template: `
    <section class="container mx-auto p-6 text-center">
      <h1 class="text-2xl font-bold mb-2">Payment canceled</h1>
      <p class="mb-6">No charge was made. You can try again anytime.</p>
      <a class="vl-btn1 outline" routerLink="/checkout">Return to Checkout</a>
    </section>
  `
})
export class CheckoutCancelComponent {}
