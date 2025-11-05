import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlunoChecklistCompleto } from '../../../../models/calendario.model';

@Component({
    selector: 'app-checklist-status',
    standalone: false,
    templateUrl: './checklist-status.component.html',
    styleUrl: './checklist-status.component.css',
})
export class ChecklistStatusComponent implements OnChanges {
    @Input() checklist!: AlunoChecklistCompleto;
    icon: string = '';
    text: string = '';
    textColor: string = '';

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['checklist']) {
            this.checklist = changes['checklist'].currentValue;
            this.setComponent();
        }
    }
    setComponent() {
        if (this.checklist.itensFinalizados.length == this.checklist.items.length) {
            this.icon = 'pi pi-check-circle';
            this.textColor = 'text-green-600';
            this.text = `Finalizado`;
        }
        else if (this.checklist.itensAtrasados.length > 0
            && this.checklist.itensFinalizados.length < this.checklist.items.length) {
            this.icon = 'pi pi-times-circle';
            this.textColor = 'text-red-500';
            this.text = `Atrasado ${this.checklist.itensFinalizados.length}/${this.checklist.items.length}`;
        }
        else if (this.checklist.itensEmAndamento.length > 0
            && this.checklist.itensFinalizados.length < this.checklist.items.length) {
            this.icon = 'pi pi-hourglass';
            this.textColor = 'text-orange-500';
            this.text = `Em Andamento ${this.checklist.itensFinalizados.length}/${this.checklist.items.length}`;
        }
        else if (this.checklist.itensEmAndamento.length == 0
            && this.checklist.itensAtrasados.length == 0
            && this.checklist.prazo
            && this.checklist.itensFinalizados.length != this.checklist.items.length) {
            this.icon = 'pi pi-clock';
            this.textColor = 'text-blue-500';
            this.text = `Futuro ${this.checklist.itensFinalizados.length}/${this.checklist.items.length}`;
        }
        else {
            this.icon = 'pi pi-question';
            this.textColor = 'text-purple-500';
            this.text = `Indefinido ${this.checklist.itensFinalizados.length}/${this.checklist.items.length}`;
        }
    }
}
