import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Evento } from '../../../../models/evento.model';

@Component({
  selector: 'app-legenda',
  standalone: false,
  
  templateUrl: './legenda.component.html',
  styleUrl: './legenda.component.css'
})
export class LegendaComponent implements OnChanges {
    @Input() eventos: Evento[] = [];
    legenda: { label: string, corLegenda: string }[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['eventos']) {
            this.eventos = changes['eventos'].currentValue;
            this.setLegenda();
        }
    }


    setLegenda() {
        this.legenda = [];

        let legenda = this.eventos.map(x => JSON.stringify({ label: x.professor, corLegenda: x.corLegenda }))
        legenda = [...new Set(legenda)]
        legenda = legenda.map(x => JSON.parse(x))
        this.legenda = legenda as any;
    }

}
