import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PrivacyConsoleService {
  private http = inject(HttpClient);
  // put in env.ts
  private base = environment.functionsBase; // e.g., 'https://llenroc-privacy-functions.azurewebsites.net'

  // Store your function key in a server-side proxy or as a custom auth.
  // For now (simple), append the code in query string:
  private fnCode = environment.fnCode; // Function key string

  submit(formType: string, fields: Record<string, any>) {
    const url = `${this.base}/api/submit-form/${formType}?code=${this.fnCode}`;
    return this.http.post<{ok:boolean; id:string}>(url, fields);
  }
}
