import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
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
import { Button } from 'primeng/button';

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


    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private apostilaService: ApostilaService,
    ) {

        var apostilas = this.apostilaService.listApostila.subscribe(res => this.apostilas = res);
        this.subscription.push(apostilas);

        if (this.apostilas.length == 0) {
            this.loadingApostila = true;
            lastValueFrom(this.apostilaService.getApostilas())
                .then(res => this.loadingApostila = false)
                .catch(res => this.loadingApostila = false)
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

    loadApostila(aluno: Evento_Participacao_Aluno) {
        this.loadingApostila = true;
        this.apostilaAbacoAluno = this.apostilas.filter(x => x.apostila_Kit_Id == aluno.apostila_Kit_Id && x.apostila_Tipo_Id == ApostilaTipo.Abaco);
        this.apostilaAHAluno = this.apostilas.filter(x => x.apostila_Kit_Id == aluno.apostila_Kit_Id && x.apostila_Tipo_Id == ApostilaTipo.AH);

        this.apostilaAHAluno.sort((x, y) => x.ordem - y.ordem)
        this.apostilaAbacoAluno.sort((x, y) => x.ordem - y.ordem)

        this.loadingApostila = false;
    }

    apostilaAbacoChange(value: any, item: Evento_Participacao_Aluno, ngModel: NgModel, el: Select) {
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

    apostilaAHChange(value: any, item: Evento_Participacao_Aluno, ngModel: NgModel, el: Select) {
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

    inputFocus(e: any) {
        e.target.select()
    }

    presenteClick(item: Evento_Participacao_Aluno, e: any, button?: Button) {

        if (item.presente == undefined || item.presente == null) {
            item.presente = true;
        }
        else {
            item.presente = !item.presente;
        }


        if (button) {
            button.label = item.presente ? 'Presente' : 'Faltou';
            button.severity = item.presente ? 'success' : 'danger';
            button.icon = item.presente ? 'pi pi-check' : 'pi pi-thumbs-down-fill';
        }


        if (!item.presente && item.celular) {
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
        return item;
    }

}
