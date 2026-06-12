import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceComponent } from './dice';

describe('Dice', () => {
  let component: DiceComponent;
  let fixture: ComponentFixture<DiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DiceComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
