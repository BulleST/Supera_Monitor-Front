import { Pipe, PipeTransform } from '@angular/core';
import { SalaAulaService } from '../services/sala-aula.service';
import { SalaAula } from '../models/sala-aula.model';
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
        var id = 'sala_Id' in value ? value.sala_Id : value.id;
        let sala = this.salas.find(x => x.id == id);

        return sala?.descricao;
    }
}
