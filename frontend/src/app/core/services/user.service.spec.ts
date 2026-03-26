import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService, SignupRequest, UserProfile } from './user.service';

describe('UserService', () => {
    let service: UserService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UserService]
        });
        service = TestBed.inject(UserService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send a POST request to signup', () => {
        const mockRequest: SignupRequest = {
            fullName: 'Test User',
            email: 'test@example.com',
            mobileNumber: '+1-555-555-5555',
            dateOfBirth: '2000-01-01',
            password: 'Password123!',
            tenantDomainKey: 'alpha-bank'
        };

        const mockResponse: UserProfile = {
            id: '123',
            email: 'test@example.com',
            fullName: 'Test User',
            mobileNumber: '+1-555-555-5555',
            dateOfBirth: '2000-01-01',
            tenantName: 'Alpha Bank',
            roles: ['APPLICANT'],
            status: 'ACTIVE'
        };

        service.signup(mockRequest).subscribe(response => {
            expect(response).toEqual(mockResponse);
        });

        const req = httpTestingController.expectOne('/api/v1/auth/signup');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });
});
