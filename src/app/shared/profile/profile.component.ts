import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { getError } from '../../utils';
import { Account } from '../../models/account.model';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css',
    standalone: false
})
export class ProfileComponent implements OnDestroy {
    @Input() visible = false;
    object: Account = new Account;
    error: string = '';
    subscription: Subscription[] = [];
    loading = false;

    constructor(
        private service: AccountService,
        private confirmationService: ConfirmationService
    ) {
        var account = this.service.accountSubject.subscribe(res => {
            if (res) {
                this.object = res;
            } else {
                this.visible = false;
            }
        });

        this.subscription.push(account);

        
        var profileModalOpen = this.service.profileModalOpen.subscribe(res => this.visible = res);
        this.subscription.push(profileModalOpen);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }


    visibleChange() {
        this.service.profileModalOpen.emit(this.visible);
    }

    changePassworModalOpen() {
        this.service.changePasswordModalOpen.emit(true);
    }
    
    showError(message: string, e: any) {
         this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Error',
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'Ok',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    send(form: NgForm, e: any) {
        if (form.invalid) {
            return;
        }

        this.loading = true;
        lastValueFrom(this.service.updateAccount(this.object))
        .then(res => {
            this.loading = false;
            if (res.success) {
                this.visible = false;
                this.visibleChange();
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
