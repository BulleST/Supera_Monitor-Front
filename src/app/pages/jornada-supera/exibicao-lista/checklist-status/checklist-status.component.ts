import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { JornadaSupera_List_Checklist } from '../../../../models/jornada-supera-list.model';
import { JornadaSuperaStatus } from '../../../../models/jornada-supera-status.model';

@Component({
    selector: 'app-checklist-status',
    standalone: false,
    templateUrl: './checklist-status.component.html',
    styleUrl: './checklist-status.component.css',
})
export class ChecklistStatusComponent implements OnChanges {
    @Input() checklist!: JornadaSupera_List_Checklist;

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
        var finalizados = this.checklist.items.filter(x => x.dataFinalizacao)

        if (this.checklist.status == JornadaSuperaStatus.Finalizado) {
            this.icon = 'pi pi-check-circle';
            this.textColor = 'text-green-600';
            this.text = `Finalizado`;
        }
        else if (this.checklist.status == JornadaSuperaStatus.FinalizadoComAtraso) {
            this.icon = 'pi pi-check-circle';
            this.textColor = 'text-yellow-500';
            this.text = `Finalizado`;
        }
        else if (this.checklist.status == JornadaSuperaStatus.Atrasado) {
            this.icon = 'pi pi-times-circle';
            this.textColor = 'text-red-500';
            this.text = `Atrasado ${finalizados.length}/${this.checklist.items.length}`;
        }
        else if (this.checklist.status == JornadaSuperaStatus.EmAndamento) {
            this.icon = 'pi pi-hourglass';
            this.textColor = 'text-orange-500';
            this.text = `Em Andamento ${finalizados.length}/${this.checklist.items.length}`;
        }
        else if (this.checklist.status == JornadaSuperaStatus.ARealizar) {
            this.icon = 'pi pi-clock';
            this.textColor = 'text-blue-500';
            this.text = `À Realizar ${finalizados.length}/${this.checklist.items.length}`;
        }
        else {
            this.icon = 'pi pi-question';
            this.textColor = 'text-purple-500';
            this.text = `Indefinido ${finalizados.length}/${this.checklist.items.length}`;
        }
    }
}
