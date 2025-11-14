import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { lastValueFrom, Subscription } from 'rxjs';
import { PerfilCognitivo } from '../../../../models/perfil-cognitivo.model';
import { Professor } from '../../../../models/professor.model';
import { Aluno } from '../../../../models/alunos.model';
import { Turma } from '../../../../models/turma.model';
import { SalaAndar, SalaAula } from '../../../../models/sala-aula.model';
import { ActivatedRoute, Router } from '@angular/router';
import { TurmaService } from '../../../../services/turma.service';
import { ProfessorService } from '../../../../services/professor.service';
import { PerfilCognitivoService } from '../../../../services/perfil-cognitivo.services';
import { ToastrService } from 'ngx-toastr';
import { SalaAulaService } from '../../../../services/sala-aula.service';
import { AlunoService } from '../../../../services/alunos.service';
import { NgForm, NgModel } from '@angular/forms';
import { Roteiro } from '../../../../models/roteiro.model';
import { EventoTurmaExtraRequest, EventoTurmaExtraRequest_Alunos } from '../../../../models/evento-aula.model';
import moment from 'moment';
import { RoteiroService } from '../../../../services/roteiro.service';
import { MensagemWhatsapp } from '../../../../utils/mensagem-whatsapp';
import { EventoService } from '../../../../services/evento.service';
import { getError, showError } from '../../../../utils';
import { Evento } from '../../../../models/evento.model';
import { SelectChangeEvent } from 'primeng/select';
import { CalendarioRequest } from '../../../../models/calendario.model';
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../../utils/validacao';
import { Feriado } from '../../../../models/feriado.model';
import { DatePickerYearChangeEvent } from 'primeng/datepicker';
import { PseudoEvento } from '../../../../models/reposicao.model';
import $ from 'jquery';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CalendarioUtils } from '../../../../utils/calendario-utils';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { DialogService } from 'primeng/dynamicdialog';
import { ReposicaoDeSelectComponent } from './reposicao-de-select/reposicao-de-select.component';
import { MensagemTipo } from '../../../../shared/evento/enviar-mensagem-alunos/enviar-mensagem-alunos.component';
import { showEnviarMensagemAlunos } from '../../../../utils/show-enviar-mensagem-alunos';
import { JornadaSuperaService } from '../../../../services/jornada-supera.service';
import { MonitoramentoService } from '../../../../services/monitoramento.service';

@Component({
    selector: 'app-cadastrar-turma-extra',
    standalone: false,
    templateUrl: './cadastrar-turma-extra.component.html',
    styleUrl: './cadastrar-turma-extra.component.css',
    providers: [ConfirmationService, DialogService],
})
export class CadastrarTurmaExtraComponent implements OnDestroy {
    visible: boolean = false;
    loading = false;
    error: string = '';
    subscription: Subscription[] = [];

    object: EventoTurmaExtraRequest = new EventoTurmaExtraRequest;

    data: Date = undefined as any;
    horario: Date = undefined as any;

    @ViewChild('perfilCognitivo') perfilCognitivo!: NgModel
    perfilCognitivoSelected: PerfilCognitivo[] = [];
    perfisCognitivos: PerfilCognitivo[] = [];
    loadingPerfisCognitivos = false;

    roteiroAtual?: Roteiro;
    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    professores: Professor[] = [];
    loadingProfessores = false;

    salaAulas: SalaAula[] = [];
    loadingSalaAulas = false;

    turmas: Turma[] = [];
    loadingTurmas = false;

    selectedSource?: Aluno;
    selectedTarget?: Aluno;

    target: Aluno[] = [];
    source: Aluno[] = [];
    loadingAlunos = false;

    eventos: Evento[] = [];
    loadingEventos = false;

    // @ViewChild('picklist') picklist!: PickList;
    @ViewChild('professor_Id') professor_Id!: NgModel;

    feriados: Feriado[] = [];
    loadingFeriados = false;
    invalidDates: Date[] = [];
    ano: number = new Date().getFullYear();

