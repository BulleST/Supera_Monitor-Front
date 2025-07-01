import { Component, inject, Injector, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { ProfessorService } from '../../../services/professor.service';
import { Professor, Professor_NivelCertificacao } from '../../../models/professor.model';
import { Account } from '../../../models/account.model';
import { UserService } from '../../../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Turma } from '../../../models/turma.model';
import { TurmaService } from '../../../services/turma.service';
import moment from 'moment';
import { Crypto, insertOrReplace, playAlert, playSuccess, showError } from '../../../utils';

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

    minDate: Date = new Date(1950, 1, 1);
    maxDate: Date = new Date();


    inicioExpedienteMin = new Date;
    inicioExpedienteMax = new Date;

    fimExpedienteMin = new Date;
    fimExpedienteMax = new Date;

    turmas: Turma[] = [];
    loadingTurmas = false;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private service: ProfessorService,
        private userService: UserService,
        private turmaService: TurmaService,
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
                var id = this.crypto.decrypt(res['id']);

                this.loadingTurmas = true;
                lastValueFrom(this.turmaService.getList())
                    .then(res => {
                        this.turmas = res.filter(x => x.professor_Id == id);
                        this.loadingTurmas = false;
                    })
                    .catch(res => this.loadingTurmas = false);


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

    expedienteChanged(e: any) {

        this.inicioExpedienteMin = this.object.expedienteFim ? 
                    moment(this.object.expedienteFim).subtract(8, 'hours').toDate()
                    : moment(new Date).set('hours', 8).toDate();
        this.inicioExpedienteMax = this.object.expedienteFim ?? moment(new Date).set('hours', 19).toDate();
        
        this.fimExpedienteMin = this.object.expedienteInicio ?? moment(new Date).set('hours', 8).toDate();
        this.fimExpedienteMax = this.object.expedienteInicio ? 
                                moment(this.object.expedienteInicio).add(8, 'hours').toDate()
                                : moment(new Date).set('hours', 19).toDate();
        
        this.fimExpedienteMin = moment(new Date).set('hours', 8).toDate();

        if (this.isEditPage) {
            var mensagem = '';
            if (this.object.expedienteInicio) {

                let turmas = this.turmas.filter(x => x.active
                    && moment(x.horario).isBefore(this.object.expedienteInicio))
                if (turmas.length > 0) {
                    mensagem = 'Existem turmas atribuídas a esse educador com horário iniciando antes do expediente escolhido.';
                    mensagem += `\n Turmas:  \n ${turmas.map(x => x.nome).join('\n ')}`
                }
            }


            if (this.object.expedienteFim) {
                let turmas = this.turmas.filter(x => x.active
                    && (moment(x.horario).isSameOrAfter(this.object.expedienteFim)
                        || moment(x.horario).add(120, 'minutes').isAfter(this.object.expedienteFim)))
                if (turmas.length > 0) {
                    mensagem += '\n Existem turmas atribuídas a esse educador com horário finalizando após o expediente escolhido.';
                    mensagem += `\n Turmas:  ${turmas.map(x => x.nome).join(', ')}`
                }
            }
            if (mensagem) {
                this.showError('Expediente inválido', mensagem, e)
            }
        }

    }
    goToCalendario() {
        this.router.navigate(['professores', 'calendario', this.crypto.encrypt(this.object.id)]);
    }


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }



    async sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Campos inválidos', 'Preencha os campos corretamente para salvar.', e);
        }

        // playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: 'Tem certeza que deseja salvar os dados do professor?',
            header: 'Salvar dados',
            acceptLabel: 'Salvar',
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Cancelar',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e)
            }
        })
    }


    async send(e: any) {
        this.loading = true;

        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {
                    this.toastrService.success(this.isEditPage ? `Registro atualizado com sucesso.` : `Registro cadastrado com sucesso.`);
                    this.visible = false;
                    this.visibleChange();
                    // playSuccess();
                }
                else {
                    this.error = res.message;
                    this.showError('Erro', this.error, e);
                }
            })
            .catch((res: HttpErrorResponse) => {
                this.error = res.error.message;
                this.loading = false;
                this.showError('Erro', this.error, e);
            })
    }

    request() {
        if (this.isEditPage) {
            return lastValueFrom(this.service.edit(this.object));
        }
        return lastValueFrom(this.service.create(this.object));
    }


}
