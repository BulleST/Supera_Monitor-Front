import { AfterViewInit, Component, inject, Injector, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Crypto, insertOrReplace } from '../../../utils';
import { lastValueFrom, Subscription } from 'rxjs';
import { NgForm, NgModel } from '@angular/forms';
import { Turma } from '../../../models/turma.model';
import { TurmaService } from '../../../services/turma.service';
import { Professor } from '../../../models/professor.model';
import { ProfessorService } from '../../../services/professor.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { SelectChangeEvent } from 'primeng/select';
import { PerfilCognitivoService } from '../../../services/perfil-cognitivo.services';
import { PerfilCognitivo } from '../../../models/perfil-cognitivo.model';
import { AulaService } from '../../../services/aulas.service';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrl: './form.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class FormComponent implements OnDestroy, AfterViewInit {
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
        // { id: 0, label: 'Domingo' },
        { id: 1, label: 'Segunda-feira' },
        { id: 2, label: 'Terça-feira' },
        { id: 3, label: 'Quarta-feira' },
        { id: 4, label: 'Quinta-feira' },
        { id: 5, label: 'Sexta-feira' },
        { id: 6, label: 'Sábado' },
    ];

    perfisCognitivos: PerfilCognitivo[] = [];
    loadingPerfisCognitivos = true;

    professores: Professor[] = [];
    loadingProfessores = true;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private service: TurmaService,
        private aulaService: AulaService,
        private professorService: ProfessorService,
        private perfilCognitivoService: PerfilCognitivoService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
    ) {

        lastValueFrom(this.perfilCognitivoService.getList())
            .then(res => {
                this.loadingPerfisCognitivos = false;
                this.perfisCognitivos = res
            })
            .catch(res => this.loadingPerfisCognitivos = false);
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngAfterViewInit(): void {
        this.loadPage();
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

                        this.verificaDisponibilidadeProfessor({target: this.divForm});
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

    async verificaDisponibilidadeProfessor(e: any) {
        var valid = true;

        if (!this.object.diaSemana || !this.object.horario) {
            return valid;
        }

        var calendario = this.aulaService.calendario.value;
        if (calendario.length == 0) {
            await lastValueFrom(this.aulaService.getCalendario({
                professor_Id: this.object.professor_Id,
                intervaloDe: moment(new Date).startOf('week').toDate(),
                intervaloAte: moment(new Date).endOf('week').toDate()
            }))
            .then(res => calendario = res)
            .catch(res => this.showError('Erro', 'Não foi possível validar disponibilidade.', e))
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
            var exists = calendario.find(x => x.aula_Id != this.object.id
                && x.professor_Id == professor.id
                && x.data.getDay() == this.object.diaSemana
                && moment(x.data, 'HH:mm:ss').isAfter(intervaloDe)
                && moment(x.data, 'HH:mm:ss').isBefore(intervaloAte)
            );


            if (exists) {
                professor.disponivel = false;
                professor.disponivelEvent = exists;

                if (professor.id == this.object.professor_Id) {
                    valid = false;
                    this.professorSelect.control.setErrors({ indisponivel: 'Professor indisponível' });
                    this.showError('Professor Indisponível', `Esse professor está atribuído para outra aula com a turma <b>${exists.turma ?? exists.descricao}</b> no mesmo dia às <b>${moment(exists.data).format('HH[h]mm')}</b>.`, { target: this.divForm });
                }
            }
            else {
                professor.disponivel = true;
                professor.disponivelEvent = undefined;
                this.professorSelect.control.setErrors({ indisponivel: null });
                this.professorSelect.control.updateValueAndValidity();
            }
            return professor;
        });

        return valid

    }

    professorChanged(e: SelectChangeEvent) {
        var professor = this.professores.find(x => x.id == e.value);

        if (professor && professor.disponivel == false && professor.disponivelEvent) {
            this.professorSelect.control.setErrors({ indisponivel: 'Professor indisponível' });
            this.showError('Professor Indisponível', `Esse professor está atribuído para outra aula com a turma <b>${professor.disponivelEvent.turma??professor.disponivelEvent.descricao}</b> no mesmo dia às <b>${moment(professor.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
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
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }


    perfilChange(model: NgModel) {
        console.log(model.value)
    }


    async send(form: NgForm, e: any) {

        var professorValido = await this.verificaDisponibilidadeProfessor(e);
        if (form.invalid || this.professorSelect.invalid || professorValido == false) {
            return;
        }

        this.loading = true;
        this.request()
            .then(res => {
                this.loading = false;
                if (res.success) {

                    res.object.horario = new Date(moment().format('YYYY-MM-DD') + 'T' + res.object.horario);

                    this.toastrService.success(this.isEditPage ? `Registro atualizado com sucesso.` : `Registro cadastrado com sucesso.`);
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
