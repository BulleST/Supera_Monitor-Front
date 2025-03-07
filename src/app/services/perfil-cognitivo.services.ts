import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import { perfisCognitivos, PerfilCognitivo } from '../models/perfil-cognitivo.model';

@Injectable({
    providedIn: 'root',
})
export class PerfilCognitivoService extends Service {
    override list = new BehaviorSubject<PerfilCognitivo[]>([]);

    
    getList() {
        return new Observable<PerfilCognitivo[]>(subscription => {
            this.list.next(perfisCognitivos);
            subscription.next(perfisCognitivos);
            subscription.complete();
        })


        // return this.http.get<PerfilCognitivo[]>(`${this.url}/turmas/perfil/all/`)
        //     .pipe(tap({
        //         next: list => {
        //             this.list.next(list);
        //             return of(list);
        //         },
        //         error: err => {
        //             this.toastrService.error(`Não foi possível carregar professores. \n ${getError(err)}`);
        //         }
        //     }));
    }



}
