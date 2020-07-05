import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import { LoginVm } from 'app/fake-db/ViewModels/login-vm';
import { MatInput } from '@angular/material';
import { LoginServiceService } from './login-service.service';
import { Router } from '@angular/router';
import { ComingSoonModule } from '../../coming-soon/coming-soon.module';
import { IHttpConnectionOptions, HubConnectionBuilder } from '@aspnet/signalr';
import { SignalRService } from 'app/Services/signal-r.service';
import { environment } from 'environments/environment';
@Component({
    selector     : 'login',
    templateUrl  : './login.component.html',
    styleUrls    : ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class LoginComponent implements OnInit
{
    loginVm :LoginVm = new LoginVm();
    loginForm: FormGroup;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private loginservice:LoginServiceService,
        private router:Router,
        private _SignalRService:SignalRService,
    )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        if(localStorage.getItem('token') != null) {
            this.router.navigateByUrl('/apps/dashboards/analytics')
          }
        this.loginForm = this._formBuilder.group({
            email   : ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
        
        
    }
    onSubmit() {
        this.loginVm.Email= this.loginForm.value.email;
        this.loginVm.password=this.loginForm.value.password;
        this.loginservice.login(this.loginVm).subscribe(
          (res: any) => {
            localStorage.setItem("token", res.token);
            //this.router.navigateByUrl("/home");
            localStorage.setItem('email', res.email);
            localStorage.setItem('userName', res.userName);
            localStorage.setItem('imageUrl', res.imageUrl);
            localStorage.setItem('role',res.role);
            localStorage.setItem('userId',res.id);
            console.log("starting signalr ");
            
            // start signalR connection
            const options: IHttpConnectionOptions={
                accessTokenFactory:()=>{
                    return localStorage.getItem('token');
                }
            }
            console.log("connection status => " + this._SignalRService.connectionAlive);
            if(!this._SignalRService.connectionAlive){
                console.log('inside');
            this._SignalRService.hubConnection = new HubConnectionBuilder().withUrl(environment.BaseUri+"hub",options).build();
            this._SignalRService.hubConnection.start()
                              .then(()=>{
                                console.log("connection started ! from login");
                                this._SignalRService.connectionAlive=true;
                                this._SignalRService.Initialize();
                                this.router.navigateByUrl("/apps/dashboards/analytics");
                            })
                              .catch(err=>{console.error(err);this._SignalRService.connectionAlive=false});
                          }
          },
          err => {
            if (err.status == 400) {
                
            } else {
              console.log(err);
            }
          }
        );

    }
}
