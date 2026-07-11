// contact.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ContactService {
  private url = '/.netlify/functions/contact-email'; // relative path works in prod

  constructor(private http: HttpClient) {}

  send(form: {
    name: string; email: string; phone?: string;
    subject: string; budget?: string; message: string;
  }) {
    return this.http.post<{ ok: boolean }>(this.url, form);
  }
}
