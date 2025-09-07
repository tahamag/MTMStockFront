import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';

// Shared components
import { HeaderComponent } from '../../../shared/header/header.component';
import { SidebarComponent } from '../../../shared/sidebar/sidebar.component';

// Services
import { CommandeService } from '../../../services/commande/commande.service';
import { ArticleService } from '../../../services/article/article.service';
import { FournisseurService } from '../../../services/fournisseur/fournisseur.service';
import { Commande, } from '../../../models/commande';
import { Fournisseur } from '../../../models/fournisseur';
import { Article } from '../../../models/article';


@Component({
  selector: 'app-commande-frs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    MatDatepickerModule,
    MatNativeDateModule,
    HeaderComponent,
    SidebarComponent,
    DatePipe
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'fr'},
    provideNativeDateAdapter()
  ],
  templateUrl: './commande.component.html',
  styleUrl: './commande.component.css'
})
export class commandefrsComponent {

  private fb = inject(FormBuilder);
  private commandeService = inject(CommandeService);
  private articleService = inject(ArticleService);
  private fournisseurService = inject(FournisseurService);
  private snackBar = inject(MatSnackBar);

  commandes = signal<Commande[]>([]);
  fournisseur = signal<Fournisseur[]>([]);
  articles = signal<Article[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  currentEditId = signal<number | null>(null);
  expandedCommande = signal<Commande | null>(null); // Track which command is expanded
  showFilters = signal(false); // Control filter panel visibility

  filterCode = signal('');
  filterFournisseur = signal('');
  filterDateDebut = signal<Date>(new Date());
  filterDateFin = signal<Date>(new Date());
  filteredCommandes = signal<Commande[]>([]);

  commandeForm: FormGroup;
  displayedColumns: string[] = ['expand', 'code', 'fournisseur', 'date', 'montant', 'actions'];
  codeFilter:any = "";
  fournisseurFilter:any = "";
  dateDebutFilter:any = new Date();
  dateFinFilter:any = new Date();


  constructor() {
    this.filterDateDebut.set(new Date);
    // Main command form
    this.commandeForm = this.fb.group({
      typeIntervenant: ['fournisseurs'],
      code: [''],
      dateCommande: [new Date(), Validators.required],
      fournisseur: [null, Validators.required],
      Id_intervenant :[''],
      montantTotal: [0, [Validators.required, Validators.min(0)]],
      lignes: this.fb.array([])
    });

  }

  ngOnInit(): void {
    this.loadCommandes();
    this.loadFournisseurs();
    this.loadArticles();
  }

  // Toggle filter panel
  toggleFilters(): void {
    this.showFilters.set(!this.showFilters());
    if (!this.showFilters()) {
      this.clearFilters();
    }
  }

  // Clear all filters
  clearFilters(): void {

    this.codeFilter =""
    this.fournisseurFilter =""
    this.dateDebutFilter = new Date();
    this.dateFinFilter = new Date();
    this.filterCode.set('');
    this.filterFournisseur.set('');

    const currentDate = new Date();
    this.filterDateDebut.set(currentDate);
    this.filterDateFin.set(currentDate);
    this.filterCommandes();
  }

  onCodeFilterChange(event: any): void {
    this.filterCode.set(event.target.value)
    this.filterCommandes();
  }
  onFournisseurFilterChange(event: MatSelectChange): void {
    this.filterFournisseur.set(event.value)
    this.filterCommandes();
  }
  onDateDebutFilterChange(event: MatDatepickerInputEvent<Date>): void {
    this.filterDateDebut.set(event.value?? new Date())
    this.filterCommandes();
  }
  onDateFinFilterChange(event: MatDatepickerInputEvent<Date>): void {
    this.filterDateFin.set(event.value?? new Date())
    this.filterCommandes();
  }

filterCommandes(): void {
  const start = new Date (this.filterDateDebut());
  const end = new Date (this.filterDateFin());
  const codeFilter = this.filterCode()?.toLowerCase() || '';
  const fournisseurId = parseInt(this.filterFournisseur(), 10);

  this.filteredCommandes.set(
    this.commandes().filter(commande => {
      const dateCommande = new Date(commande.dateCommande);
      const afterStart = !start || dateCommande >= start;
      const beforeEnd = !end || dateCommande <= end;

      const matchesCode = !codeFilter || commande.code?.toLowerCase().includes(codeFilter);
    const matchesfournisseur = isNaN(fournisseurId) || fournisseurId === -1 || commande.fournisseur?.id === fournisseurId;

      return afterStart &&   beforeEnd  && matchesCode && matchesfournisseur;
    })
  );
}

  // Check if any filter is active
  hasActiveFilters(): boolean {
    return !!this.filterCode || !!this.filterFournisseur || !!this.filterDateDebut || !!this.filterDateFin;
  }
  // Toggle command details view
  toggleCommandeDetails(commande: Commande): void {
    if (this.expandedCommande() === commande) {
      this.expandedCommande.set(null);
    } else {
      this.expandedCommande.set(commande);
    }
  }

  // Check if a command is expanded
  isCommandeExpanded(commande: Commande): boolean {
    return this.expandedCommande() === commande;
  }

  get lignes(): FormArray {
    return this.commandeForm.get('lignes') as FormArray;
  }

  createLigne(article?: Article, ligne? : any ): FormGroup {
    if(ligne){
      const prixTTC = ligne ? ligne.prix_TTC || 0 : 0;
      const tva = ligne ? ligne.tva || 0 : 0;
      const prixHT = prixTTC / (1 + tva / 100);

      return this.fb.group({
        id :ligne?.id,
        id_Article: [ligne?.id_Article || null, Validators.required],
        quantite: [ligne?.quantite, [Validators.required, Validators.min(1)]],
        Prix_HT: [prixHT],
        Prix_TTC: [prixTTC],
        TVA: [tva],
        MontantTTC: [prixTTC * ligne?.quantite],
        article: [article || null]
      });
    }
    else{
      const prixTTC = article ? article.prixA_TTC || 0 : 0;
      const tva = article ? article.tva || 0 : 0;
      const prixHT = prixTTC / (1 + tva / 100);
      return this.fb.group({
        id_Article: [article?.id || null, Validators.required],
        quantite: [1, [Validators.required, Validators.min(1)]],
        Prix_HT: [prixHT],
        Prix_TTC: [prixTTC],
        TVA: [tva],
        MontantTTC: [prixTTC * 1],
        article: [article || null]
      });
    }
  }

  addLigne(): void {
    this.lignes.push(this.createLigne());
  }

  removeLigne(index: number): void {
    this.lignes.removeAt(index);
    this.calculateTotal();
  }

  onArticleChange(index: number, articleId: number): void {
    const article = this.articles().find(a => a.id === articleId);
    if (article) {
      const ligne = this.lignes.at(index);
      const quantite = ligne.value.quantite || 1;
      const prixTTC = article.prixA_TTC || 0;
      const tva = article.tva || 0;
      const prixHT = prixTTC / (1 + tva / 100);

      ligne.patchValue({
        Prix_HT: prixHT,
        Prix_TTC: prixTTC,
        TVA: tva,
        MontantTTC: prixTTC * quantite,
        article: article
      });
      this.calculateTotal();
    }
  }

  onquantiteChange(index: number): void {
    const ligne = this.lignes.at(index);
    const quantite = ligne.value.quantite;
    const prixHT = ligne.value.Prix_HT;
    const TVA = ligne.value.TVA;
    const prixTTC = prixHT * (1 + TVA / 100);
    ligne.patchValue({
      Prix_TTC : prixTTC,
      MontantTTC: quantite * prixTTC
    });
    this.calculateTotal();
  }

  calculateTotal(): void {
    const total = this.lignes.controls.reduce((sum, ligne) => {
      return sum + (ligne.value.MontantTTC || 0);
    }, 0);
    this.commandeForm.patchValue({ montantTotal: total });
  }

  loadCommandes(): void {
    this.isLoading.set(true);
    this.commandeService.getCommandes('fournisseurs').subscribe({
      next: (response) => {
        if (response) {
          this.commandes.set(response);
          this.filteredCommandes.set(response);
          this.filterCommandes();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.handleError(error);
        this.isLoading.set(false);
      }
    });
  }

  loadFournisseurs(): void {
    this.fournisseurService.getFournisseurs().subscribe({
      next: (response) => {
        if (response) {
          this.fournisseur.set(response);
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  loadArticles(): void {
    this.articleService.getArticles().subscribe({
      next: (response) => {
        if (response) {
          this.articles.set(response);
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  onSubmit(): void {
    if (this.commandeForm.valid && this.lignes.length > 0) {
      this.isLoading.set(true);
      // Prepare the commande data
      const formData = this.prepareCommandeData();
      if (this.isEditing() && this.currentEditId() !== null) {
        this.commandeService.updateCommande(this.currentEditId()!, formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'Commande modifiée avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      } else {
        this.commandeService.createCommande(formData , 'fournisseurs').subscribe({
          next: (response) => {
            this.handleSuccess(response, 'Commande créée avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      }
    }
  }

  private prepareCommandeData(): Commande {
    const formValue = this.commandeForm.value;
    const selectedFournisseur = this.fournisseur().find(c => c.id === formValue.fournisseur);
    if (!selectedFournisseur) {
      throw new Error('Fournisseur non trouvé');
    }
    return {
      typeIntervenant: 'fournisseur',
      code: formValue.code,
      dateCommande: formValue.dateCommande,
      createdAt: new Date(),
      montantTotal: formValue.montantTotal,
      fournisseur: selectedFournisseur,
      Id_intervenant : formValue.fournisseur,
      lignes: formValue.lignes.map((ligne: any) => ({
        id:ligne.id,
        id_Article: ligne.id_Article,
        quantite: ligne.quantite,
        Prix_HT: ligne.Prix_HT,
        Prix_TTC: ligne.Prix_TTC,
        TVA: ligne.TVA,
        MontantTTC: ligne.MontantTTC,
        article: ligne.article
      }))
    };
  }

  onEdit(commande: Commande): void {
    this.isEditing.set(true);
    this.currentEditId.set(commande.id!);
    // Clear existing lignes
    while (this.lignes.length !== 0) {
      this.lignes.removeAt(0);
    }

    // Add lignes from commande
    commande.lignes.forEach(ligne => {
      const article = this.articles().find(a => a.id === ligne.id_Article);
      this.lignes.push(this.createLigne(article,ligne));
    });

    this.commandeForm.patchValue({
      code: commande.code,
      dateCommande: commande.dateCommande,
      fournisseur: commande.fournisseur?.id,
      montantTotal: commande.montantTotal
    });
  }

  onDelete(commande: Commande): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande "${commande.code}" ?`)) {
      this.isLoading.set(true);
      this.commandeService.deleteCommande(commande.id!).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'Commande supprimée avec succès');
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  resetForm(): void {
    this.commandeForm.reset({
      typeIntervenant: 'fournisseurs',
      dateCommande: new Date(),
      montantTotal: 0
    });
    while (this.lignes.length !== 0) {
      this.lignes.removeAt(0);
    }
    this.isEditing.set(false);
    this.currentEditId.set(null);
    this.expandedCommande.set(null);
  }

  private handleSuccess(response: any, successMessage: string): void {
    this.isLoading.set(false);
    if (response) {
      this.snackBar.open(successMessage, 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.loadCommandes();
    } else {
      this.snackBar.open(response || 'Une erreur est survenue', 'Fermer', {
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

  getFournisseurName(fournisseurId: number): string {
    const fournisseur = this.fournisseur().find(c => c.id === fournisseurId);
    return fournisseur ? fournisseur.nomComplet : 'Inconnu';
  }

  getArticleName(articleId: number): string {
    const article = this.articles().find(a => a.id === articleId);
    return article ? article.designation : 'Inconnu';
  }

}
