import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faChevronCircleLeft, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';
import { AccountService } from '../../../services/account.service';
import { getError } from '../../../utils';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./../account.component.css','./forgot-password.component.css'],
    providers: [ConfirmationService, MessageService]
})
export class ForgotPasswordComponent {

    faChevronCircleLeft = faChevronCircleLeft;
    faEnvelope = faEnvelope;
    loading = false;
    error = '';
    object = {
        email: '',
    };
    emailPattern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: AccountService,
        private confirmationService: ConfirmationService,
    ) { }



    send(e: any) {
        lastValueFrom(this.service.forgotPassword(this.object.email))
        .then(res => {
            this.loading = false;
            this.error = '';
            
            this.confirmationService.confirm({
                target: e.target,
                message: res.message,
                header: 'Success',
                icon: 'pi pi-envelope',
                rejectVisible: false,
                acceptIcon: "none",
                acceptLabel: 'Go to Login',
                acceptButtonStyleClass: 'p-button-sm mr-0',
                accept: () => {
                    this.router.navigate(['account', 'login']);
                }
            })

        })
        .catch(res => {
            this.error = getError(res);
            this.loading = false;
            this.confirmationService.confirm({
                target: e.target,
                message: this.error,
                header: 'Error',
                icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500',
                rejectVisible: false,
                acceptIcon: "none",
                acceptLabel: 'Ok',
              acceptButtonStyleClass: 'p-button-sm mr-0',
              rejectIcon: "none",
              rejectButtonStyleClass: 'p-button-text p-button-sm',
            })
        });
    }

}
