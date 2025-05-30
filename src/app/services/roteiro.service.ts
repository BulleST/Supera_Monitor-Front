import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { MyMap } from '../utils/map';
import moment from 'moment';
import 'moment/locale/pt-br'
import { Service } from '../helpers/service.service';
import { getError, insertOrReplace, playError, playSuccess } from '../utils';
import { Roteiro, RoteiroRequest } from '../models/roteiro.model';

@Injectable({
    providedIn: 'root',
})
export class RoteiroService extends Service {
    override list = new BehaviorSubject<Roteiro[]>([]);

    getList(where: string = 'não sei') {
        return this.http.get<Roteiro[]>(`${this.url}/roteiros/all/`)
            .pipe(tap({
                next: list => {
                    list = list.map(x => {
                        x.dataInicio = moment(x.dataInicio, 'YYYY-MM-DD').toDate();
                        x.dataFim = moment(x.dataFim, 'YYYY-MM-DD').set({ hours: 23, minute: 59 }).toDate();
                        x.corLegenda =  x.corLegenda ?? this.getRandomColor();
                        x.active = !x.deactivated;
                        return x
                    })
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar roteiro supera. \n ${getError(err)}`);
                }
            }));
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

    get(id: number) {
        return new Promise<Roteiro>(async (resolve, reject) => {
            if (this.list.value.length == 0)
                this.getList('get ' + id).subscribe();

            var item = this.list.value.find(x => x.id == id) as Roteiro;
            if (!item){
                this.toastrService.error(`Roteiro não encontrado.`);
               return reject('Roteiro não encontrado.')
            }

            if (item.dataInicio)
                item.dataInicio = new Date(moment(item.dataInicio).format('YYYY-MM-DD[T]HH:mm:ss'))
            if (item.dataFim)
                item.dataFim = new Date(moment(item.dataFim).format('YYYY-MM-DD[T]HH:mm:ss'))

            return resolve(item);
        })
    }

    create(model: Roteiro) {
        var request = MyMap(model, new RoteiroRequest);
        return this.http.post<RequestResponse>(`${this.url}/roteiros`, request)
            .pipe(tap({
                next: res => {
                    // res.object.dataFim = moment(res.object.dataFim).add(23, 'h').toDate();
                    // insertOrReplace(this, res.object, 'list');
                    // this.toastrService.success(`Registro cadastrado com sucesso.`);
                    // // playSuccess();
                    
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar roteiro. \n ${getError(err)}`);
                    return err;
                }
            }));
        }
        
        edit(model: Roteiro) {
            var request = MyMap(model, new RoteiroRequest);
            return this.http.put<RequestResponse>(`${this.url}/roteiros`, request)
            .pipe(tap({
                next: res => {
                    // res.object.dataFim = moment(res.object.dataFim).add(23, 'h').toDate();
                    // insertOrReplace(this, res.object, 'list');
                    // this.toastrService.success(`Registro atualizado com sucesso.`);
                    // // playSuccess();
                    
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível editar roteiro. \n ${getError(err)}`);
                    return err;
                }
            }));
    }

}
