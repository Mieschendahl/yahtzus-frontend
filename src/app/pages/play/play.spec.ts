import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayPage } from './play';

describe('Play', () => {
  let component: PlayPage;
  let fixture: ComponentFixture<PlayPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
