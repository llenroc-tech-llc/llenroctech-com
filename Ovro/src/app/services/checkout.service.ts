import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private apiBase = this.detectApiBase();

  private detectApiBase(): string {
    // Use Netlify dev (functions) when you're on Angular dev (4200 / localhost)
    try {
      const { hostname, port } = window.location;
      if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '4200') {
        return 'http://localhost:8888';
      }
    } catch {}
    // In prod, use relative path on the same origin
    return '';
  }

  /**
   * Dynamic-amount checkout. `amountUsd` can be number or string like "199.99".
   */
  async pay(amountUsd: number | string, label = 'Llenroc Tech – Custom Payment') {
    // normalize & validate
    const amount = Math.round(Number(amountUsd) * 100) / 100;
    if (!isFinite(amount) || amount < 1) {
      throw new Error('Enter at least $1.00');
    }

    const res = await fetch(`${this.apiBase}/.netlify/functions/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, label })
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(errText || 'Failed to create session');
    }

    const { url } = await res.json();
    if (!url) throw new Error('Stripe did not return a redirect URL');
    window.location.href = url; // simplest redirect
  }

  /** Back-compat alias */
  paySetup(amountUsd: number | string) {
    return this.pay(amountUsd, 'Llenroc Tech – Custom Payment');
  }
}
