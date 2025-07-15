import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core'
import { Evento, EventoTipo } from '../../../../../models/evento.model'
import { lastValueFrom, Subscription } from 'rxjs'
import { Professor } from '../../../../../models/professor.model'
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model'
import { ConfirmationService } from 'primeng/api'
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp'
import { SelectChangeEvent } from 'primeng/select'
import { ControlContainer, NgForm, NgModel } from '@angular/forms'
import moment from 'moment'
import { Evento_Participacao_Aluno } from '../../../../../models/evento-participacao-aluno.model'
import { Apostila, ApostilaTipo } from '../../../../../models/apostila.model'
import { ApostilaService } from '../../../../../services/apostila.service'
import { Roteiro } from '../../../../../models/roteiro.model'
import { MobileService, showError } from '../../../../../utils'
import { ScreenWidth } from '../../../../../utils/mobile'
import { Aluno } from '../../../../../models/alunos.model'
import { AlunoService } from '../../../../../services/alunos.service'
import { CalendarioUtils } from '../../../../../utils/calendario-utils'
import { EventoService } from '../../../../../services/evento.service'
import { AlunoPopoverComponent } from '../../../../../shared/aluno/aluno-popover/aluno-popover.component'
import { NameFirstWordPipe } from '../../../../../utils/name-first-word.pipe'

