import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { Evento, EventoTipo } from '../../../../../models/evento.model';
import { lastValueFrom, Subscription } from 'rxjs';
import { Professor } from '../../../../../models/professor.model';
import { SalaAula, SalaAulaId } from '../../../../../models/sala-aula.model';
import { ConfirmationService } from 'primeng/api';
import { MensagemWhatsapp } from '../../../../../utils/mensagem-whatsapp';
import { Select, SelectChangeEvent } from 'primeng/select';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import moment from 'moment';
import { Evento_Participacao_Aluno } from '../../../../../models/evento-participacao-aluno.model';
import { Apostila, ApostilaTipo } from '../../../../../models/apostila.model';
import { ApostilaService } from '../../../../../services/apostila.service';
import { Roteiro } from '../../../../../models/roteiro.model';
import { MobileService } from '../../../../../utils';
import { ScreenWidth } from '../../../../../utils/mobile';
import { Aluno } from '../../../../../models/alunos.model';
import { AlunoService } from '../../../../../services/alunos.service';
import $ from 'jquery';

@Component({
    selector: 'app-editar-aula',
    standalone: false,
    templateUrl: './editar-aula.component.html',
    styleUrl: './editar-aula.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class EditarAulaComponent implements OnChanges, OnDestroy {
    subscription: Subscription[] = [];

    @Input() evento: Evento = new Evento;
    @Input() duracaoEvento = '';
    @Input() loadingChecklist = false;
    @Input() isChamadaPage = false;

    @Input() professores: Professor[] = [];
    @Input() loadingProfessores = false;

    @Input() salaAulas: SalaAula[] = [];
    @Input() loadingSalaAulas = false;

    @Input() roteiros: Roteiro[] = [];
    @Input() loadingRoteiros = false;

    @Output() validaProfessor = new EventEmitter<Professor>();
    @Output() validaSala = new EventEmitter<SalaAula>();
    @Output() width = new EventEmitter<string>();
    onSave = new EventEmitter<Evento>();


    perfilCognitivo = '';
    EventoTipo = EventoTipo;
    SalaAulaId = SalaAulaId;
    
    apostilaAbacoAluno: Apostila[] = [];
    apostilaAHAluno: Apostila[] = [];
    apostilas: Apostila[] = [];
    loadingApostila = false;
    @ViewChildren('select') apostilasDropdown!: QueryList<Select>; 
    
    alunos: Aluno[] = [];
    loadingAluno = false;

    ScreenWidth = ScreenWidth;
    screen = ScreenWidth.lg;

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private apostilaService: ApostilaService,
        private mobileService: MobileService,
        private alunoService: AlunoService
    ) {

        var screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        var apostilas = this.apostilaService.listApostila.subscribe(res => this.apostilas = res);
        this.subscription.push(apostilas);

        if (this.apostilas.length == 0) {
            this.loadingApostila = true;
            lastValueFrom(this.apostilaService.getApostilas())
                .then(res => this.loadingApostila = false)
                .catch(res => this.loadingApostila = false)
        }

        var alunos = this.alunoService.list.subscribe(res => this.alunos = res);
        this.subscription.push(alunos);

        if (this.alunos.length == 0) {
            this.loadingAluno = true;
            lastValueFrom(this.alunoService.getList())
                .then(res => {
                    this.alunos = res;
                    this.loadingAluno = false;
                })
                .catch(res => this.loadingAluno = false)
        }

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            if (this.evento.perfilCognitivo.length > 0) {
                this.perfilCognitivo = this.evento.perfilCognitivo[0].nome;
            }
        }

        if (changes['duracaoEvento']) this.duracaoEvento = changes['duracaoEvento'].currentValue;
        if (changes['isChamadaPage']) this.isChamadaPage = changes['isChamadaPage'].currentValue;

        if (changes['professores']) this.professores = changes['professores'].currentValue;
        if (changes['loadingProfessores']) this.loadingProfessores = changes['loadingProfessores'].currentValue;

        if (changes['salaAulas']) this.salaAulas = changes['salaAulas'].currentValue;
        if (changes['loadingSalaAulas']) this.loadingSalaAulas = changes['loadingSalaAulas'].currentValue;

        if (changes['roteiros']) this.roteiros = changes['roteiros'].currentValue;
        if (changes['loadingRoteiros']) this.loadingRoteiros = changes['loadingRoteiros'].currentValue;

        this.width.emit('1200px');
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
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

    professorChanged(e: SelectChangeEvent, model: NgModel) {
        var item = this.professores.find(x => x.id == e.value);
        this.validaProfessor.emit(item);

        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Professor indisponível' });
            this.showError('Professor Indisponível', `Esse professor está atribuído a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        } else {
            model.control.setErrors({ indisponivel: null });
        }
        model.control.updateValueAndValidity();
    }

    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        var item = this.salaAulas.find(x => x.id == e.value);
        this.validaSala.emit(item);

        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            this.showError('Sala Indisponível', `Essa sala está atribuída a outra ${this.getTipo(item.disponivelEvent)} no mesmo dia às <b>${moment(item.disponivelEvent.data).format('HH[h]mm')}</b>.`, e.originalEvent);
            return;
        } else {
            model.control.setErrors({ indisponivel: null });
        }
        model.control.updateValueAndValidity();
    }

    getTipo(e: Evento) {
        return this.mensagemWhatsapp.getEventoTipo(e)
    }

    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular!)
    }

    
    loadApostilasSelect(select: Select, participacao: Evento_Participacao_Aluno) {
        var tipo = select.inputId!.toLowerCase().includes('apostila_abaco_id') ? ApostilaTipo.Abaco : ApostilaTipo.AH;
        var apostilas = this.apostilas.filter(x => x.apostila_Kit_Id == participacao.apostila_Kit_Id && x.apostila_Tipo_Id == tipo);
        select.options = apostilas.sort((x,y) => x.ordem - y.ordem);
        select.updateModel(tipo == ApostilaTipo.Abaco ? participacao.apostila_Abaco_Id : participacao.apostila_AH_Id)

        select.loading = false;
    }
    
    loadApostila(aluno: Evento_Participacao_Aluno) {
        this.loadingApostila = true;
        this.apostilaAbacoAluno = this.apostilas.filter(x => x.apostila_Kit_Id == aluno.apostila_Kit_Id && x.apostila_Tipo_Id == ApostilaTipo.Abaco);
        this.apostilaAHAluno = this.apostilas.filter(x => x.apostila_Kit_Id == aluno.apostila_Kit_Id && x.apostila_Tipo_Id == ApostilaTipo.AH);

        this.apostilaAHAluno.sort((x, y) => x.ordem - y.ordem)
        this.apostilaAbacoAluno.sort((x, y) => x.ordem - y.ordem)

        this.loadingApostila = false;
    }


    inputFocus(e: any) {
        e.target.select()
    }
    presente(item: Evento_Participacao_Aluno, e: any) {
        item.presente = true;
    }

    faltou(item: Evento_Participacao_Aluno, e: any) {
        item.presente = false;
        if (item.celular) {
            var nome = item.aluno.split(' ')[0];
            this.confirmationService.confirm({
                target: e.targer,
                message: `O aluno ${nome} faltou? <br> Envie uma mensagem para saber o que aconteceu.`,
                header: 'Enviar whatsapp',
                icon: 'pi pi-whatsapp text-green-500 text-4xl',
                acceptLabel: `Enviar mensagem`,
                acceptButtonStyleClass: 'p-button-sm p-button-rounded p-button-success  px-3 mr-0',
                acceptIcon: 'pi pi-whatsapp',
                rejectLabel: 'Não enviar',
                rejectButtonStyleClass: 'p-button-text p-button-sm',
                accept: () => {
                    var url = this.mensagemWhatsapp.enviarMensagemFalta(item.aluno, item.celular!, this.evento);
                    window.open(url, '_blank')
                },
            });
        }
    }

    presenteClick(item: Evento_Participacao_Aluno, e: any) {
        item.presente = !item.presente;

        if (item.presente == false && item.celular) {
            var nome = item.aluno.split(' ')[0];
            this.confirmationService.confirm({
                target: e.target,
                message: `O aluno ${nome} faltou? <br> Envie uma mensagem para saber o que aconteceu.`,
                header: 'Enviar whatsapp',
                icon: 'pi pi-whatsapp text-green-500 text-4xl',
                acceptLabel: `Enviar mensagem`,
                acceptButtonStyleClass: 'p-button-sm p-button-rounded p-button-success  px-3 mr-0',
                acceptIcon: 'pi pi-whatsapp',
                rejectLabel: 'Não enviar',
                rejectButtonStyleClass: 'p-button-text p-button-sm',
                accept: () => {
                    var url = this.mensagemWhatsapp.enviarMensagemFalta(item.aluno, item.celular!, this.evento);
                    window.open(url, '_blank')
                },
            });

        }
        return item;
    }
    
    numeroPaginaAHChange(current: any, participacao: Evento_Participacao_Aluno, model: NgModel, el: HTMLInputElement) {
        var aluno = this.alunos.find(x => x.id == participacao.aluno_Id) as Aluno;
        var prev = participacao.numeroPaginaAH ?? 0;
        if (current <= prev && participacao.apostila_AH_Id == aluno.apostila_AH_Id) {

            this.confirmationService.confirm({
                target: el,
                message: `O aluno está regredindo a página da apostila "${participacao.apostila_AH}"?`,
                header: 'Regredir página?',
                acceptLabel: `Sim`,
                acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
                rejectLabel: 'Não, foi um engano',
                rejectButtonStyleClass: 'p-button-sm p-button-rounded p-button-text',
                accept: () => {
                    participacao.numeroPaginaAH = current;
                    model.control.setValue(current);
                    model.control.updateValueAndValidity();
                },
                reject: () => {
                    model.control.setValue(participacao.numeroPaginaAH);
                    model.control.updateValueAndValidity();
                }
            });

        }
    }
    
    numeroPaginaAbacoChange(current: any, participacao: Evento_Participacao_Aluno, model: NgModel, el: HTMLInputElement) {
        var aluno = this.alunos.find(x => x.id == participacao.aluno_Id) as Aluno;
        var prev = participacao.numeroPaginaAbaco ?? 0;
        if (current <= prev && participacao.apostila_Abaco_Id == aluno.apostila_Abaco_Id) {

            this.confirmationService.confirm({
                target: el,
                message: `O aluno está regredindo a página da apostila "${participacao.apostila_Abaco}"?`,
                header: 'Regredir página?',
                acceptLabel: `Sim, regredir página`,
                acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
                rejectLabel: 'Não, foi um engano',
                rejectButtonStyleClass: 'p-button-sm p-button-rounded p-button-text',
                accept: () => {
                    participacao.numeroPaginaAbaco = current;
                    model.control.setValue(current);
                    model.control.updateValueAndValidity();
                },
                reject: () => {
                    model.control.setValue(participacao.numeroPaginaAbaco);
                    model.control.updateValueAndValidity();
                }
            });

        }
    }
    
    apostilaAbacoChange(id: any, item: Evento_Participacao_Aluno, ngModel: NgModel, el: Select) {
        var aluno = this.alunos.find(x => x.id == item.aluno_Id) as Aluno;
        var newApostila = this.apostilas.find(x => x.id == id) as Apostila;
        var oldApostila = this.apostilas.find(x => x.id == aluno.apostila_Abaco_Id) as Apostila;
        if (id != item.apostila_Abaco_Id && newApostila.ordem < oldApostila.ordem) {

            this.confirmationService.confirm({
                target: el.el.nativeElement,
                message: `Tem certeza que deseja regredir a apostila desse aluno?.`,
                header: 'Regredir apostila?',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Sim',
                acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Não',
                rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                accept: async () => {
                    item.apostila_Abaco_Id = id;
                    item.apostila_Abaco = newApostila.nome
                },
                reject: () => {
                    ngModel.control.setValue(oldApostila.id)
                    id = oldApostila.id;
                    item.apostila_Abaco_Id = oldApostila.id;
                    item.apostila_Abaco = oldApostila.nome;
                }
            });
        } else {
            item.apostila_Abaco = newApostila.nome;
            item.apostila_Abaco_Id = newApostila.id;
        }
    }

    apostilaAHChange(id: any, item: Evento_Participacao_Aluno, ngModel: NgModel, el: Select) {
        var aluno = this.alunos.find(x => x.id == item.aluno_Id) as Aluno;
        var newApostila = this.apostilaAHAluno.find(x => x.id == id) as Apostila;
        var oldApostila = this.apostilaAHAluno.find(x => x.id == aluno.apostila_AH_Id) as Apostila;

        if (id != item.apostila_Abaco_Id && newApostila.ordem < oldApostila.ordem) {
            this.confirmationService.confirm({
                target: el.el.nativeElement,
                message: `Tem certeza que deseja regredir a apostila desse aluno?.`,
                header: 'Regredir apostila?',
                icon: 'pi pi-exclamation-triangle',
                acceptIcon: 'pi pi-check',
                acceptLabel: 'Sim',
                acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
                rejectIcon: 'pi pi-times',
                rejectLabel: 'Não',
                rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
                accept: async () => {
                    item.apostila_AH_Id = id;
                    item.apostila_AH = newApostila.nome
                },
                reject: () => {
                    ngModel.control.setValue(oldApostila.id)
                    item.apostila_AH_Id = oldApostila.id;
                    item.apostila_AH = oldApostila.nome;
                }
            });
        } else {
            item.apostila_AH = newApostila.nome;
            item.apostila_AH_Id = newApostila.id;
        }
    }
    
    primeiraAula(aluno: Evento_Participacao_Aluno, evento:Evento) {
        return moment(aluno.primeiraAula).isSame(evento.data)
    }
}
