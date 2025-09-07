import { Component, inject, signal} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { AuthService } from '../../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone : true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm : FormGroup;
  errorMessage = signal('');
  hide = signal(true);
  router = inject(Router);

  constructor(
    private AuthService : AuthService,
    private fb : FormBuilder,
    ) {
      this.loginForm = this.fb.group({
        email : ['taha1@mail.com' , [Validators.required  , Validators.email]],
        password : ['Taha@1221' , [
            Validators.required ,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
        ]],
      })
  }

  getEmailErrorMessage(): string{
    if(this.loginForm.get('email')?.hasError('required'))
      return 'Email is required';

    return this.loginForm.get('email')? 'Invalid email format' : '';
  }

  getPasswordErrorMessage(): string{
    if(this.loginForm.get('password')?.hasError('required'))
      return 'password is required';

    if(this.loginForm.get('password')?.hasError('minlength'))
      return 'mot de passe doit contraire au mois 8 caractere';

    return this.loginForm.get('pattern')? 'Requires uppercase, lowercase and number' : '';
  }

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  onSubmit():void {
    if(this.loginForm.invalid)
      return console.log('invalid form');

    this.AuthService.login(this.loginForm.get('email')?.value ,this.loginForm.get('password')?.value)
      .subscribe({
        next:(res : any) =>{
          this.errorMessage.set('');
          this?.AuthService.setToken(res.token);
          this.router.navigate(['/dashboard']);
        },
        error:(err : any) =>{
          this.errorMessage.set(err.error || 'An error occurred during login');
          console.error(err);
        },
      })
  }
}
