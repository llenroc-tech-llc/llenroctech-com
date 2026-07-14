import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type ChatRequestMessage = { role: 'user' | 'assistant'; content: string };
export interface ChatResponse { reply: string; }

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private http: HttpClient) {}
  send(messages: ChatRequestMessage[]) {
    return this.http.post<ChatResponse>('/.netlify/functions/chat', { messages });
  }
}
