import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BonReceptionComponent } from './bon-reception.component';

describe('BonReceptionComponent', () => {
  let component: BonReceptionComponent;
  let fixture: ComponentFixture<BonReceptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BonReceptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BonReceptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
