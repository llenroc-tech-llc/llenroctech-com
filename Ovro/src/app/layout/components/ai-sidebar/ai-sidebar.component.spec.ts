import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSidebarComponent } from './ai-sidebar.component';

describe('AiSidebarComponent', () => {
  let component: AiSidebarComponent;
  let fixture: ComponentFixture<AiSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
