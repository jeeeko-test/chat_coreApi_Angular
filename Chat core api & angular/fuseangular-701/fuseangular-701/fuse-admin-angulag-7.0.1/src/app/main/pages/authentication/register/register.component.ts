import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';
import {  Router } from '@angular/router';
import { RegisterService } from './register.service';

@Component({
    selector     : 'register',
    templateUrl  : './register.component.html',
    styleUrls    : ['./register.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class RegisterComponent implements OnInit, OnDestroy
{
    registerForm: FormGroup;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private router:Router,
        private registerService : RegisterService,
        
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

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // if(localStorage.getItem('token') != null) {
        //     this.router.navigateByUrl('/apps/dashboards/analytics')
        //   }
        this.registerForm = this._formBuilder.group({
            name           : ['', Validators.required],
            email          : ['', [Validators.required, Validators.email]],
            password       : ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
        });

        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.registerForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('passwordConfirm').updateValueAndValidity();
            });

           
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onSubmit(){
        //console.log("Inside on submit");
        //alert( this.registerForm.value.password);
        var body = {
            // UserName : this.formModel.value.UserName,
            //Image: this.registerForm.value.Image,
            Email : this.registerForm.value.email,
            UserName: this.registerForm.value.name,
            Role: "Admin",
            Password : this.registerForm.value.password,
            ConfirmPassword : this.registerForm.value.passwordConfirm,
        };
        console.log(body);
        //alert("dsdsd");
        this.registerService.register(body).subscribe((res: any) => {
            // if (res.succeeded) {
              localStorage.setItem("token", res.token);
              this.router.navigateByUrl("/apps/dashboards/analytics");
              //document.getElementById("image").setAttribute("src", "assets/Images/download.jpg");
              localStorage.setItem('email', res.email);
              localStorage.setItem('userName', res.userName);
              localStorage.setItem('imageUrl', res.imageUrl);
              localStorage.setItem('role',res.role);
              console.log(res);
            },
            err => {
              console.log(err);
              console.log('There is an erorr')
            }
        )
    

       


        
    }
}

/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if ( !control.parent || !control )
    {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if ( !password || !passwordConfirm )
    {
        return null;
    }

    if ( passwordConfirm.value === '' )
    {
        return null;
    }

    if ( password.value === passwordConfirm.value )
    {
        return null;
    }

    return {'passwordsNotMatching': true};
};
