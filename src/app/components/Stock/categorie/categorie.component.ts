import { Categorie } from './../../../models/categorie';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule} from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Shared components
import { HeaderComponent } from '../../../shared/header/header.component';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

// Services
import { CategorieService } from '../../../services/categorie/categorie.service';

@Component({
  selector: 'app-categories',
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
    HeaderComponent,
    SidebarComponent
  ],
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.css']
})
export class CategorieComponent implements OnInit {
  private fb = inject(FormBuilder);
  private CategorieService = inject(CategorieService);
  private snackBar = inject(MatSnackBar);

  Categories = signal<Categorie[]>([]);

  isLoading = signal(false);
  isEditing = signal(false);
  currentEditId = signal<number | null>(null);

  categorieForm: FormGroup;
  displayedColumns: string[] = ['id', 'nom', 'description', 'actions'];

  constructor() {
    this.categorieForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(5)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.CategorieService.getCategories().subscribe({
      next: (response) => {
        if (response) {
          this.Categories.set(response);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.snackBar.open(error.message, 'Fermer', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.categorieForm.valid) {
      this.isLoading.set(true);
      const formData = this.categorieForm.value;

      if (this.isEditing() && this.currentEditId() !== null) {
        // Update existing categorie
        this.CategorieService.updateCategorie(this.currentEditId()!, formData).subscribe({
          next: (response) => {
            this.handleSuccess(response,'Categorie modifié avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      } else {
        // Create new categorie
        this.CategorieService.createCategorie(formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'Categorie créé avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      }
    }
  }

  onEdit(categorie: Categorie): void {
    this.isEditing.set(true);
    this.currentEditId.set(categorie.id);
    this.categorieForm.patchValue({
      nom: categorie.nom,
      description: categorie.description
    });
  }

  onDelete(categorie: Categorie): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le Categorie "${categorie.nom}" ?`)) {
      this.isLoading.set(true);
      this.CategorieService.deleteCategorie(categorie.id).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'Categorie supprimé avec succès');
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  resetForm(): void {
    this.categorieForm.reset();
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
      this.loadCategories();
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