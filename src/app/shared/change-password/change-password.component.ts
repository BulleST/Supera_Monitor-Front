import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Account, ChangePassword } from '../../models/account.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { ConfirmationService } from 'primeng/api';
import { NgForm } from '@angular/forms';
import { getError } from '../../utils';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnDestroy {
    @Input() visible = false;
    account: Account = new Account;
    object: ChangePassword = new ChangePassword
    error: string = '';
    subscription: Subscription[] = [];
    loading = false;

    constructor(
        private service: AccountService,
        private confirmationService: ConfirmationService
    ) {
        var account = this.service.accountSubject.subscribe(res => {
            if (res) 
                this.account = res;
            else
                this.visible = false;
        });

        this.subscription.push(account);

        var changePasswordModalOpen = this.service.changePasswordModalOpen.subscribe(res => this.visible = res);
        this.subscription.push(changePasswordModalOpen);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        this.service.changePasswordModalOpen.emit(this.visible);
    }

    
    showError(message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Error',
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptIcon: "none",
            acceptLabel: 'Ok',
            acceptButtonStyleClass: 'p-button-sm mr-0',
            rejectVisible: false,
        })
    }

    send(form: NgForm, e: any) {
        if (form.invalid) {
            return;
        }

        this.loading = true;
        lastValueFrom(this.service.changePassword(this.object))
        .then(res => {
            this.loading = false;
            if (res.success) {
                this.visible = false;
                this.visibleChange();
                this.confirmationService.confirm({
                    target: e.target,
                    message: res.message,
                    header: 'Success',
                    icon: 'pi pi-check-circle text-2xl -mr-2 text-green-400',
                    acceptIcon: "none",
                    acceptLabel: 'Ok',
                    acceptButtonStyleClass: 'p-button-sm mr-0',
                    rejectVisible: false,
                })
            } else {
                this.error = res.message;
                this.showError(this.error, e);
            }
        })
        .catch(res => {
            this.loading = false;
            this.error = getError(res);
            this.showError(this.error, e);
        })

    }
}
