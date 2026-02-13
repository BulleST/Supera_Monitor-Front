import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import { Apostila, Apostila_Kit } from '../models/apostila.model';
import { getError } from '../utils';
import { sortBy } from 'sort-by-typescript';

@Injectable({
    providedIn: 'root',

})
export class ApostilaService extends Service {
    listApostila = new BehaviorSubject<Apostila[]>([]);
    listKits = new BehaviorSubject<Apostila_Kit[]>([]);

    getApostilas() {
        return this.http.get<Apostila[]>(`${this.url}/professor/apostilas/all/`)
            .pipe(tap({
                next: list => {
                    list = list.sort(sortBy('ordem', 'nome'))
                    this.listApostila.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar apostilas. \n ${getError(err)}`)
                }
            }));
    }

    getKit() {
        return this.http.get<Apostila_Kit[]>(`${this.url}/professor/kits/all/`)
            .pipe(tap({
                next: list => {
                    list = list.sort(sortBy('nome'))
                    this.listKits.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar kits. \n ${getError(err)}`)
                }
            }));
    }

}
