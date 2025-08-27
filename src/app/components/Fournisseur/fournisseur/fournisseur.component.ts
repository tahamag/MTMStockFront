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
import { FournisseurService } from '../../../services/fournisseur/fournisseur.service';
import { Fournisseur } from '../../../models/fournisseur';
@Component({
  selector: 'app-fournisseur',
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
    SidebarComponent,],
  templateUrl: './fournisseur.component.html',
  styleUrl: './fournisseur.component.css'
})
export class FournisseurComponent {
  private fb = inject(FormBuilder);
  private fournisseurService = inject(FournisseurService);
  private snackBar = inject(MatSnackBar);

  fournisseurs = signal<Fournisseur[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  currentEditId = signal<number | null>(null);
  filterName = signal('');
  filterCode = signal('');
  filteredfournisseurs = signal<Fournisseur[]>([]);

  fournisseurForm: FormGroup;
  displayedColumns: string[] = ['code', 'nomComplet', 'email', 'telephone', 'adresse', 'actions'];

  constructor() {
    this.fournisseurForm = this.fb.group({
      code: ['', ],
      nomComplet: ['', [Validators.required, Validators.minLength(3)]],
      email: ['',Validators.email ],
      telephone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      adresse: ['', ],
    });
  }

  ngOnInit(): void {
    this.loadfournisseur();
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
    this.filteredfournisseurs.set(
      this.fournisseurs().filter(fournisseur => {
        const matchesName = fournisseur.nomComplet.includes(nameFilter) ||
                            fournisseur.code!.toLowerCase().includes(nameFilter);
        return matchesName ;
      })
    );
  }

  loadfournisseur(): void {
    this.isLoading.set(true);
    this.fournisseurService.getFournisseurs().subscribe({
      next: (response) => {
        if (response) {
          this.fournisseurs.set(response);
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
    if (this.fournisseurForm.valid) {
      this.isLoading.set(true);
      const formData = this.fournisseurForm.value;
      
      if (this.isEditing() && this.currentEditId() !== null) {
        this.fournisseurService.updateFournisseur(this.currentEditId()!, formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'fournisseur modifié avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      } else {
        
        this.fournisseurService.createFournisseur(formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'fournisseur créé avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      }
    }
  }

  onEdit(fournisseur: Fournisseur): void {
    this.isEditing.set(true);
    this.currentEditId.set(fournisseur.id);
    alert(fournisseur.id)
    this.fournisseurForm.patchValue({
      nomComplet:fournisseur.nomComplet,
      email: fournisseur.email,
      telephone:fournisseur.telephone,
      adresse:fournisseur.adresse,
    });
    
  }

  onDelete(fournisseur: Fournisseur): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer fournisseur "${fournisseur.nomComplet}" ?`)) {
      this.isLoading.set(true);
      this.fournisseurService.deleteFournisseur(fournisseur.id).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'fournisseur supprimé avec succès');
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  resetForm(): void {
    this.fournisseurForm.reset();
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
      this.loadfournisseur();
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
