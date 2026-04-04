import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Rendering Logic', () => {
    it('should render an image when src signal has a value', () => {
      const testSrc = 'https://example.com/avatar.jpg';
      fixture.componentRef.setInput('src', testSrc);
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img.avatar-img'));
      expect(img).toBeTruthy();
      expect(img.nativeElement.src).toContain('avatar.jpg');
    });

    it('should render the first two consonants when src is null but name is provided', () => {
      fixture.componentRef.setInput('src', null);
      fixture.componentRef.setInput('name', 'John Doe');
      fixture.detectChanges();

      const initialContainer = fixture.debugElement.query(
        By.css('.avatar-initial'),
      );
      expect(initialContainer).not.toBeNull();
      expect(initialContainer.nativeElement.textContent.trim()).toBe('JH');
      expect(component.initial()).toBe('JH');
    });

    it('should render the system SVG icon as a final fallback', () => {
      fixture.componentRef.setInput('src', null);
      fixture.componentRef.setInput('name', null);
      fixture.detectChanges();

      const systemIcon = fixture.debugElement.query(By.css('.avatar-system'));
      expect(systemIcon).toBeTruthy();
      expect(systemIcon.query(By.css('svg'))).toBeTruthy();
    });
  });

  describe('Computed Initials (Signal Reactivity)', () => {
    it('should handle name with leading spaces and return uppercase consonants', () => {
      fixture.componentRef.setInput('name', '   alice   ');
      fixture.detectChanges();

      expect(component.initial()).toBe('LC');
    });

    it('should return the first character if no consonants are present', () => {
      fixture.componentRef.setInput('name', 'Aia');
      fixture.detectChanges();

      expect(component.initial()).toBe('A');
    });

    it('should return null and not render initials if name is empty', () => {
      fixture.componentRef.setInput('name', '   ');
      fixture.detectChanges();

      expect(component.initial()).toBeNull();
      const initialContainer = fixture.debugElement.query(
        By.css('.avatar-initial'),
      );
      expect(initialContainer).toBeNull();
    });
  });

  describe('Dynamic Sizing', () => {
    it('should apply custom size class from signal input', () => {
      const customSize = 'w-16 h-16';
      fixture.componentRef.setInput('size', customSize);
      fixture.detectChanges();

      const container = fixture.debugElement.query(By.css('.avatar-container'));
      expect(container.nativeElement.classList).toContain('w-16');
      expect(container.nativeElement.classList).toContain('h-16');
    });
  });
});
