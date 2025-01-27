import { afterNextRender, AfterRenderPhase, Component, inject, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Crypto, getError, insertOrReplace } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Account } from '../../../models/account.model';
import { UserService } from '../../../services/user.service';
import { AccountRole, Role, roles } from '../../../models/account-perfil.model';
import { AccountService } from '../../../services/account.service';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService, MessageService]
})
export class FormComponent implements OnDestroy {
    visible: boolean = false;
    injector = inject(Injector);
    object = new Account;
    loading = false;
    error: string = '';
    isEditPage = false;
    emailPattern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    subscription: Subscription[] = [];
    roles: AccountRole[] = roles;
    roleDisabled: boolean = false; 
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

        afterNextRender(() =>
            this.loadPage(),
            { injector: this.injector, phase: AfterRenderPhase.Read }
        );
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadPage() {
        var account: Account = this.accountService.accountValue as Account;
        this.roles.forEach(x => x.isDisabled = x.id < account.role_Id);

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
            .catch(res => {
                this.error = getError(res);
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
