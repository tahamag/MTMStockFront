import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DepotService {

  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  
  getDepots(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Depot`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération des dépôts: ' + error.message));
      })
    );
  }
  
  getDepot(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Depot/${id}`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération du dépôt: ' + error.message));
      })
    );
  }
  
  createDepot(depotData: { nom: string; description: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Depot`, depotData, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la création du dépôt: ' + error.message));
      })
    );
  }
  
  updateDepot(id: number, depotData: { nom: string; description: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Depot/${id}`, depotData, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la modification du dépôt: ' + error.message));
      })
    );
  }

  deleteDepot(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Depot/${id}`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la suppression du dépôt: ' + error.message));
      })
    );
  }
}
