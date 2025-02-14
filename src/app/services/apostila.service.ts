import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { Service } from '../helpers/service.service';
import { Apostila, Apostila_Kit } from '../models/apostila.model';

@Injectable({
    providedIn: 'root',

})
export class ApostilaService extends Service {
    listApostila = new BehaviorSubject<Apostila[]>([]);
    listKits = new BehaviorSubject<Apostila_Kit[]>([]);

    getApostilas() {
        return this.http.get<Apostila[]>(`${this.url}/professor/apostila/all/`)
            .pipe(tap({
                next: list => {
                    this.listApostila.next(list);
                    return of(list);
                },
                error: err => {
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar apostila', life: 3000 });
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
                    this.messageService.add({ severity: 'danger', summary: 'Ocorreu um erro', detail: 'Não foi possível carregar apostila', life: 3000 });
                }
            }));
    }

}
