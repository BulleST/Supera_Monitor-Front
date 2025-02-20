import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AulaService } from '../../../services/aulas.service';
import { Crypto } from '../../../utils';
import { Professor } from '../../../models/professor.model';
import { ProfessorService } from '../../../services/professor.service';
import { Popover } from 'primeng/popover';
import { CalendarioAlunoList, CalendarioList } from '../../../models/calendario.model';
import { AlunoService } from '../../../services/alunos.service';
import { AulaCreateRequest, AulaEditRequest } from '../../../models/aulas.model';
import { Reposicao } from '../../../models/reposicao.model';
import { Map } from '../../../utils/map';
import { ApostilaService } from '../../../services/apostila.service';
import { Apostila, Apostila_Tipo } from '../../../models/apostila.model';
import { Select } from 'primeng/select';
import { NgModel } from '@angular/forms';
import { ChamadaRequest, ChamadaRequestAlunos } from '../../../models/chamada.model';
import { LoadingService } from '../../../parts/loading/loading';
import { ToastrService } from 'ngx-toastr';
import { TurmaService } from '../../../services/turma.service';
import moment from 'moment';

@Component({
    selector: 'app-aula',
    standalone: false,
    templateUrl: './aula.component.html',
    styleUrl: './aula.component.css',
    providers: [ConfirmationService],
})
export class AulaComponent implements OnDestroy {
    visible: boolean = false;
    object = new CalendarioList;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    professores: Professor[] = [];
    loadingProfessores = true;
    professorSelected?: Professor;

    @ViewChild('popoverSelectedAluno') popoverSelectedAluno!: Popover;
    @ViewChild('professor_Id') professorSelect!: NgModel;
    @ViewChild('aulaForm') aulaForm!: HTMLElement;
    selectedAluno?: CalendarioAlunoList;

    horario: string = '';
    isChamadaPage: boolean = false;


    apostilaAbacoAluno: Apostila[] = [];
    apostilaAHAluno: Apostila[] = [];
    apostilas: Apostila[] = [];
    loadingApostila = false;

