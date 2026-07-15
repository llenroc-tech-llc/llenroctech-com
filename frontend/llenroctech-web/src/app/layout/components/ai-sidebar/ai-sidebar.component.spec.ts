import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSidebarComponent } from './ai-sidebar.component';
import { provideRouter } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { of } from 'rxjs';

describe('AiSidebarComponent', () => {
  let component: AiSidebarComponent;
  let fixture: ComponentFixture<AiSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSidebarComponent],
      providers: [provideRouter([]), { provide: ChatService, useValue: { send: () => of({ reply: 'Response' }) } }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reuses the shared chat experience', () => {
    expect(fixture.nativeElement.querySelector('app-ai-assistant-chat')).toBeTruthy();
  });
});
