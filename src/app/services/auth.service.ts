import { Injectable } from '@angular/core';
import { env } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Societe } from '../models/societe';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = env.apiUrl;

  constructor( private http : HttpClient) { }

  login(email : string , mot_de_passe : string):Observable<any>{
    console.log(email , mot_de_passe);
    return this.http.post<Societe>(this.apiUrl+'/Auth/login' , {email , mot_de_passe}) ;
  }
}
