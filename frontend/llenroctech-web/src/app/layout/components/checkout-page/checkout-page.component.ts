import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { loadStripe, Stripe, StripeElements, PaymentRequest } from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';

type MethodTab = 'card' | 'wallets' | 'paypal';
type Addr = {
  line1?: string; line2?: string; city?: string; state?: string; postal?: string; country?: string;
};

const FN_BASE = environment.fnBase; // e.g. '/.netlify/functions'
const PAYPAL_SDK_URL = 'https://www.paypal.com/sdk/js?client-id=Aej4J8ZbeJnGweDSfT1xnLNgGyFByFsoktBAiRtUZKGWrfLNhbxG4mE81zLip6R6lpon4MgIqbILrtaC&components=buttons,funding-eligibility&enable-funding=venmo';
let paypalSdkPromise: Promise<any> | undefined;

@Component({
  standalone: true,
  selector: 'app-checkout-page',
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class CheckoutPageComponent implements AfterViewInit, OnDestroy {
  amountUsd = 25;
  private submitLock = false;
  private lastClientSecret: string | null = null;


  // Contact-style fields
  name = ''; email = '';
  address1 = ''; address2 = '';
  city = ''; state = ''; postal = ''; country = 'US';

  busy = false;
  err = '';
  orderId = 'ORDER_' + Date.now();

  tab: MethodTab = 'card';

  private stripe: Stripe | null = null;
  private elements?: StripeElements;
  private paymentMounted = false;

  private paymentRequest?: PaymentRequest;
  private prButtonMounted = false;

  private paypalRendered = false;

  setAmount(cents: number) {
    this.amountUsd = cents / 100;
    this.updatePaymentRequestTotal();
  }
  onAmountChanged() {
    this.amountUsd = Math.max(1, Number(this.amountUsd || 1));
    this.updatePaymentRequestTotal();
  }

  async ngAfterViewInit() {
    await this.selectTab('card');
  }
  ngOnDestroy(): void {}

  async payWithStripeCheckout() {
    this.err = '';
    this.busy = true;
    try {
      const r = await fetch(`${FN_BASE}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: this.amountUsd, // dollars (server should convert)
          metadata: { orderId: this.orderId },
        }),
      });
      if (!r.ok) throw new Error(await r.text());
      const { url } = await r.json();
      location.href = url;
    } catch (e: any) {
      this.err = e?.message || 'Stripe error';
    } finally {
      this.busy = false;
    }
  }

  async selectTab(next: MethodTab) {
    if (this.tab === next && (next !== 'paypal' || this.paypalRendered)) return;
    this.tab = next;
    this.err = '';

    if (next === 'card') {
      await this.ensureStripeAndPaymentElement();
    } else if (next === 'wallets') {
      await this.ensurePaymentRequestButton();
    } else if (next === 'paypal') {
      await Promise.resolve();
      await this.ensurePaypalButtons();
    }
  }

  /** Inline pay (uses { amount: <cents>, currency }) */
async payInline(ev: Event) {
  ev.preventDefault();
  if (this.submitLock || this.busy || this.tab !== 'card') return;
  this.submitLock = true;
  this.busy = true;
  this.err = '';

  try {
    // If we already created a PI for this session/orderId, reuse it.
    let clientSecret = this.lastClientSecret;

    if (!clientSecret) {
      const intentRes = await fetch(`${FN_BASE}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(this.amountUsd * 100),
          currency: 'usd',
          orderId: this.orderId,
          customerEmail: this.email || undefined,
          address: this.buildAddress(),
          name: this.name || undefined,
          email: this.email || undefined,
        }),
      });

      if (!intentRes.ok) {
        let msg = 'Failed to create PaymentIntent';
        try { const j = await intentRes.json(); msg = j?.error || msg; } catch {}
        throw new Error(msg);
      }

      ({ clientSecret } = await intentRes.json());
      this.lastClientSecret = clientSecret; // cache it
    }

    await this.ensureStripeAndPaymentElement(clientSecret!);

    const { error } = await this.stripe!.confirmPayment({
      elements: this.elements!,
      confirmParams: {
        return_url: window.location.origin + '/checkout/success',
        payment_method_data: {
          billing_details: {
            name: this.name || undefined,
            email: this.email || undefined,
            address: this.buildAddress(),
          },
        },
      },
    });

    if (error) this.err = error.message || 'Payment failed';
  } catch (e: any) {
    this.err = e?.message || 'Inline payment error';
  } finally {
    this.busy = false;
    setTimeout(() => (this.submitLock = false), 250);
  }
}


  private buildAddress(): Addr {
    return {
      line1: this.address1 || undefined,
      line2: this.address2 || undefined,
      city: this.city || undefined,
      state: this.state || undefined,
      postal: this.postal || undefined,
      country: (this.country || 'US').toUpperCase(),
    };
  }

  private async ensureStripeAndPaymentElement(clientSecret?: string) {
    if (!this.stripe) {
      const publishableKey = environment.stripePublishableKey;
      if (!publishableKey) {
        throw new Error('Stripe publishable key is not set in environments.');
      }
      this.stripe = await loadStripe(publishableKey);
      if (!this.stripe) throw new Error('Stripe failed to load. Check your publishable key.');
    }

    if (!this.elements || clientSecret) {
      this.elements = this.stripe.elements({
        clientSecret: clientSecret ?? (this as any)._lastClientSecret,
        appearance: { theme: 'night' },
      });
      (this as any)._lastClientSecret = clientSecret ?? (this as any)._lastClientSecret;
      this.paymentMounted = false;
    }

    if (!this.paymentMounted) {
      const host = document.getElementById('payment-element');
      if (host) host.innerHTML = '';   // ensure no child nodes
      const paymentEl = this.elements!.create('payment', { layout: { type: 'tabs' } });
      paymentEl.mount('#payment-element');
      this.paymentMounted = true;
    }
  }

  private async ensurePaymentRequestButton() {
    if (!this.stripe) {
      const publishableKey = environment.stripePublishableKey;
      if (!publishableKey) throw new Error('Stripe publishable key is not set in environments.');
      this.stripe = await loadStripe(publishableKey);
      if (!this.stripe) throw new Error('Stripe failed to load. Check your publishable key.');
    }

    this.paymentRequest = this.stripe.paymentRequest({
      country: (this.country || 'US').toUpperCase(),
      currency: 'usd',
      total: { label: 'Payment', amount: Math.round(this.amountUsd * 100) },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    this.paymentRequest.on('paymentmethod', async (ev: any) => {
      try {
        const intentRes = await fetch(`${FN_BASE}/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(this.amountUsd * 100),
            currency: 'usd',
            orderId: this.orderId,
            customerEmail: ev.payerEmail || undefined,
            address: this.buildAddress(),
            name: this.name || undefined,
            email: this.email || undefined,
          }),
        });

        if (!intentRes.ok) {
          let msg = 'Failed to create PaymentIntent';
          try { const j = await intentRes.json(); msg = j?.error || msg; } catch {}
          throw new Error(msg);
        }

        const { clientSecret } = await intentRes.json();

        const { error, paymentIntent } = await this.stripe!.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (error) {
          ev.complete('fail');
          this.err = error.message || 'Wallet payment failed';
          return;
        }

        if (paymentIntent.status === 'requires_action') {
          const next = await this.stripe!.confirmCardPayment(clientSecret);
          if (next.error) {
            ev.complete('fail');
            this.err = next.error.message || 'Wallet authentication failed';
            return;
          }
        }

        ev.complete('success');
        location.href = '/checkout/success';
      } catch (e: any) {
        ev.complete('fail');
        this.err = e?.message || 'Wallet error';
      }
    });

    const canUse = await this.paymentRequest.canMakePayment();
    const container = document.getElementById('wallets-button');
    if (container) container.innerHTML = '';

    if (canUse) {
      const elements = this.stripe.elements();
      const prButton = elements.create('paymentRequestButton', { paymentRequest: this.paymentRequest });
      prButton.mount('#wallets-button');
      this.prButtonMounted = true;
    } else {
      if (container) container.innerHTML = `<div class="muted">Apple/Google Pay is not available on this device/browser.</div>`;
      this.prButtonMounted = false;
    }
  }

  private updatePaymentRequestTotal() {
    if (this.paymentRequest) {
      this.paymentRequest.update({
        total: { label: 'Payment', amount: Math.round(this.amountUsd * 100) },
      });
    }
  }

  private waitForEl(selector: string, timeout = 5000): Promise<HTMLElement> {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) return resolve(el);
        if (Date.now() - start > timeout) return reject(new Error(`Element ${selector} not found`));
        requestAnimationFrame(tick);
      };
      tick();
    });
  }

  private loadPaypalSdk(): Promise<any> {
    const loadedPaypal = (window as any).paypal;
    if (loadedPaypal?.Buttons) return Promise.resolve(loadedPaypal);
    if (paypalSdkPromise) return paypalSdkPromise;

    paypalSdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = PAYPAL_SDK_URL;
      script.async = true;
      script.onload = () => {
        const paypal = (window as any).paypal;
        paypal?.Buttons
          ? resolve(paypal)
          : reject(new Error('PayPal SDK loaded without the Buttons component'));
      };
      script.onerror = () => reject(new Error('PayPal SDK failed to load'));
      document.head.appendChild(script);
    }).catch(error => {
      paypalSdkPromise = undefined;
      throw error;
    });

    return paypalSdkPromise;
  }

  private async ensurePaypalButtons() {
    if (this.paypalRendered) return;

    const container = await this.waitForEl('#paypal-buttons').catch(err => {
      this.err = err.message; return null;
    });
    if (!container) return;

    const pp = await this.loadPaypalSdk().catch(err => {
      this.err = err.message; return null;
    });
    if (!pp) return;

    pp.Buttons({
      style: { layout: 'vertical', shape: 'rect' },
      createOrder: async () => {
        const res = await fetch(`${FN_BASE}/paypal-create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: this.orderId,
            amountCents: Math.round(this.amountUsd * 100),
            currency: 'USD',
          }),
        });
        const { orderID } = await res.json();
        return orderID;
      },
      onApprove: async (data: any) => {
        await fetch(`${FN_BASE}/paypal-capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: data.orderID }),
        });
        location.href = '/checkout/success';
      },
      onCancel: () => (location.href = '/checkout/cancel'),
      onError: (err: any) => (this.err = err?.message || 'PayPal error'),
    }).render(container);

    this.paypalRendered = true;
  }
}
