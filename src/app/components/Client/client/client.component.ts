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
import { ClientService } from '../../../services/client/client.service';
import { Client } from '../../../models/client';

@Component({
  selector: 'app-client',standalone: true,
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
  templateUrl: './client.component.html',
  styleUrl: './client.component.css'
})
export class ClientComponent {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  clients = signal<Client[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  currentEditId = signal<number | null>(null);
  filterName = signal('');
  filterCode = signal('');
  filteredClients = signal<Client[]>([]);

  clientForm: FormGroup;
  displayedColumns: string[] = ['code', 'nomComplet', 'email', 'telephone', 'adresse', 'actions'];

  constructor() {
    this.clientForm = this.fb.group({
      code: ['', ],
      nomComplet: ['', [Validators.required, Validators.minLength(3)]],
      email: ['',Validators.email ],
      telephone: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      adresse: ['', ],
    });
  }

  ngOnInit(): void {
    this.loadClients();
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
    this.filteredClients.set(
      this.clients().filter(client => {
        const matchesName = client.nomComplet.includes(nameFilter) ||
                            client.code!.toLowerCase().includes(nameFilter);
        return matchesName ;
      })
    );
  }

  loadClients(): void {
    this.isLoading.set(true);
    this.clientService.getClients().subscribe({
      next: (response) => {
        if (response) {
          this.clients.set(response);
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
    if (this.clientForm.valid) {
      this.isLoading.set(true);
      const formData = this.clientForm.value;
      
      if (this.isEditing() && this.currentEditId() !== null) {
        this.clientService.updateClient(this.currentEditId()!, formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'client modifié avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      } else {
        
        this.clientService.createClient(formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'client créé avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      }
    }
  }

  onEdit(client: Client): void {
    this.isEditing.set(true);
    this.currentEditId.set(client.id);
    this.clientForm.patchValue({
      code: client.code,
      nomComplet:client.nomComplet,
      email: client.email,
      telephone:client.telephone,
      adresse:client.adresse,
    });
    
  }

  onDelete(client: Client): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer client "${client.nomComplet}" ?`)) {
      this.isLoading.set(true);
      this.clientService.deleteClient(client.id).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'client supprimé avec succès');
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  resetForm(): void {
    this.clientForm.reset();
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
      this.loadClients();
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
