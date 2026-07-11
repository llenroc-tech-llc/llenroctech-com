import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Msg = { role: 'system'|'user'|'assistant'; content: string };

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}
  send(messages: Msg[]) {
    return this.http.post<{ reply: string }>('/.netlify/functions/chat', { messages });
  }
}
