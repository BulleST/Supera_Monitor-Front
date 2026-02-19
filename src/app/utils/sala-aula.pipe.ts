import { Pipe, PipeTransform } from '@angular/core';
import { SalaAulaService } from '../services/sala-aula.service';
import { SalaAndar, SalaAula } from '../models/sala-aula.model';
import { lastValueFrom } from 'rxjs';

@Pipe({
    name: 'salaAulaPipe'
})

export class SalaAulaPipe implements PipeTransform {

    salas: SalaAula[] = [];

    constructor(
        private service: SalaAulaService
    ) {
        this.service.list.subscribe(res => this.salas = res);


        if (!this.salas.length) {
            lastValueFrom(this.service.getList())
        }

    }


    transform(value: any): any {
        const id = 'sala_Id' in value ? value.sala_Id : value.id;
        let sala = this.salas.find(x => x.id == id);

        return sala?.descricao;
    }


    getFullDescription(value: any) {
        const sala_Id = 'sala_Id' in value ? value.sala_Id : value.id;
        if (sala_Id) {
            const andar = value.andar > SalaAndar.Terreo ? value.andar + 'º andar' : 'Térreo'
            return value.sala + ' - ' + andar;
        }
        else {
            return 'Indefinida'
        }
    }
}
