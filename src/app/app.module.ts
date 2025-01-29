import { NgModule } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';

import { provideEnvironmentNgxMask, provideNgxMask } from 'ngx-mask';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AppComponent } from './app.component';
import { LoadingComponent } from './parts/loading/loading.component';
import { AlertComponent } from './parts/alert/alert.component';
import { RequestInterceptor } from './helpers/request.interceptor';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { LoadingService } from './parts/loading/loading';
import { SharedModule } from './shared/shared.module';
import { MyPreset } from '../mytheme';
import Material from '@primeng/themes/material'
import { AppRoutingModule } from './app.routing';
@NgModule({
    declarations: [
        AppComponent,
        LoadingComponent,
        AlertComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        SharedModule,
    ],
    providers: [
        provideNgxMask(),
        provideEnvironmentNgxMask(),
        provideHttpClient(withFetch()),
        ConfirmationService,
        CurrencyPipe,
        DatePipe,
        MessageService,
        LoadingService,
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: MyPreset,
                options: {
                    darkModeSelector: '.my-app-dark'
                }
            }
        })
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
