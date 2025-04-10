import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AulaService } from '../../../../services/aulas.service';
import { ProfessorService } from '../../../../services/professor.service';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { PseudoAula, ReagendarAulaRequest, ReagendarAulaView } from '../../../../models/reposicao.model';
import { lastValueFrom } from 'rxjs';
import { Professor } from '../../../../models/professor.model';
import moment from 'moment';
import { Crypto, getError } from '../../../../utils';
import { NgModel } from '@angular/forms';
import { SelectChangeEvent } from 'primeng/select';
import { TurmaService } from '../../../../services/turma.service';
import { AulaCreateRequest } from '../../../../models/aulas.model';
import { Map } from '../../../../utils/map';
import { Turma } from '../../../../models/turma.model';

@Component({
    selector: 'app-reagendar-aula',
    standalone: false,
    templateUrl: './reagendar-aula.component.html',
    styleUrl: './reagendar-aula.component.css',
    providers: [ConfirmationService]
})
export class ReagendarAulaComponent implements AfterViewInit {
    visible: boolean = false;
    object: ReagendarAulaView = new ReagendarAulaView;
    // oldObject: ReagendarAulaView = new ReagendarAulaView;
    loading = false;

    turma: Turma = new Turma;
    data = new Date();
    horario = new Date();

    minDate: Date = new Date();
    maxDate: Date = new Date();
    disableDates: Date[] = [];

    @ViewChild('dataNgModel') dataNgModel!: NgModel;
    @ViewChild('horaNgModel') horaNgModel!: NgModel;
    @ViewChild('professor_Id') professorSelect!: NgModel;

