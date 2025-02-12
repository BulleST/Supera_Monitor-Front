import { Component, inject, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Crypto, insertOrReplace } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { AccountService } from '../../../services/account.service';
import { Account, AccountResponse } from '../../../models/account.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Role } from '../../../models/account-perfil.model';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService, MessageService],
    standalone: false
})
export class FormComponent implements OnDestroy {
    visible: boolean = false;
    injector = inject(Injector);
    object: Account = new Account;
    loading = false;
    error: string = '';
    isEditPage = false;
    emailPattern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    subscription: Subscription[] = [];
    account?: AccountResponse;
Role: typeof Role = Role;
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private messageService: MessageService,
        private crypto: Crypto,
        private service: UserService,
        private accountService: AccountService,
        private confirmationService: ConfirmationService
    ) {

        var account = this.accountService.account.subscribe(account => {
            this.account = account;
        });
        this.subscription.push(account);

        this.loadPage();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadPage() {
        var account: AccountResponse = this.accountService.accountValue as AccountResponse;

        var params = this.activatedRoute.params.subscribe(res => {
            this.isEditPage = !!res['id'];
            if (this.isEditPage) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])
                
                lastValueFrom(this.service.get(id))
                    .then(res => {
                        this.object = res;
                        if ( account && account?.role_Id < this.object.role_Id) {
                        }
                        this.loading = false;
                        this.visible = true;
                    })
                    .catch(res => {
                        this.visible = false;
                    });
            } else {
                this.visible = true;
            }
        })
        this.subscription.push(params);
    }

    visibleChange() {
        if (!this.visible) {
            var route = this.isEditPage ? ['../../'] : ['../'];
            this.router.navigate(route, { relativeTo: this.activatedRoute });
        }
    }
    
    showError(message: string, e: any) {
         this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Error',
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    send(form: NgForm, e: any) {
        if (form.invalid) {
            return;
        }
        this.loading = true;

        this.object.role_Id = Role.Assistant;

        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {
                    insertOrReplace(this.service, res.object);
                    this.visible = false; 
                    this.visibleChange();
                } 
                else {
                    this.error = res.message;
                    this.showError(this.error, e);
                }
            })
            .catch((res: HttpErrorResponse) => {
                this.error = res.error.message;
                this.loading = false;
                this.showError(this.error, e);
            })
    }

    request() {
        if (this.isEditPage) {
            return lastValueFrom(this.service.edit(this.object));
        }
        return lastValueFrom(this.service.create(this.object));
    }

}
