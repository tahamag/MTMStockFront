import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  companyForm: FormGroup;
  employeeForm: FormGroup;

  roles = ['Administrateur'];
  
  constructor() {
    this.companyForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      ville: ['', [Validators.required, Validators.minLength(2)]]
    });

    this.employeeForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      role: ['Administrateur'],
      mot_de_passe: ['',[
        Validators.required ,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('mot_de_passe')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  getPasswordErrorMessage(): string{
    if(this.employeeForm.get('mot_de_passe')?.hasError('required'))
      return 'mot de passe est obligatoire';

    if(this.employeeForm.get('mot_de_passe')?.hasError('minlength'))
      return 'le mot de passe doit comporter au moins 8 caractères';

    return this.employeeForm.get('pattern')? 'Nécessite des majuscules, des minuscules et des chiffres' : '';
  }
  async onSubmit() {
    if (this.companyForm.valid && this.employeeForm.valid) {
      this.isLoading.set(true);
      
      // First create the company
      const companyData = this.companyForm.value;
      await this.authService.registerSociete(companyData).subscribe({
        next: async (companyResponse) => {
          if (companyResponse) {
            // Then create the employee with the company ID
            const employeeData = {
              ...this.employeeForm.value,
              id_ste: companyResponse.id,
            };
            // Remove confirmPassword as it's not needed in the API
            delete employeeData.confirmPassword;
            
            await this.authService.registerEmploye(employeeData).subscribe({
              next: (employeeResponse) => {
                this.isLoading.set(false);
                this.snackBar.open('Inscription réussie! Vous pouvez maintenant vous connecter.', 'Fermer', {
                  duration: 15000,
                  panelClass: ['success-snackbar']
                });
                this.router.navigate(['/login']);
              },
              error: (error) => {
                this.isLoading.set(false);
                this.snackBar.open("Erreur lors de la création de l'employé: " + error.message, 'Fermer', {
                  duration: 15000,
                  panelClass: ['error-snackbar']
                });
              }
            });
          } else {
            this.isLoading.set(false);
            this.snackBar.open("Erreur lors de la création de la société: " + companyResponse, 'Fermer', {
              duration: 15000,
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.snackBar.open("Erreur lors de la création de la société: " + error.message, 'Fermer', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.companyForm);
      this.markFormGroupTouched(this.employeeForm);
    }
  }
  
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

    // Helper methods for template access
    get companyNom() { return this.companyForm.get('nom'); }
    get companyVille() { return this.companyForm.get('ville'); }
    get employeeNom() { return this.employeeForm.get('nom'); }
    get employeeEmail() { return this.employeeForm.get('email'); }
    get employeeTelephone() { return this.employeeForm.get('telephone'); }
    get employeeRole() { return this.employeeForm.get('role'); }
    get employeeMotDePasse() { return this.employeeForm.get('mot_de_passe'); }
    get employeeConfirmPassword() { return this.employeeForm.get('confirmPassword'); }
}