    professores: Professor[] = [];
    loadingProfessores = true;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private service: AulaService,
        private turmaService: TurmaService,
        private professorService: ProfessorService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private crypto: Crypto
    ) {
        this.activatedRoute.queryParams.subscribe(async res => {
            this.object = {
                id: res['id'],
                professor_Id: parseInt(res['professor_Id']),
                sala_Id: parseInt(res['sala_Id']),
                turma_Id: parseInt(res['turma_Id']),
                turma: res['turma'],
                data: new Date(new Date(res['data']).toUTCString()),
                observacao: res['observacao'],
            };


            this.data = this.object.data;
            this.horario = this.object.data;

            this.minDate = this.object.data;
            this.maxDate = moment(this.object.data).add(1, 'month').toDate();

            this.visible = true;

            this.turmaService.get(this.object.turma_Id)
            .then(res => this.turma = res)
            .catch(res => {
                this.visible = false;
                this.visibleChange();
            });


            lastValueFrom(this.professorService.getList())
                .then(res => {
                    this.professorService.get(this.object.professor_Id)
                        .catch(res => {
                            this.visible = false;
                            this.visibleChange();
                        });
                    this.professores = res;
                    this.loadingProfessores = false;

                })
                .catch(res => {
                    this.loadingProfessores = false;
                    this.visible = false;
                    this.visibleChange();
                });


        })

    }

    ngAfterViewInit(): void {
        this.dataNgModel.control.setValue(this.object.data)
        this.horaNgModel.control.setValue(this.object.data);
        var disabledDates: Date[] = [];
        var current = this.object.data
        var today = new Date();
        while (moment(current).isBefore(today, 'date')) {

            if (!moment(current).isSame(this.object.data)) {
                disabledDates.push(current)
            }

            current = moment(current).add(1, 'day').toDate();
        }

        this.disableDates = disabledDates

    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../../../'], { relativeTo: this.activatedRoute });
        }
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

    async verificaDisponibilidadeProfessor(e: any) {
        var valid = true;

        if (!this.object.data) {
            return valid;
        }

        // var turmas = this.turmaService.list.value;
        // if (turmas.length == 0) {
        //     turmas = await lastValueFrom(this.turmaService.getList());
        // }

        var calendario = this.service.calendario.value;
        if (calendario.length == 0) {
            await lastValueFrom(this.service.getCalendario({
                professor_Id: this.object.professor_Id,
                intervaloDe: moment(this.data).add(-1, 'day').format('YYYY-MM-DD') as any,
                intervaloAte: moment(this.data).add(1, 'day').format('YYYY-MM-DD') as any
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

            var intervaloDe = moment(this.object.data).add(-2, 'hour'); // Duas horas antes
            var intervaloAte = moment(this.object.data).add(2, 'hour'); // Duas horas depois

            // var beginningTime = moment({ hour: intervaloDe.getHours(), minute: intervaloDe.getMinutes() });            
            // var endTime = moment({ hour: intervaloAte.getHours(), minute: intervaloAte.getMinutes() });

            // Procura outra turma com o mesmo professor que tenha aula no mesmo dia e horário
            var exists = calendario.find(x => x.aula_Id != this.object.id
                && x.professor_Id == professor.id
                && moment(x.data).isBetween(intervaloDe, intervaloAte)
            /**
             * 
                x.data.getDay() == this.object.data.getDay()
                && moment(x.data, 'HH:mm:ss').isAfter(intervaloDe)
                && moment(x.data, 'HH:mm:ss').isBefore(intervaloAte)
             */
            );

            if (exists) {
                professor.disponivel = false;
                professor.disponivelEvent = exists;

                if (professor.id == this.object.professor_Id) {
                    valid = false;
                    this.professorSelect.control.setErrors({ indisponivel: 'Professor indisponível' });
                    this.showError('Professor Indisponível', `Esse professor está atribuído para outra aula com a turma <b>${exists.turma ?? exists.descricao}</b> no mesmo dia às <b>${moment(exists.data).format('HH[h]mm')}</b>.`, e);
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
            this.showError('Professor Indisponível', `Esse professor está atribuído para outra aula com a turma <b>${professor.disponivelEvent.turma ?? professor.disponivelEvent.descricao}</b> no mesmo dia às <b>${moment(professor.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        } else {
            this.professorSelect.control.setErrors({ indisponivel: null });
        }
        this.professorSelect.control.updateValueAndValidity();
    }


    confirma(e: any) {
        var data = new Date(this.data.toISOString().substring(0, 10) + this.horario.toISOString().substring(10));

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja reagendar aula da turma ${this.object.turma} do dia <b>${moment(this.object.data).format('DD/MM/YYYY [às] HH:mm')} </b> para o dia <b>${moment(data).format('DD/MM/YYYY [às] HH:mm')}</b> ?`,
            header: 'Reagendar aula',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Agendar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: () => {
                this.send(e)
            },
            reject: () => {
                this.visible = false;
                this.visibleChange();
                this.confirmationService.close();
            }
        });
    }


    async send(e: any) {
        this.loading = true;
        var data = new Date(this.data.toISOString().substring(0, 10) + this.horario.toISOString().substring(10));
        // Se a aula não existir, cria a aula
        if (this.object.id == PseudoAula.AulaId) {
            var aulaRequest: AulaCreateRequest = {
                professor_Id: this.object.professor_Id,
                sala_Id: this.object.sala_Id,
                turma_Id: this.object.turma_Id ?? 0,
                data: moment(this.object.data).format('YYYY-MM-DD[T]HH:mm:ss') as any,
                observacao: this.object.observacao,
                descricao: this.object.turma ?? '',
                perfilCognitivo: this.turma.perfilCognitivo
            }
            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => this.object.id = res.object.aula_Id)
                .catch(res => {
                    this.showError('Ocorreu um erro', `Não foi possível reagendar aula. \n ${getError(res)}`, e);
                    return
                });
        }


        this.object.data = data;
        var model = Map(this.object, new ReagendarAulaRequest);
        await lastValueFrom(this.service.reagendar(model))
            .then(res => {
                this.loading = false;
                this.visible = false;
                this.visibleChange();
                this.toastrService.success(`Aula reagendada para o dia ${moment(this.object.data).format('DD/MM/YYYY [às] HH[h]mm')}`)
                this.service.calendarioReload.emit(res.object.id);                
            })
            .catch(res => {
                this.loading = false;
                {
                    this.showError('Ocorreu um erro', `Não foi possível reagendar aula. \n ${getError(res)}`, e);
                    return
                }
            })
    }
}
