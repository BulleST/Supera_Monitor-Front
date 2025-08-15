import { Pipe, PipeTransform } from '@angular/core';
import { SalaAulaId } from '../models/sala-aula.model';

@Pipe({
    name: 'salaAulaPipe'
})

export class SalaAulaPipe implements PipeTransform {
    transform(value: any): any {
        var id = 'sala_Id' in value ? value.sala_Id : value.id;
        if (SalaAulaId.online == id) {
            return 'Online'
        } else if (SalaAulaId.financeiro == id) {
            return 'Sala do Financeiro'
        } else if (SalaAulaId.professores == id) {
            return 'Sala pedagógica'
        } else {
            if (value.numeroSala !== undefined && value.numeroSala !== null && value.andar !== undefined && value.andar !== null) {
                return `${value.numeroSala} - ${value.andar}º andar`;
            } else {
                return 'Indefinido';
            }
        }
    }
}

/*

<ng-container *ngIf="[SalaAulaId.online, SalaAulaId.professores, SalaAulaId.financeiro].includes(sala_Id); else salaTemplate">
    <ng-container *ngIf="sala_Id == SalaAulaId.online; then onlineTemplate"></ng-container>
    <ng-container *ngIf="sala_Id == SalaAulaId.professores; then pedagogicaTemplate"></ng-container>
    <ng-container *ngIf="sala_Id == SalaAulaId.financeiro; then financeiroTemplate"></ng-container>
</ng-container>


<ng-template #salaTemplate> {{numeroSala}} - {{andar}}º andar</ng-template>
<ng-template #onlineTemplate>Online</ng-template>
<ng-template #pedagogicaTemplate>Sala pedagógica</ng-template>
<ng-template #financeiroTemplate>Sala do Financeiro</ng-template>
*/