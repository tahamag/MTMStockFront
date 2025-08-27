import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  getClients(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Clients`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération des clients: ' + error.message));
      })
    );
  }

  getClient(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Clients/${id}`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération de l\'client: ' + error.message));
      })
    );
  }

  createClient(clientData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Clients`, clientData, { 
    }).pipe(
      catchError(error => {
        console.log("service",error)
        return throwError(() => new Error('Erreur lors de la création de l\'client: ' + error.error));
      })
    );
  }

  updateClient(id: number, clientData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Clients/${id}`, clientData, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la modification de l\'client: ' + error.error));
      })
    );
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Clients/${id}`, { 
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la suppression de client: ' + error.message));
      })
    );
  }
  
}
