import { Component, OnDestroy, ViewChild } from '@angular/core'
import { EventoAula0Request } from '../../../../../models/evento-aula-0.model'
import { lastValueFrom, Subscription } from 'rxjs'
import { Aluno } from '../../../../../models/alunos.model'
import { Professor } from '../../../../../models/professor.model'
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model'
import { ActivatedRoute, Router } from '@angular/router'
import { ConfirmationService } from 'primeng/api'
import { ToastrService } from 'ngx-toastr'
import { Crypto, getError, showError } from '../../../../../utils'
import moment from 'moment'
import { Turma } from '../../../../../models/turma.model'
import { TurmaService } from '../../../../../services/turma.service'
import { SalaAulaService } from '../../../../../services/sala-aula.service'
import { ProfessorService } from '../../../../../services/professor.service'
import { AlunoService } from '../../../../../services/alunos.service'
import { EventoService } from '../../../../../services/evento.service'
import { NgForm, NgModel } from '@angular/forms'
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp'
import { SelectChangeEvent } from 'primeng/select'
import { Evento, EventoTipo } from '../../../../../models/evento.model'
import { CalendarioRequest } from '../../../../../models/calendario.model'
import { ChecklistService } from '../../../../../services/checklist.service'
import { AccountService } from '../../../../../services/account.service'
import { validaAlunos, validaProfessores, validaSalaAulas } from '../../../../../utils/validacao'
import { Feriado } from '../../../../../models/feriado.model'
import { DatePickerYearChangeEvent } from 'primeng/datepicker'
import { MultiSelectChangeEvent } from 'primeng/multiselect'
import $ from 'jquery'
import { CalendarioUtils } from '../../../../../utils/calendario-utils'
import { Aluno_CheckList_Item } from '../../../../../models/checklist.model'
import { MyMap } from '../../../../../utils/map'
import { NameFirstWordPipe } from '../../../../../utils/name-first-word.pipe'
import { Evento_Participacao_Aluno } from '../../../../../models/evento-participacao-aluno.model'
import { RoteiroService } from '../../../../../services/roteiro.service'
import { Roteiro } from '../../../../../models/roteiro.model'
import { SalaAulaPipe } from '../../../../../utils/sala-aula.pipe'

@Component({
    selector: 'app-cadastrar-aula-0',
    standalone: false,
    templateUrl: './cadastrar-aula-0.component.html',
    styleUrl: './cadastrar-aula-0.component.css',
    providers: [ConfirmationService],
})
export class CadastrarAula0Component implements OnDestroy {
    visible: boolean = false
    loading = false
    error: string = ''
    subscription: Subscription[] = []
    object: EventoAula0Request = new EventoAula0Request()
    data: Date = undefined as unknown as Date
    horario: Date = undefined as unknown as Date

    blockAlunoField = false

    mensagensEnviadasAlunos: Aluno[] = []
    selectedAlunos: Aluno[] = []
    alunos: Aluno[] = []
    loadingAlunos = false

    professores: Professor[] = []
    loadingProfessores = false

    salaAulas: SalaAula[] = []
    loadingSalaAulas = false

    turmas: Turma[] = []
    loadingTurmas = false

    eventos: Evento[] = []
    loadingEventos = false

    roteiros: Roteiro[] = [];
    loadingRoteiros = false;

    feriados: Feriado[] = []
    loadingFeriados = false
    ano: number = new Date().getFullYear()

    invalidDates: Date[] = []

    @ViewChild('form') form!: NgForm
    @ViewChild('formDiv') formDiv!: HTMLFormElement
    @ViewChild('professor_Id') professor_Id!: NgModel

