import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SignupComponent', () => {
    let component: SignupComponent;
    let fixture: ComponentFixture<SignupComponent>;
    let userServiceSpy: jasmine.SpyObj<UserService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('UserService', ['getPublicTenants', 'signup']);
        spy.getPublicTenants.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [SignupComponent, ReactiveFormsModule, HttpClientTestingModule],
            providers: [
                { provide: UserService, useValue: spy },
                provideRouter([])
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(SignupComponent);
        component = fixture.componentInstance;
        userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should show error if form is invalid on submit', () => {
        component.onSubmit();
        expect(component.form.touched).toBeTrue();
    });

    it('should validate E.164 phone number correctly', () => {
        const mobile = component.form.get('mobileNumber');
        
        mobile?.setValue('+1-555-555-5555');
        expect(mobile?.valid).toBeTrue();

        mobile?.setValue('123456');
        expect(mobile?.valid).toBeFalse();

        mobile?.setValue('+15555555555');
        expect(mobile?.valid).toBeTrue();
    });
});
