import { AfterViewInit, Component, inject, Injector, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm, NgModel } from '@angular/forms';
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
export class FormComponent implements OnDestroy, AfterViewInit {
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

    min = moment().set({ hour: 8, minute: 0, second: 0, millisecond: 0 }).toDate();
    max = moment().set({ hour: 20, minute: 0, second: 0, millisecond: 0 }).toDate();

    fimExpedienteMin = new Date;
    fimExpedienteMax = new Date;

    turmas: Turma[] = [];
    loadingTurmas = false;

    @ViewChild('formTag') formTag!: HTMLFormElement;

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


    }
    ngAfterViewInit(): void {
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
                this.loadTurmas(id);

                this.service.get(id)
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;
                    })
                    .catch(res => {
                        // this.visible = false;
                        // this.visibleChange();
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

    loadTurmas(professor_Id: number) {
        this.loadingTurmas = true;
        lastValueFrom(this.turmaService.getList())
            .then(res => {
                this.turmas = res.filter(x => x.professor_Id == professor_Id);
                this.loadingTurmas = false;
            })
            .catch(res => this.loadingTurmas = false);
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

    formIsValid(form: NgForm) {
        let valid = true;
        if (form.invalid) {
            valid = false
        }

        if (this.loading) {
            valid = false;
        }

        return valid;

    }

    expedienteChanged(expedienteInicio: NgModel, expedienteFim: NgModel) {
        let min = moment(this.min, 'HH:mm')
        let max = moment(this.max, 'HH:mm')
        let mensagem = '';
        let titulo = '';

        if (this.object.expedienteInicio) {
            let turmas = this.turmas.filter(x => {
                let ehAtiva = x.active;
                let intervaloValido = moment(x.horario).isSameOrAfter(this.object.expedienteInicio, 'minutes') 
                return ehAtiva && !intervaloValido;
            });

            if (!moment(this.object.expedienteInicio).isBetween(min, max, 'minutes', '[]')) {
                mensagem = 'O expediente deve iniciar no mínimo às 8h da manhã.';
                titulo = 'Início de expediente inválido'
                expedienteInicio.control.setErrors({ 'expedienteInvalido': mensagem })
            }
            else if (turmas.length > 0) {
                titulo = 'Início de expediente inválido'
                mensagem = 'O educador tem turmas com horários que iniciam antes do expediente selecionado: <br>'
                mensagem += turmas.map(x => '   • ' + x.nome).join('<br> ');
                expedienteInicio.control.setErrors({ 'expedienteInvalido': mensagem })
            } else {
                expedienteInicio.control.setErrors(null)
            }
        }

        if (this.object.expedienteFim) {
            let turmas = this.turmas.filter(x => {
                let intervaloAte = moment(x.horario).add(120, 'minutes');
                let ehAtiva = x.active;
                let intervaloValido = moment(intervaloAte).isSameOrBefore(this.object.expedienteFim);
                return ehAtiva && !intervaloValido;
            });
                

            if (!moment(this.object.expedienteFim).isBetween(this.min, this.max, 'minutes', '[]')) {
                titulo = 'Fim de expediente inválido'
                mensagem = 'O expediente deve finalizar até 20h da noite.';
                expedienteFim.control.setErrors({ 'expedienteInvalido': mensagem });
            } else if (turmas.length > 0) {
                titulo = 'Fim de expediente inválido'
                mensagem = 'O educador tem turmas com horários que se estendem ao expediente selecionado: <br>'
                mensagem += turmas.map(x => '   • ' + x.nome).join('<br>');
                expedienteFim.control.setErrors({ 'expedienteInvalido': mensagem })
            } else {
                expedienteFim.control.setErrors(null);
            }
        }
        expedienteInicio.control.updateValueAndValidity();
        expedienteFim.control.updateValueAndValidity();

        if (mensagem) {
            this.showError(titulo, mensagem, { target: this.formTag });
            return false;
        }

        return true;
    }

    goToCalendario() {
        this.router.navigate(['professores', 'calendario', this.crypto.encrypt(this.object.id)]);
    }


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }



    async sendConfirmation(e: any, form: NgForm) {
        if (!this.formIsValid(form)) {
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
