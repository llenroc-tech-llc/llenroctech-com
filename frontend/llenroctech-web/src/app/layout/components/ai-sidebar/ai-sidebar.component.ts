import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AiAssistantStateService } from '../../../services/ai-assistant-state.service';
import { AiAssistantChatComponent } from '../ai-assistant-chat/ai-assistant-chat.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-ai-sidebar',
  standalone: true,
  imports: [RouterLink, AiAssistantChatComponent, TopbarComponent],
  templateUrl: './ai-sidebar.component.html',
  styleUrl: './ai-sidebar.component.scss',
})
export class AiSidebarComponent {
  constructor(readonly state: AiAssistantStateService) {}
}
