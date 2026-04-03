import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AvatarComponent } from './avatar.component';

/**
 * Unit tests for AvatarComponent using Signal Inputs.
 * Validates reactive rendering of images, initials, and fallback icons.
 */
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
      // Arrange
      const testSrc = 'https://example.com/avatar.jpg';
      fixture.componentRef.setInput('src', testSrc);

      // Act
      fixture.detectChanges();

      // Assert
      const img = fixture.debugElement.query(By.css('img.avatar-img'));
      expect(img).toBeTruthy();
      expect(img.nativeElement.src).toContain('avatar.jpg');
    });

    it('should render the first initial when src is null but name is provided', () => {
      // Arrange
      fixture.componentRef.setInput('src', null);
      fixture.componentRef.setInput('name', 'John Doe');

      // Act
      fixture.detectChanges();

      // Assert
      const initialContainer = fixture.debugElement.query(
        By.css('.avatar-initial'),
      );
      expect(initialContainer)
        .withContext('Initial container should be rendered')
        .not.toBeNull();
      expect(initialContainer.nativeElement.textContent.trim()).toBe('J');
      expect(component.initial()).toBe('J');
    });

    it('should render the system SVG icon as a final fallback', () => {
      // Arrange
      fixture.componentRef.setInput('src', null);
      fixture.componentRef.setInput('name', null);

      // Act
      fixture.detectChanges();

      // Assert
      const systemIcon = fixture.debugElement.query(By.css('.avatar-system'));
      expect(systemIcon).toBeTruthy();
      expect(systemIcon.query(By.css('svg'))).toBeTruthy();
    });
  });

  describe('Computed Initials (Signal Reactivity)', () => {
    it('should handle name with leading spaces and return uppercase initial', () => {
      // Arrange
      fixture.componentRef.setInput('name', '  alice  ');

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.initial()).toBe('A');
    });

    it('should return null and not render initials if name is empty', () => {
      // Arrange
      fixture.componentRef.setInput('name', '   ');

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.initial()).toBeNull();
      const initialContainer = fixture.debugElement.query(
        By.css('.avatar-initial'),
      );
      expect(initialContainer).toBeNull();
    });
  });

  describe('Dynamic Sizing', () => {
    it('should apply custom size class from signal input', () => {
      // Arrange
      const customSize = 'w-16 h-16';
      fixture.componentRef.setInput('size', customSize);

      // Act
      fixture.detectChanges();

      // Assert
      const container = fixture.debugElement.query(By.css('.avatar-container'));
      expect(container.nativeElement.classList).toContain('w-16');
      expect(container.nativeElement.classList).toContain('h-16');
    });
  });
});
