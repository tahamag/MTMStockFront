import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { env } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private http = inject(HttpClient);
  private apiUrl = env.apiUrl;

  getEmployes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Employe`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération des Employes: ' + error.message));
      })
    );
  }

  getEmploye(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Employe/${id}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la récupération de l\'Employe: ' + error.message));
      })
    );
  }

  createEmploye(EmployeData: any): Observable<any> {
    console.log(EmployeData)
    return this.http.post<any>(`${this.apiUrl}/Employe`, EmployeData, {
    }).pipe(
      catchError(error => {
        console.log("service",error)
        return throwError(() => new Error('Erreur lors de la création de l\'Employe: ' + error.error));
      })
    );
  }

  updateEmploye(id: number, EmployeData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Employe/${id}`, EmployeData, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la modification de l\'Employe: ' + error.error));
      })
    );
  }

  deleteEmploye(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Employe/${id}`, {
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erreur lors de la suppression de Employe: ' + error.message));
      })
    );
  }

}
