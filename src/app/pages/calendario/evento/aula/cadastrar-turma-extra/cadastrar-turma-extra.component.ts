import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { PerfilCognitivo } from '../../../../../models/perfil-cognitivo.model';
import { Professor } from '../../../../../models/professor.model';
import { Aluno } from '../../../../../models/alunos.model';
import { Turma } from '../../../../../models/turma.model';
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TurmaService } from '../../../../../services/turma.service';
import { ProfessorService } from '../../../../../services/professor.service';
import { PerfilCognitivoService } from '../../../../../services/perfil-cognitivo.services';
import { ToastrService } from 'ngx-toastr';
import { SalaAulaService } from '../../../../../services/sala-aula.service';
import { AlunoService } from '../../../../../services/alunos.service';
import { NgForm, NgModel } from '@angular/forms';
import { Roteiro } from '../../../../../models/roteiro.model';
import { EventoAulaExtraRequest, EventoAulaRequest } from '../../../../../models/evento-aula.model';
import moment from 'moment';
import { RoteiroService } from '../../../../../services/roteiro.service';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { EventoService } from '../../../../../services/evento.service';
import { getError } from '../../../../../utils';
import { Evento, EventoCancelamentoRequest, EventoTipo } from '../../../../../models/evento.model';
import { MyMap as MyMap } from '../../../../../utils/map';
import { SelectChangeEvent } from 'primeng/select';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import { PickList, PickListMoveAllToTargetEvent, PickListMoveToSourceEvent, PickListSourceSelectEvent } from 'primeng/picklist';
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../../../utils/validacao';
import { Feriado } from '../../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';
import { RequestResponse } from '../../../../../helpers/request-response.interface';
import { PseudoEvento } from '../../../../../models/reposicao.model';
import { ConfirmDialog } from 'primeng/confirmdialog';
import $ from 'jquery';

