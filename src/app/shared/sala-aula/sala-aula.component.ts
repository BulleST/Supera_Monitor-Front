import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SalaAula, SalaAulaId } from '../../models/sala-aula.model';

@Component({
  selector: 'app-sala-aula',
  standalone: false,
  
  templateUrl: './sala-aula.component.html',
  styleUrl: './sala-aula.component.css'
})
export class SalaAulaComponent implements OnChanges {
    SalaAulaId = SalaAulaId;
    
    @Input() numeroSala!: number;
    @Input() andar!: number;
    @Input() sala_Id!: number;

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['numeroSala']) this.numeroSala = changes['numeroSala'].currentValue;
        if(changes['andar']) this.andar = changes['andar'].currentValue;
        if(changes['sala_Id']) this.sala_Id = changes['sala_Id'].currentValue;
    }

}
