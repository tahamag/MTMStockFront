import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategorieService {

  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Categorie`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération des categories: ' + error.message));
      })
    );
  }
  
  getCategorie(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Categorie/${id}`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération du categorie: ' + error.message));
      })
    );
  }
  
  createCategorie(CategorieData: { nom: string; description: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Categorie`, CategorieData, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la création du categorie: ' + error.message));
      })
    );
  }
  
  updateCategorie(id: number, CategorieData: { nom: string; description: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Categorie/${id}`, CategorieData, {})
    .pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la modification du categorie: ' + error.message));
      })
    );
  }

  deleteCategorie(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Categorie/${id}`, { })
    .pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la suppression du categorie: ' + error.message));
      })
    );
  }
}
