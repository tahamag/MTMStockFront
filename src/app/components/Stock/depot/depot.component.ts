// depots.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Shared components
import { HeaderComponent } from '../../../shared/header/header.component';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

// Services
import { DepotService } from '../../../services/depot/depot.service';
import { Depot } from '../../../models/depot';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-depots',
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
  templateUrl: './depot.component.html',
  styleUrls: ['./depot.component.css']
})
export class DepotComponent implements OnInit {
  private fb = inject(FormBuilder);
  private depotService = inject(DepotService);
  private snackBar = inject(MatSnackBar);

  depots = signal<Depot[]>([]);

  isLoading = signal(false);
  isEditing = signal(false);
  currentEditId = signal<number | null>(null);

  depotForm: FormGroup;
  displayedColumns: string[] = ['id', 'nom', 'description', 'actions'];

  constructor() {
    this.depotForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(5)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadDepots();
  }

  loadDepots(): void {
    this.isLoading.set(true);
    this.depotService.getDepots().subscribe({
      next: (response) => {
        if (response) {
          this.depots.set(response);
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
    if (this.depotForm.valid) {
      this.isLoading.set(true);
      const formData = this.depotForm.value;

      if (this.isEditing() && this.currentEditId() !== null) {
        // Update existing depot
        this.depotService.updateDepot(this.currentEditId()!, formData).subscribe({
          
          next: (response) => {
            console.log(response)
            this.handleSuccess(response,'Dépôt modifié avec succès');
            this.resetForm();
          },
          error: (error) => {
            console.log('error',error)
            this.handleError(error);
          }
        });
      } else {
        // Create new depot
        this.depotService.createDepot(formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'Dépôt créé avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      }
    }
  }

  onEdit(depot: Depot): void {
    this.isEditing.set(true);
    this.currentEditId.set(depot.id);
    this.depotForm.patchValue({
      nom: depot.nom,
      description: depot.description
    });
  }

  onDelete(depot: Depot): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le dépôt "${depot.nom}" ?`)) {
      this.isLoading.set(true);
      this.depotService.deleteDepot(depot.id).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'Dépôt supprimé avec succès');
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  resetForm(): void {
    this.depotForm.reset();
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
      this.loadDepots();
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
    this.loadDepots();
  }
}