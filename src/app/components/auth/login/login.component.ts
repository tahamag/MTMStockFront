import { AuthService } from './../../../services/auth.service';
import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { merge } from 'rxjs';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone : true,
  imports: [
    MatFormFieldModule, 
    MatInputModule, 
    FormsModule, 
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule, 
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  loginForm : FormGroup;
  readonly email = new FormControl(
    '', [Validators.required, Validators.email],);

  errorMessage = signal('');
  hide = signal(true);

  constructor(
    private AuthService : AuthService,
    private fb : FormBuilder,
    ) {
      this.loginForm = this.fb.group({
        email : ['' , Validators.required],
        password : ['' , Validators.required],
      })
      
    merge(this.email.statusChanges, this.email.valueChanges)
      .subscribe(() => this.updateErrorMessage());
  }

  updateErrorMessage() {
    if (this.email.hasError('required')) {
      this.errorMessage.set('You must enter a value');
    } else if (this.email.hasError('email')) {
      this.errorMessage.set('Not a valid email');
    } else {
      this.errorMessage.set('');
    }
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
        next:(res : any) => console.log(res),
        error(err) {
            console.error(err);
        },
      }) /**/
  }
}
