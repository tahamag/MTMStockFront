import { filter } from 'rxjs';
import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

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
import { ClientService } from '../../../services/client/client.service';
import { Commande, } from '../../../models/commande';
import { Client } from './../../../models/client';
import { Article } from '../../../models/article';
import { Ligne } from '../../../models/ligne';


@Component({
  selector: 'app-commande',
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
    MatDatepickerModule,
    MatNativeDateModule,
    HeaderComponent,
    SidebarComponent,
    DatePipe], 
    providers: [
      {provide: MAT_DATE_LOCALE, useValue: 'fr'},
      provideNativeDateAdapter()
    ],
  templateUrl: './commande.component.html',
  styleUrl: './commande.component.css'
})
export class CommandeComponent {

  private fb = inject(FormBuilder);
  private commandeService = inject(CommandeService);
  private articleService = inject(ArticleService);
  private clientService = inject(ClientService);
  private snackBar = inject(MatSnackBar);

  commandes = signal<Commande[]>([]);
  clients = signal<Client[]>([]);
  articles = signal<Article[]>([]);
  isLoading = signal(false);
  isEditing = signal(false);
  currentEditId = signal<number | null>(null);
  expandedCommande = signal<Commande | null>(null); // Track which command is expanded
  showFilters = signal(false); // Control filter panel visibility

  filterCode = signal('');
  filterClient = signal('');
  filterDateDebut = signal<Date>(new Date());
  filterDateFin = signal<Date>(new Date());
  filteredCommandes = signal<Commande[]>([]);
  
  commandeForm: FormGroup;
  displayedColumns: string[] = ['expand', 'code', 'client', 'date', 'montant', 'actions'];
  
  
  constructor() {
    this.filterDateDebut.set(new Date);
    // Main command form
    this.commandeForm = this.fb.group({
      typeIntervenant: ['client'],
      code: [''],
      dateCommande: [new Date(), Validators.required],
      client: [null, Validators.required],
      Id_intervenant :[''],
      montantTotal: [0, [Validators.required, Validators.min(0)]],
      lignes: this.fb.array([])
    });
    
  }
  
  ngOnInit(): void {
    this.loadCommandes();
    this.loadClients();
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
    this.filterCode.set('');
    this.filterClient.set('');   

    const currentDate = new Date();
    this.filterDateDebut.set(currentDate);
    this.filterDateFin.set(currentDate);
  }

  onCodeFilterChange(event: any): void {
    this.filterCode.set(event.target.value)
    const codeFilter = this.filterCode().toLowerCase();
    this.filteredCommandes.set(
      this.commandes().filter(commande => {
        return commande.code.includes(codeFilter) ||
                            commande.code!.toLowerCase().includes(codeFilter);
        
      })
    );
  }
  onClientFilterChange(event: MatSelectChange): void {
    this.filterClient.set(event.value)
    const codeFilter = parseInt(this.filterClient());
    if(codeFilter == -1){
      this.filteredCommandes.set(
        this.commandes().filter(commande => {
          return commande
        })
      );
    }else{
      this.filteredCommandes.set(
        this.commandes().filter(commande => {
          return commande.client.id == event.value
        })
      );
    }
    
  }
  onDateDebutFilterChange(event: MatDatepickerInputEvent<Date>): void {
    this.filterDateDebut.set(event.value!)
    const filterDateDebut = new Date(this.filterDateDebut()!);

    this.filteredCommandes.set(
      this.commandes().filter(commande => {
        const dateCommande = new Date(commande.dateCommande)
        return dateCommande >= filterDateDebut
      })
    );
  }
  onDateFinFilterChange(event: any): void {
    this.filterDateFin.set(event.target.value)
    const filterDateFin = new Date(this.filterDateFin()!);

    this.filteredCommandes.set(
      this.commandes().filter(commande => {
        const dateCommande = new Date(commande.dateCommande)
        return dateCommande <= filterDateFin
      })
    );
  }

  // Check if any filter is active
  hasActiveFilters(): boolean {
    // todo change code
    return false;
    /*const values = this.filterForm.value;
    return !!values.code || !!values.client || !!values.dateDebut || !!values.dateFin;*/
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
      const prixTTC = article ? article.prixV_TTC || 0 : 0;
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
      const prixTTC = article.prixV_TTC || 0;
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
    this.commandeService.getCommandes('clients').subscribe({
      next: (response) => {
        if (response) {
          this.commandes.set(response);
          this.filteredCommandes.set(response);
          console.log(response)
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        this.handleError(error);
        this.isLoading.set(false);
      }
    });
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (response) => {
        if (response) {
          this.clients.set(response);
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
      console.log(formData)
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
        this.commandeService.createCommande(formData , 'clients').subscribe({
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
    const selectedClient = this.clients().find(c => c.id === formValue.client);
    if (!selectedClient) {
      throw new Error('Client non trouvé');
    }
    return {
      typeIntervenant: 'client',
      code: formValue.code,
      dateCommande: formValue.dateCommande,
      createdAt: new Date(),
      montantTotal: formValue.montantTotal,
      client: selectedClient,
      Id_intervenant : formValue.client,
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
      console.log(ligne);
      this.lignes.push(this.createLigne(article,ligne));
    });

    this.commandeForm.patchValue({
      code: commande.code,
      dateCommande: commande.dateCommande,
      client: commande.client.id,
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
      typeIntervenant: 'client',
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

  getClientName(clientId: number): string {
    const client = this.clients().find(c => c.id === clientId);
    return client ? client.nomComplet : 'Inconnu';
  }

  getArticleName(articleId: number): string {
    const article = this.articles().find(a => a.id === articleId);
    return article ? article.designation : 'Inconnu';
  }

}