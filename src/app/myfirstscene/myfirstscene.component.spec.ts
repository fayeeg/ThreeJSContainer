import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyfirstsceneComponent } from './myfirstscene.component';

describe('MyfirstsceneComponent', () => {
  let component: MyfirstsceneComponent;
  let fixture: ComponentFixture<MyfirstsceneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyfirstsceneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyfirstsceneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
