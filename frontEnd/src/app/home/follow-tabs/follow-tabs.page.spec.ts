import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FollowTabsPage } from './follow-tabs.page';

describe('FollowTabsPage', () => {
  let component: FollowTabsPage;
  let fixture: ComponentFixture<FollowTabsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FollowTabsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FollowTabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
