import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDesktopMenuComponent } from './user-desktop-menu.component';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { UserRoles } from '../../../shared/models';

describe('UserDesktopMenuComponent', () => {
  let component: UserDesktopMenuComponent;
  let fixture: ComponentFixture<UserDesktopMenuComponent>;

  const mockUser = {
    username: 'Pablo',
    role: UserRoles.Admin,
    avatar: 'path/to/avatar',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDesktopMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDesktopMenuComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('displayName', 'Pablo');
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should display the correct display name', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('displayName', 'Pablo');
    fixture.detectChanges();

    const nameElement = fixture.debugElement.query(
      By.css('.header-name'),
    ).nativeElement;
    expect(nameElement.textContent).toContain('Pablo');
  });

  it('should show role tag if user has a role', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('displayName', 'Pablo');
    fixture.detectChanges();

    const roleElement = fixture.debugElement.query(By.css('.role-tag'));
    expect(roleElement.nativeElement.textContent).toContain('Admin');
  });

  it('should NOT show "Create Collection" button if canCreateCollection is false', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('displayName', 'Pablo');
    fixture.componentRef.setInput('canCreateCollection', false);
    fixture.detectChanges();

    const createBtn = fixture.debugElement.query(
      By.css('.link-add-collection'),
    );
    expect(createBtn).toBeNull();
  });

  it('should show "Create Collection" button if canCreateCollection is true', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('displayName', 'Pablo');
    fixture.componentRef.setInput('canCreateCollection', true);
    fixture.detectChanges();

    const createBtn = fixture.debugElement.query(
      By.css('.link-add-collection'),
    );
    expect(createBtn).not.toBeNull();
  });

  it('should emit close output when a link is clicked', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('displayName', 'Pablo');
    fixture.detectChanges();

    spyOn(component.menuClose, 'emit');
    const settingsLink = fixture.debugElement.query(By.css('.link-settings'));

    settingsLink.nativeElement.click();

    expect(component.menuClose.emit).toHaveBeenCalled();
  });

  it('should emit createCollection output when create button is clicked', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('displayName', 'Pablo');
    fixture.componentRef.setInput('canCreateCollection', true);
    fixture.detectChanges();

    spyOn(component.createCollection, 'emit');
    const createBtn = fixture.debugElement.query(
      By.css('.link-add-collection'),
    );

    createBtn.nativeElement.click();

    expect(component.createCollection.emit).toHaveBeenCalled();
  });

  it('should stop propagation and emit close when logout is clicked', () => {
    fixture.componentRef.setInput('user', mockUser);
    fixture.componentRef.setInput('displayName', 'Pablo');
    fixture.detectChanges();

    spyOn(component.menuClose, 'emit');
    const logoutBtn = fixture.debugElement.query(By.css('.logout-btn'));

    const event = new MouseEvent('click');
    spyOn(event, 'stopPropagation');

    logoutBtn.nativeElement.dispatchEvent(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.menuClose.emit).toHaveBeenCalled();
  });
});
