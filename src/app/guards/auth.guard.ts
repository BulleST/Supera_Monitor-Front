import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { AccountService } from '../services/account.service';

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
            await lastValueFrom(this.accountService.refreshToken('appInitializer'))
            .then(async account => {
                const jwtToken = JSON.parse(atob(account.jwtToken.split('.')[1]));
                const expires = new Date(jwtToken.exp * 1000);
                if (new Date() > expires) {
                    resolve(false);
                    this.router.navigate(['accounts', 'login'], { queryParams: { returnUrl: state.url } });
                    return;
                }

                resolve(true);

                if (!account.passwordReset) {
                    this.accountService.profileModalOpen.emit(true);
                    this.accountService.changePasswordModalOpen.emit(true);
                    this.accountService.emitChangePasswordRequired.emit(true);
                }
            })
            .catch(res => {
                console.log('res', res);
                this.router.navigate(['accounts', 'login'], { queryParams: { returnUrl: state.url } });
                resolve(false);

            })            
        })       
    }
}
