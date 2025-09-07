import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  getStock(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Stock/${id}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération du Stock: ' + error.message));
      })
    );
  }

  getStockBySte(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Stock`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération du Stock: ' + error.message));
      })
    );
  }
}
