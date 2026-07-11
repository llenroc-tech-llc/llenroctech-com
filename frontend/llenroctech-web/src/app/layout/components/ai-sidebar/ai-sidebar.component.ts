// src/app/components/ai-sidebar/ai-sidebar.component.ts
import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../services/chat.service';

export type Msg = { role: 'system'|'user'|'assistant'; content: string };

@Component({
  selector: 'app-ai-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-sidebar.component.html',
  styleUrls: ['./ai-sidebar.component.scss']
})
export class AiSidebarComponent implements AfterViewChecked {
  q: string = '';   // always a string

  loading = false;

  messages: Msg[] = [
    { role: 'system', content: 'You are Llenroc Tech’s website assistant. Be concise, friendly, and accurate about services, stack, pricing, and how to start a project.' }
  ];

  get visMessages() { return this.messages.filter(m => m.role !== 'system'); }

  @ViewChild('log') log?: ElementRef<HTMLDivElement>;
  private needsScroll = false;

  constructor(private chat: ChatService) {}

  ngAfterViewChecked() {
    if (this.needsScroll && this.log?.nativeElement) {
      const el = this.log.nativeElement;
      el.scrollTop = el.scrollHeight;
      this.needsScroll = false;
    }
  }

  quick(text: string) { this.q = text; this.send(); }

  send() {
    const content = this.q.trim();
    if (!content || this.loading) return;

    this.messages.push({ role: 'user', content });
    this.q = ''; this.loading = true; this.needsScroll = true;

    this.chat.send(this.messages).subscribe({
      next: r => {
        this.messages.push({ role: 'assistant', content: r.reply || 'Happy to help! Anything else?' });
        this.loading = false; this.needsScroll = true;
      },
      error: e => {
        console.error(e);
        this.messages.push({ role: 'assistant', content: 'Sorry — I hit a connection issue. Please try again.' });
        this.loading = false; this.needsScroll = true;
      }
    });
  }
}
