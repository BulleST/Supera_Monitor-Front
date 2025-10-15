import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SalaAulaPipe } from '../../utils/sala-aula.pipe';
import { SalaAulaId } from '../../models/sala-aula.model';

@Component({
  selector: 'app-sala-aula',
  standalone: false,
  templateUrl: './sala-aula.component.html',
  styleUrl: './sala-aula.component.css'
})
export class SalaAulaComponent implements OnChanges {
    @Input() numeroSala!: number;
    @Input() andar!: number;
    @Input() sala_Id!: number;
    @Input() descricao!: string;

    SalaAulaId = SalaAulaId;

    constructor(
        private pipe: SalaAulaPipe
    ) {

    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['numeroSala']) {
            this.numeroSala = changes['numeroSala'].currentValue;
        }
            
        if(changes['andar']) {
            this.andar = changes['andar'].currentValue;
        }
            
        if(changes['sala_Id']) {
            this.sala_Id = changes['sala_Id'].currentValue;
        }   
        if(changes['descricao']) {
            this.descricao = changes['descricao'].currentValue;
        }
    }

    get sala() {
        if (this.descricao)
            return this.descricao;
        if (this.sala_Id)
            return this.pipe.transform({sala_Id: this.sala_Id});
    }

}
