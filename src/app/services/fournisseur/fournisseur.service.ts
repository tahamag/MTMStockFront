import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FournisseurService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  getFournisseurs(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Fournisseur`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération des Fournisseurs: ' + error.message));
      })
    );
  }

  getFournisseur(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Fournisseur/${id}`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération de Fournisseur: ' + error.message));
      })
    );
  }

  createFournisseur(clientData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Fournisseur`, clientData, { 
    }).pipe(
      catchError(error => {
        console.log("service",error)
        return throwError(() => new Error('Erreur lors de la création de Fournisseur: ' + error.error));
      })
    );
  }

  updateFournisseur(id: number, clientData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Fournisseur/${id}`, clientData, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la modification de Fournisseur: ' + error.error));
      })
    );
  }

  deleteFournisseur(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Fournisseur/${id}`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la suppression de Fournisseur: ' + error.message));
      })
    );
  }
  
}
