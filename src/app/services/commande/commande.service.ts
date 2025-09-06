import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;
//fournisseurs  || clients
  getCommandes(intervenant : string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Commande/${intervenant}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération commandes: ' + error.message));
      })
    );
  }

  getCommande(id: number,intervenant : string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Commande/${intervenant}/${id}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error(`Erreur lors de la récupération de commandes ${intervenant}: ` + error.message));
      })
    );
  }

  createCommande(CommandeData: any,intervenant : string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Commande/${intervenant}`, CommandeData, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error(`Erreur lors de la création de Commande ${intervenant}: ` + error.error));
      })
    );
  }

  updateCommande(id: number, CommandeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Commande/${id}`, CommandeData, {
    }).pipe(
      catchError(error => {
        console.log("service",error)
        return throwError(() => new Error(`Erreur lors de la modification de Commande : ` + error.error));
      })
    );
  }

  deleteCommande(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Commande/${id}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la suppression de Commande: ' + error.message));
      })
    );
  }

}