    constructor(
        private confirmationService: ConfirmationService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private crypto: Crypto,
        private service: AulaService,
        private turmaService: TurmaService,
        private alunoService: AlunoService,
        private professorService: ProfessorService,
        private apostilaService: ApostilaService,
        private loadingService: LoadingService,
        private toastrService: ToastrService,
    ) {

        // var aula = this.service.aula.subscribe(async res => {

        //     // if (res && !res.aula_Id) {
        //     //     this.visible = false;
        //     //     this.visibleChange();
        //     //     return;
        //     // }

        //     this.object = res;
        //     this.object.alunos = this.object.alunos.sort((x, y) => x.aluno < y.aluno ? -1 : x.aluno > y.aluno ? 1 : 0);
        //     this.horario = `${moment(this.object.data).format('HH[h]mm')} às ${moment(this.object.data).add(2, 'hours').format('HH[h]mm')}`;

        //     this.verificaDisponibilidadeProfessor();

        //     this.loading = false;
        //     this.visible = true;

        // });
        // this.subscription.push(aula);

        this.activatedRoute.params.subscribe(async res => {
            if (res['aula_id']) {
                this.object.aula_Id = this.crypto.decrypt(res['aula_id']);
                var aula = this.service.aula.getValue();

                if (!aula && this.object.aula_Id) {
                    if (this.service.list.value.length == 0) {
                        await lastValueFrom(service.getCalendario({}))
                        .catch(res => {
                            this.visible = false;
                            this.visibleChange();
                            return;
                        })
                    }

                    aula = service.list.value.find(x => x.aula_Id == this.object.aula_Id);
                }

                if (!aula) {
                    this.visible = false;
                    this.visibleChange();
                    return;
                }

                this.object = aula;
                this.object.alunos = this.object.alunos.sort((x, y) => x.aluno < y.aluno ? -1 : x.aluno > y.aluno ? 1 : 0);
                this.horario = `${moment(this.object.data).format('HH[h]mm')} às ${moment(this.object.data).add(2, 'hours').format('HH[h]mm')}`;
                this.verificaDisponibilidadeProfessor();
                this.loading = false;
                this.visible = true;
        
            }
        })


        this.activatedRoute.url.subscribe(res => {
            var url = res[0];
            this.isChamadaPage = url.path == 'chamada'
        })

        this.loadingApostila = true;
        lastValueFrom(this.apostilaService.getApostilas())
            .then(res => {
                this.apostilas = res;
                this.loadingApostila = false;
            })
            .catch(res => this.loadingApostila = false)

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    toDate(horario: string) {
        var stringDate = new Date(2025, 1, 1).toISOString().substring(0, 10) + 'T' + horario;
        return new Date(stringDate);
    }

    addHours(data: Date, h: number) {
        data.setTime(data.getTime() + (h * 60 * 60 * 1000));
        return data;
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
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
            acceptIcon: '',
            rejectVisible: false,
        })
    }


    displayPopoverAluno(event: any, aluno: CalendarioAlunoList) {
        if (this.selectedAluno && this.selectedAluno.id === aluno.id) {
            this.popoverSelectedAluno.hide();
            delete this.selectedAluno;
        } else {
            this.selectedAluno = aluno;
            this.popoverSelectedAluno.show(event);

            aluno.loadingFoto = true;
            lastValueFrom(this.alunoService.getFoto(aluno.aluno_Id))
                .then(res => {
                    aluno.aluno_Foto = res;
                    aluno.loadingFoto = false;
                })
                .catch(res => aluno.loadingFoto = false);

            if (this.popoverSelectedAluno.container) {
                this.popoverSelectedAluno.align();
            }
        }
    }

    hidePopoverAluno() {
        this.popoverSelectedAluno.hide();
    }



    async verificaDisponibilidadeProfessor() {
        var valid = true;
        if (!this.object.finalizada) {

            var turmas = this.turmaService.list.value;
            if (turmas.length == 0) {
                turmas = await lastValueFrom(this.turmaService.getList());
            }

            if (this.professores.length == 0) {

                this.loadingProfessores = true;
                await lastValueFrom(this.professorService.getList())
                    .then(res => {
                        this.loadingProfessores = false;
                        this.professores = res.sort((x, y) => Number(x.deactivated) - Number(y.deactivated));
                    })
                    .catch(res => this.loadingProfessores = false);
            }

            this.professores.map(professor => {

                var intervaloDe = new Date(this.object.data.getTime() - 2 * 60 * 60 * 1000); // Duas horas antes
                var intervaloAte = new Date(this.object.data.getTime() + 2 * 60 * 60 * 1000); // Duas horas depois

                var beginningTime = moment({ hour: intervaloDe.getHours(), minute: intervaloDe.getMinutes() });
                var endTime = moment({ hour: intervaloAte.getHours(), minute: intervaloAte.getMinutes() });

                // Procura outra turma com o mesmo professor que tenha aula no mesmo dia e horário
                var exists = turmas.find(x => x.id != this.object.turma_Id
                    && x.professor_Id == professor.id
                    && x.diaSemana == this.object.data.getDay()
                    && moment(x.horario, 'HH:mm:ss').isAfter(beginningTime)
                    && moment(x.horario, 'HH:mm:ss').isBefore(endTime));

                if (exists) {
                    professor.disponivel = false;
                    professor.disponivelTurma = exists;
                    if (professor.id == this.object.professor_Id) {
                        valid = false;
                        this.professorSelect.control.setErrors({ indisponivel: 'Professor indisponível' });
                        this.showError('Professor indisponível', `Esse professor está atribuído para outra aula com a turma <b>${exists.nome}</b> no mesmo dia às <b>${moment(exists.horario).format('HH[h]mm')}</b>.`, { target: this.aulaForm });
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

            this.professorSelected = this.professores.find(x => x.id == this.object.professor_Id)

        }
        return valid

    }



    professorChange(e: any) {
        if (!this.professorSelected) {
            this.professorSelected = this.professores.find(x => x.id == this.object.professor_Id)
            return;
        }

        if (this.professorSelected && this.professorSelected.disponivel == false) {
            this.professorSelect.control.setErrors({ indisponivel: 'Professor indisponível' });
            this.showError('Professor Indisponível', `Esse professor está atribuído para outra aula com a turma <b>${this.professorSelected.disponivelTurma!.nome}</b> no mesmo dia às <b>${moment(this.professorSelected.disponivelTurma!.horario).format('HH[h]mm')}</b>.`, e);
            return;
        }

        this.professorSelect.control.setErrors({ indisponivel: null });
        this.professorSelect.control.updateValueAndValidity();
        this.confirmationService.confirm({
            target: e,
            message: `Tem certeza que deseja alterar o professor para essa aula? <br> Sujeito a disponibilidade.`,
            header: 'Troca de professor',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Alterar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.object.professor_Id = this.professorSelected!.id;
            },
            reject: () => {
                this.professorSelected = this.professores.find(x => x.id == this.object.professor_Id);
            }
        });
    }

    loadApostila(aluno: CalendarioAlunoList) {
        this.loadingApostila = true;
        this.apostilaAbacoAluno = this.apostilas.filter(x => x.apostila_Kit_Id == aluno.apostila_Kit_Id && x.apostila_Tipo_Id == Apostila_Tipo.Abaco);
        this.apostilaAHAluno = this.apostilas.filter(x => x.apostila_Kit_Id == aluno.apostila_Kit_Id && x.apostila_Tipo_Id == Apostila_Tipo.AH);

        this.apostilaAHAluno.sort((x, y) => x.ordem - y.ordem)
        this.apostilaAbacoAluno.sort((x, y) => x.ordem - y.ordem)

        this.loadingApostila = false;
    }

    apostilaAbacoChange(value: any, item: CalendarioAlunoList, ngModel: NgModel, el: Select) {
        var newApostila = this.apostilaAbacoAluno.find(x => x.id == value) as Apostila;
        var oldApostila = this.apostilaAbacoAluno.find(x => x.id == item.apostila_Abaco_Id) as Apostila;
        if (value != item.apostila_Abaco_Id && newApostila.ordem < oldApostila.ordem) {

            this.confirmationService.confirm({
                target: el.el.nativeElement,
                message: `Tem certeza que deseja retornar o nível da apostila desse aluno?.`,
                header: 'Alterar apostila',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Sim',
                acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Não',
                rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                accept: async () => {
                    item.apostila_Abaco_Id = value;
                    item.apostila_Abaco = newApostila.nome
                },
                reject: () => {
                    ngModel.control.setValue(oldApostila.id)
                    value = oldApostila.id;
                    item.apostila_Abaco_Id = oldApostila.id;
                    item.apostila_Abaco = oldApostila.nome;
                }
            });
        }
    }

    apostilaAHChange(value: any, item: CalendarioAlunoList, ngModel: NgModel, el: Select) {
        var newApostila = this.apostilaAHAluno.find(x => x.id == value) as Apostila;
        var oldApostila = this.apostilaAHAluno.find(x => x.id == item.apostila_AH_Id) as Apostila;
        if (value != item.apostila_AH_Id && newApostila.ordem < oldApostila.ordem) {

            this.confirmationService.confirm({
                target: el.el.nativeElement,
                message: `Tem certeza que deseja retornar o nível da apostila desse aluno?.`,
                header: 'Alterar apostila',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Sim',
                acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Não',
                rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                accept: async () => {
                    item.apostila_AH_Id = value;
                    item.apostila_AH = newApostila.nome
                },
                reject: () => {
                    ngModel.control.setValue(oldApostila.id)
                    value = oldApostila.id;
                    item.apostila_AH_Id = oldApostila.id;
                    item.apostila_AH = oldApostila.nome;
                }
            });
        }
    }

    goToAluno(aluno: CalendarioAlunoList) {
        this.router.navigate(['home', 'aluno', this.crypto.encrypt(aluno.aluno_Id)]);
    }

    async goToIniciarChamada(e: any) {
        this.loading = true;

        if (!this.object.aula_Id) {
            var aulaRequest: AulaCreateRequest = {
                turma_Id: this.object.turma_Id,
                data: moment(this.object.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
                professor_Id: this.object.professor_Id,
                observacao: ''
            };

            await lastValueFrom(this.service.create(aulaRequest))
                .then(res => {
                    this.object.aula_Id = res.object.id;
                    this.service.calendarioReload.emit(true);
                })
                .catch(res => this.showError('Ocorreu um erro', `Não foi possível iniciar chamada. \n (Aula não foi inserida) \n ${res.error.message}`, e));

        }
        this.loading = false;
        this.isChamadaPage = true;

        this.service.aula.next(this.object)
        this.router.navigate(['home', 'chamada', this.crypto.encrypt(this.object.aula_Id)], { replaceUrl: true });
    }

    goToReposicao(aluno: CalendarioAlunoList) {
        if (this.object) {
            var reposicao: Reposicao = {
                aluno: aluno.aluno,
                aluno_Id: aluno.aluno_Id,
                source_Aula_Id: this.object.aula_Id,
                source_Data: this.object.data,
                source_Turma_Id: aluno.turma_Id,
                source_Turma: aluno.turma,
                source_Turma_Tipo_Id: this.object.turma_Tipo_Id,
                source_Turma_Tipo: this.object.turma_Tipo,
                source_Professor_Id: this.object.professor_Id,
                source_Professor: this.object.professor
            };

            this.service.reposicao.next(reposicao)
            this.router.navigate(['home', 'reposicao', this.crypto.encrypt(aluno.aluno_Id)]);
        }
    }

    async salvarDados(e: any) {
        this.loading = true;

        var request: any = {
            id: this.object.aula_Id,
            turma_Id: this.object.turma_Id,
            data: moment(this.object.data).format('YYYY-MM-DD[T]HH:mm:ss') as unknown as Date,
            professor_Id: this.object.professor_Id,
            observacao: this.object.observacao
        }
        await this.request(request)
            .then(res => {
                this.service.calendarioReload.emit(true);
                this.loading = false;
                this.object.aula_Id = res.object.id;
                this.service.aula.next(this.object);
                this.router.navigate(['../', this.crypto.encrypt(this.object.aula_Id)], { relativeTo: this.activatedRoute, replaceUrl: true });
                this.toastrService.success('Dados atualizados com sucesso.')
            })
            .catch(res => {
                this.showError('Ocorreu um erro', `Não foi possível salvar dados. \n ${res.error.message}`, e)
                this.loading = false;
            });

    }

    request(request: any) {
        if (this.object.aula_Id) {
            request = Map(request, new AulaEditRequest)
            return lastValueFrom(this.service.edit(request))
        }
        request = Map(request, new AulaCreateRequest)
        return lastValueFrom(this.service.create(request))
    }

    finalizarAula(e: any) {

        if (this.object.alunos.find(x => x.presente == undefined)) {
            this.showError('Erro', 'Atribua presença ou falta para todos os alunos.', e);
            return;
        }

        if (this.object.alunos.find(x => x.apostila_Abaco_Id == undefined || x.apostila_AH_Id == undefined)) {
            this.showError('Erro', 'Atribua apostila do dia para todos os alunos.', e);
            return;
        }

        if (this.object.alunos.find(x => x.numeroPaginaAbaco == 0 || x.numeroPaginaAH == 0)) {
            this.showError('Erro', 'Página não pode ser 0.', e);
            return;
        }

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja finalizar aula?.`,
            header: 'Finalizar aula',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Finalizar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0 p-button-icon-right',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Ainda não',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.loading = true;
                var request: ChamadaRequest = {
                    aula_Id: this.object.aula_Id as number,
                    professor_Id: this.object.professor_Id as number,
                    registros: this.object.alunos.map(x => ({
                        turma_Aula_Aluno_Id: x.id,
                        presente: x.presente,
                        apostila_Abaco_Id: x.apostila_Abaco_Id,
                        numero_Pagina_Abaco: x.numeroPaginaAbaco,
                        apostila_Ah_Id: x.apostila_AH_Id,
                        numero_Pagina_Ah: x.numeroPaginaAH
                    }) as ChamadaRequestAlunos)
                }
                lastValueFrom(this.service.chamada(request))
                    .then(res => {
                        this.object.finalizada = true;
                        this.service.aula.next(this.object)
                        this.loading = false;
                        this.visible = false;
                        this.visibleChange();
                        this.service.calendarioReload.emit(true);

                        this.toastrService.success('Aula finalizada com sucesso.');
                    })
                    .catch(res => {
                        this.error = res.message;
                        this.showError('Erro', `Não foi possível finalizar aula. \n ${res.error.message}`, e);
                        this.loading = false;
                    })
            },
            reject: () => {
            }
        });
    }
}
