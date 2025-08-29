import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Feriado } from '../../../../models/feriado.model';
import { Evento } from '../../../../models/evento.model';
import { Calendar } from '@fullcalendar/core';
import moment from 'moment';
import { PerfilCognitivo, PerfilCognitivo_Calculo_Data } from '../../../../models/perfil-cognitivo.model';
import { Popover } from 'primeng/popover';

@Component({
    selector: 'app-calculo-perfil-cognitivo',
    standalone: false,
    templateUrl: './calculo-perfil-cognitivo.component.html',
    styleUrl: './calculo-perfil-cognitivo.component.css'
})
export class CalculoPerfilCognitivoComponent implements OnChanges {
    @Input() eventos!: Evento[];
    @Input() data!: Date;
    @Input() feriados: Feriado[] = [];
    @Input() perfilCognitivo: PerfilCognitivo[] = [];
    @Input() loadingPerfilCognitivo = false;
    calendar!: Calendar;

    visible = false;

    @ViewChild('popover') popover!: Popover;

    model!: PerfilCognitivo_Calculo_Data;

    constructor() {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['eventos']) this.eventos = changes['eventos'].currentValue;
        if (changes['data']) this.data = changes['data'].currentValue;
        if (changes['feriados']) this.feriados = changes['feriados'].currentValue;
        if (changes['perfilCognitivo']) this.perfilCognitivo = changes['perfilCognitivo'].currentValue;
        if (changes['loadingPerfilCognitivo']) this.loadingPerfilCognitivo = changes['loadingPerfilCognitivo'].currentValue;
        this.calcula();
    }


    calcula() {
        if (this.data && this.eventos) {

            let dataPerfilCog: PerfilCognitivo_Calculo_Data = {
                data: this.data,
                perfilCognitivo: [],
                total: 0
            };

            let dataFormated = moment(this.data).format('YYYY-MM-DD');
            let eventosData = this.eventos.filter(x => moment(x.data).format('YYYY-MM-DD') == dataFormated);
            let alunosData = eventosData
                                .flatMap(x => x.alunos)
                                .filter(x => x.active);
                                
            this.perfilCognitivo.forEach(item => {
                let alunosPerfil = alunosData.filter(x => x.perfilCognitivo_Id == item.id);
                dataPerfilCog.total += alunosPerfil.length;
                dataPerfilCog.perfilCognitivo.push({
                    id: item.id,
                    descricao: item.descricao,
                    nome: item.nome,
                    quantidadeAlunos: alunosPerfil.length
                });
            })

            this.model = dataPerfilCog;

        }
    }
    show(e: any) {
        this.visible = true;
        this.popover.show(e)
    }
    
    hide() {
        this.visible = false;
        this.popover.hide()
    }

}

