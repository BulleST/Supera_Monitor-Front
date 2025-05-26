import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';
import { ResetPassword } from '../../../models/accounts.model';
import { AccountService } from '../../../services/account.service';
import { getError } from '../../../utils';
import { ConfirmationService } from 'primeng/api';
import { playError, playSuccess } from '../../../utils/audio';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./../account.component.css'],
    standalone: false,
    providers: [ConfirmationService]
})
export class ResetPasswordComponent {
    faChevronCircleLeft = faChevronCircleLeft;

    object: ResetPassword = new ResetPassword;
    loading = false;
    error = '';

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: AccountService,
        private confirmationService: ConfirmationService,
    ) {
        this.object.token = this.activatedRoute.snapshot.queryParams['token'];
    }

    send(e: any) {
        lastValueFrom(this.service.resetPassword(this.object))
            .then((res) => {
                if (res.success) {
                    this.confirmationService.confirm({
                        target: e.target,
                        message: res.message,
                        header: 'Sucesso',
                        icon: 'pi pi-key text-xl',
                        rejectVisible: false,
                        acceptLabel: 'Fazer Login',
                        acceptButtonStyleClass: 'p-button-rounded',
                        accept: () => {
                            this.router.navigate(['account', 'login']);
                        }
                    });
                    playSuccess();
                }
                else {
                    this.error = res.message;

                    playError();
                    this.confirmationService.confirm({
                        target: e.target,
                        message: res.message,
                        header: 'Erro',
                        icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500',
                        rejectVisible: false,
                        acceptLabel: 'OK',
                        acceptButtonStyleClass: 'p-button-rounded',
                    })
                }
            })

            .catch((res) => {
                playError();
                this.error = getError(res);
                this.loading = false;
            })
            .finally(() => {
                this.loading = false;
            });
    }
}
