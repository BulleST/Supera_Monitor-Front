import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom,  Observable,  of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { Map } from '../utils/map';
import moment from 'moment';
import { Service } from '../helpers/service.service';
import { Jornada, JornadaRequest, jornadas } from '../models/jornada.model';
import { getError } from '../utils';

@Injectable({
    providedIn: 'root',
})
export class JornadaService extends Service {
    override list = new BehaviorSubject<Jornada[]>([]);
 

    getList() {
        return  new Observable<Jornada[]>(subscription => {
           setTimeout(() => {
            this.list.next(jornadas);
            subscription.next(jornadas);
            subscription.complete();
            }, 1000);
        });
        // return this.http.get<Jornada[]>(`${this.url}/jornada/all/`)
        //     .pipe(tap({
        //         next: list => {
        //             this.list.next(list);
        //             return of(list);
        //         },
        //         error: err => {
        //             this.toastrService.error(`Não foi possível carregar jornada supera. \n ${getError(err)}`);
        //         }
        //     }));
    }

    get(id: number) {
        return new Promise<Jornada>(async (resolve, reject) => {
            if (this.list.value.length == 0)
                this.getList()  .subscribe();

            var item = this.list.value.find(x => x.id == id) as Jornada;
            if (!item){
                this.toastrService.error(`Jornada não encontrado.`);
               return reject('Jornada não encontrado.')
            }

            if (item.dataInicio)
                item.dataInicio = new Date(moment(item.dataInicio).format('YYYY-MM-DD[T]HH:mm:ss'))
            if (item.dataFim)
                item.dataFim = new Date(moment(item.dataFim).format('YYYY-MM-DD[T]HH:mm:ss'))

            return resolve(item);
        })
    }

    create(model: Jornada) {
        var request = Map(model, new JornadaRequest);
        return this.http.post<Response>(`${this.url}/jornada`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar jornada. \n ${getError(err)}`);
                }
            }));
    }

    edit(model: Jornada) {
        var request = Map(model, new JornadaRequest);
        return this.http.put<Response>(`${this.url}/jornada`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível editar jornada. \n ${getError(err)}`);
                }
            }));
    }

}