    SalaAndar = SalaAndar;

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private turmaService: TurmaService,
        private eventoService: EventoService,
        private jornadaService: JornadaSuperaService,
        private monitoramentoService: MonitoramentoService,
        private professorService: ProfessorService,
        private perfilCognitivoService: PerfilCognitivoService,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private salaAulaService: SalaAulaService,
        private alunoService: AlunoService,
        private roteiroService: RoteiroService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private dialogService: DialogService,
        private calendarioUtils: CalendarioUtils,
    ) {
        let feriados = this.eventoService.feriados.subscribe(res => {
            this.feriados = res;
            this.setInvalidDates();
        });
        this.subscription.push(feriados);

        if (this.feriados.length == 0) {
            this.loadFeriados();
        }

        let roteiros = this.roteiroService.list.subscribe(res => {
            this.roteiros = res.filter(x => x.active);
            this.setInvalidDates();
            this.setRoteiroAtual();
        });
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            this.loadRoteiros();
        }

        let professores = this.professorService.list.subscribe(res => this.professores = res.filter(x => x.active));
        this.subscription.push(professores);

        if (this.professores.length == 0) {
            this.loadProfessores();
        }

        let salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res);
        this.subscription.push(salaAula);

        if (this.salaAulas.length == 0) {
            this.loadSalas();
        }

        let perfisCognitivos = this.perfilCognitivoService.list.subscribe(res => this.perfisCognitivos = res);
        this.subscription.push(perfisCognitivos);

        if (this.perfisCognitivos.length == 0) {
            this.loadPerfilCognitivo();
        }

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active));
        this.subscription.push(turmas);

        if (this.turmas.length == 0) {
            this.loadTurmas();
        }

        let alunos = this.alunoService.list.subscribe(res => this.source = res.filter(x => x.active == true && x.turma_Id));
        this.subscription.push(alunos);

        if (this.source.length == 0) {
            this.loadAlunos();
        }

        let eventos = this.eventoService.eventos.subscribe(res => this.eventos = res);
        this.subscription.push(eventos);

        this.verificaDisponibilidade();
        this.visible = true;

        this.data = new Date;
        this.horario = new Date;
        this.object.descricao = 'Turma Extra';
        this.object.professor_Id = 31;
        this.object.sala_Id = 1;
        this.perfilCognitivoSelected = this.perfisCognitivos;

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../../'], { relativeTo: this.activatedRoute });
        }
    }



    loadProfessores() {
        this.loadingProfessores = true;
        lastValueFrom(this.professorService.getList())
            .then(res => this.loadingProfessores = false)
            .catch(res => this.loadingProfessores = false);
    }

    loadPerfilCognitivo() {
        this.loadingPerfisCognitivos = true;
        lastValueFrom(this.perfilCognitivoService.getList())
            .then(res => this.loadingPerfisCognitivos = false)
            .catch(res => this.loadingPerfisCognitivos = false);
    }

    loadRoteiros() {
        this.loadingRoteiros = true;
        lastValueFrom(this.roteiroService.getList(moment().year()))
            .then(res => this.loadingRoteiros = false)
            .catch(res => this.loadingRoteiros = false);
    }

    loadSalas() {
        this.loadingSalaAulas = true;
        lastValueFrom(this.salaAulaService.getList())
            .then(res => this.loadingSalaAulas = false)
            .catch(res => this.loadingSalaAulas = false);
    }

    loadTurmas() {
        this.loadingTurmas = true;
        lastValueFrom(this.turmaService.getList())
            .then(res => this.loadingTurmas = false)
            .catch(res => this.loadingTurmas = false);
    }

    loadAlunos() {
        this.loadingAlunos = true;
        lastValueFrom(this.alunoService.getList())
            .then(res => this.loadingAlunos = false)
            .catch(res => this.loadingAlunos = false);
    }

    loadFeriados() {
        this.loadingFeriados = true;
        lastValueFrom(this.eventoService.getFeriados(this.ano))
            .then(res => this.loadingFeriados = false)
            .catch(res => this.loadingFeriados = false);
    }

    setInvalidDates() {
        if (this.roteiros.length && this.feriados.length) {
            let recessos = this.roteiros.filter(x => x.recesso === true);
            let recessosDate = recessos.flatMap(x => {
                let length = moment(x.dataFim).diff(x.dataInicio, 'day')
                let range = Array.from({ length }, (item, index) => {
                    return moment(x.dataInicio, 'YYYY-MM-DD').add(index, 'day').toDate()
                });
                range.push(moment(x.dataFim, 'YYYY-MM-DD').toDate())
                return range;
            });

            let feriadosDate = this.feriados.map(x => moment(x.date).toDate());
            this.invalidDates = [... new Set(recessosDate.concat(feriadosDate))];
        }
    }

    showError(header: string, message: string, e: any, innerMessage?: string) {
        showError(this.confirmationService, header, message, e, innerMessage);
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

    perfilChanged(e: MultiSelectChangeEvent) {

        let selected = (e.originalEvent as any).selected;
        //
        // Se deselecionar o perfil, selected = true
        // Se selecionar o perfil, selected = false
        //
        if (selected) {
            let perfilUnselected = e.itemValue;
            let alunosPerfis = this.target.filter(x => x.perfilCognitivo_Id == perfilUnselected.id)

            // Se algum aluno tiver o perfil que foi removido
            if (alunosPerfis.length > 0) {
                let mensagem = `Não é possível remover o perfil <b>${perfilUnselected.nome}</b> pois a turma possui alunos com esse perfil:
                    <ul class="my-1">
                        ${alunosPerfis.map(x => `<li>${x.nome}</li>`)}
                    </ul>`;
                this.perfilCognitivoSelected.push(perfilUnselected);
                return this.showError('OPS!', mensagem, e.originalEvent)
            }
        }


        let perfis = this.perfilCognitivoSelected.map(x => x.id);
        let alunosTarget = this.target.map(x => x.id);
        let alunosList = this.alunoService.list.value.filter(x => x.active && x.turma_Id);
        this.source = alunosList.filter(x =>
            (perfis.includes(x.perfilCognitivo_Id) || !x.perfilCognitivo_Id)
            && !alunosTarget.includes(x.id));
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

    setRoteiroAtual() {
        if (this.data && this.roteiros.length) {
            let roteiro = this.roteiros.find(x => moment(this.data).isBetween(x.dataInicio, x.dataFim, 'days', '[]'));
            this.roteiroAtual = roteiro;
            if (roteiro && roteiro.id != PseudoEvento.EventoId) {
                this.object.roteiro_Id = roteiro.id ?? undefined;
            }
        }
    }

    async verificaDisponibilidade() {

        this.setRoteiroAtual();

        let valid = true;

        if (!this.data || !this.horario) {
            return valid;
        }

        this.loadingEventos = true;
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0);


        let request: CalendarioRequest = new CalendarioRequest;
        request.intervaloDe = data;
        request.intervaloAte = moment(data).add(1, 'day').toDate();

        this.loadingEventos = true;
        await lastValueFrom(this.eventoService.getList(request))
            .then(res => this.loadingEventos = false)
            .catch(res => this.loadingEventos = false);

        this.validaProfessores();
        this.validaSalaAulas();
        this.validaAlunos();

        return valid

    }

    validaSalaAulas() {
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.salaAulas = validaSalaAulas(data, this.object.duracaoMinutos, this.salaAulas, this.eventos, undefined, undefined);
    }

    validaProfessores() {
        this.loadingProfessores = true;
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined);
        if (this.object.professor_Id) {
            let e: SelectChangeEvent = {
                value: this.object.professor_Id,
                originalEvent: { target: $('#professor_Id').get(0) as any } as any
            }
            this.professorChanged(e, this.professor_Id);
        }
        this.loadingProfessores = false;
    }

    validaAlunos() {
        let data = this.data;
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.source = validaAlunos(data, this.object.duracaoMinutos, this.source, this.eventos, undefined, undefined);
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        let item = this.professores.find(x => x.id == e.value) as Professor;
        let mensagemErro: string | null = null;


        if (item && item.disponivel === false && item.disponivelEvent) {
            mensagemErro = `Esse educador está educador a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às ${moment(item.disponivelEvent.data).format('HH[h]mm')}.`;
        }
        else if (item && item.disponivel === false && !item.disponivelEvent && item.expedienteInicio && item.expedienteFim) {
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

        let item = this.salaAulas.find(x => x.id == e.value) as SalaAula;
        if (item && item.disponivel === false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError(
                'Sala Indisponível',
                `Essa sala está atribuída a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`,
                e.originalEvent
            );
            return;
        }

        if (item.andar > SalaAndar.Terreo) {
            var targetAlunos = this.target.filter(x => x.restricaoMobilidade);
            if (targetAlunos.length > 0) {
                model.control.setErrors({ incompativel: 'Sala incompatível' });
                let alunos = targetAlunos
                    .map(x => x.nome)
                    .join('<br>')

                this.showError(
                    'Sala Incompatível',
                    `Os seguintes alunos possuem mobilidade reduzida e não poderão realizar essa aula na sala ${item.descricao} - ${item.andar}º andar: <br> ${alunos}`,
                    e.originalEvent
                );
                return;
            }
        }

        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();

        let alunosTarget = this.target.map(x => x.id);
        let alunosList = this.alunoService.list.value.filter(x => x.active && x.turma_Id);
        this.source = alunosList.filter(x => {
            const terreo = item.andar == SalaAndar.Terreo;
            const restricao = x.restricaoMobilidade;
            const target = alunosTarget.includes(x.id);
            return (terreo || !restricao) && !target;
        });


    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    sortList() {
        this.source = this.source.sort((x, y) => x.nome < y.nome ? -1 : 1)
        this.target = this.target.sort((x, y) => x.nome < y.nome ? -1 : 1);
    }

    moveToSource(e: any) {
        var aluno = this.selectedTarget;
        let event: any = {
            event: e,
            item: { data: aluno },
            previousContainer: { data: this.source },
            container: { data: this.target },
            previousIndex: 0,
            currentIndex: 0,
        };
        this.sourceDropped(event);

    }

    moveToTarget(e: any) {
        var aluno = this.selectedSource;
        let event: any = {
            event: e,
            item: { data: aluno },
            previousContainer: { data: this.source },
            container: { data: this.target },
            previousIndex: 0,
            currentIndex: 0,
        };
        this.targetDropped(event);
    }

    sourceDropped(e: CdkDragDrop<Aluno[]>) {
        var aluno = e.item.data;
        if (aluno) {
            this.confirmationService.confirm({
                target: e.event.target as any,
                message: `Tem certeza?`,
                header: 'Remover aluno',
                acceptLabel: `Sim`,
                rejectLabel: 'Não',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: () => {

                    aluno.eventoReposicaoEmAndamento = undefined

                    let index = this.target.findIndex(x => x.id == aluno.id);
                    this.target.splice(index, 1);
                    this.source.push(aluno as Aluno);

                    this.sortList();
                    this.removeSelection();
                },
                reject: () => this.removeSelection(),
            });

        }
    }

    targetDropped(e: CdkDragDrop<Aluno[]>) {
        var sala = this.salaAulas.find(x => x.id == this.object.sala_Id);
        var aluno = e.item.data;

        if (!aluno) {
            this.showError('Selecionar aluno', 'Selecione um aluno para mover.', e.event);
        }
        else if (aluno.disponivel === false) {
            this.showError('Aluno indisponível', 'Você não pode mover um aluno indisponível.', e.event);
        }
        else if (sala && sala.andar > SalaAndar.Terreo) {
            if (aluno.restricaoMobilidade) {
                this.showError('Mobilidade reduzida', `Esse aluno tem mobilidade reduzida e não poderá participar dessa aula na sala ${sala.descricao} no ${sala.andar}º andar`, e.event);
            }
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

    restricoesConfirm(e: CdkDragDrop<Aluno[]>) {
        let aluno = e.item.data as Aluno;
        let restricoes = aluno.restricoes.filter(x => x.active);

        if (restricoes.length) {
            let message = 'Esse aluno possui as seguintes restrições.';
            if (aluno.restricaoMobilidade) {
                message += '<br>Restrição de mobilidade.'
            }
            if (aluno.restricoes.filter(x => x.active).length)
                message += aluno.restricoes.filter(x => x.active).map(x => `<br>${x.descricao}`).join('');

            message += '<br> Deseja continuar?';

            this.confirmationService.confirm({
                target: e.event.target as any,
                header: 'Continuar?',
                message: message,
                acceptLabel: 'Continuar',
                rejectLabel: 'Cancelar',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptButtonStyleClass: ' p-button-rounded',
                rejectButtonStyleClass: ' p-button-rounded p-button-outlined',
                accept: () => this.selecionarAulaReposicaoConfirm(e),
                reject: () => this.removeSelection(),
            });
        } else {
            this.selecionarAulaReposicaoConfirm(e)
        }

    }

    selecionarAulaReposicaoConfirm(e: CdkDragDrop<Aluno[]>) {
        let aluno = e.item.data as Aluno;

        var ref = this.dialogService.open(ReposicaoDeSelectComponent, {
            showHeader: false,
            closable: true,
            maximizable: false,
            closeOnEscape: true,
            draggable: true,
            dismissableMask: true,
            duplicate: true,
            modal: true,
            width: '450px',
            style: {
                maxWidth: '95vw',
                maxHeight: '95vh',
            },
            data: {
                aluno: aluno,
                evento: this.object
            }
        });

        var onClose = ref.onClose.subscribe(reposicaoDe => {
            console.log('onClose', reposicaoDe)
            if (reposicaoDe) {
                aluno.eventoReposicaoEmAndamento = reposicaoDe;
                this.selectedSource = aluno;
                this.transferToTarget(e);
            }
            else {
                this.removeSelection();
            }
        });
        this.subscription.push(onClose);

    }

    transferToTarget(e: CdkDragDrop<Aluno[]>) {
        let aluno = e.item.data as Aluno;
        let index = this.source.findIndex(x => x.id == aluno.id);

        this.target.push(aluno);
        this.source.splice(index, 1);

        this.sortList();
        this.removeSelection();
    }

    removeSelection() {
        delete this.selectedSource;
    }

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Campos inválidos', 'Preencha os campos corretamente para salvar.', e)
        }

        let professor = this.professores.find(x => x.id == this.object.professor_Id)
        if (professor && professor.disponivel === false && professor.disponivelEvent) {
            return this.showError('Educador indisponível', `O educador ${professor.nome} está atribuído a uma ${this.getTipo(professor.disponivelEvent)} no dia ${moment(professor.disponivelEvent.data).format('DD/MM/YY [ás] HH[h]mm')}`, e)
        }
        let sala = this.salaAulas.find(x => x.id == this.object.sala_Id)
        if (sala && sala.disponivel === false && sala.disponivelEvent) {
            return this.showError('Sala indisponível', `A sala ${sala.numeroSala} está atribuída a uma ${this.getTipo(sala.disponivelEvent)} no dia ${moment(sala.disponivelEvent.data).format('DD/MM/YY [ás] HH[h]mm')}`, e)
        }

        let aluno = this.target.find(x => x.disponivel === false && x.disponivelEvent)
        if (aluno && aluno.disponivelEvent) {
            return this.showError('Aluno indisponível', `O alunos ${aluno.nome} está atribuído a uma ${this.getTipo(aluno.disponivelEvent)} no dia ${moment(aluno.disponivelEvent.data).format('DD/MM/YY [ás] HH[h]mm')}`, e)
        }
        if (!this.target.length) {
            return this.showError('Selecionar aluno', `Selecione pelo menos algum aluno para continuar`, e)
        }

        var data = moment(this.object.data)
            .set({
                hour: this.horario.getHours(),
                minute: this.horario.getMinutes(),
                second: 0
            })
            .toDate();

        this.object.data = moment(data).format('YYYY-MM-DD[T]HH:mm') as any;
        let dataFormatada = moment(data).format('DD/MM/YY [às] HH[h]mm');

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar aula',
            message: `Tem certeza que deseja agendar essa aula para o dia <b class="text-primary-500">${dataFormatada}</b>?`,
            acceptLabel: `Agendar aula`,
            rejectLabel: 'Cancelar',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e);
            }
        })
    }

    async send(e: any) {
        this.loading = true;

        this.object.perfilCognitivo = this.perfilCognitivoSelected.map(x => x.id);

        var alunosComAula = this.target.filter(x => x.eventoReposicaoEmAndamento && x.eventoReposicaoEmAndamento.id != PseudoEvento.EventoId)
        var alunosComPseudoAula = this.target.filter(x => x.eventoReposicaoEmAndamento && x.eventoReposicaoEmAndamento.id == PseudoEvento.EventoId)
        var alunos: EventoTurmaExtraRequest_Alunos[] = [];

        alunosComAula.forEach(aluno => {
            var evento = aluno.eventoReposicaoEmAndamento as Evento;
            alunos.push({
                aluno_Id: aluno.id,
                reposicaoDe_Evento_Id: evento.id
            })
        })


        var request = alunosComPseudoAula.map(aluno => {
            var evento = aluno.eventoReposicaoEmAndamento as Evento;
            return this.requestAulaTurma(evento)
                .then(response => {
                    if (response.success) {
                        evento.id = response.object.id;
                        alunos.push({
                            aluno_Id: aluno.id,
                            reposicaoDe_Evento_Id: evento.id
                        })
                    }
                    else {
                        this.showError(
                            'Erro',
                            `Não foi possível inserir ${aluno.nome}`,
                            e,
                            response.message);
                    }
                    return response;
                })
                .catch(response => {
                    this.showError(
                        'Erro',
                        `Não foi possível inserir ${aluno.nome}`,
                        e,
                        response.message);
                    return response;
                })
        })

        this.object.alunos = alunos;

        await Promise.all(request)

        lastValueFrom(this.eventoService.createAulaExtra(this.object))
            .then(res => {
                this.loading = false;

                if (res.success) {
                    this.jornadaService.onReload.emit(res.object.id);
                    this.monitoramentoService.onReload.emit(res.object.id);
                    this.eventoService.onReload.emit(res.object.id);
                    if (this.object.alunos.length > 0) {
                        this.sendMensagemAlunos(res.object);
                    } else {
                        this.visible = false;
                        this.visibleChange()
                    }
                    this.toastrService.success('Turma extra cadastrada com sucesso.', 'Agendamento finalizado');
                }
                else {
                    this.showError('Agendamento falhou', `Não foi possível agendar turma extra. <br> ${res.message}`, e);
                }
            })
            .catch(res => {
                this.loading = false;
                this.showError('Agendamento falhou', `Não foi possível agendar turma extra. <br> ${getError(res)}`, e);
            })

    }

    sendMensagemAlunos(evento: Evento) {
        var alunos = this.target
            .sort((x, y) => x.nome < y.nome ? -1 : 1);

        var ref = showEnviarMensagemAlunos(
            this.dialogService,
            alunos, evento,
            MensagemTipo.Agendamento
        );

        var onClose = ref.onClose.subscribe(res => {
            this.visible = false;
            this.visibleChange();
        });
        this.subscription.push(onClose);
    }

    requestAulaTurma(evento: Evento) {
        return this.calendarioUtils.requestAulaTurma(evento);
    }

}
