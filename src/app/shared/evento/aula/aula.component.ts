import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { ControlContainer, NgForm, NgModel } from "@angular/forms";
import { lastValueFrom, Subscription } from "rxjs";
import { Evento, EventoTipo } from "../../../models/evento.model";
import { Professor } from "../../../models/professor.model";
import { SalaAula, SalaAulaId } from "../../../models/sala-aula.model";
import { Roteiro } from "../../../models/roteiro.model";
import { MobileService, ScreenWidth } from "../../../utils/mobile";
import { Apostila, ApostilaTipo } from "../../../models/apostila.model";
import { InputNumber } from "primeng/inputnumber";
import { ConfirmationService } from "primeng/api";
import { CalendarioUtils, MensagemWhatsapp, showError } from "../../../utils";
import { ApostilaService } from "../../../services/apostila.service";
import { SelectChangeEvent } from "primeng/select";
import { Evento_Participacao_Aluno } from "../../../models/evento-participacao-aluno.model";
import moment from "moment"
import { Button } from "primeng/button";
import $ from 'jquery';
import { showAluno } from "../../../utils/show-aluno-dialog-service";
import { DialogService } from "primeng/dynamicdialog";

@Component({
    selector: 'app-aula',
    standalone: false,
    templateUrl: './aula.component.html',
    styleUrl: './aula.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    providers: [DialogService],
})
export class AulaComponent implements OnChanges, OnDestroy {
    subscription: Subscription[] = [];

    @Input() evento: Evento = new Evento();
    @Input() duracaoEvento = '';
    @Input() loadingChecklist = false;

    @Input() professores: Professor[] = [];
    @Input() loadingProfessores = false;

    @Input() salaAulas: SalaAula[] = [];
    @Input() loadingSalaAulas = false;

    apostilas: Apostila[] = [];
    loadingApostila = false;

    roteiro?: Roteiro;

    @Output() onProfessorChanged = new EventEmitter<Professor>();
    @Output() onSalaChanged = new EventEmitter<SalaAula>();
    @Output() onWidthChanged = new EventEmitter<string>();

    onSave = new EventEmitter<Evento>();

    ScreenWidth = ScreenWidth;
    screen = ScreenWidth.lg;
    EventoTipo = EventoTipo;
    SalaAulaId = SalaAulaId;

