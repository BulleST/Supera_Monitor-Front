import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';
import { ResetPassword } from '../../../models/accounts.model';
import { AccountService } from '../../../services/account.service';
import { getError } from '../../../utils';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./../account.component.css'],
    standalone: false
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
                        header: 'Success',
                        icon: 'fa-solid fa-key text-2xl',
                        rejectVisible: false,
                        acceptIcon: "none",
                        acceptLabel: 'Go to Login',
                      acceptButtonStyleClass: 'p-button-sm mr-0',
                        accept: () => {
                            this.router.navigate(['account', 'login']);
                        }
                    })
                } 
                else {
                    this.error = res.message;
                    
                    this.confirmationService.confirm({
                        target: e.target,
                        message: res.message,
                        header: 'Error',
                        icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500',
                        rejectVisible: false,
                        acceptIcon: "none",
                        acceptLabel: 'Ok',
                        acceptButtonStyleClass: 'p-button-sm mr-0',
                    })
                }
            
            })
            .catch((res) => {
                this.error = getError(res);
                this.loading = false;
            })
            .finally(() => {
                this.loading = false;
            });
    }
}
