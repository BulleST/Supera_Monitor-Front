import { Component } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AccountService } from '../../../services/account.service';
import { LoadingService } from '../../../parts/loading/loading';
import { getError, showError } from '../../../utils';
import { Login } from '../../../models/accounts.model';
import { playSuccess } from '../../../utils/audio';
import { ConfirmationService } from 'primeng/api';
import { EventoService } from '../../../services/evento.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./../account.component.css'],
    standalone: false,
    providers: [ConfirmationService],
})
export class LoginComponent {
    object = new Login;
    loading: boolean = false;
    error = '';

    constructor(
        private accountService: AccountService,
        private loadingHelper: LoadingService,
        private confirmationService: ConfirmationService,
        private eventoService: EventoService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
    ) {
        this.loadingHelper.loading.subscribe(res => this.loading = res);
    }

    showError(e: any, header: string, message: string, innerMessage: string) {
        showError(this.confirmationService, header, message, e, innerMessage)
    }

    send(e: any) {
      this.loadingHelper.loading.next(true);

        lastValueFrom(this.accountService.login(this.object))
            .then(async res => {


                try {
                    
                    await lastValueFrom(this.eventoService.cancelarEventos(new Date().getFullYear()))
                    .then(res => {
                        console.log('cancelarEventos', res)
                    })
                }
                catch (error) {
                    console.log('error', error)
                }

                this.loadingHelper.loading.next(false);
                const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
                this.router.navigateByUrl(returnUrl);
                
                // playSuccess();
                // this.appinitService.initialized.next(true);
            })
            .catch(res => {
                this.error = 'Não foi possível realizar login. <br> Conexão não foi estabelecida.';
                this.loadingHelper.loading.next(false);
                this.showError(e, 'Ops', this.error, res.toString())
            });
    }

}
