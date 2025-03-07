import { Component, inject, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Crypto, getError, insertOrReplace } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ProfessorService } from '../../../services/professor.service';
import { Professor, Professor_NivelCertificacao } from '../../../models/professor.model';
import { Account } from '../../../models/account.model';
import { UserService } from '../../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class FormComponent implements OnDestroy {
    visible: boolean = false;
    object = new Professor;
    loading = false;
    error: string = '';
    isEditPage = false;
    subscription: Subscription[] = [];
    emailPattern = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    accounts: Account[] = [];
    accountsSelected?: Account;
    loadingAccounts: boolean = true;

    nivelCertificacao: Professor_NivelCertificacao[] = [];
    loadingNivelCertificacao = true;

    minDate: Date = new Date(1900, 1, 1);
    maxDate: Date = new Date();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private service: ProfessorService,
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
    ) {

        lastValueFrom(this.service.getNivelCertificacao())
            .then(res => {
                this.nivelCertificacao = res;
                this.loadingNivelCertificacao = false;
            })
            .catch(res => this.loadingNivelCertificacao = false);

        lastValueFrom(this.userService.getList())
            .then(res => {
                this.accounts = res;
                this.loadingAccounts = false;
            })
            .catch(res => this.loadingAccounts = false)

        this.loadPage();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadPage() {
        var params = this.activatedRoute.params.subscribe(async res => {
            this.isEditPage = !!res['id'];
            if (this.isEditPage) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])

                this.service.get(id)
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;
                    })
                    .catch(res => {
                        this.visible = false;
                        this.visibleChange();
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

    accountSelectedChange(account?: Account) {
        if (account) {
            this.object.account_Id = account.id;
            this.object.nome = account.name;
            this.object.email = account.email;
            this.object.telefone = account.phone;
        } else {
            this.object.account_Id = 0;
            this.object.nome = '';
            this.object.email = '';
            this.object.telefone = '';
        }
    }

    showError(message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: 'Ocorreu um erro',
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    async send(form: NgForm, e: any) {
        if (form.invalid) {
            return;
        }
        this.loading = true;

        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {
                    this.toastrService.success( this.isEditPage ? `Registro atualizado com sucesso.` : `Registro cadastrado com sucesso.`);
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

    goToCalendario() {
        this.router.navigate(['professores', 'calendario', this.crypto.encrypt(this.object.id)]);
    }

}
