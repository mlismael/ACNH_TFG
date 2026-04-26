import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeaCreaturesComponent } from './sea-creatures.component';

describe('SeaCreaturesComponent', () => {
  let component: SeaCreaturesComponent;
  let fixture: ComponentFixture<SeaCreaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeaCreaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeaCreaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
