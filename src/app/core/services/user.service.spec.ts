import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserService } from './user.service';
import { UserApiService } from '../../../api/services/user.api';
import { User } from '../../shared/models';

/**
 * Unit tests for UserService.
 * Validates profile hydration and collection fetching logic.
 */
describe('UserService', () => {
  let service: UserService;
  let userApiMock: jasmine.SpyObj<UserApiService>;

  const mockUser: User = {
    id: 'be19f98f-84bc-4fa4-a7c9-a5c8dc3a0b68',
    email: 'test@example.com',
    username: 'testuser',
  } as User;

  beforeEach(() => {
    // Create a mock for UserApiService
    const spy = jasmine.createSpyObj('UserApiService', ['findById', 'findAll']);

    TestBed.configureTestingModule({
      providers: [UserService, { provide: UserApiService, useValue: spy }],
    });

    service = TestBed.inject(UserService);
    userApiMock = TestBed.inject(
      UserApiService,
    ) as jasmine.SpyObj<UserApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProfileSync', () => {
    it('should retrieve a user profile by ID using firstValueFrom', async () => {
      // Arrange
      userApiMock.findById.and.returnValue(of(mockUser));

      // Act
      const result = await service.getProfileSync(mockUser.id);

      // Assert
      expect(result).toEqual(mockUser);
      expect(userApiMock.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userApiMock.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the API call fails', async () => {
      // Arrange
      const errorResponse = { status: 404, message: 'Not Found' };
      userApiMock.findById.and.returnValue(throwError(() => errorResponse));

      // Act & Assert
      try {
        await service.getProfileSync('invalid-id');
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toEqual(errorResponse);
      }
    });
  });

  describe('fetchAll', () => {
    it('should retrieve an array of all users', async () => {
      // Arrange
      const mockUsers: User[] = [mockUser, { ...mockUser, id: 'another-id' }];
      userApiMock.findAll.and.returnValue(of(mockUsers));

      // Act
      const result = await service.fetchAll();

      // Assert
      expect(result.length).toBe(2);
      expect(result).toEqual(mockUsers);
      expect(userApiMock.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no users are found', async () => {
      // Arrange
      userApiMock.findAll.and.returnValue(of([]));

      // Act
      const result = await service.fetchAll();

      // Assert
      expect(result).toEqual([]);
    });
  });
});
