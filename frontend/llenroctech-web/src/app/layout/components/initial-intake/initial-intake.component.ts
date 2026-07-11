import { Component, OnInit, effect, signal } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IntakeService } from '../../../services/initial.service';

@Component({
  selector: 'app-initial-intake',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './initial-intake.component.html',
})
export class InitialIntakeComponent implements OnInit {
  heading = 'Initial Intake';
  showSectionHeader = true;

  // UI state with Angular signals (you’ve been using these already)
  submitting = signal(false);
  sent = signal(false);
  failed = signal(false);

  industries = ['Financial Services', 'Healthcare', 'Professional Services', 'Other'];
  dataCollectedOptions = ['Name', 'Email', 'Phone', 'IP', 'Cookies', 'Messages', 'Other'];
  retentionRanges = ['30 days','90 days','6 months','12 months','24 months','Until account deletion','Not sure'];

  form: FormGroup;

  constructor(private fb: FormBuilder, private svc: IntakeService, private router: Router) {
    this.form = this.fb.group({
      botField: [''], // honeypot
      clientProject: ['', [Validators.required, Validators.minLength(2)]],
      contactEmail: ['', [Validators.required, Validators.email]],
      industry: [''],
      dataCollected: [[] as string[]],
      purposes: ['', [Validators.required, Validators.minLength(10)]],
      storageVendors: [''],
      retentionRange: ['']
    });
  }

  ngOnInit(): void {}

  isInvalid(ctrl: string): boolean {
    const c = this.form.get(ctrl);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  toggleDataCollected(opt: string, e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    const current: string[] = this.form.value.dataCollected ?? [];
    const next = checked ? [...current, opt] : current.filter(v => v !== opt);
    this.form.patchValue({ dataCollected: next });
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    if (this.form.value.botField) return; // spam bot
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.sent.set(false);
    this.failed.set(false);

    try {
      // Send to backend → SharePoint List
      await this.svc.submitInitialIntake(this.form.value);

      this.sent.set(true);
      // Redirect to Thank-you page (adjust route as needed)
      this.router.navigate(['/thank-you'], { queryParams: { t: 'initial' }});
    } catch (err) {
      console.error(err);
      this.failed.set(true);
    } finally {
      this.submitting.set(false);
    }
  }

  dismiss(which: 'sent'|'failed') {
    (which === 'sent' ? this.sent : this.failed).set(false);
  }
}
