import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { LoadingComponent } from './parts/loading/loading.component';
import { AlertComponent } from './parts/alert/alert.component';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { RequestInterceptor } from './helpers/request.interceptor';
import { JwtInterceptor } from './helpers/jwt.interceptor';
import { LoadingService } from './parts/loading/loading';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { provideEnvironmentNgxMask, provideNgxMask } from 'ngx-mask';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
    declarations: [
        AppComponent,
        LoadingComponent,
        AlertComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
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
        // { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        // { provide: HTTP_INTERCEPTORS, useClass: RequestInterceptor, multi: true },
        provideAnimationsAsync(),
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
