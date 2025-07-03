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
import { EventoTurmaExtraRequest, EventoAulaRequest } from '../../../../../models/evento-aula.model';
import moment from 'moment';
import { RoteiroService } from '../../../../../services/roteiro.service';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { EventoService } from '../../../../../services/evento.service';
import { getError, showError } from '../../../../../utils';
import { Evento, EventoCancelamentoRequest, EventoTipo } from '../../../../../models/evento.model';
import { MyMap as MyMap } from '../../../../../utils/map';
import { SelectChangeEvent } from 'primeng/select';
import { CalendarioRequest } from '../../../../../models/calendario.model';
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../../../utils/validacao';
import { Feriado } from '../../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';
import { PseudoEvento } from '../../../../../models/reposicao.model';
import $ from 'jquery';
import {
    CdkDragDrop,
} from '@angular/cdk/drag-drop';
import { AlunoRestricaoService } from '../../../../../services/aluno-restricao.service';
import { CalendarioUtils } from '../../../../../utils/calendario-utils';
import { playAlert, playSuccess } from '../../../../../utils/audio';

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

    object: EventoTurmaExtraRequest = new EventoTurmaExtraRequest;

    data: Date = new Date; // new Date(2025,5,21)//
    horario: Date = new Date(2025, 5, 21, 12, 0, 0); // undefined as unknown as Date; // new Date(2025, 5, 21, 12, 0, 0);
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
    alunosSelected: Aluno[] = [];

    selectedAlunoSource?: Aluno;
    selectedAlunoTarget?: Aluno;

    alunos: Aluno[] = [];
    loadingAlunos = false;

    loadingEventosReposicaoAluno = false;
    selectedEventoReposicao?: Evento;

    eventos: Evento[] = [];
    loadingEventos = false;

    // @ViewChild('picklist') picklist!: PickList;
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
        private alunoRestricaoService: AlunoRestricaoService,
        private roteiroService: RoteiroService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
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
        showError(this.confirmationService, header, message, e);
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
                this.feriados = res
                this.feriadoDates = this.feriados.map(x => moment(x.date).toDate());
                this.loadingFeriados = false;
            })
            .catch(res => this.loadingFeriados = false);
    }

    enviarMensagem(aluno: Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }


    enviarMensagemAgendamento(aluno: Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        var evento = MyMap(this.object, new Evento)
        evento.evento_Tipo_Id = EventoTipo.AulaExtra;
        let object = this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, evento);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);

        var index = this.mensagensEnviadasAlunos.findIndex(x => x.id == aluno.id)
        if (index != -1)
            this.mensagensEnviadasAlunos.splice(index, 1);

        return object;
    }

    async verificaDisponibilidade() {
        var roteiro = this.roteiros.find(x => moment(this.data).isBetween(x.dataInicio, x.dataFim));
        this.roteiro = roteiro;
        if (roteiro) {
            this.object.roteiro_Id = roteiro.id ?? undefined;
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
        this.loadingProfessores = true;
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
        this.loadingProfessores = false;
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
        return this.calendarioUtils.getEventoTipo(e)
    }

    sendMensagemAlunos() {
        this.mensagensEnviadasAlunos = this.alunosSelected.sort((x, y) => x.nome < y.nome ? -1 : 1);// .filter(x => !!x.celular);
        this.confirmationService.confirm({
            key: 'enviarMensagem',
            message: `Agendamento concluído com sucesso. \n Envie uma mensagem de confirmação para os alunos que participarão da aula.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500',
            acceptLabel: `Concluir`,
            acceptButtonStyleClass: 'p-button-rounded',
            rejectVisible: false,
            accept: () => {
                this.visible = false
                this.visibleChange();
            },
        });
    }


    moveToSource(e: any) {
        if (this.selectedAlunoTarget) {
            this.confirmationService.confirm({
                target: e.target,
                message: `Tem certeza?`,
                header: 'Remover aluno',
                acceptLabel: `Sim`,
                acceptButtonStyleClass: 'p-button-rounded',
                rejectLabel: 'Não',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {

                    var objIndex = this.object.alunos.findIndex(x => x.aluno_Id == this.selectedAlunoTarget!.id);
                    this.object.alunos.splice(objIndex, 1);

                    var index = this.alunosSelected.findIndex(x => x.id == this.selectedAlunoTarget!.id);
                    this.alunosSelected.splice(index, 1);

                    this.alunos.push(this.selectedAlunoTarget as Aluno);

                    this.sortList();
                    this.removeSelection();
                },
                reject: () => this.removeSelection(),
            });

        }
    }

    moveToTarget(e: any) {
        if (!this.selectedAlunoSource) {
            this.showError('Selecionar aluno', 'Selecione um aluno para mover.', e.event);
        }
        else if (this.selectedAlunoSource.disponivel == false) {
            this.showError('Aluno indisponível', 'Você não pode mover um aluno indisponível.', e.event);
        }
        else if (!this.data) {
            this.showError('Selecione uma data', 'Selecione uma data para carregar sugestões de reposição do aluno.', e.event);
        }
        else if (!this.horario) {
            this.showError('Selecione um horário', 'Selecione um horário para carregar sugestões de reposição do aluno.', e.event);
        }
        else {
            var event: any = {
                event: e,
                item: {
                    data: this.selectedAlunoSource
                },
                previousContainer: {
                    data: this.alunos
                },
                container: {
                    data: this.alunosSelected
                },
                previousIndex: 0,
                currentIndex: 0,
            }
            this.restricoesConfirm(event)
        }


    }

    sourceDropped(e: CdkDragDrop<Aluno[]>) {

        if (e.previousContainer != e.container) {
            var aluno = e.item.data;
            this.selectedAlunoTarget = aluno;

            this.confirmationService.confirm({
                target: e.event.target as any,
                message: `Tem certeza?`,
                header: 'Remover aluno',
                acceptLabel: `Sim`,
                acceptButtonStyleClass: 'p-button-rounded',
                rejectLabel: 'Não',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {

                    var indexObj = this.object.alunos.findIndex(x => x.aluno_Id == aluno.id);
                    this.object.alunos.splice(indexObj, 1);

                    var index = this.alunosSelected.findIndex(x => x.id == aluno.id);
                    this.alunosSelected.splice(index, 1);

                    this.alunos.push(aluno);

                    this.sortList();
                    this.removeSelection();

                },
                reject: () => this.removeSelection(),
            });

        }
    }

    async targetDropped(e: CdkDragDrop<Aluno[]>) {
        if (e.previousContainer != e.container) {

            var aluno = e.item.data as Aluno;
            this.selectedAlunoSource = aluno;

            if (aluno.disponivel == false) {
                this.showError('Aluno indisponível', 'Você não pode mover um aluno indisponível.', e.event);
            }
            else if (!this.data) {
                this.showError('Selecione uma data', 'Selecione uma data para carregar sugestões de reposição do aluno.', e.event);
            }
            else if (!this.horario) {
                this.showError('Selecione um horário', 'Selecione um horário para carregar sugestões de reposição do aluno.', e.event);
            }
            else {
                this.restricoesConfirm(e)
            }

        }
    }

    async restricoesConfirm(e: CdkDragDrop<Aluno[]>) {
        var aluno = this.selectedAlunoSource as Aluno;
        this.selectedAlunoSource = aluno;

        aluno.restricoes = await lastValueFrom(this.alunoRestricaoService.getList(aluno.id));

        if (aluno.restricoes.filter(x => x.active).length || aluno.restricaoMobilidade) {

            // playAlert(1);

            var message = 'Esse aluno possui as seguintes restrições. <div>';

            if (aluno.restricoes.filter(x => x.active).length)
                message += aluno.restricoes.filter(x => x.active).map(x => `<p class="ml-4">• ${x.descricao}</p>`).join('');

            if (aluno.restricaoMobilidade) {
                message += '<p class="font-bold ml-4">• Restrição de mobilidade.</p>'
            }
            message += '</div> <br> Deseja continuar?';



            this.confirmationService.confirm({
                target: e.event.target as any,
                header: 'Continuar?',
                message: message,
                acceptLabel: 'Continuar',
                rejectLabel: 'Cancelar',
                acceptButtonStyleClass: ' p-button-rounded',
                rejectButtonStyleClass: ' p-button-rounded p-button-outlined',
                accept: () => this.selectEventoConfirm(e),
                reject: () => this.removeSelection(),
            });
        } else {
            this.selectEventoConfirm(e)
        }

    }

    selectEventoConfirm(e: CdkDragDrop<Aluno[]>) {
        var aluno = this.selectedAlunoSource as Aluno;
        this.selectedAlunoSource = aluno;
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
                /* Apenas aulas sem presença marcada e sem reposição marcada */
                aluno.aulasParaRepor = aluno.aulasParaRepor.filter(evento => evento.alunos.find(a => a.aluno_Id == aluno.id
                    && a.presente != true
                    && !a.reposicaoPara_Evento_Id
                    && !a.reposicaoDe_Evento_Id) != undefined);
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

        this.confirmationService.confirm({
            key: 'selecionarReposicao',
            message: ``,
            header: 'Selecionar aula a repor',
            acceptLabel: 'Continuar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: ' p-button-rounded',
            rejectButtonStyleClass: ' p-button-rounded p-button-outlined',
            accept: async () => this.selectEventoSave(e),
            reject: () => this.removeSelection(),
        });
    }

    async selectEventoSave(e: CdkDragDrop<Aluno[]>) {
        var aluno = this.selectedAlunoSource as Aluno;
        if (!this.selectedEventoReposicao || !this.selectedAlunoSource) {
            this.confirmationService.confirm({
                key: 'selecionarReposicao',
                message: ``,
                header: 'Selecionar aula a repor',
                acceptLabel: 'Continuar',
                rejectLabel: 'Cancelar',
                acceptButtonStyleClass: ' p-button-rounded',
                rejectButtonStyleClass: ' p-button-rounded p-button-outlined',
                accept: async () => this.selectEventoSave(e),
                reject: () => this.removeSelection(),
            });
            this.showError('Erro', 'Selecione uma aula e aluno para repor', e.event);
        }
        else {
            var alunoReposicao = {
                aluno_Id: aluno.id,
                reposicaoDe_Evento_Id: this.selectedEventoReposicao.id
            };
            this.object.alunos.push(alunoReposicao);

            this.transferAlunoTarget(e);
        }
    }

    transferAlunoTarget(e: CdkDragDrop<Aluno[]>) {
        var aluno = this.selectedAlunoSource as Aluno;
        var index = this.alunos.findIndex(x => x.id == aluno.id);

        this.alunosSelected.push(aluno);
        this.alunos.splice(index, 1);

        this.sortList();
        this.removeSelection();
    }

    sortList() {
        this.alunos = this.alunos.sort((x, y) => x.nome < y.nome ? -1 : 1)
        this.alunosSelected = this.alunosSelected.sort((x, y) => x.nome < y.nome ? -1 : 1);
    }

    removeSelection() {
        delete this.selectedEventoReposicao;
        delete this.selectedAlunoSource;
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
        if (!this.alunosSelected.length) {
            return this.showError('Selecionar aluno', `Selecione pelo menos algum aluno para continuar`, e)
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
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e);
            }
        })
    }

    send(e: any) {

        this.loading = true;

        this.object.perfilCognitivo = this.perfilCognitivoSelected ? [this.perfilCognitivoSelected.id] : [];

        lastValueFrom(this.service.createAulaExtra(this.object))
            .then(res => {
                this.loading = false;
                this.sendMensagemAlunos();
                this.toastrService.success('Aula cadastrada com sucesso.', 'Agendamento finalizado');
                this.service.calendarioReload.emit(res.object.id);

                playSuccess(1)
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar aula. \n ${getError(res)}`, e);
            })

    }

}
