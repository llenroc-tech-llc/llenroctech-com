import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignModelSectionComponent } from './design-model-section.component';

describe('DesignModelSectionComponent', () => {
  let component: DesignModelSectionComponent;
  let fixture: ComponentFixture<DesignModelSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesignModelSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesignModelSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
