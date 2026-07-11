import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractIntakeComponent } from './contract-intake.component';

describe('ContractIntakeComponent', () => {
  let component: ContractIntakeComponent;
  let fixture: ComponentFixture<ContractIntakeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContractIntakeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractIntakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
