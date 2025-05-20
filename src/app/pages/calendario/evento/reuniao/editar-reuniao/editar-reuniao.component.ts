import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { SelectChangeEvent } from 'primeng/select';
import { ControlContainer, NgForm, NgModel } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import moment from 'moment';
import { PickList, PickListMoveAllToTargetEvent } from 'primeng/picklist';
import { Evento } from '../../../../../models/evento.model';
import { Professor } from '../../../../../models/professor.model';
import { Evento_Participacao_Professor } from '../../../../../models/evento-participacao-professor.model';
import { SalaAula } from '../../../../../models/sala-aula.model';
import { MensagemWhatsapp , CalendarioUtils, showError } from '../../../../../utils';

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
    @Input() isChamadaPage = false;

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
        };
        if (changes['professores']){
            this.professores = changes['professores'].currentValue;
            this.setProfessores();
        }
        if (changes['loadingProfessores']) this.loadingProfessores = changes['loadingProfessores'].currentValue;
        if (changes['salaAulas']) this.salaAulas = changes['salaAulas'].currentValue;
        if (changes['loadingSalaAulas']) this.loadingSalaAulas = changes['loadingSalaAulas'].currentValue;
        if (changes['duracaoEvento']) this.duracaoEvento = changes['duracaoEvento'].currentValue;
        if (changes['isChamadaPage']) this.isChamadaPage = changes['isChamadaPage'].currentValue;
        
        this.width.emit('600px');

    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    setProfessores() {
        
        var professoresIds = this.evento.professores.map(x => x.professor_Id);
        this.target = this.professores.filter(x => professoresIds.includes(x.id))
        this.source = this.professores.filter(x => !professoresIds.includes(x.id))
    }

        
        showError(header: string, message: string, e: any) {
            showError(this.confirmationService, header, message, e);
        }
    


    salaAulaChanged(e: SelectChangeEvent, model: NgModel) {
        var item = this.salaAulas.find(x => x.id == e.value);
        this.validaSala.emit(item);
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

    enviarMensagem(nome: string, celular: string) {
        return this.mensagemWhatsapp.enviarMensagem(nome, celular!)
    }

    inputFocus(e: any) {
        e.target.select()
    }


    onMoveToSource(e: any) {
        this.evento.professores = this.target.map(x => ({
            id: null as any,
            professor_Id: x.id,
            corLegenda: x.corLegenda,
            evento_Id: this.evento.id,
            observacao: '',
            nome: x.nome,
            presente: null as any,
        }))
    }

    onMoveToTarget(e: PickListMoveAllToTargetEvent) {
        var item = e.items[0] as Professor;
        if (!item.disponivel) {
            this.showError('Educador indisponível', 'Você não pode mover um educador indisponível.', { target: this.picklist.el.nativeElement });
            var index = this.target.findIndex(x => x.id == item.id);
            if (index != -1) {
                this.target.splice(index, 1)
                this.professores.push(item);

            };
        }
        this.evento.professores = this.target.map(x => ({
            id: null as any,
            professor_Id: x.id,
            corLegenda: x.corLegenda,
            evento_Id: this.evento.id,
            observacao: '',
            nome: x.nome,
            presente: null as any,
        }))
    }

    onMoveAllToSource(e: any) {
        this.evento.professores = this.target.map(x => ({
            id: null as any,
            professor_Id: x.id,
            corLegenda: x.corLegenda,
            evento_Id: this.evento.id,
            observacao: '',
            nome: x.nome,
            presente: null as any,
        }))

    }

    onMoveAllToTarget(e: any) {
        var items = e.items as Professor[];
        if (items.find(x => !x.disponivel)) {
            this.showError('Educador indisponível', 'Você não pode mover educadores indisponíveis.', { target: this.picklist.el.nativeElement });
            this.professores = items.filter(x => !x.disponivel);
            this.target = items.filter(x => x.disponivel);
        }
        this.evento.professores = this.target.map(x => ({
            id: null as any,
            professor_Id: x.id,
            corLegenda: x.corLegenda,
            evento_Id: this.evento.id,
            observacao: '',
            nome: x.nome,
            presente: null as any,
        }))
    }

}