    SalaAulaId = SalaAulaId

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private confirmationService: ConfirmationService,
        private toastrService: ToastrService,
        private crypto: Crypto,
        private turmaService: TurmaService,
        private salaAulaService: SalaAulaService,
        private professorService: ProfessorService,
        private alunoService: AlunoService,
        private roteiroService: RoteiroService,
        private service: EventoService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private checklistService: ChecklistService,
        private accountService: AccountService,
        private calendarioUtils: CalendarioUtils,
        private nameFirstWordPipe: NameFirstWordPipe,
        private salaAulaPipe: SalaAulaPipe,
    ) {
        this.object.descricao = 'Aula 0'

        let feriados = this.service.feriados.subscribe(res => {
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
        });
        this.subscription.push(roteiros);

        if (this.roteiros.length == 0) {
            this.loadRoteiros();
        }

        let professores = this.professorService.list.subscribe(res => this.professores = res.filter(x => x.active))
        this.subscription.push(professores)

        if (this.professores.length == 0) {
            this.loadProfessores();
        }

        let salaAula = this.salaAulaService.list.subscribe(res => this.salaAulas = res.filter(x => x.active))
        this.subscription.push(salaAula)

        if (this.salaAulas.length == 0) {
            this.loadSalas();
        }

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res.filter(x => x.active))
        this.subscription.push(turmas)

        if (this.turmas.length == 0) {
            this.loadTurmas();
        }

        let alunos = this.alunoService.list.subscribe(res => this.alunos = res.filter(x => x.active))
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadAlunos();
        }

        let eventos = this.service.eventos.subscribe(res => this.eventos = res.filter(x => x.active))
        this.subscription.push(eventos)

        this.loadFeriados()
        this.verificaDisponibilidade()

        this.activatedRoute.params.subscribe(res => {
            if (res['aluno_Id']) {
                this.object.alunos = this.crypto.decrypt(res['aluno_Id'])
                this.blockAlunoField = true
            }
        })

        this.visible = true;
    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe())
    }

    visibleChange() {
        if (!this.visible) {
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute })
        }
    }

    loadProfessores() {
        this.loadingProfessores = true;
        lastValueFrom(this.professorService.getList())
            .then(res => this.loadingProfessores = false)
            .catch(res => this.loadingProfessores = false);
    }

    loadRoteiros() {
        this.loadingRoteiros = true;
        lastValueFrom(this.roteiroService.getList())
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
        lastValueFrom(this.service.getFeriados(this.ano))
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
                return range
            });

            let feriadosDate = this.feriados.map(x => moment(x.date).toDate());

            this.invalidDates = [... new Set(recessosDate.concat(feriadosDate))];
        }
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e)
    }

    dateNavigatorChanged(e: DatePickerYearChangeEvent) {
        if (e.year != this.ano) {
            this.ano = e.year ?? new Date().getFullYear()
            this.loadFeriados()
        }
    }


    enviarMensagem(aluno: Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno)
            return
        }

        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular)
        window.open(object.link, '_target')
        this.mensagemWhatsapp.copiarMensagem(object.mensagem)
    }

    async verificaDisponibilidade() {
        let valid = true

        if (!this.data || !this.horario) {
            return valid
        }

        this.loadingEventos = true
        let data = this.data
        data.setHours(this.horario.getHours(), this.horario.getMinutes())

        let request: CalendarioRequest = new CalendarioRequest()
        request.intervaloDe = data
        request.intervaloAte = moment(data).add(1, 'day').toDate()

        this.loadingEventos = true
        await lastValueFrom(this.service.getList(request))
            .then(res => (this.loadingEventos = false))
            .catch(res => (this.loadingEventos = false))

        this.validaProfessores()
        this.validaSalaAulas()
        this.validaAlunos()

        return valid
    }

    validaSalaAulas() {
        if (!this.data || !this.horario) {
            return
        }

        let data = this.data
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.salaAulas = validaSalaAulas(
            data,
            this.object.duracaoMinutos,
            this.salaAulas,
            this.eventos,
            undefined,
            undefined,
        )
    }

    validaProfessores() {
        if (!this.data || !this.horario) {
            return
        }

        let data = this.data
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.professores = validaProfessores(data, this.object.duracaoMinutos, this.professores, this.eventos, undefined, undefined)

        if (this.object.professor_Id) {
            let e: SelectChangeEvent = {
                value: this.object.professor_Id,
                originalEvent: { target: $('#professor_Id').get(0) as any } as any,
            }
            this.professorChanged(e, this.professor_Id)
        }
    }

    validaAlunos() {
        if (!this.data || !this.horario) {
            return
        }
        let data = this.data
        data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.alunos = validaAlunos(data, this.object.duracaoMinutos, this.alunos, this.eventos, undefined, undefined)
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        // this.validaProfessores();
        let item = this.professores.find(x => x.id == e.value) as Professor
        let mensagemErro: string | null = null

        if (item) {

            if (!item.disponivel && item.disponivelEvent) {
                let data = moment(item.disponivelEvent.data).format('HH[h]mm');
                let tipo = this.getTipo(item.disponivelEvent)
                mensagemErro = `Existe uma outra ${tipo} às ${data} no mesmo dia.`
            } 
            else if (!item.disponivel && !item.disponivelEvent && item.expedienteInicio && item.expedienteFim) {
                let inicio = moment(item.expedienteInicio).format('HH[h]mm');
                let fim = moment(item.expedienteFim).format('HH[h]mm');
                mensagemErro = `O expediente do educador é das ${inicio} às ${fim}`
            }
        }

        if (mensagemErro) {
            this.showError(
                'Educador indisponível', 
                mensagemErro, 
                e.originalEvent
            )
            model.control.setValue(undefined)
        }
        model.control.setErrors({ indisponivel: mensagemErro })
        model.control.updateValueAndValidity()
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        let salaAula = this.salaAulas.find(x => x.id == e.value) as SalaAula

        this.validaSalaAulas()

        let alunosComRestricaoMobilidade = this.selectedAlunos.filter(x => x.restricaoMobilidade)

        let item = this.salaAulas.find(x => x.id == e.value)
        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' })
            let data = moment(item.disponivelEvent.data).format('HH[h]mm')
            let tipo = this.getTipo(item.disponivelEvent)
            this.showError(
                'Sala Indisponível',
                `Essa sala está atribuída a outra ${tipo} no mesmo dia às <b>${data}</b>.`,
                e.originalEvent,
            )
            return
        } else if (alunosComRestricaoMobilidade.length && salaAula && salaAula.andar > 1) {
            model.control.setErrors({ restricaoMobilidade: 'Restrição de Mobilidade' })
            let alunos = alunosComRestricaoMobilidade.map(x => this.nameFirstWordPipe.transform(x.nome)).join(', ')
            let sala = this.salaAulaPipe.transform({ 
                sala_Id: salaAula.id,
                numeroSala: salaAula.numeroSala,
                andar: salaAula.andar,
            })
            this.showError(
                'Restrição de Mobilidade',
                `O(s) aluno(s) ${alunos}} tem restrição de mobilidade e não podem participar da aula zero na sala ${sala}.`,
                e.originalEvent,
            )
            return
        }

        model.control.setErrors({ indisponivel: null })
        model.control.updateValueAndValidity()
    }

    async alunoChanged(e: MultiSelectChangeEvent, model: NgModel) {

        this.validaAlunos()

        let selected = (e.originalEvent as any).selected

        // se o aluno foi selecionado, selected = false
        // se o aluno foi deselecionado, selected = true
        if (selected == false) {
            let aluno = (e.originalEvent as any).option as Aluno;
            let nome = this.nameFirstWordPipe.transform(aluno.nome);

            if (aluno && aluno.disponivel == false && aluno.disponivelEvent) {
                let tipo = this.getTipo(aluno.disponivelEvent);
                let data = moment(aluno.disponivelEvent.data).format('HH[h]mm');

                this.showError(
                    'Aluno Indisponível', 
                    `${nome} tem ${tipo} no mesmo dia às <b>${data}</b>.`, 
                    e.originalEvent
                );

                this.selectAlunoReject(aluno, model);
                return
            }

            aluno = await this.loadAluno(e.originalEvent, aluno, model) as Aluno;
            
            let mensagem = ''
            
            mensagem += await this.aulaZeroMensagem(aluno);
            mensagem += await this.restricaoMobilidadeMensagem(aluno);
            mensagem += await this.maisDeUmAlunoMensagem(aluno);

            if (mensagem) {
                this.confirmationService.confirm({
                    target: e.originalEvent.target as any,
                    header: 'Selecionar aluno',
                    message: `<p>Algumas observações são relevantes antes de continuar:</p>
                                ${mensagem}
                            `,
                    acceptLabel: `Continuar`,
                    rejectLabel: 'Não',
                    acceptIcon: 'pi pi-check',
                    rejectIcon: 'pi pi-times',
                    acceptButtonStyleClass: 'p-button-rounded',
                    rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                    accept: () => {
                    },
                    reject: () => {
                        this.selectAlunoReject(aluno, model);
                    }
                })
            }

            model.control.updateValueAndValidity()

        }
    }


    async aulaZeroMensagem(aluno: Aluno) {
        let mensagem = '';
        if (aluno.aulaZero_Id) {
            let aulaZero: Evento = await lastValueFrom(this.service.get(aluno.aulaZero_Id));
            let participacaoAulaZero = aulaZero.alunos.find(x => x.aluno_Id == aluno.id) as Evento_Participacao_Aluno;

            mensagem += '<br>'
            mensagem += `<p>Outra aula zero já foi cadastrada: </p>`;

            if (!aulaZero.active) {
                mensagem += `<p>${moment(aulaZero.data).format('DD/MM HH:mm')} - Cancelada (${aulaZero.observacao})</p>`;
            }
            else if (aulaZero.active && participacaoAulaZero.presente === false && participacaoAulaZero.active === true) {
                mensagem += `<p>${moment(aulaZero.data).format('DD/MM HH:mm')} - Faltou (${participacaoAulaZero.observacao})</p>`;
            }
            else {
                mensagem += `<p>${moment(aulaZero.data).format('DD/MM HH:mm')} - Ativa</p>`;
                mensagem += `<p class="text-sm text-red-500">(Ao continuar, essa aula zero que está ativa será cancelada automaticamente)</p>`;
            }
        }
        return mensagem;
    }

    async restricaoMobilidadeMensagem(aluno: Aluno) {

        let mensagem = '';

        let restricoes = aluno.restricoes.filter(x => x.active === true)
        let restricaoMobilidade = aluno.restricaoMobilidade

        if (restricoes.length > 0 || restricaoMobilidade) {
            mensagem += '<br>'
            mensagem += '<p class="font-bold">Restrições:</p> <ul class="my-2 pl-2">'

            if (restricaoMobilidade)
                mensagem += '<li>Restrição de mobilidade </li>'
            if (restricoes.length > 0)
                mensagem += restricoes.map(x => `<li>${x.descricao}</li>`)

            mensagem += `</ul>`
            mensagem += `<p class="text-sm text-red-500">Tem certeza que deseja ignorar as restrições e continuar?</p>`;
        }
        return mensagem;
    }

    async maisDeUmAlunoMensagem(aluno: Aluno) {

        let mensagem = '';

        if (this.selectedAlunos.length == 0) {
            mensagem += '<br>'
            mensagem += `<p>Nenhum aluno selecionado.</p>`;
        }
        else if (this.selectedAlunos.length > 1) {
            mensagem += '<br>'
            mensagem += `<p>${this.selectedAlunos.length} alunos selecionados</p>`;
            mensagem += `<p class="text-sm text-red-500">Tem certeza que deseja selecionar mais de um aluno?</p>`;
        }

        return mensagem;
    }

    selectAlunoReject(aluno: Aluno, model: NgModel) {
        let index = this.selectedAlunos.findIndex(x => x.id == aluno.id);
        if (index)
            this.selectedAlunos.splice(index, 1);

        model.control.setValue(this.selectedAlunos);
        model.control.updateValueAndValidity()
    }


    loadAluno(e: any, selectedAluno: Aluno, model: NgModel) {
        this.loadingAlunos = true
        this.loading = true
        return lastValueFrom(this.alunoService.get(selectedAluno.id))
            .then(res => {
                this.loadingAlunos = false
                this.loading = false
                return res;
            })
            .catch(res => {
                this.showError('Erro', `Não foi possível carregar dados do aluno ${selectedAluno.nome}`, e)
                this.loadingAlunos = false
                this.loading = false
                return undefined
            })
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    sendConfirmation(form: NgForm, e: any) {
        if (form.invalid) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }
        if (this.selectedAlunos.length == 0) {
            return this.showError('Não foi possível salvar', 'Preencha todos os dados corretamente para salvar', e)
        }

        // playAlert();

        this.object.alunos = this.selectedAlunos.map(x => x.id)

        this.object.data = new Date(this.data)
        this.object.data.setHours(this.horario.getHours(), this.horario.getMinutes(), 0)
        this.object.data = moment(this.data).format('YYYY-MM-DD[T]HH:mm') as any

        let mensagem = ``
        let nome = this.selectedAlunos[0].nome
        let data = moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')

        if (this.selectedAlunos.length == 1) {
            mensagem = `Tem certeza que deseja agendar a aula 0 do aluno ${nome} para o dia <span class="text-primary-500">${data}</span>?`
        } else if (this.selectedAlunos.length > 1) {
            mensagem = `Tem certeza que deseja agendar a aula 0 dos alunos ${this.selectedAlunos
                .map(x => x.nome)
                .join(', ')} para o dia <span class="text-primary-500">${data}</span>?`
        }

        this.confirmationService.confirm({
            target: e.target,
            header: 'Agendar aula 0',
            message: mensagem,
            acceptLabel: `Agendar aula 0`,
            acceptIcon: 'pi pi-check',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectLabel: 'Não',
            rejectIcon: 'pi pi-times',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.send(e)
            },
        })
    }

    async send(e: any) {
        this.loading = true

        this.object.data = this.data;

        await lastValueFrom(this.service.createAula0(this.object))
            .then(async res => {
                this.loading = false
                this.object = res.object
                this.service.calendarioReload.emit(res.object.id)
                this.markChecklistAsDone()
                // Refresh alunos list after event registration
                await lastValueFrom(this.alunoService.getList())
                this.toastrService.success('Aula 0 cadastrada com sucesso.', 'Agendamento finalizado')
                // playSuccess();

                if (this.selectedAlunos.length == 1 && this.selectedAlunos[0].celular) {
                    this.sendMensagemAluno(e, res.object)
                } else if (this.selectedAlunos.filter(x => x.celular).length > 0) {
                    this.sendMensagemAlunos()
                } else {
                    this.visible = false
                    this.visibleChange()
                }
            })
            .catch(res => {
                this.loading = false
                this.showError('Agendamento falhou', `Não foi possível agendar aula 0. <br> ${getError(res)}`, e)
            })
    }

    sendMensagemAluno(e: any, evento: any) {
        let aluno = this.selectedAlunos[0] as Aluno
        this.confirmationService.confirm({
            target: e.target,
            message: `Agendamento concluído com sucesso. <br> Clique para enviar mensagem de confirmação.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500 text-4xl',
            acceptLabel: `Enviar mensagem`,
            acceptButtonStyleClass: ' p-button-rounded p-button-success  px-3 mr-0',
            acceptIcon: 'pi pi-whatsapp',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Não enviar',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false
                this.visibleChange();

                this.enviarMensagemAgendamento(aluno)
            },
            reject: () => {
                this.visible = false
                this.visibleChange()
            },
        })
    }

    sendMensagemAlunos() {
        this.mensagensEnviadasAlunos = this.selectedAlunos.sort((x, y) => (x.nome < y.nome ? -1 : 1))
        this.confirmationService.confirm({
            key: 'enviarMensagem',
            message: `Agendamento concluído com sucesso. <br> Envie uma mensagem de confirmação para os alunos que participarão da aula.`,
            header: 'Enviar whatsapp',
            icon: 'pi pi-whatsapp text-green-500',
            acceptLabel: `Concluir`,
            acceptButtonStyleClass: 'p-button-rounded',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Não',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.visible = false
                this.visibleChange()
            },
        })
    }

    enviarMensagemAgendamento(aluno: Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno)
            return
        }
        let evento = MyMap(this.object, new Evento())
        evento.evento_Tipo_Id = EventoTipo.TurmaExtra
        let object = this.mensagemWhatsapp.enviarMensagemAgendamento(aluno.nome, aluno.celular, evento)
        window.open(object.link, '_target')
        this.mensagemWhatsapp.copiarMensagem(object.mensagem)
        let index = this.mensagensEnviadasAlunos.findIndex(x => x.id == aluno.id)
        if (index != -1) this.mensagensEnviadasAlunos.splice(index, 1)
    }

    markChecklistAsDone() {
        // Agendamento na aula 0
        if (this.selectedAlunos) {
            const id = 31
            this.selectedAlunos.forEach(async alunoItem => {

                const aluno = await lastValueFrom(this.alunoService.get(alunoItem.id));

                const alunoChecklist = aluno.alunoChecklist.find(x => x.checklist_Item_Id == id) as Aluno_CheckList_Item
                const professor = this.professores.find(x => x.id == this.object.professor_Id)?.nome;
                const data = moment(this.object.data).format('DD/MM/YY [às] HH[h]mm')
                const dataCadastro = moment(new Date()).format('DD/MM/YY [aproximadamente às] HH[h]mm')
                const account = this.accountService.accountValue?.name

                if (alunoChecklist && !alunoChecklist.finalizado) {
                    const mensagem = `Aula 0 agendada para o dia ${data} com o educador ${professor}.<br> Agendamento realizado por ${account} no dia ${dataCadastro}`
                    if (alunoChecklist && !alunoChecklist.finalizado) {
                        lastValueFrom(this.checklistService.markAsDone(alunoChecklist.id, mensagem))
                    }
                }
            })
        }
    }
}
