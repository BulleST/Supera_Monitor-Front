import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import { Apostila, Apostila_Kit } from '../models/apostila.model';
import { getError } from '../utils';

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
                    this.listKits.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar kits. \n ${getError(err)}`)
                }
            }));
    }

}
