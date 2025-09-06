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

@Component({
  selector: 'app-utilisateur',
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
  templateUrl: './utilisateur.component.html',
  styleUrl: './utilisateur.component.css'
})
export class UtilisateurComponent {
  private fb = inject(FormBuilder);
  private UtilisateurService = inject(UtilisateurService);
  private snackBar = inject(MatSnackBar);

  Employes = signal<Employe[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  currentEditId = signal<number | null>(null);
  filterName = signal('');
  filteredEmployes = signal<Employe[]>([]);
  hidePassword = signal(true);

  EmployeForm: FormGroup;
  displayedColumns: string[] = ['nom', 'email', 'telephone', 'role', 'actions'];

  constructor() {
    this.EmployeForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      email: ['',Validators.email],
      telephone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      role: ['employe' ],
      mot_de_passe: ['',[
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)
      ]],
    });
  }

  ngOnInit(): void {
    this.loadEmployes();
  }

  getPasswordErrorMessage(): string{
    if(this.EmployeForm.get('mot_de_passe')?.hasError('required'))
      return 'mot de passe est obligatoire';

    if(this.EmployeForm.get('mot_de_passe')?.hasError('minlength'))
      return 'le mot de passe doit comporter au moins 8 caractères';

    return this.EmployeForm.get('pattern')? 'Nécessite des majuscules, des minuscules et des chiffres' : '';
  }
  onNameFilterChange(event: any): void {
    this.filterName.set(event.target.value);
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterName.set('');
    this.applyFilters();
  }

  applyFilters(): void {
    const nameFilter = this.filterName().toLowerCase();
    this.filteredEmployes.set(
      this.Employes().filter(Employe => {
        const matchesName = Employe.nom.includes(nameFilter)
        return matchesName ;
      })
    );
  }

  loadEmployes(): void {
    this.isLoading.set(true);
    this.UtilisateurService.getEmployes().subscribe({
      next: (response) => {
        if (response) {
          this.Employes.set(response);
          this.applyFilters();
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
      if (this.isEditing() && this.currentEditId() !== null) {
        this.UtilisateurService.updateEmploye(this.currentEditId()!, formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'Employe modifié avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      } else {
      console.log(formData)

        this.UtilisateurService.createEmploye(formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'Employe créé avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      }
    }
  }

  onEdit(Employe: Employe): void {
    this.isEditing.set(true);
    this.currentEditId.set(Employe.id!);
    this.EmployeForm.patchValue({
      nom:Employe.nom,
      email: Employe.email,
      telephone:Employe.telephone,
      role:'employe',
    });

  }

  onDelete(Employe: Employe): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer Employe "${Employe.nom}" ?`)) {
      this.isLoading.set(true);
      this.UtilisateurService.deleteEmploye(Employe.id!).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'Employe supprimé avec succès');
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  resetForm(): void {
    this.EmployeForm.reset();
    this.isEditing.set(false);
    this.currentEditId.set(null);
  }

  private handleSuccess(response: any, successMessage: string): void {
    this.isLoading.set(false);
    if (response) {
      this.snackBar.open(successMessage, 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.loadEmployes();
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

}
