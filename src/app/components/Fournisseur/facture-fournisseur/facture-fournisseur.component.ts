import { Component, inject, signal, OnInit } from '@angular/core';
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
import { FactureService } from '../../../services/facture/facture.service';
import { ArticleService } from '../../../services/article/article.service';
import { ClientService } from '../../../services/client/client.service';
import { DepotService } from '../../../services/depot/depot.service';
import { Facture } from '../../../models/facture';
import { Client } from '../../../models/client';
import { Article } from '../../../models/article';
import { Depot } from '../../../models/depot';
import { Fournisseur } from '../../../models/fournisseur';
import { FournisseurService } from '../../../services/fournisseur/fournisseur.service';

@Component({
  selector: 'app-facture-fournisseur',
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
  templateUrl: './facture-fournisseur.component.html',
  styleUrl: './facture-fournisseur.component.css'
})
export class FactureFournisseurComponent {

  private fb = inject(FormBuilder);
  private factureService = inject(FactureService);
  private articleService = inject(ArticleService);
  private fournisseurService = inject(FournisseurService);
  private depotService = inject(DepotService);
  private snackBar = inject(MatSnackBar);

  factures = signal<Facture[]>([]);
  fournisseurs = signal<Fournisseur[]>([]);
  depots = signal<Depot[]>([]);
  articles = signal<Article[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  currentEditId = signal<number | null>(null);
  expandedFacture = signal<Facture | null>(null);
  showFilters = signal(false);

  filterCode = signal('');
  filterIntervenant = signal('');
  filterDateDebut = signal<Date>(new Date());
  filterDateFin = signal<Date>(new Date());
  filteredFactures = signal<Facture[]>([]);

  factureForm: FormGroup;
  displayedColumns: string[] = ['expand', 'code', 'intervenant', 'date', 'montant', 'actions'];
  codeFilter: any = "";
  intervenantFilter: any = "";
  dateDebutFilter: any = new Date();
  dateFinFilter: any = new Date();
  typeIntervenant: string = 'fournisseurs';

  constructor() {
    // Main facture form
    this.factureForm = this.fb.group({
      typeIntervenant: ['fournisseurs'],
      Id_intervenant: [null, Validators.required],
      id_depot: [null, Validators.required],
      code: [''],
      dateFacture: [new Date(), Validators.required],
      montantTotal: [0, [Validators.required, Validators.min(0)]],
      lignes: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadFacturations();
    this.loadFournisseurs();
    this.loadDepots();
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
    this.codeFilter = "";
    this.intervenantFilter = "";
    this.dateDebutFilter = new Date();
    this.dateFinFilter = new Date();
    this.filterCode.set('');
    this.filterIntervenant.set('');
    this.filterTransactions();
  }

  onCodeFilterChange(event: any): void {
    this.filterCode.set(event.target.value)
    this.filterTransactions();
  }

  onIntervenantFilterChange(event: MatSelectChange): void {
    this.filterIntervenant.set(event.value)
    this.filterTransactions();
  }

  onDateDebutFilterChange(event: MatDatepickerInputEvent<Date>): void {
    this.filterDateDebut.set(event.value ?? new Date())
    this.filterTransactions();
  }

  onDateFinFilterChange(event: MatDatepickerInputEvent<Date>): void {
    this.filterDateFin.set(event.value ?? new Date())
    this.filterTransactions();
  }

  onTypeIntervenantChange(event: MatSelectChange): void {
    this.typeIntervenant = event.value;
    this.factureForm.patchValue({
      typeIntervenant: event.value,
      Id_intervenant: null
    });
    this.loadFacturations();
  }

  filterTransactions(): void {
    const start = new Date(this.filterDateDebut());
    const end = new Date(this.filterDateFin());
    const codeFilter = this.filterCode()?.toLowerCase() || '';
    const intervenantId = parseInt(this.filterIntervenant(), 10);

    this.filteredFactures.set(
      this.factures().filter(facture => {
        console.log("date facture",facture.dateFacture)
        const dateFacture = new Date(facture.dateFacture);
        const afterStart = !start || dateFacture >= start;
        const beforeEnd = !end || dateFacture <= end;
        console.log('dateFacture:', dateFacture,'end:', end, 'start:', start);

        const matchesCode = !codeFilter || facture.code?.toLowerCase().includes(codeFilter);
        const matchesIntervenant = isNaN(intervenantId) || intervenantId === -1 || facture.fournisseur?.id === intervenantId;

        return  afterStart && beforeEnd && matchesCode && matchesIntervenant;
      })
    );
  }

  // Check if any filter is active
  hasActiveFilters(): boolean {
    return !!this.filterCode() || !!this.filterIntervenant() || !!this.filterDateDebut() || !!this.filterDateFin();
  }

  // Toggle facture details view
  toggleTransactionDetails(facture: Facture): void {
    if (this.expandedFacture() === facture) {
      this.expandedFacture.set(null);
    } else {
      this.expandedFacture.set(facture);
    }
  }

  // Check if a facture is expanded
  isTransactionExpanded(facture: Facture): boolean {
    return this.expandedFacture() === facture;
  }

  get lignes(): FormArray {
    return this.factureForm.get('lignes') as FormArray;
  }

  createLigne(article?: Article, ligne?: any): FormGroup {
    if (ligne) {
      const prixTTC = ligne ? ligne.prix_TTC || 0 : 0;
      const tva = ligne ? ligne.tva || 0 : 0;
      const prixHT = prixTTC / (1 + tva / 100);

      return this.fb.group({
        id: ligne?.id,
        id_Article: [ligne?.id_Article || null, Validators.required],
        quantite: [ligne?.quantite, [Validators.required, Validators.min(1)]],
        Prix_HT: [prixHT],
        Prix_TTC: [prixTTC],
        TVA: [tva],
        MontantTTC: [prixTTC * ligne?.quantite],
        article: [article || null]
      });
    } else {
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

  onQuantiteChange(index: number): void {
    const ligne = this.lignes.at(index);
    const quantite = ligne.value.quantite;
    const prixHT = ligne.value.Prix_HT;
    const TVA = ligne.value.TVA;
    const prixTTC = prixHT * (1 + TVA / 100);
    ligne.patchValue({
      Prix_TTC: prixTTC,
      MontantTTC: quantite * prixTTC
    });
    this.calculateTotal();
  }

  calculateTotal(): void {
    const total = this.lignes.controls.reduce((sum, ligne) => {
      return sum + (ligne.value.MontantTTC || 0);
    }, 0);
    this.factureForm.patchValue({ montantTotal: total });
  }

  loadFacturations(): void {
    this.isLoading.set(true);
    this.factureService.getFactures("fournisseurs").subscribe({
      next: (response) => {
        if (response) {
          this.factures.set(response);
         // this.filteredFactures.set(response);
          this.filterTransactions();
          console.log( this.filterTransactions())
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
          this.fournisseurs.set(response);
        }
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  loadDepots(): void {
    this.depotService.getDepots().subscribe({
      next: (response) => {
        if (response) {
          this.depots.set(response);
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
    if (this.factureForm.valid && this.lignes.length > 0) {
      this.isLoading.set(true);
      const formData = this.prepareTransactionData();
      console.log('Submitting form data:', formData);
      if (this.isEditing() && this.currentEditId() !== null) {
        this.factureService.updateFacture(this.currentEditId()!, formData).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'facture modifié avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      } else {
        this.factureService.createFacture(formData, this.typeIntervenant).subscribe({
          next: (response) => {
            this.handleSuccess(response, 'facture créé avec succès');
            this.resetForm();
          },
          error: (error) => {
            this.handleError(error);
          }
        });
      }
    }
  }

  private prepareTransactionData(): Facture {
    const formValue = this.factureForm.value;
    const typeIntervenant = formValue.typeIntervenant;

    let selectedIntervenant: Fournisseur | undefined;
      selectedIntervenant = this.fournisseurs().find(f => f.id === formValue.Id_intervenant);

    if (!selectedIntervenant) {
      throw new Error('Intervenant non trouvé');
    }

    const selectedDepot = this.depots().find(d => d.id === formValue.id_depot);
    if (!selectedDepot) {
      throw new Error('Dépôt non trouvé');
    }

    return {
      typeIntervenant: formValue.typeIntervenant,
      Id_intervenant: formValue.Id_intervenant,
      id_depot: formValue.id_depot,
      code: formValue.code,
      dateFacture: formValue.dateFacture,
      createdAt: new Date(),
      montantTotal: formValue.montantTotal,
      client: undefined,
      fournisseur: typeIntervenant === 'fournisseurs' ? selectedIntervenant as Fournisseur : undefined,
      lignes: formValue.lignes.map((ligne: any) => ({
        id: ligne.id,
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

  onEdit(facture: Facture): void {
    this.isEditing.set(true);
    this.currentEditId.set(facture.id!);
    this.typeIntervenant = facture.typeIntervenant;

    // Clear existing lignes
    while (this.lignes.length !== 0) {
      this.lignes.removeAt(0);
    }

    // Add lignes from facture
    facture.lignes.forEach(ligne => {
      const article = this.articles().find(a => a.id === ligne.id_Article);
      this.lignes.push(this.createLigne(article, ligne));
    });
    console.log('Editing facture:', facture);
    this.factureForm.patchValue({
      typeIntervenant: 'fournisseur',
      Id_intervenant: facture.fournisseur?.id,
      id_depot: facture.id_depot,
      code: facture.code,
      dateFacture: facture.dateFacture,
      montantTotal: facture.montantTotal
    });
  }

  onDelete(facture: Facture): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la facture "${facture.code}" ?`)) {
      this.isLoading.set(true);
      this.factureService.deleteFacture(facture.id!).subscribe({
        next: (response) => {
          this.handleSuccess(response, 'facture supprimé avec succès');
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    }
  }

  resetForm(): void {
    this.factureForm.reset({
      typeIntervenant: 'fournisseurs',
      Id_intervenant: null,
      id_depot: null,
      dateFacture: new Date(),
      montantTotal: 0
    });
    while (this.lignes.length !== 0) {
      this.lignes.removeAt(0);
    }
    this.isEditing.set(false);
    this.currentEditId.set(null);
    this.expandedFacture.set(null);
    this.typeIntervenant = 'fournisseurs';
  }

  private handleSuccess(response: any, successMessage: string): void {
    this.isLoading.set(false);
    if (response) {
      this.snackBar.open(successMessage, 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.loadFacturations();
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

  getIntervenantName(intervenantId: number, type: string): string {
      const fournisseur = this.fournisseurs().find(f => f.id === intervenantId);
      return fournisseur ? fournisseur.nomComplet : 'Inconnu';
  }


  getArticleName(articleId: number): string {
    const article = this.articles().find(a => a.id === articleId);
    return article ? article.designation : 'Inconnu';
  }

}
