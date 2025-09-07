import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';

// Shared components
import { HeaderComponent } from '../../../shared/header/header.component';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

// Services
import { Employe } from '../../../models/Employe';
import { UtilisateurService } from '../../../services/utilisateur/utilisateur.service';
import { AuthService } from '../../../services/auth/auth.service';
@Component({
  selector: 'app-profile',
  standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatCardModule,
      MatIconModule,
      MatButtonModule,
      MatTableModule,
      MatDialogModule,
      MatSnackBarModule,
      MatProgressSpinnerModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatChipsModule,
      HeaderComponent,
      SidebarComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  private fb = inject(FormBuilder);
  private UtilisateurService = inject(UtilisateurService);
  private AuthService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  Employes = signal<Employe[]>([]);
  isLoading = signal(false);
  currentEditId = signal<number | null>(null);
  filterName = signal('');
  filteredEmployes = signal<Employe[]>([]);
  hidePassword = signal(true);

  EmployeForm: FormGroup;
  displayedColumns: string[] = ['nom', 'email', 'telephone', 'actions'];

  constructor() {
    this.EmployeForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['',[Validators.required,Validators.email]],
      telephone: ['', [Validators.required,Validators.pattern(/^[0-9]{10}$/)]],
      role: ['Administrateur' ],
      mot_de_passe: ['',[
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
    });
  }

  ngOnInit(): void {
    this.loadEmployes(this.getUserIdFromToken());
  }

  getPasswordErrorMessage(): string{
    if(this.EmployeForm.get('mot_de_passe')?.hasError('required'))
      return 'mot de passe est obligatoire';

    if(this.EmployeForm.get('mot_de_passe')?.hasError('minlength'))
      return 'le mot de passe doit comporter au moins 8 caractères';

    return this.EmployeForm.get('pattern')? 'Nécessite des majuscules, des minuscules et des chiffres' : '';
  }

  loadEmployes(userId : any): void {
    this.isLoading.set(true);
    this.UtilisateurService.getEmploye(userId).subscribe({
      next: (response) => {
        if (response) {
          this.Employes.set(response);
          this.onEdit(response)
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.handleError(error);
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.EmployeForm.valid) {
      this.isLoading.set(true);
      const formData = this.EmployeForm.value;
        this.UtilisateurService.updateEmploye(this.currentEditId()!, formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'profile modifié avec succès');
          },
          error: (error) => {
            this.handleError(error);
          }
        });
    }
  }

  onEdit(Employe: Employe): void {
    this.currentEditId.set(Employe.id!);
    this.EmployeForm.patchValue({
      nom:Employe.nom,
      email: Employe.email,
      telephone:Employe.telephone,
      role:'Administrateur',
    });


  }

  private handleSuccess(response: any, successMessage: string): void {
    this.isLoading.set(false);
    if (response) {
      this.snackBar.open(successMessage, 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
     // this.loadEmployes();
    } else {
      this.snackBar.open(response.message || 'Une erreur est survenue', 'Fermer', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  }

  private handleError(error: any): void {
    this.isLoading.set(false);
    this.snackBar.open(error.message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  getUserIdFromToken(): string | null {
    const token = this?.AuthService.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      const parsed = JSON.parse(decoded);
      return parsed?.nameid || null;
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }

}
