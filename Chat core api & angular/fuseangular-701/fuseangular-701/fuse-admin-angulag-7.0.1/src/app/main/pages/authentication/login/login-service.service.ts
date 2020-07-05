import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Environment } from 'prismjs';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {

  constructor(private http: HttpClient) { }
  login(loginVm){
    

    return this.http.post(`${environment.ApiUri}Account/login`,  loginVm);
  }
}
