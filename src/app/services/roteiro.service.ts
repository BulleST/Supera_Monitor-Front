import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { MyMap } from '../utils/map';
import moment from 'moment';
import 'moment/locale/pt-br'
import { Service } from '../helpers/service.service';
import { getError } from '../utils';
import { Roteiro, RoteiroRequest } from '../models/roteiro.model';
import { sortBy } from 'sort-by-typescript';

@Injectable({
    providedIn: 'root',
})
export class RoteiroService extends Service {
    override list = new BehaviorSubject<Roteiro[]>([]);
    roteiro = new BehaviorSubject<Roteiro | undefined>(undefined);

    mapRoteiro(roteiro: Roteiro) {

        roteiro.dataInicio = moment(roteiro.dataInicio, 'YYYY-MM-DD').toDate();
        roteiro.dataFim = moment(roteiro.dataFim, 'YYYY-MM-DD').set({ hours: 23, minute: 59 }).toDate();
        roteiro.corLegenda = roteiro.corLegenda ?? this.getRandomColor();
        roteiro.active = !roteiro.deactivated;
        return roteiro
    }

    getRoteiro() {
        if (!this.roteiro.value) {
            let objString = localStorage.getItem('roteiro');
            let obj = objString ? this.mapRoteiro(JSON.parse(objString)) : undefined;
            this.roteiro.next(obj);
        }
        return this.roteiro;
    }

    setRoteiro(value: Roteiro | undefined) {
        this.roteiro.next(value);
        if (value) localStorage.setItem('roteiro', JSON.stringify(value));
        else localStorage.removeItem('roteiro');
    }

    getList(ano?: number) {
        return this.http.get<Roteiro[]>(`${this.url}/roteiros/all/${ano}`)
            .pipe(tap({
                next: list => {
                    list = list.map(x => {
                        x.dataInicio = moment(x.dataInicio, 'YYYY-MM-DD').toDate();
                        x.dataFim = moment(x.dataFim, 'YYYY-MM-DD').set({ hours: 23, minute: 59 }).toDate();
                        x.corLegenda = x.corLegenda ?? this.getRandomColor();
                        x.active = !x.deactivated;
                        return x
                    })
                    list = list.sort(sortBy('dataInicio'))
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
        // return this.http.get<Roteiro>(`${this.url}/roteiros/${id}`)
        return new Observable<Roteiro>(subscription => {
            if (this.list.value.length == 0)
                this.getList().subscribe();

            var item = this.list.value.find(x => x.id == id) as Roteiro;
            if (!item) {
                this.toastrService.error(`Roteiro não encontrado.`);
                subscription.error('Roteiro não encontrado.')
            }

            if (item.dataInicio)
                item.dataInicio = new Date(moment(item.dataInicio).format('YYYY-MM-DD[T]HH:mm:ss'))
            if (item.dataFim)
                item.dataFim = new Date(moment(item.dataFim).format('YYYY-MM-DD[T]HH:mm:ss'))

            subscription.next(item);
            subscription.complete()
        })
    }

    create(model: Roteiro) {
        var request = MyMap(model, new RoteiroRequest);
        return this.http.post<RequestResponse>(`${this.url}/roteiros`, request)
            .pipe(tap({
                next: res => {
                    if (res.success) {
                        res.object = this.mapRoteiro(res.object);
                        let list = this.list.value;
                        list.push(res.object);
                        list = list.sort(sortBy('dataInicio'));
                        this.list.next(list);
                    }
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
                    if (res.success) {
                        res.object = this.mapRoteiro(res.object);
                        let list = this.list.value;
                        let index = list.findIndex(x => x.id == model.id);
                        if (index == -1) list.push(res.object);
                        else list.splice(index, 1, res.object)
                        list = list.sort(sortBy('dataInicio'));
                        this.list.next(list);
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível editar roteiro. \n ${getError(err)}`);
                    return err;
                }
            }));
    }

}
