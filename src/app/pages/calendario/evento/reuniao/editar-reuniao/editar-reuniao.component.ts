import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectChangeEvent } from 'primeng/select';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import moment from 'moment';
import { PickList } from 'primeng/picklist';
import { Evento } from '../../../../../models/evento.model';
import { Professor } from '../../../../../models/professor.model';
import { Evento_Participacao_Professor } from '../../../../../models/evento-participacao-professor.model';
import { SalaAula } from '../../../../../models/sala-aula.model';
import { MensagemWhatsapp, CalendarioUtils, showError } from '../../../../../utils';

@Component({
    selector: 'app-editar-reuniao',
    standalone: false,
    templateUrl: './editar-reuniao.component.html',
    styleUrl: './editar-reuniao.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }]
})
export class EditarReuniaoComponent implements OnChanges, OnDestroy {
    subscription: Subscription[] = [];

    @Input() evento: Evento = new Evento;
    @Input() duracaoEvento = '';
    @Input() loadingChecklist = false;

    source: Professor[] = [];
    target: Professor[] = [];
    selected: Evento_Participacao_Professor[] = [];
    @Input() professores: Professor[] = [];
    @Input() loadingProfessores = false;

    @Input() salaAulas: SalaAula[] = [];
    @Input() loadingSalaAulas = false;

    @Output() validaProfessor = new EventEmitter<Professor>();
    @Output() validaSala = new EventEmitter<SalaAula>();
    @Output() width = new EventEmitter<string>();
    onSave = new EventEmitter<Evento>();

    @ViewChild('picklist') picklist!: PickList;

    constructor(
        private confirmationService: ConfirmationService,
        public mensagemWhatsapp: MensagemWhatsapp,
        private calendarioUtils: CalendarioUtils,
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue;
            this.selected = this.evento.professores;
            this.setProfessores();
            if (!this.evento.finalizado) {
                this.evento.professores
                    .filter(x => x.active)
                    .map(x => {
                        x.presente == true;
                        return x;
                    });
            }
        };
        if (changes['professores']) {
            this.professores = changes['professores'].currentValue;
            this.setProfessores();
        }
        if (changes['loadingProfessores']) this.loadingProfessores = changes['loadingProfessores'].currentValue;
        if (changes['salaAulas']) this.salaAulas = changes['salaAulas'].currentValue;
        if (changes['loadingSalaAulas']) this.loadingSalaAulas = changes['loadingSalaAulas'].currentValue;
        if (changes['duracaoEvento']) this.duracaoEvento = changes['duracaoEvento'].currentValue;

        this.width.emit('600px');

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    setProfessores() {
        let professoresIds = this.evento.professores.map(x => x.professor_Id);
        this.target = this.professores.filter(x => professoresIds.includes(x.id))
        this.source = this.professores.filter(x => !professoresIds.includes(x.id))
    }

    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }


    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        let item = this.salaAulas.find(x => x.id == e.value);
        this.validaSala.emit(item);
        
        if (item && item.disponivel == false && item.disponivelEvent) {
            model.control.setErrors({ indisponivel: 'Sala indisponível' });
            let tipo = this.getTipo(item.disponivelEvent);
            let data = moment(item.disponivelEvent.data).format('HH[h]mm');

            this.showError('Sala Indisponível', 
                `Essa sala está atribuída a outra ${tipo} no mesmo dia às <b>${data}</b>.`,
                 e.originalEvent);
            return;
        }
        model.control.setErrors({ indisponivel: null });
        model.control.updateValueAndValidity();
    }

    getTipo(e: Evento) {
        return this.calendarioUtils.getEventoTipo(e)
    }

    presente(item: Evento_Participacao_Professor) {
        item.presente = !item.presente;
    }

    enviarMensagem(professor: Evento_Participacao_Professor) {
        if (!professor.phone) {
            this.showError('Erro', 'Nenhum celular cadastrado', professor);
            return;
        }
        let object = this.mensagemWhatsapp.enviarMensagem(professor.nome, professor.phone);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    inputFocus(e: any) {
        e.target.select()
    }
}
