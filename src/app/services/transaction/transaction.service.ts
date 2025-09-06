import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;
  //fournisseurs  || clients
  getTransactions(intervenant : string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Transaction/${intervenant}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération Transactions: ' + error.message));
      })
    );
  }

  getTransaction(id: number,intervenant : string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Transaction/${intervenant}/${id}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error(`Erreur lors de la récupération de Transactions ${intervenant}: ` + error.message));
      })
    );
  }

  createTransaction(TransactionData: any,intervenant : string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Transaction/${intervenant}`, TransactionData, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error(`Erreur lors de la création de Transaction ${intervenant}: ` + error.error));
      })
    );
  }

  updateTransaction(id: number, TransactionData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Transaction/${id}`, TransactionData, {
    }).pipe(
      catchError(error => {
        console.log("service",error)
        return throwError(() => new Error(`Erreur lors de la modification de Transaction : ` + error.error));
      })
    );
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Transaction/${id}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la suppression de Transaction: ' + error.message));
      })
    );
  }

}
