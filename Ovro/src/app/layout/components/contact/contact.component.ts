import { Component, inject, signal, OnDestroy, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, NgForm } from '@angular/forms';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnDestroy {
  year = new Date().getFullYear();
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);

  @Input() heading = "Let’s Work Together!";
  @Input() formName = 'contact';
  @Input() supportEmail = 'support@llenroctech.com';
  @Input() prefillSubject?: string;
  @Input() showSectionHeader = true;
  @ViewChild('formRef') formRef!: NgForm; 

  submitting = signal(false);
  sent = signal(false);
  failed = signal(false);

  autoHideMs = 4000;
  private sentTimer?: ReturnType<typeof setTimeout>;
  private failTimer?: ReturnType<typeof setTimeout>;

  form = this.fb.group({
    botField: [''], // honeypot
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: [''],
    budget: [''],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnDestroy() {
    clearTimeout(this.sentTimer);
    clearTimeout(this.failTimer);
  }

  ngOnInit() {
    if (this.prefillSubject) {
      this.form.get('subject')?.setValue(this.prefillSubject);
    }
  }

  dismiss(which: 'sent' | 'failed') {
    if (which === 'sent') this.sent.set(false);
    else this.failed.set(false);
  }

  isInvalid(ctrl: string) {
    const c = this.form.get(ctrl);
    return !!c && c.invalid && (c.dirty || c.touched);
  }


  async onSubmit(e: Event) {
    e.preventDefault();
    this.sent.set(false);
    this.failed.set(false);

    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (this.form.value.botField) return; // spam

    try {
      this.submitting.set(true);

      // Persist to Supabase
      await this.supabase.submitContact({
        name: this.form.value.name!,
        email: this.form.value.email!,
        phone: this.form.value.phone || null,
        subject: this.form.value.subject || null,
        budget: this.form.value.budget || null,
        message: this.form.value.message!
      });

      // Trigger Netlify function to send email
      const resp = await fetch('/.netlify/functions/contact-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.form.value.name!,
          email: this.form.value.email!,
          phone: this.form.value.phone || '',
          subject: this.form.value.subject || '',
          budget: this.form.value.budget || '',
          message: this.form.value.message!
        })
      });

      if (!resp.ok) throw new Error(`contact-email HTTP ${resp.status}`);
      const body = await resp.json().catch(() => ({}));
      if (!body?.ok) throw new Error('contact-email returned ok:false');

      this.sent.set(true);
      clearTimeout(this.sentTimer);
      this.sentTimer = setTimeout(() => this.sent.set(false), this.autoHideMs);
      this.form.reset();

    } catch (err) {
      console.error('Contact submit failed:', err);
      this.failed.set(true);
      clearTimeout(this.failTimer);
      this.failTimer = setTimeout(() => this.failed.set(false), this.autoHideMs);
    } finally {
      this.submitting.set(false);
    }
  }

  /** Optional helper (only needed if you keep NgForm) */
  resetForm() {
    if (this.formRef) this.formRef.reset();
  }
}
