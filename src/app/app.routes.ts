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


export const routes: Routes = [
    {path:'', component:LoginComponent},
    {path:'login', component:LoginComponent},
    {path:'register', component:RegisterComponent},
    {path:'dashboard', component:DashboardComponent},
    //stock
    {path:'depot', component:DepotComponent},
    {path:'categorie', component:CategorieComponent},
    {path:'article', component:ArticleComponent},
    //client
    {path:'client', component:ClientComponent},
    {path:'commandeClient', component:CommandeComponent},

    //Fournisseur
    {path:'fournisseur', component:FournisseurComponent},

];
