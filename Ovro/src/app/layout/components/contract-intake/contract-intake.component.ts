import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

function dateOrderValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('StartDate')?.value;
  const end = group.get('EndDate')?.value;
  if (!start || !end) return null;
  const s = new Date(start);
  const e = new Date(end);
  return e >= s ? null : { dateOrder: true };
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  selector: 'app-contract-intake',
  templateUrl: './contract-intake.component.html',
  styleUrls: ['./contract-intake.component.scss'],
})
export class ContractIntakeComponent {
  heading = 'New Project Contract';
  submitting = false;
  sent = false;
  failed = false;
  private successTimer: any;
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      ClientName: ['', [Validators.required, Validators.minLength(2)]],
      ClientEmail: ['', [Validators.required, Validators.email]],
      ClientTitle: [''],
      GoverningLawCounty: ['', Validators.required],
      ProjectScope: ['', [Validators.required, Validators.minLength(10)]],
      ProjectFee: [null, [Validators.required, Validators.min(0)]],
      EffectiveDate: ['', Validators.required],
      StartDate: ['', Validators.required],
      EndDate: ['', Validators.required],
      botField: [''], // honeypot
    }, { validators: dateOrderValidator });
  }

  isInvalid(ctrl: string) {
    const c = this.form.get(ctrl);
    return !!c && (c.touched || this.submitting) && c.invalid;
  }

  dismiss(which: 'sent' | 'failed') {
    if (which === 'sent') { this.sent = false; clearTimeout(this.successTimer); }
    if (which === 'failed') this.failed = false;
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.sent = this.failed = false;

    if (this.form.value.botField) return; // honeypot

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    try {
      const body = {
        ...this.form.value,
        ProjectFee: Number(this.form.value.ProjectFee || 0)
      };

      const res = await fetch('/.netlify/functions/create-sp-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());

      // reset + pristine so red borders vanish
      this.form.reset();
      Object.keys(this.form.controls).forEach(k => this.form.get(k)?.markAsPristine());

      this.sent = true;
      clearTimeout(this.successTimer);
      this.successTimer = setTimeout(() => (this.sent = false), 6000);
    } catch (err) {
      console.error(err);
      this.failed = true;
    } finally {
      this.submitting = false;
    }
  }
}
