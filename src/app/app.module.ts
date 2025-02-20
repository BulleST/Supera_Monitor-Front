import { LOCALE_ID, NgModule } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';

import { provideEnvironmentNgxMask, provideNgxMask } from 'ngx-mask';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService } from 'primeng/api';

import { AppComponent } from './app.component';
import { LoadingComponent } from './parts/loading/loading.component';
import { AlertComponent } from './parts/alert/alert.component';
import { RequestInterceptor } from './helpers/request.interceptor';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { LoadingService } from './parts/loading/loading';
import { SharedModule } from './shared/shared.module';
import { MyPreset } from '../mytheme';
import { AppRoutingModule } from './app.routing';

import { registerLocaleData } from '@angular/common';
import localeBr  from '@angular/common/locales/pt';

registerLocaleData(localeBr , 'pt-BR');

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
        { provide: LOCALE_ID, useValue: "pt-BR" }, 
        provideNgxMask(),
        provideEnvironmentNgxMask(),
        provideHttpClient(withFetch()),
        ConfirmationService,
        CurrencyPipe,
        DatePipe,
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
