import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core'
import { Evento } from '../../../../../models/evento.model'
import { Subscription } from 'rxjs'
import { Professor } from '../../../../../models/professor.model'
import { SalaAula } from '../../../../../models/sala-aula.model'
import { ControlContainer, NgForm } from '@angular/forms'
import { Roteiro } from '../../../../../models/roteiro.model'
import { AulaComponent } from '../../../../../shared/evento/aula/aula.component'

@Component({
    selector: 'app-editar-aula',
    standalone: false,
    templateUrl: './editar-aula.component.html',
    styleUrl: './editar-aula.component.css',
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
})
export class EditarAulaComponent implements OnChanges {

    @Input() evento: Evento = new Evento()
    @Input() duracaoEvento = ''
    @Input() loadingChecklist = false

    @Input() professores: Professor[] = []
    @Input() loadingProfessores = false

    @Input() salaAulas: SalaAula[] = []
    @Input() loadingSalaAulas = false

    @Input() roteiros: Roteiro[] = []
    @Input() loadingRoteiros = false

    @Output() onProfessorChanged = new EventEmitter<Professor>()
    @Output() onSalaChanged = new EventEmitter<SalaAula>()
    @Output() onWidthChanged = new EventEmitter<string>()
    @Output() onSave = new EventEmitter<Evento>();

    @ViewChild('componentForm') componentForm!: AulaComponent;

    constructor() { 

        this.onSave.subscribe(res => {
            this.componentForm.onSave.emit(res);
        })
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['evento']) {
            this.evento = changes['evento'].currentValue
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
        }
        if (changes['loadingRoteiros'])
            this.loadingRoteiros = changes['loadingRoteiros'].currentValue

    }

}
