import { Injectable } from "@angular/core";
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    CanLoad,
    Route,
} from "@angular/router";
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class MyGuardGuard implements CanLoad,CanActivate {
    constructor(private router: Router) {}

    canLoad(route: Route): boolean {
        if (localStorage.getItem("token") == null) {
            this.router.navigate(["/pages/auth/login"]);
            return false;
        } else {
            return true;
        }
    }
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        if (localStorage.getItem("token") == null) {
            this.router.navigate(["/pages/auth/login"]);
            return false;
        } else {
            return true;
        }
    }
}
