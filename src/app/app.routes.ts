import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';


export const routes: Routes = [
    {path:'login', component:LoginComponent},
    {path:'', component:LoginComponent}

];