@Component({
    selector: 'app-editar-aula',
    standalone: false,
    templateUrl: './editar-aula.component.html',
    styleUrl: './editar-aula.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class EditarAulaComponent implements OnChanges, OnDestroy {
    subscription: Subscription[] = []

    @Input() evento: Evento = new Evento()
    @Input() duracaoEvento = ''
    @Input() loadingChecklist = false

    @Input() professores: Professor[] = []
    @Input() loadingProfessores = false

    @Input() salaAulas: SalaAula[] = []
    @Input() loadingSalaAulas = false

    roteiro?: Roteiro
    @Input() roteiros: Roteiro[] = []
    @Input() loadingRoteiros = false

    @Output() validaProfessor = new EventEmitter<Professor>()
    @Output() validaSala = new EventEmitter<SalaAula>()
    @Output() width = new EventEmitter<string>()
    onSave = new EventEmitter<Evento>()

    perfilCognitivo = ''
    EventoTipo = EventoTipo
    SalaAulaId = SalaAulaId

    apostilas: Apostila[] = []
    loadingApostila = false

    alunos: Aluno[] = []
    loadingAluno = false

    ScreenWidth = ScreenWidth
    screen = ScreenWidth.lg


    @ViewChildren('alunoPopover') alunoPopover!: QueryList<AlunoPopoverComponent>;

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private apostilaService: ApostilaService,
        private mobileService: MobileService,
        private alunoService: AlunoService,
        private service: EventoService,
        private calendarioUtils: CalendarioUtils,
        private nameFirstWordPipe: NameFirstWordPipe,
    ) {
        let screen = this.mobileService.get().subscribe((res) => (this.screen = res));
        this.subscription.push(screen);

        let apostilas = this.apostilaService.listApostila.subscribe(
            (res) => (this.apostilas = res),
        )
        this.subscription.push(apostilas)

        let alunos = this.alunoService.list.subscribe((res) => (this.alunos = res))
        this.subscription.push(alunos)

        if (this.alunos.length == 0) {
            this.loadingAluno = true
            lastValueFrom(this.alunoService.getList())
                .then((res) => {
                    this.alunos = res
                    this.loadingAluno = false
                })
                .catch((res) => (this.loadingAluno = false))
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue

            if (!this.evento.finalizado) {
                this.evento.alunos.filter(x => x.active).forEach(item => item.presente = true)
            }
            this.setApostilasAlunos()
            this.setRoteiro();

            if (this.evento.perfilCognitivo.length > 0) {
                this.perfilCognitivo = this.evento.perfilCognitivo[0].nome
            }

        }

        if (changes['duracaoEvento'])
            this.duracaoEvento = changes['duracaoEvento'].currentValue

        if (changes['professores'])
            this.professores = changes['professores'].currentValue

        if (changes['loadingProfessores'])
            this.loadingProfessores = changes['loadingProfessores'].currentValue

        if (changes['salaAulas']) 
            this.salaAulas = changes['salaAulas'].currentValue

        if (changes['loadingSalaAulas'])
            this.loadingSalaAulas = changes['loadingSalaAulas'].currentValue

        if (changes['roteiros']) {
            this.roteiros = changes['roteiros'].currentValue
            this.setRoteiro()
        }
        if (changes['loadingRoteiros'])
            this.loadingRoteiros = changes['loadingRoteiros'].currentValue

        this.width.emit('1200px')
    }

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e)
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        let item = this.professores.find((x) => x.id == e.value)
        this.validaProfessor.emit(item)

        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Professor indisponível' })
            this.showError(
                'Professor Indisponível',
                `Esse professor está atribuído a outra ${this.getTipo(
                    item.disponivelEvent,
                )} no mesmo dia às <b>${moment(item.disponivelEvent.data).format(
                    'HH[h]mm',
                )}</b>.`,
                e.originalEvent,
            )
            return
        } else {
            model.control.setErrors({ indisponivel: null })
        }
        model.control.updateValueAndValidity()
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        let item = this.salaAulas.find((x) => x.id == e.value)
        this.validaSala.emit(item)

        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuída a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            model.control.updateValueAndValidity();
            return
        } else {
            model.control.setErrors({ indisponivel: null });
            model.control.updateValueAndValidity();
        }

        let restricoesMessage = '';
        this.alunoPopover.forEach(async component => {
            let aluno = await component.loadAluno();
            if (aluno) {
                let restricaoMobilidade = aluno.restricaoMobilidade;
                let restricoes = aluno.restricoes.filter(x => x.active);

                if (restricaoMobilidade || restricoes.length > 0) {
                    restricoesMessage += `\n - ${this.nameFirstWordPipe.transform(aluno.nome)}`
                    if (restricaoMobilidade) {
                        restricoesMessage += `<pre>Restrição de mobilidade: Sim</pre>`
                    }
                    if (restricoes.length > 0) {
                        restricoesMessage += `<pre>Outras Restrições: ${restricoes.map(x => x.descricao).join(', ')}</pre>`
                    }
                }
            }
        });

        if (restricoesMessage) {
            this.showError('Atenção', `Alguns alunos possuem restrições. \n${restricoesMessage} \n Tem certeza que deseja continuar?`, e);
        }

    }



    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    enviarMensagem(aluno: Evento_Participacao_Aluno) {
        if (!aluno.celular) {
            this.showError('Erro', 'Nenhum celular cadastrado', aluno);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.aluno, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    inputFocus(e: any) {
        e.target.select()
    }

    presente(item: Evento_Participacao_Aluno) {
        item.presente = !item.presente;
    }

    enviarMensagemFalta(aluno: Evento_Participacao_Aluno, e: any) {
        this.mensagemWhatsapp.enviarMensagemFalta(this.evento, aluno, e);
    }

    async setApostilasAlunos() {
        if (this.apostilas.length == 0) {
            this.loadingApostila = true
            await lastValueFrom(this.apostilaService.getApostilas())
                .then((res) => {
                    this.loadingApostila = false
                    this.apostilas = res
                })
                .catch((res) => (this.loadingApostila = false))
        }

        this.evento.alunos.forEach((aluno) => {
            if (aluno.apostila_Abaco_Id) {
                aluno.apostilaAbacoObject = this.apostilas.find((x) => x.id == aluno.apostila_Abaco_Id) as Apostila;
                aluno.apostilasAbacoList = this.apostilas.filter((x) => x.apostila_Kit_Id == aluno.apostila_Kit_Id && x.apostila_Tipo_Id == ApostilaTipo.Abaco);
                aluno.numeroPaginaAbaco = aluno.numeroPaginaAbaco ?? 0;
            }

            if (aluno.apostila_AH_Id) {
                aluno.apostilaAHObject = this.apostilas.find((x) => x.id == aluno.apostila_AH_Id) as Apostila;
                aluno.apostilasAHList = this.apostilas.filter((x) => x.apostila_Kit_Id == aluno.apostila_Kit_Id && x.apostila_Tipo_Id == ApostilaTipo.AH);
                aluno.numeroPaginaAH = aluno.numeroPaginaAH ?? 0;
            }
        })
    }

    clonedRow: { [aluno_Id: number]: Evento_Participacao_Aluno } = {}


    //
    // Abaco
    //

    apostilaAbacoClick(item: Evento_Participacao_Aluno) {
        this.clonedRow[item.aluno_Id as number] = { ...item }
    }

    apostilaAbacoChange(item: Evento_Participacao_Aluno, e: SelectChangeEvent) {
        let newApostila = item.apostilaAbacoObject as Apostila
        let oldApostila = this.clonedRow[item.aluno_Id].apostilaAbacoObject as Apostila

        if (
            newApostila.id != oldApostila.id &&
            newApostila.ordem < oldApostila.ordem
        ) {
            this.confirmationService.confirm({
                target: e.originalEvent.target as EventTarget,
                message: `Tem certeza que deseja regredir a apostila desse aluno?.`,
                header: 'Regredir apostila?',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Sim',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Não',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    // Seta nova apostila e página e máximo permitido
                    item.numeroPaginaAbaco = 1
                    item.apostila_Abaco_Id = newApostila.id
                    item.apostila_Abaco = newApostila.nome
                },
                reject: () => {
                    // Seta antiga apostila e página e máximo permitido
                    item.apostila_Abaco_Id = oldApostila.id
                    item.apostila_Abaco = oldApostila.nome
                },
            })
        } else {
            // Seta nova apostila e página e máximo permitido
            item.apostila_Abaco = newApostila.nome
            item.apostila_Abaco_Id = newApostila.id
            item.numeroPaginaAbaco = 1
        }
    }

    numeroPaginaAbacoChange(item: Evento_Participacao_Aluno, e: any) {
        let prev = this.clonedRow[item.aluno_Id]
        let current = item


        if (item.presente === true && item.numeroPaginaAbaco === 0) {
            item.numeroPaginaAbaco = 1;
            return this.showError('OPS!', 'Se o aluno esteve presente, ele deve avançar pelo menos na página 1, certo?!', e);
        }

        if (current.numeroPaginaAbaco <= prev.numeroPaginaAbaco && prev.apostila_Abaco_Id == current.apostila_Abaco_Id) {
            this.confirmationService.confirm({
                target: e.target,
                message: `O aluno está regredindo a página da apostila "${current.apostila_Abaco}"?`,
                header: 'Regredir página?',
                acceptLabel: `Sim, regredir página`,
                acceptButtonStyleClass: 'p-button-rounded',
                rejectLabel: 'Não, foi um engano',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                reject: () => {
                    item.numeroPaginaAbaco = prev.numeroPaginaAbaco
                },
            })
        }
    }

    //
    // AH
    //

    apostilaAHClick(item: Evento_Participacao_Aluno) {
        this.clonedRow[item.aluno_Id as number] = { ...item }
    }

    apostilaAHChange(item: Evento_Participacao_Aluno, e: SelectChangeEvent) {

        let newApostila = this.apostilas.find(x => x.id == item.apostila_AH_Id) as Apostila;
        let oldApostila = this.apostilas.find(x => x.id == this.clonedRow[item.aluno_Id].apostila_AH_Id) as Apostila;

        if (newApostila.id != oldApostila.id && newApostila.ordem < oldApostila.ordem) {
            this.confirmationService.confirm({
                target: e.originalEvent.target as EventTarget,
                message: `Tem certeza que deseja regredir a apostila desse aluno?.`,
                header: 'Regredir apostila?',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Sim',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Não',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    // Seta nova apostila e página e máximo permitido
                    item.numeroPaginaAH = 1
                    item.apostila_AH_Id = newApostila.id
                    item.apostila_AH = newApostila.nome
                },
                reject: () => {
                    // Seta antiga apostila e página e máximo permitido
                    item.apostila_AH_Id = oldApostila.id
                    item.apostila_AH = oldApostila.nome
                },
            })
        } else {
            // Seta nova apostila e página e máximo permitido
            item.apostila_AH = newApostila.nome
            item.apostila_AH_Id = newApostila.id
            item.numeroPaginaAH = 1
        }
    }

    numeroPaginaAHChange(item: Evento_Participacao_Aluno, e: any) {
        let prev = this.clonedRow[item.aluno_Id]
        let current = item

        if (item.presente === true && item.numeroPaginaAbaco === 0) {
            item.numeroPaginaAbaco = 1;
            return this.showError('OPS!', 'Se o aluno esteve presente, ele deve avançar pelo menos na página 1, certo?!', e);
        }
        if (current.numeroPaginaAH <= prev.numeroPaginaAH && prev.apostila_AH_Id == current.apostila_AH_Id) {
            this.confirmationService.confirm({
                target: e.target,
                message: `O aluno está regredindo a página da apostila "${current.apostila_AH}"?`,
                header: 'Regredir página?',
                acceptLabel: `Sim, regredir página`,
                acceptButtonStyleClass: 'p-button-rounded',
                rejectLabel: 'Não, foi um engano',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                reject: () => {
                    item.numeroPaginaAH = prev.numeroPaginaAH
                },
            })
        }
    }

    setRoteiro() {
        if (this.roteiros.length && this.evento) {
            let roteiro: Roteiro | undefined
            if (this.evento.roteiro_Id) {
                roteiro = this.roteiros.find((x) => x.id == this.evento.roteiro_Id)
                this.evento.roteiro_Id = roteiro?.id
            } else {
                roteiro = this.roteiros.find((x) => moment(this.evento.data).isBetween(x.dataInicio, x.dataFim))
            }
            this.roteiro = roteiro
        }
    }
    showDivVaziaEnviarMensagemFalta(item: Evento_Participacao_Aluno) {
        return this.evento.alunos.filter(x => x.presente === false).length > 0 && item.presente !== false
    }

    get roteiroEvento(): Roteiro | undefined {
        if (!this.evento?.roteiro_Id) return undefined;

        return this.roteiros.find(r => r.id === this.evento.roteiro_Id);
    }

    get roteiroTextColor(): string {
        const bg = this.roteiroEvento?.corLegenda || '#ffffff';
        // Luminance-based check
        const r = parseInt(bg.slice(1, 3), 16);
        const g = parseInt(bg.slice(3, 5), 16);
        const b = parseInt(bg.slice(5, 7), 16);
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        return luminance > 150 ? '#000' : '#fff';
    }
}
