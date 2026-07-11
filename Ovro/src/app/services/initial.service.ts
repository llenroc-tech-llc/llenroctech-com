import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class IntakeService {
  private http = inject(HttpClient);

  // Point to your Azure Function URL (env var recommended)
  private base = '/api'; // e.g., proxy to Azure Function; or environment.apiBase

  submitInitialIntake(payload: any) {
    // Map Angular form → backend expected shape (kept 1:1 here)
    return this.http.post(`${this.base}/initial-intake`, payload).toPromise();
  }
}
