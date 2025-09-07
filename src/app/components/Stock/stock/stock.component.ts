import { Component, inject, signal, OnInit } from '@angular/core';
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
import { ArticleService } from '../../../services/article/article.service';
import { StockService } from '../../../services/stock/stock.service';
import { DepotService } from './../../../services/depot/depot.service';
import { Article } from '../../../models/article';
import { MatProgressBar } from "@angular/material/progress-bar";
import { Depot } from '../../../models/depot';
import { Stock } from '../../../models/stock';

@Component({
  selector: 'app-stock',
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
    MatProgressBar
],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.css'
})
export class StockComponent {
  private stockService = inject(StockService);
  private DepotService = inject(DepotService);
  private snackBar = inject(MatSnackBar);

  stock = signal<Stock[]>([]);
  depots = signal<Depot[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  filterName = signal('');
  FilterDepot = signal('');
  filteredArticles = signal<Stock[]>([]);
  displayedColumns: string[] = ['code', 'designation', 'quantiteEntree', 'quantiteSortie', 'quantiteFinale', 'Depot'];



  ngOnInit(): void {
    this.loadDepot();
  }

  onNameFilterChange(event: any): void {
    this.filterName.set(event.target.value);
    this.applyFilters();
  }

  ondepotFilterChange(event: any): void {

    this.FilterDepot.set(event.value);
    this.loadArticles(event.value);
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterName.set('');
    this.FilterDepot.set('');
    this.applyFilters();
  }

  applyFilters(): void {
    const nameFilter = this.filterName().toLowerCase();
    this.filteredArticles.set(
      this.stock().filter(stock => {
        const matchesName = stock.article.designation.toLowerCase().includes(nameFilter) ||
                            stock.article.code!.toLowerCase().includes(nameFilter);

        return matchesName;
      })
    );
  }

  loadArticles(depotId : number ): void {
    this.isLoading.set(true);

    this.stockService.getStock(depotId).subscribe({
      next: (response) => {
        if (response) {
          this.stock.set(response);
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

  loadDepot(): void {
    this.DepotService.getDepots().subscribe({
      next: (response) => {
        if (response) {
          this.depots.set(response);
          this.loadArticles(response[0].id || 0);
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private handleError(error: any): void {
    this.isLoading.set(false);
    this.snackBar.open(error.message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

}
