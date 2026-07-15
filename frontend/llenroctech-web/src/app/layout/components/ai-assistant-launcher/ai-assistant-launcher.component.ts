import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { AiAssistantStateService } from '../../../services/ai-assistant-state.service';

@Component({ selector: 'app-ai-assistant-launcher', standalone: true, templateUrl: './ai-assistant-launcher.component.html', styleUrl: './ai-assistant-launcher.component.scss' })
export class AiAssistantLauncherComponent {
  readonly state = inject(AiAssistantStateService);
  @ViewChild('launcher', { read: ElementRef }) launcher?: ElementRef<HTMLButtonElement>;
  open(): void { this.state.open(this.launcher); }
}
