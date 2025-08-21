import { Injectable } from '@angular/core';
import { env } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Societe } from '../../models/societe';
import { Employe } from '../../models/Employe';
import { auth } from '../../models/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = env.apiUrl;

  constructor( private http : HttpClient) { }

  login(email : string , mot_de_passe : string):Observable<auth>{
    return this.http.post<auth>(this.apiUrl+'/Auth/login' , {email , mot_de_passe}) ;
  }

  registerSociete(societeData: Societe): Observable<Societe> {
    return this.http.post<Societe>(`${this.apiUrl}/Socite`, societeData)
  }
  
  registerEmploye(EmployeData: Employe): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Employe/administrateur`, EmployeData)
  }
  
  // Store token in local storage
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  // Get token from local storage
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Remove token from local storage
  logout(): void {
    localStorage.removeItem('authToken');
  }
}
