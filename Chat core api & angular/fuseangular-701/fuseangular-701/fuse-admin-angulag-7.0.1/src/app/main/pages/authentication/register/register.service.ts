import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  constructor(private http: HttpClient) { }

  register(body:any){
  
    var formData: FormData = new FormData();
    //formData.append("ImageUrl", body.Image);
    formData.append('Email', body.Email);
    formData.append('UserName', body.UserName);
    formData.append('Role', body.Role);
    formData.append('Password', body.Password);
    formData.append('ConfirmPassword', body.ConfirmPassword);
    return this.http.post(`${environment.ApiUri}Account/register`,  formData);


  }
}
