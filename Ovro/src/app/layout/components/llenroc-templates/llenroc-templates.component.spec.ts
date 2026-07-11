import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LlenrocTemplatesComponent } from './llenroc-templates.component';

describe('LlenrocTemplatesComponent', () => {
  let component: LlenrocTemplatesComponent;
  let fixture: ComponentFixture<LlenrocTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LlenrocTemplatesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LlenrocTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
