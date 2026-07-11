import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialIntakeComponent } from './initial-intake.component';

describe('InitialIntakeComponent', () => {
  let component: InitialIntakeComponent;
  let fixture: ComponentFixture<InitialIntakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialIntakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialIntakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
