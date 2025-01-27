import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Crypto } from '../utils/crypto';
import { AccountService } from '../services/account.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private accountService: AccountService,
        private crypto: Crypto
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if account is logged in and request is to the api url
        const account = this.accountService.accountValue;
        const isLoggedIn = account && account.jwtToken != '' && account.jwtToken != undefined && account.id != 0;
        if (isLoggedIn) {
            request = request.clone({
                setHeaders: { Authorization: `Bearer ${account.jwtToken}` },
            });
        }
        return next.handle(request);
    }
}