import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class FactureService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;
  //fournisseurs  || clients
  getFactures(intervenant : string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Facture/${intervenant}`, {

    })
      .pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération Factures: ' + error.message));
      })
    );
  }

  getFacture(id: number,intervenant : string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Facture/${intervenant}/${id}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error(`Erreur lors de la récupération de Factures ${intervenant}: ` + error.message));
      })
    );
  }

  createFacture(FactureData: any,intervenant : string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Facture/${intervenant}`, FactureData, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error(`Erreur lors de la création de Facture ${intervenant}: ` + error.error));
      })
    );
  }

  updateFacture(id: number, FactureData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Facture/${id}`, FactureData, {
    }).pipe(
      catchError(error => {
        console.log("service",error)
        return throwError(() => new Error(`Erreur lors de la modification de Facture : ` + error.error));
      })
    );
  }

  deleteFacture(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Facture/${id}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la suppression de Facture: ' + error.message));
      })
    );
  }

}
