import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FormsService {
  private http = inject(HttpClient);

  // Accept either full URL or bare host in environment.functionsBase
  private base = environment.functionsBase?.startsWith('http')
    ? environment.functionsBase
    : `https://${environment.functionsBase}`;

  private code = environment.fnCode;

  // Unified submit to Azure Functions → SharePoint
  submit(formType: string, payload: any) {
    const url = `${this.base}/api/submit-form/${formType}?code=${this.code}`;
    return this.http.post(url, payload).toPromise();
  }

  // Optional convenience for the public DSR form
  submitDSRPublic(payload: any) { return this.submit('dsr-log', payload); }
}
