import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { AccountService } from '../services/account.service';
import moment from 'moment';
import { AccountResponse } from '../models/account.model';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private accountService: AccountService,
        private router: Router,
    ) {

    }
    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return new Promise(async (resolve, reject) => {

            let account = this.accountService.accountValue;
            if (!account) {
                await lastValueFrom(this.accountService.refreshToken(''))
                    .then(async res => {
                        account = res;
                    })
                    .catch(res => {
                        this.router.navigate(['accounts', 'login'], { queryParams: { returnUrl: state.url } });
                        resolve(false);
                    })
            }
            if (!account) {
                this.router.navigate(['accounts', 'login'], { queryParams: { returnUrl: state.url } });
                resolve(false);
            } else {
                const jwtToken = JSON.parse(atob(account.jwtToken.split('.')[1]));
                const expires = new Date(jwtToken.exp * 1000);
                if (moment(expires).isBefore(new Date)) {
                    console.log('auth guard expires', false)
                    resolve(false);
                    this.router.navigate(['accounts', 'login'], { queryParams: { returnUrl: state.url } });
                }
                console.log('auth guard', true)
                resolve(true);
            }

        })
    }
}
