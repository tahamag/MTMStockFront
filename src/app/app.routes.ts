import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DepotComponent } from './components/Stock/depot/depot.component';
import { CategorieComponent } from './components/Stock/categorie/categorie.component';
import { ArticleComponent } from './components/Stock/article/article.component';
import { ClientComponent } from './components/Client/client/client.component';
import { FournisseurComponent } from './components/Fournisseur/fournisseur/fournisseur.component';
import { CommandeComponent } from './components/Client/commande/commande.component';
import { commandefrsComponent } from './components/Fournisseur/commande/commande.component';
import { BonLivraisonComponent } from './components/Client/bon-livraison/bon-livraison.component';
import { BonReceptionComponent } from './components/Fournisseur/bon-reception/bon-reception.component';
import { FactureComponent } from './components/Client/facture/facture.component';
import { FactureFournisseurComponent } from './components/Fournisseur/facture-fournisseur/facture-fournisseur.component';
import { UtilisateurComponent } from './components/Parametre/utilisateur/utilisateur.component';
import { ProfileComponent } from './components/Parametre/profile/profile.component';
import { StockComponent } from './components/Stock/stock/stock.component';

export const routes: Routes = [
    {path:'', component:LoginComponent},
    {path:'login', component:LoginComponent},
    {path:'register', component:RegisterComponent},
    {path:'dashboard', component:DashboardComponent},
    //stock
    {path:'depot', component:DepotComponent},
    {path:'categorie', component:CategorieComponent},
    {path:'article', component:ArticleComponent},
    {path:'stock', component:StockComponent},
    //client
    {path:'client', component:ClientComponent},
    {path:'commandeClient', component:CommandeComponent},
    {path:'BonLivraison', component:BonLivraisonComponent},
    {path:'factureClient', component:FactureComponent},

    //Fournisseur
    {path:'fournisseur', component:FournisseurComponent},
    {path:'commandeFournisseur', component:commandefrsComponent},
    {path:'BonReception', component:BonReceptionComponent},
    {path:'FactureFournisseur', component:FactureFournisseurComponent},

    //parametre
    {path:'utilisateur', component:UtilisateurComponent},
    {path:'profile', component:ProfileComponent},

];
