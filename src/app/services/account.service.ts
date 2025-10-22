import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, lastValueFrom, of, throwError } from 'rxjs';
import { ChangePassword, Login, Register, ResetPassword, UpdateAccount } from '../models/accounts.model';
import { catchError, tap } from 'rxjs/operators';
import { getError } from '../utils';
import { RequestResponse } from '../helpers/request-response.interface';
import { environment } from '../../environments/environment';
import { AccountResponse } from '../models/account.model';
import { Service } from '../helpers/service.service';
import { UrlService } from '../utils/url.service';

@Injectable({
    providedIn: 'root'
})
export class AccountService {
    url = '';
    accountSubject: BehaviorSubject<AccountResponse | undefined> = new BehaviorSubject<AccountResponse | undefined>(undefined);
    public account: Observable<AccountResponse | undefined> = new Observable<AccountResponse | undefined>(undefined);

    changePasswordModalOpen = new EventEmitter<boolean>();
    profileModalOpen = new EventEmitter<boolean>();
    emitChangePasswordRequired = new EventEmitter<boolean>();

    constructor(
        private router: Router,
        private http: HttpClient,
        private urlService: UrlService
    ) {

        this.urlService.getUrl().subscribe(res => {
            this.url = res;
        })

        this.account = this.accountSubject.asObservable();

        this.profileModalOpen.subscribe(res => {
            localStorage.setItem('profile', res.toString());
        })

        this.changePasswordModalOpen.subscribe(res => {
            localStorage.setItem('change-password', res.toString());
        })
    }

    setAccount(where: string, value?: AccountResponse) {
        this.accountSubject.next(value)
    }

    public get accountValue() {
        return this.accountSubject.value;
    }

    login(model: Login) {
        return this.http.post<AccountResponse>(`${this.url}/accounts/authenticate`, model, { withCredentials: true } /* */).pipe(
            tap(async (account) => {
                this.setAccount('login', account);
                this.startRefreshTokenTimer();
                return of(account);
            }),
            catchError((err => {
                this.setAccount('login', undefined);
                return throwError(err);
            }))
        );
    }

    async logout() {
        lastValueFrom(this.http.post<any>(`${this.url}/accounts/revoke-token`, { token: this.accountValue?.refreshToken }, { withCredentials: true } /**/))
        this.stopRefreshTokenTimer();
        this.setAccount('logout', undefined);
        localStorage.clear();
        this.router.navigate(['accounts', 'login']);
    }

    refreshToken(where: string) {
        return this.http.post<AccountResponse>(`${this.url}/accounts/refresh-token`, {}, { withCredentials: true })
            .pipe(tap({
                next: async account => {
                    this.setAccount('refreshToken', account);
                    this.startRefreshTokenTimer();
                },
                error: (err) => {
                    var error = getError(err);
                    // this.router.navigate(['accounts', 'login']);
                    this.setAccount('refreshToken', undefined);
                    this.startRefreshTokenTimer();
                },
            }));

    }

    register(model: Register) {
        return this.http.post<RequestResponse>(`${this.url}/accounts/register`, model);
    }

    forgotPassword(email: string) {
        return this.http.post<RequestResponse>(`${this.url}/accounts/forgot-password`, { email: email });
    }

    resetPassword(object: ResetPassword) {
        return this.http.post<RequestResponse>(`${this.url}/accounts/reset-password`, object);
    }

    verifyEmail(token: string) {
        return this.http.post<RequestResponse>(`${this.url}/accounts/verify-email`, { token: token });
    }

    changePassword(object: ChangePassword) {
        return this.http.post<RequestResponse>(`${this.url}/accounts/change-password`, object);
    }

    updateAccount(object: UpdateAccount) {
        return this.http.post<RequestResponse>(`${this.url}/accounts/update-account`, object);
    }

    private refreshTokenTimeout: any;

    private startRefreshTokenTimer() {
        try {
            if (this.accountValue) {
                const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));
                const expires = new Date(jwtToken.exp * 1000);
                const timeout = expires.getTime() - Date.now() - (60 * 1000);
                this.refreshTokenTimeout = setTimeout(() => this.refreshToken('startRefreshTokenTimer'), timeout);
            }
        } catch (e) {
        }
    }

    private stopRefreshTokenTimer() {
        clearTimeout(this.refreshTokenTimeout);
    }

}
