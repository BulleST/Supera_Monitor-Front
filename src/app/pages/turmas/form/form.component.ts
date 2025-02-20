import { Component, inject, Injector, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Crypto, insertOrReplace } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm, NgModel } from '@angular/forms';
import { Turma, Turma_Tipo } from '../../../models/turma.model';
import { TurmaService } from '../../../services/turma.service';
import { Professor } from '../../../models/professor.model';
import { ProfessorService } from '../../../services/professor.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { Select, SelectChangeEvent } from 'primeng/select';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class FormComponent implements OnDestroy {
    visible: boolean = false;
    injector = inject(Injector);
    object = new Turma;
    loading = false;
    error: string = '';
    isEditPage = false;
    subscription: Subscription[] = [];

    @ViewChild('professor_Id') professorSelect!: NgModel;
    @ViewChild('divForm') divForm!: HTMLElement;

    diasSemana = [
        { id: 0, label: 'Domingo' },
        { id: 1, label: 'Segunda-feira' },
        { id: 2, label: 'Terça-feira' },
        { id: 3, label: 'Quarta-feira' },
        { id: 4, label: 'Quinta-feira' },
        { id: 5, label: 'Sexta-feira' },
        { id: 6, label: 'Sábado' },
    ];

    tipos: Turma_Tipo[] = [];
    loadingTurmaTipo = true;

    professores: Professor[] = [];
    loadingProfessores = true;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private service: TurmaService,
        private professorService: ProfessorService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
    ) {

        this.loadPage();
        lastValueFrom(this.service.getTipos())
            .then(res => {
                this.loadingTurmaTipo = false;
                this.tipos = res
            })
            .catch(res => this.loadingTurmaTipo = false);

       
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadPage() {

        var params = this.activatedRoute.params.subscribe(res => {
            this.isEditPage = !!res['id'];
            if (this.isEditPage) {
                this.loading = true;
                var id = this.crypto.decrypt(res['id'])

                this.service.get(id)
                    .then(res => {
                        this.object = res;
                        this.loading = false;
                        this.visible = true;

                        this.verificaDisponibilidadeProfessor();
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

    async verificaDisponibilidadeProfessor() {
        var valid = true;

        if (!this.object.diaSemana || !this.object.horario) {
            return valid;
        }

        var turmas = this.service.list.value;
        if (turmas.length == 0) {
            turmas = await lastValueFrom(this.service.getList());
        }

        if (this.professores.length == 0) {

            this.loadingProfessores = true;
            await lastValueFrom(this.professorService.getList())
            .then(res => {
                this.loadingProfessores = false;
                this.professores = res.sort((x, y) => Number(x.deactivated) - Number(y.deactivated))
            })
            .catch(res => this.loadingProfessores = false);
        }

        this.professores.map(professor => {

            var intervaloDe = moment(this.object.horario).add(-2, 'hour'); // Duas horas antes
            var intervaloAte = moment(this.object.horario).add(2, 'hour'); // Duas horas depois

            // var beginningTime = moment({ hour: intervaloDe.getHours(), minute: intervaloDe.getMinutes() });            
            // var endTime = moment({ hour: intervaloAte.getHours(), minute: intervaloAte.getMinutes() });

            // Procura outra turma com o mesmo professor que tenha aula no mesmo dia e horário
            var exists = turmas.find(x => x.id != this.object.id 
                            && x.professor_Id == professor.id 
                            && x.diaSemana == this.object.diaSemana 
                            && moment(x.horario, 'HH:mm:ss').isAfter(intervaloDe) 
                            && moment(x.horario, 'HH:mm:ss').isBefore(intervaloAte) );

            
            if (exists ) {
                professor.disponivel = false;
                professor.disponivelTurma = exists;
                
                if (professor.id == this.object.professor_Id) {
                    valid = false;
                    this.professorSelect.control.setErrors({ indisponivel: 'Professor indisponível' });
                    this.showError('Professor Indisponível', `Esse professor está atribuído para outra aula com a turma <b>${exists.nome}</b> no mesmo dia às <b>${moment(exists.horario).format('HH[h]mm')}</b>.`, { target: this.divForm } );
                }
            } 
            else {
                professor.disponivel = true;
                professor.disponivelTurma = undefined;
                this.professorSelect.control.setErrors({ indisponivel: null });
                this.professorSelect.control.updateValueAndValidity();
            }
            return professor;
        });

        return valid

    }

    professorChanged(e: SelectChangeEvent) {
        var professor = this.professores.find(x => x.id == e.value);

        if (professor && professor.disponivel == false) {
            this.professorSelect.control.setErrors({ indisponivel: 'Professor indisponível' });
            this.showError('Professor Indisponível', `Esse professor está atribuído para outra aula com a turma <b>${professor.disponivelTurma!.nome}</b> no mesmo dia às <b>${moment(professor.disponivelTurma!.horario).format('HH[h]mm')}</b>.`, e.originalEvent );
            return;
        } else {
            this.professorSelect.control.setErrors({ indisponivel: null });
        }
        this.professorSelect.control.updateValueAndValidity();
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header:  'Erro',
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    async send(form: NgForm, e: any) {
       var professorValido = await this.verificaDisponibilidadeProfessor();


        if (form.invalid || this.professorSelect.invalid || professorValido == false) {
            return;
        }


        this.loading = true;
        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {

                    res.object.horario = new Date(moment().format('YYYY-MM-DD') + 'T' + res.object.horario);

                    this.toastrService.success( this.isEditPage ? `Registro atualizado com sucesso.` : `Registro cadastrado com sucesso.`);
                    insertOrReplace(this.service, res.object);
                    this.visible = false;
                    this.visibleChange();
                }
                else {
                    this.error = res.message;
                    this.showError('Ocorreu um erro', this.error, e);
                }
            })
            .catch((res: HttpErrorResponse) => {
                this.error = res.error.message;
                this.loading = false;
                this.showError('Ocorreu um erro', this.error, e);
            })
    }

    request() {
        if (this.isEditPage) {
            return lastValueFrom(this.service.edit(this.object));
        }
        return lastValueFrom(this.service.create(this.object));
    }
    goToCalendario() {
        this.router.navigate(['turmas', 'calendario', this.crypto.encrypt(this.object.id)]);
    }

}
