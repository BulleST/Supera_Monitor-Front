import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoadingService } from '../parts/loading/loading';
import { getError } from '../utils/error';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root',
    deps: [LoadingService]
})
export class RequestInterceptor implements HttpInterceptor {

    excludeUrlsToastr = [
        "accounts/refresh-token",
        "accounts/authenticate",
        "accounts/reset-password",
        "accounts/forgot-password",
        "accounts/revoke-token",
    ];

    excludeUrlsToastrError = [
    ]

    excludeUrlsLoading = [
        "account/refresh-token",
    ];


    constructor(
        private router: Router,
        // private toastr: ToastrService,
        private loadingService: LoadingService,
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        var notLoading = this.excludeUrlsLoading.filter(x => request.url.includes(x));
        var notToastr = this.excludeUrlsToastr.filter(x => request.url.includes(x));
        var notToastrError = this.excludeUrlsToastrError.filter(x => request.url.includes(x));

        var loadingHeader = request.headers.get('loading');
        if (request.method == 'POST' || request.method == 'PUT' || request.method == 'PATCH' || request.method == 'DELETE' || loadingHeader == 'true') {
            if (notLoading.length == 0) {
                this.loadingService.loading.next(true);
                this.loadingService.addLoadingRequest();
            }
        }


        var block = new Promise<boolean>((resolve, reject) => {
            setTimeout(() => {
                resolve(true);
            }, 6000);
        });

        return next.handle(request)
            .pipe(
                tap({
                    next: async (data: any) => {
                        await block
                        if (data.type != 0) {
                            if (data instanceof HttpResponse) {
                                if ([200, 204, 201].includes(data.status)) {
                                    var message = '';
                                    if (data.body && data.body.success == false) {
                                        if (data.body.message)
                                            message = data.body.message;
                                        else {
                                            if (request.method == 'POST') {
                                                message = 'Could not conclude this request.';
                                            }
                                            else if (request.method == 'PUT') {
                                                message = 'Could not update this register.';
                                            }
                                            else if (request.method == 'PATCH') {
                                                message = 'Could not conclude this request.';
                                            }
                                            else if (request.method == 'DELETE') {
                                                message = 'Could not delete this register.';
                                            }
                                        }
                                        if (notToastrError.length == 0) {
                                            // this.toastr.error(message, 'Error');

                                        }
                                    }
                                    else {
                                        if (request.method == 'POST') {
                                            message = 'Request completed successfully.';
                                        }
                                        else if (request.method == 'PUT') {
                                            message = 'Register updated successfully.';
                                        }
                                        else if (request.method == 'PATCH') {
                                            message = 'Request completed successfully.';
                                        }
                                        else if (request.method == 'DELETE') {
                                            message = 'Register deleted successfully.';
                                        }
                                        if (message && notToastr.length == 0) {
                                            // this.toastr.success(message, 'Success', { enableHtml: true });
                                        }
                                    }
                                }
                            }
                        }
                    },
                    error: res => {
                        var message = getError(res);

                        if (res.status == 401) {
                            var returnUrl = window.location.pathname;
                            returnUrl = returnUrl.includes('account/login') ? '' : returnUrl;
                            this.router.navigate(['account', 'login'], { queryParams: { returnUrl } });
                            localStorage.clear();
                            message = 'Unauthorized. Please, login.';
                        }
                        else if (res.status == 403) {
                            message = 'Denied.';
                        }
                        this.loadingService.loading.next(false);
                        this.loadingService.removeLoadingRequest();

                        return res;

                    }
                }),
                // Log when response observable either completes or errors
                finalize(() => {
                    if (request.method == 'POST' || request.method == 'PUT' || request.method == 'PATCH' || request.method == 'DELETE' || loadingHeader == 'true') {
                        if (notLoading.length == 0) {
                            this.loadingService.loading.next(false);
                            this.loadingService.removeLoadingRequest();
                        }
                    }
                }),
            );
    }
}