@Component({
    selector: 'app-cadastrar-turma-extra',
    standalone: false,
    templateUrl: './cadastrar-turma-extra.component.html',
    styleUrl: './cadastrar-turma-extra.component.css',
    providers: [ConfirmationService],
})
export class CadastrarTurmaExtraComponent implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    object: EventoAulaExtraRequest = new EventoAulaExtraRequest;

    data: Date = new Date; // new Date(2025,5,21)//
    horario: Date = undefined as unknown as Date; // new Date(2025, 5, 21, 12, 0, 0);
    minData = new Date();

    @ViewChild('perfilCognitivo') perfilCognitivo!: NgModel
    perfilCognitivoSelected?: PerfilCognitivo;
    perfisCognitivos: PerfilCognitivo[] = [];
    loadingPerfisCognitivos = false;

    roteiro?: Roteiro;
    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    professores: Professor[] = [];
    loadingProfessores = false;

    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    mensagensEnviadasAlunos: Aluno[] = [];
    alunoSelected?: Aluno;
    alunosSelected: Aluno[] = [];
    alunos: Aluno[] = [];
    loadingAlunos = false;

    loadingEventosReposicaoAluno = false;
    selectedEventoReposicao?: Evento;
    selecionarReposicaoVisible = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    @ViewChild('picklist') picklist!: PickList;
    @ViewChild('professor_Id') professor_Id!: NgModel;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    feriadoDates: Date[] = [];
    ano: number = new Date().getFullYear();

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private turmaService: TurmaService,
        private service: EventoService,
        private professorService: ProfessorService,
        private perfilCognitivoService: PerfilCognitivoService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private salaAulaService: SalaAulaService,
        private alunoService: AlunoService,
        private roteiroService: RoteiroService,
        public mensagemWhatsapp: MensagemWhatsapp,
    ) {
        var roteiros = this.roteiroService.list.subscribe(res => this.roteiros = res);
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            this.loadingRoteiros = true;
            lastValueFrom(this.roteiroService.getList('cadastrar aula extra'))
                .then(res => this.loadingRoteiros = false)
                .catch(res => this.loadingRoteiros = false);
        }

        var professores = this.professorService.list.subscribe(res => this.professores = res);
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadingProfessores = true;
            lastValueFrom(this.professorService.getList())
                .then(res => this.loadingProfessores = false)
                .catch(res => this.loadingProfessores = false);
        }

        var salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res);
        this.subscription.push(salaAula);

        if (this.salaAulas.length == 0) {
            this.loadingSalaAulas = true;
            lastValueFrom(this.salaAulaService.getList())
                .then(res => this.loadingSalaAulas = false)
                .catch(res => this.loadingSalaAulas = false);
        }

        var perfisCognitivos = this.perfilCognitivoService.list.subscribe(res => this.perfisCognitivos = res);
        this.subscription.push(perfisCognitivos);

        if (this.perfisCognitivos.length == 0) {
            this.loadingPerfisCognitivos = true;
            lastValueFrom(this.perfilCognitivoService.getList())
                .then(res => this.loadingPerfisCognitivos = false)
                .catch(res => this.loadingPerfisCognitivos = false);
        }

        var turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);


        if (this.turmas.length == 0) {
            this.loadingTurmas = true;
            lastValueFrom(this.turmaService.getList())
                .then(res => this.loadingTurmas = false)
                .catch(res => this.loadingTurmas = false);
        }

        var alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active == true));
        this.subscription.push(alunos);

        if (this.alunos.length == 0) {
            this.loadingAlunos = true;
            lastValueFrom(this.alunoService.getListWithChecklist())
                .then(res => this.loadingAlunos = false)
                .catch(res => this.loadingAlunos = false);
        }


        this.loadFeriados();

        var eventos = this.service.eventos.subscribe(res => this.eventos = res);
        this.subscription.push(eventos);

        this.verificaDisponibilidade();
        this.visible = true;

    }
    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
        }
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target,
            message: message,
            header: header,
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    getCorTurma(turma_Id: number) {
        return this.turmas.find(x => x.id == turma_Id)?.corLegenda ?? ''
    }

    setDiaSemana(i: number) {
        return moment().day(i).format('dddd')
    }

    dateNavigatorChanged(e: DatePickerYearChangeEvent) {
        if (e.year != this.ano) {
            this.ano = e.year ?? new Date().getFullYear();
            this.loadFeriados()
        }
    }

    async loadFeriados() {
        this.loadingFeriados = true;
        await lastValueFrom(this.service.getFeriados(this.ano))
            .then(res => {
                res.forEach(item => {
                    var index = this.feriados.findIndex(x => moment(x.date).isSame(item.date));
                    if (index == -1) {
                        this.feriados.push(item);
                    } else {
                        this.feriados.splice(index, 1, item);
                    }
                });

                this.feriadoDates = this.feriados.map(x => moment(x.date).toDate());
                this.loadingFeriados = false;
            })
            .catch(res => this.loadingFeriados = false);
    }


    // turmaChanged() {
    //     if (this.object.turma_Id) {
    //         var turma = this.turmas.find(x => x.id == this.object.turma_Id) as Turma;
    //         this.alunosSelected = this.alunos.filter(x => x.turma_Id == this.object.turma_Id);
    //         this.object.capacidadeMaximaAlunos = turma.capacidadeMaximaAlunos ?? 12
    //         this.object.professor_Id = turma.professor_Id;
    //         this.object.sala_Id = turma.sala_Id;
    //         this.object.descricao = turma.nome;
    //         this.perfilCognitivoSelected = this.perfisCognitivos.find(x => x.id == turma.perfilCognitivo[0].id)

    //         var roteiro = this.roteiros.find(x => moment(this.data).isBetween(x.dataInicio, x.dataFim));
    //         if (roteiro) {
    //             this.object.roteiro_Id = roteiro.id;
    //         }

    //         this.verificaDisponibilidade();
    //     }
    // }

    @HostListener('mouseup', ['$event'])
    middleclickEvent(event: any) {
        if (event.which === 2) {
        }
    }

    enviarMensagem(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }


    removerAlunoLista(aluno: Aluno, e: any) {
        if (e.which == 2) {
            var index = this.mensagensEnviadasAlunos.findIndex(x => x.id == aluno.id)
            if (index != -1)
                this.mensagensEnviadasAlunos.splice(index, 1);
        }
    }

    enviarMensagemAgendamento(aluno: Aluno) {
        var evento = MyMap(this.object, new Evento)
        evento.evento_Tipo_Id = EventoTipo.AulaExtra;
        return this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, evento);
    }

    onSourceSelect(e: PickListSourceSelectEvent) {
        var aluno = e.items[0] as Aluno;
    }

    onMoveToSource(e: PickListMoveToSourceEvent) {
        this.validaAlunos();
        var aluno = e.items[0] as Aluno;
        var index = this.object.alunos.findIndex(x => x.aluno_Id == aluno.id);
        if (index != -1) this.object.alunos.splice(index, 1);
    }

    onMoveToTarget(e: PickListMoveAllToTargetEvent) {
        this.validaAlunos();
        var aluno = e.items[0] as Aluno;
        this.alunoSelected = aluno;
        if (!aluno.disponivel) {
            this.showError('Aluno indisponível', 'Você não pode mover um aluno indisponível.', { target: this.picklist.el.nativeElement });
            this.closeEventoReposicaoDialog();
        } 
        else if (!this.data) {
            this.showError('Selecione uma data', 'Selecione uma data para carregar sugestões de reposição do aluno.', { target: this.picklist.el.nativeElement } );
            this.closeEventoReposicaoDialog();
        }
        else if (!this.horario) {
            this.showError('Selecione um horário', 'Selecione um horário para carregar sugestões de reposição do aluno.', { target: this.picklist.el.nativeElement } );
            this.closeEventoReposicaoDialog();
        } 
        else {
                
                this.confirmationService.confirm({
                    key: 'selecionarReposicao',
                    message: ``,
                    header: 'Selecionar aula a repor',
                    acceptVisible: false,
                    rejectVisible: false,
                });

                var request: CalendarioRequest = {
                    aluno_Id: aluno.id,
                    intervaloDe: moment(this.data).subtract(1, 'month').toDate(),
                    intervaloAte: moment(this.data).add(1, 'month').toDate(),
                }
                this.loadingEventosReposicaoAluno = true;
                lastValueFrom(this.service.calendario(request))
                .then(res => {

                    var feriadosDates = this.feriadoDates.map(x => moment(x).format('YYYY-MM-DD'));
                    aluno.aulasParaRepor = res;

                    /* Apenas eventos do tipo aula */
                    aluno.aulasParaRepor = aluno.aulasParaRepor.filter(evento => evento.evento_Tipo_Id == EventoTipo.Aula);
                    /* Apenas aulas não reagendadas */
                    aluno.aulasParaRepor = aluno.aulasParaRepor.filter(evento => !evento.reagendamentoPara_Evento_Id);
                    /* Apenas aulas com falta/sem reposicao */
                    aluno.aulasParaRepor = aluno.aulasParaRepor.filter(evento => evento.alunos.find(a => a.aluno_Id == aluno.id && a.presente != true && !a.reposicaoPara_Evento_Id) != undefined);
                    /* Apenas aulas instanciadas ou aulas em feriados */
                    aluno.aulasParaRepor = aluno.aulasParaRepor.filter(evento => evento.id != PseudoEvento.EventoId || feriadosDates.includes(moment(evento.data).format('YYYY-MM-DD')));
                    
                    aluno.aulasParaRepor = aluno.aulasParaRepor
                                            .map(evento => {
                                                evento.alunos = evento.alunos.filter(x => x.aluno_Id == aluno.id);
                                                var data = moment(evento.data).format('YYYY-MM-DD')
                                                evento.feriado = this.feriados.find(x => moment(x.date).format('YYYY-MM-DD') == data);
                                                return evento;
                                            });

                    this.loadingEventosReposicaoAluno = false;
                    
                })
        }
    }

    async selectEventoReposicao(e: any, dialog: ConfirmDialog) {
        if(!this.selectedEventoReposicao) {
            this.showError('Erro', 'Selecione uma aula para repor', e);
        }
        else {
            var response: RequestResponse = { success: true, message: '', object: null };
            if (this.selectedEventoReposicao.id == PseudoEvento.EventoId) {
                
                let request: EventoAulaRequest = MyMap(this.selectedEventoReposicao, new EventoAulaRequest);
                request.perfilCognitivo = this.selectedEventoReposicao.perfilCognitivo.map(x => x.id);
                request.professores = this.selectedEventoReposicao.professores.map(x => x.professor_Id);
                request.alunos = this.selectedEventoReposicao.alunos.map(x => x.aluno_Id);

                response = await lastValueFrom(this.service.createAulaTurma(request))
                                    .catch(res => {
                                        this.showError('Erro', `Não foi possível selecionar. \n ${getError(res)}`, e)
                                        return res
                                    });
                
                this.selectedEventoReposicao.id = response.object.id;
            }
            
            // Se for feriado e a aula ainda não tiver sido cancelada
            if (this.selectedEventoReposicao.feriado && this.selectedEventoReposicao.active) {
                this.selectedEventoReposicao.observacao = `Cancelamento automático \n Feriado: ${this.selectedEventoReposicao.feriado.name}`;
                let request: EventoCancelamentoRequest = {
                    id: this.selectedEventoReposicao.id,
                    observacao: this.selectedEventoReposicao.observacao
                } 
                response = await lastValueFrom(this.service.cancelar(request))
            }
            
            var alunoReposicao = {aluno_Id: this.alunoSelected!.id, reposicaoDe_Evento_Id: this.selectedEventoReposicao.id };
            this.object.alunos.push(alunoReposicao);
            this.picklist.source = this.alunos.sort((x, y) => x.nome < y.nome ? -1 : 1);
            this.picklist.target = this.alunosSelected.sort((x, y) => x.nome < y.nome ? -1 : 1);

            delete this.selectedEventoReposicao;
            delete this.alunoSelected;

            dialog.close(e);
        }
    }

    closeEventoReposicaoDialog() {
        if(this.alunoSelected ) {
            var aluno = this.alunoSelected as Aluno;
            var index = this.object.alunos.findIndex(x => x.aluno_Id == aluno.id);
            if (index != -1) this.object.alunos.splice(index, 1);
            
            var index = this.alunosSelected.findIndex(x => x.id == aluno.id);
            this.alunosSelected.splice(index, 1)
            this.alunos.push(aluno);
            
            this.picklist.source = this.alunos.sort((x, y) => x.nome < y.nome ? -1 : 1);
            this.picklist.target = this.alunosSelected.sort((x, y) => x.nome < y.nome ? -1 : 1);

            delete this.selectedEventoReposicao;
            delete this.alunoSelected;
        }
    }

    //   onMoveAllToSource(e: any) {
    //       this.validaAlunos();
    //   }

    //   onMoveAllToTarget(e: any) {
    //       this.validaAlunos();
    //       var items = e.items as Aluno[];
    //       if (items.find(x => !x.disponivel)) {
    //           this.showError('Aluno indisponível', 'Você não pode mover alunos indisponíveis.', { target: this.picklist.el.nativeElement });
    //           this.alunos = items.filter(x => !x.disponivel);
    //           this.alunosSelected = items.filter(x => x.disponivel);
    //       }
    //   }

    async verificaDisponibilidade() {
        var roteiro = this.roteiros.find(x => moment(this.data).isBetween(x.dataInicio, x.dataFim));
        this.roteiro = roteiro;
        if (roteiro) {
            this.object.roteiro_Id = roteiro.id;
        }

        var valid = true;

        if (!this.data || !this.horario) {
            return valid;
        }

        this.loadingEventos = true;
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0);


        var request: CalendarioRequest = new CalendarioRequest;
        request.intervaloDe = data;
        request.intervaloAte = moment(data).add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.service.calendario(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        this.validaProfessores();
        this.validaSalaAulas();
        this.validaAlunos();

        return valid

    }

    validaSalaAulas() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined);
        if (this.object.professor_Id) {
            var e: SelectChangeEvent = {
                value: this.object.professor_Id,
                originalEvent: { target: $('#professor_Id').get(0) as any } as any
            } 
            this.professorChanged(e, this.professor_Id);
        }
    }

    validaAlunos() {
        var data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.alunos = validaAlunos(data, this.object.duracaoMinutos, this.alunos, this.eventos, undefined, undefined);
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        var item = this.professores.find(x => x.id == e.value) as Professor;
        let mensagemErro: string | null = null;

        if (item && !item.disponivel && item.disponivelEvent) {
            mensagemErro = `Existe uma outra ${this.getTipo(item.disponivelEvent)} às ${moment(item.disponivelEvent.data).format('HH[h]mm')} no mesmo dia.`
        }
        else if (item && !item.disponivel && !item.disponivelEvent && item.expedienteInicio && item.expedienteFim) {
            mensagemErro = `O expediente do educador é das ${moment(item.expedienteInicio).format('HH:mm')} às ${moment(item.expedienteFim).format('HH:mm')}`;
        } else {
                mensagemErro = null;
        }
        
        if (mensagemErro) {
            this.showError('Educador indisponível', mensagemErro, e.originalEvent)
            model.control.setValue(undefined)
        }
        model.control.setErrors({ indisponivel: mensagemErro });
        model.control.updateValueAndValidity();
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        this.validaSalaAulas();

        var item = this.salaAulas.find(x => x.id == e.value);
        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuída a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    getTipo(e: Evento) {
        return this.mensagemWhatsapp.getEventoTipo(e)
    }

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        var professor = this.professores.find(x => x.id == this.object.professor_Id)
        if (professor && !professor.disponivel && professor.disponivelEvent) {
            return this.showError('Educador indisponível', `O educador ${professor.nome} está atribuído a uma ${this.getTipo(professor.disponivelEvent)} no dia ${moment(professor.disponivelEvent.data).format('DD/MM/YY [ás] HH[h]mm')}`, e)
        }
        var sala = this.salaAulas.find(x => x.id == this.object.sala_Id)
        if (sala && !sala.disponivel && sala.disponivelEvent) {
            return this.showError('Sala indisponível', `A sala ${sala.numeroSala} está atribuída a uma ${this.getTipo(sala.disponivelEvent)} no dia ${moment(sala.disponivelEvent.data).format('DD/MM/YY [ás] HH[h]mm')}`, e)
        }

        var aluno = this.alunosSelected.find(x => !x.disponivel && x.disponivelEvent)
        if (aluno && aluno.disponivelEvent) {
            return this.showError('Aluno indisponível', `O alunos ${aluno.nome} está atribuído a uma ${this.getTipo(aluno.disponivelEvent)} no dia ${moment(aluno.disponivelEvent.data).format('DD/MM/YY [ás] HH[h]mm')}`, e)
        }

        // this.object.alunos = this.alunosSelected.map(x => x.id);
        this.object.data = new Date(this.data);
        this.object.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any;

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar aula',
            message: `Tem certeza que deseja agendar essa aula para o dia ${moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')}?.`,
            acceptLabel: `Agendar aula`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                this.send(e);
            }
        })
    }

    send(e: any) {

        this.loading = true;

        lastValueFrom(this.service.createAulaExtra(this.object))
            .then(res => {
                this.loading = false;
                this.sendMensagemAlunos();
                this.toastrService.success('Aula cadastrada com sucesso.', 'Agendamento finalizado');
                this.service.calendarioReload.emit(res.object.id);
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar aula. \n ${getError(res)}`, e);
            })

    }

    sendMensagemAlunos() {
        this.mensagensEnviadasAlunos = this.alunosSelected.sort((x, y) => x.nome < y.nome ? -1 : 1);// .filter(x => !!x.celular);
        this.confirmationService.confirm({
            key: 'enviarMensagem',
            message: `Agendamento concluído com sucesso. \n Envie uma mensagem de confirmação para os alunos que participarão da aula.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500',
            acceptLabel: `Concluir`,
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-text p-button-sm',
            accept: () => {
                this.visible = false
                this.visibleChange();
            },
        });
    }


}
