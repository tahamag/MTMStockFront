import { Categorie } from './../../../models/categorie';
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
import { CategorieService } from './../../../services/categorie/categorie.service';
import { Article } from '../../../models/article';
import { MatProgressBar } from "@angular/material/progress-bar";

@Component({
  selector: 'app-articles',
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
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private articleService = inject(ArticleService);
  private CategorieService = inject(CategorieService);
  private snackBar = inject(MatSnackBar);

  articles = signal<Article[]>([]);
  categories = signal<Categorie[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  currentEditId = signal<number | null>(null);
  filterName = signal('');
  filterCategory = signal('');
  filteredArticles = signal<Article[]>([]);
  
  articleForm: FormGroup;
  displayedColumns: string[] = ['code', 'designation', 'categorie', 'prixV', 'prixA', 'actions'];

  constructor() {
    this.articleForm = this.fb.group({
      id_categorie: ['',Validators.required],
      code: ['', ],
      designation: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', ],
      prixA_HT: ['', ],
      prixA_TTC: ['', ],
      prixV_HT: ['', ],
      prixV_TTC: ['', ],
      tva: ['', ],
      image: ['']
    });
  }

  ngOnInit(): void {
    this.loadArticles();
    this.loadCategories();
  }

  onNameFilterChange(event: any): void {
    this.filterName.set(event.target.value);
    this.applyFilters();
  }

  onCategoryFilterChange(event: any): void {

    this.filterCategory.set(event.value);
    this.applyFilters();
  }

  clearFilters(): void {
    this.filterName.set('');
    this.filterCategory.set('');
    this.applyFilters();
  }

  applyFilters(): void {
    const nameFilter = this.filterName().toLowerCase();
    const categoryFilter = this.filterCategory();
    console.log(categoryFilter)

    this.filteredArticles.set(
      this.articles().filter(article => {
        const matchesName = article.designation.toLowerCase().includes(nameFilter) ||
                            article.code!.toLowerCase().includes(nameFilter);
        
        const matchesCategory = !categoryFilter || 
                              article.id_Categorie === parseInt(categoryFilter) ;
        return matchesName && matchesCategory;
      })
    );
  }

  loadArticles(): void {
    this.isLoading.set(true);
    this.articleService.getArticles().subscribe({
      next: (response) => {
        if (response) {
          this.articles.set(response );
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

  loadCategories(): void {
    this.CategorieService.getCategories().subscribe({
      next: (response) => {
        if (response) {
          this.categories.set(response);
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }


  calculateTTC(): void {
    const prixHT = this.articleForm.get('prixA_HT')?.value;
    const prixVHT = this.articleForm.get('prixV_HT')?.value;
    const tva = this.articleForm.get('tva')?.value;
    
    if (prixHT && tva) {
      const ttc = prixHT * (1 + tva / 100);
      this.articleForm.patchValue({
        prixA_TTC: ttc.toFixed(2)
      });
    }
    if (prixVHT && tva) {
      const ttc = prixVHT * (1 + tva / 100);
      this.articleForm.patchValue({
        prixV_TTC: ttc.toFixed(2)
      });
    }
  }
  checkValues(data : any){
    data.prixA_HT = data.prixA_HT == "" ? 0 : data.prixA_HT
    data.prixA_TTC = data.prixA_TTC == "" ? 0 : data.prixA_TTC
    data.prixV_HT = data.prixV_HT == "" ? 0 : data.prixV_HT
    data.prixV_TTC = data.prixV_TTC == "" ? 0 : data.prixV_TTC
    data.tva = data.tva == "" ? 0 : data.tva
    return data;
  }

  onSubmit(): void {
    if (this.articleForm.valid) {
      this.isLoading.set(true);
      const formData = this.checkValues(this.articleForm.value) ;
      
      if (this.isEditing() && this.currentEditId() !== null) {
        this.articleService.updateArticle(this.currentEditId()!, formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'Article modifié avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      } else {
        
        this.articleService.createArticle(formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'Article créé avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      }
    }
  }

  onEdit(article: any): void {
    this.isEditing.set(true);
    this.currentEditId.set(article.id);
    this.articleForm.patchValue({
      id_categorie: article.categorie.id,
      code: article.code,
      designation: article.designation,
      description: article.description,
      prixA_HT: article.prixA_HT,
      prixA_TTC: article.prixA_TTC,
      prixV_HT: article.prixV_HT,
      prixV_TTC: article.prixV_TTC,
      tva: article.tva
    });
    
  }

  onDelete(article: Article): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${article.designation}" ?`)) {
      this.isLoading.set(true);
      this.articleService.deleteArticle(article.id).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'Article supprimé avec succès');
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  resetForm(): void {
    this.articleForm.reset();
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
      this.loadArticles();
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