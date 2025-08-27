import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  getArticles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Article`, { 

    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération des articles: ' + error.message));
      })
    );
  }

  getArticle(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Article/${id}`, { 
       
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération de l\'article: ' + error.message));
      })
    );
  }

  createArticle(articleData: any): Observable<any> {
    console.log("service",articleData)
    return this.http.post<any>(`${this.apiUrl}/Article`, articleData, { 
    }).pipe(
      catchError(error => {
    console.log("service",error)
        return throwError(() => new Error('Erreur lors de la création de l\'article: ' + error.message));
      })
    );
  }

  updateArticle(id: number, articleData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Article/${id}`, articleData, { 

    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la modification de l\'article: ' + error.message));
      })
    );
  }

  deleteArticle(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Article/${id}`, { 

    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la suppression de l\'article: ' + error.message));
      })
    );
  }

}