    @ViewChildren('presencaButton') presencaButton!: QueryList<Button>;
    @ViewChildren('apostilaAbacoInput') apostilaAbacoInput!: QueryList<InputNumber>;
    @ViewChildren('apostilaAHInput') apostilaAHInput!: QueryList<InputNumber>;

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private apostilaService: ApostilaService,
        private mobileService: MobileService,
        private calendarioUtils: CalendarioUtils,
        private dialogService: DialogService
        
    ) {
        let screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        let apostilas = this.apostilaService.listApostila.subscribe(res => this.apostilas = res);
        this.subscription.push(apostilas);

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue
            this.setApostilasAlunos()
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

        this.onWidthChanged.emit('1200px')
    }

    ngOnDestroy(): void {
        this.subscription.forEach((item) => item.unsubscribe())
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e)
    }

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        let item = this.professores.find((x) => x.id == e.value)
        this.onProfessorChanged.emit(item)

        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Educador indisponível' })
            let horario = moment(item.disponivelEvent.data).format('HH[h]mm');
            this.showError('Educador Indisponível', `Esse educador está atribuído a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${horario}</b>.`, e.originalEvent);
            return;
        } else {
            model.control.setErrors({ indisponivel: null })
        }
        model.control.updateValueAndValidity()
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        let item = this.salaAulas.find((x) => x.id == e.value)
        this.onSalaChanged.emit(item)

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
        this.evento.alunos.forEach(aluno => {

        })
        // this.alunoPopover.forEach(async component => {
        //     let aluno = await component.loadAluno();
        //     if (aluno) {
        //         let restricaoMobilidade = aluno.restricaoMobilidade;
        //         let restricoes = aluno.restricoes.filter(x => x.active);

        //         if (restricaoMobilidade || restricoes.length > 0) {
        //             restricoesMessage += `<br> - ${this.nameFirstWordPipe.transform(aluno.nome)}`
        //             if (restricaoMobilidade) {
        //                 restricoesMessage += `<pre>Restrição de mobilidade: Sim</pre>`
        //             }
        //             if (restricoes.length > 0) {
        //                 restricoesMessage += `<pre>Outras Restrições: ${restricoes.map(x => x.descricao).join(', ')}</pre>`
        //             }
        //         }
        //     }
        // });

        if (restricoesMessage) {
            this.showError('Atenção', `Alguns alunos possuem restrições. <br>${restricoesMessage} <br> Tem certeza que deseja continuar?`, e);
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

    enviarMensagemFalta(aluno: Evento_Participacao_Aluno, e: any) {
        this.mensagemWhatsapp.enviarMensagemFalta(this.evento, aluno, e);
    }

    presente(item: Evento_Participacao_Aluno, status: any /*AlunoParticipacaoStatusComponent*/) {
        item.presente = !item.presente;
        // status.update(this.evento, item)
    }

    async setApostilasAlunos() {
        if (this.apostilas.length == 0) {
            this.loadingApostila = true
            await lastValueFrom(this.apostilaService.getApostilas())
                .then(res => {
                    this.loadingApostila = false
                    this.apostilas = res;
                })
                .catch(res => this.loadingApostila = false)
        }

        this.evento.alunos.forEach(aluno => {
            aluno.apostilasAbacoList = this.apostilas.filter(apostila => {
                const ehAbaco = apostila.apostila_Tipo_Id == ApostilaTipo.Abaco;
                const temKit = aluno.apostila_Kit_Id;
                const temApostilaNoDia = aluno.apostila_Abaco_Id;
                const ehKitCompativel = !temKit || aluno.apostila_Kit_Id == apostila.apostila_Kit_Id;
                const ehApostilaDoDia = !temApostilaNoDia || aluno.apostila_Abaco_Id == apostila.id;
                const condicao = ehAbaco && (ehKitCompativel || ehApostilaDoDia);
                return condicao
            });

            aluno.apostilasAHList = this.apostilas.filter(apostila => {
                const ehAH = apostila.apostila_Tipo_Id == ApostilaTipo.AH;
                const temKit = aluno.apostila_Kit_Id;
                const temApostilaNoDia = aluno.apostila_AH_Id;
                const ehKitCompativel = !temKit || aluno.apostila_Kit_Id == apostila.apostila_Kit_Id;
                const ehApostilaDoDia = !temApostilaNoDia || aluno.apostila_Abaco_Id == apostila.id;
                const condicao = ehAH && (ehKitCompativel || ehApostilaDoDia)
                return condicao;
            });

            aluno.numeroPaginaAbaco = aluno.numeroPaginaAbaco ?? 0;
            aluno.numeroPaginaAH = aluno.numeroPaginaAH ?? 0;

            if (aluno.apostila_Abaco_Id) {
                aluno.apostilaAbacoObject = this.apostilas.find(x => x.id == aluno.apostila_Abaco_Id) as Apostila;
            } else {
                aluno.apostilaAbacoObject = aluno.apostilasAbacoList[0];
                aluno.apostila_Abaco_Id = aluno.apostilaAbacoObject.id;
                aluno.apostila_Abaco = aluno.apostilaAbacoObject.nome;
            }

            if (aluno.apostila_AH_Id) {
                aluno.apostilaAHObject = this.apostilas.find(x => x.id == aluno.apostila_AH_Id) as Apostila;
            }
            else {
                aluno.apostilaAHObject = aluno.apostilasAHList[0];
                aluno.apostila_AH_Id = aluno.apostilaAHObject.id;
                aluno.apostila_AH = aluno.apostilaAHObject.nome;
            }
        })
    }

    clonedRow: { [aluno_Id: number]: Evento_Participacao_Aluno } = {}

    inputFocus(e: any, item: Evento_Participacao_Aluno) {
        this.clonedRow[item.aluno_Id as number] = { ...item }
    }

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
                message: `Tem certeza que deseja regredir a apostila desse aluno?`,
                header: 'Regredir apostila?',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptLabel: 'Sim',
                rejectLabel: 'Não',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    // Seta nova apostila e página e máximo permitido
                    item.numeroPaginaAbaco = 1
                    item.apostila_Abaco_Id = newApostila.id;
                    item.apostila_Abaco = newApostila.nome;
                },
                reject: () => {
                    // Seta antiga apostila e página e máximo permitido
                    item.apostila_Abaco_Id = oldApostila.id;
                    item.apostila_Abaco = oldApostila.nome;
                },
            })
        } else {
            // Seta nova apostila e página e máximo permitido
            item.apostila_Abaco = newApostila.nome;
            item.apostila_Abaco_Id = newApostila.id;
            item.numeroPaginaAbaco = 1;
        }
    }

    numeroPaginaAbacoChange(item: Evento_Participacao_Aluno, e: any, model: NgModel) {
        let prev = this.clonedRow[item.aluno_Id];
        let current = item;


        if (current.numeroPaginaAbaco == null) {
            model.control.setErrors({ required: true });
            return this.showError('Inserir página', "Insira um valor para a página!", e);
        }
        else if (current.numeroPaginaAbaco < prev.numeroPaginaAbaco && prev.apostila_Abaco_Id == current.apostila_Abaco_Id) {
            this.confirmationService.confirm({
                target: e.target,
                message: `O aluno está regredindo a página da apostila "${current.apostila_Abaco}"?`,
                header: 'Regredir página?',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptLabel: `Sim, regredir página`,
                rejectLabel: 'Não',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                reject: () => {
                    item.numeroPaginaAbaco = prev.numeroPaginaAbaco;
                },
            })
        }
    }

    //
    // AH
    //

    apostilaAHClick(item: Evento_Participacao_Aluno) {
        this.clonedRow[item.aluno_Id as number] = { ...item };
    }

    apostilaAHChange(item: Evento_Participacao_Aluno, e: SelectChangeEvent) {

        let newApostila = this.apostilas.find(x => x.id == item.apostila_AH_Id) as Apostila;
        let oldApostila = this.apostilas.find(x => x.id == this.clonedRow[item.aluno_Id].apostila_AH_Id) as Apostila;

        if (newApostila.id != oldApostila.id && newApostila.ordem < oldApostila.ordem) {
            this.confirmationService.confirm({
                target: e.originalEvent.target as EventTarget,
                message: `Tem certeza que deseja regredir a apostila desse aluno?`,
                header: 'Regredir apostila?',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptLabel: 'Sim',
                rejectLabel: 'Não',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                accept: async () => {
                    // Seta nova apostila e página e máximo permitido
                    item.numeroPaginaAH = 1;
                    item.apostila_AH_Id = newApostila.id;
                    item.apostila_AH = newApostila.nome;
                },
                reject: () => {
                    // Seta antiga apostila e página e máximo permitido
                    item.apostila_AH_Id = oldApostila.id;
                    item.apostila_AH = oldApostila.nome;
                },
            })
        } else {
            // Seta nova apostila e página e máximo permitido
            item.apostila_AH = newApostila.nome;
            item.apostila_AH_Id = newApostila.id;
            item.numeroPaginaAH = 1;
        }
    }

    numeroPaginaAHChange(item: Evento_Participacao_Aluno, e: any, model: NgModel) {
        let prev = this.clonedRow[item.aluno_Id];
        let current = item;

        if (current.numeroPaginaAH == null) {
            model.control.setErrors({ required: true });
            return this.showError('Inserir página', "Insira um valor para a página!", e);
        }
        if (current.numeroPaginaAH < prev.numeroPaginaAH && prev.apostila_AH_Id == current.apostila_AH_Id) {
            this.confirmationService.confirm({
                target: e.target,
                message: `O aluno está regredindo a página da apostila "${current.apostila_AH}"?`,
                header: 'Regredir página?',
                acceptLabel: `Sim, regredir página`,
                rejectLabel: 'Não',
                acceptIcon: 'pi pi-check',
                rejectIcon: 'pi pi-times',
                acceptButtonStyleClass: 'p-button-rounded',
                rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
                reject: () => {
                    item.numeroPaginaAH = prev.numeroPaginaAH;
                },
            })
        }
    }

    presencaPrev(index: number, e: any) {
        let prev = index - 1;

        if (index <= 0) {
            prev = this.presencaButton.length - 1;
        }

        let element = this.presencaButton.get(prev);
        let button = $(`p-button[${element?.attrSelector}]`).find('button')

        button.trigger('focus');
    }

    presencaNext(index: number, e: any) {
        let next = index + 1;
        if (index >= this.presencaButton.length - 1) {
            next = 0;
        }
        let element = this.presencaButton.get(next);
        let button = $(`p-button[${element?.attrSelector}]`).find('button')

        button.trigger('focus');
    }


    apostilaAbacoInputNumberNext(index: number, inputNumber: InputNumber) {
        let next = index + 1;
        let element = this.apostilaAbacoInput.get(next)
        element?.input.nativeElement.focus();
    }

    apostilaAHInputNumberNext(index: number, inputNumber: InputNumber) {
        let next = index + 1;
        let element = this.apostilaAHInput.get(next)
        element?.input.nativeElement.focus();
    }

    apostilaAbacoInputNumberPrev(index: number, inputNumber: InputNumber) {
        let prev = index - 1;
        let element = this.apostilaAbacoInput.get(prev)
        element?.input.nativeElement.focus();
    }

    apostilaAHInputNumberPrev(index: number, inputNumber: InputNumber) {
        let prev = index - 1;
        let element = this.apostilaAbacoInput.get(prev)
        element?.input.nativeElement.focus();
    }

    showAluno(participacao: Evento_Participacao_Aluno) {
        showAluno(participacao.aluno_Id, this.dialogService);
    }

}
