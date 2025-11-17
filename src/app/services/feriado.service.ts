import { Injectable } from '@angular/core';
import { BehaviorSubject, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import moment from 'moment';
import { MyMap } from '../utils/map';
import { Service } from '../helpers/service.service';
import { getError, insert, replace } from '../utils';
import { Feriado, InsertFeriadoRequest, UpdateFeriadoRequest } from '../models/feriado.model';

@Injectable({
    providedIn: 'root',
})
export class FeriadoService extends Service {
    override list = new BehaviorSubject<Feriado[]>([]);

    mapFeriado(feriado: Feriado) {
        feriado.data = moment(feriado.data).toDate();
        feriado.created = moment(feriado.created).toDate();
        feriado.deactivated = feriado.deactivated ? moment(feriado.deactivated).toDate() : undefined;
        return feriado;
    }

    getList() {
        return this.http.get<Feriado[]>(`${this.url}/feriado/all/`)
            .pipe(tap({
                next: list => {
                    list.map(feriado => this.mapFeriado(feriado))
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar feriados. \n ${getError(err)}`);
                }
            }));
    }

    get(id: number) {
        return this.http.get<Feriado>(`${this.url}/feriado/${id}`).pipe(tap({
            next: feriado => {
                return of(this.mapFeriado(feriado));
            },
            error: err => {
                this.toastrService.error(`Não foi possível carregar feriado. \n ${getError(err)}`);
            }
        }));
    }

    create(model: Feriado) {
        let request = MyMap(model, new InsertFeriadoRequest);
        request.data = moment(model.data).format('YYYY-MM-DD') as any;

        return this.http.post<RequestResponse>(`${this.url}/feriado`, request)
            .pipe(tap({
                next: (res) => {
                    if (res.success) {
                        res.object = this.mapFeriado(res.object);
                        insert(this, res.object, 'list');
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar feriado. \n ${getError(err)}`);
                }
            }));
    }

    edit(model: Feriado) {
        let request = MyMap(model, new UpdateFeriadoRequest) as any;
        request.data = moment(model.data).format('YYYY-MM-DD') as unknown as any;

        return this.http.put<RequestResponse>(`${this.url}/feriado`, request)
            .pipe(tap({
                next: (res) => {
                    if (res.success) {
                        res.object = this.mapFeriado(res.object);
                        replace(this, res.object, 'list');
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível editar feriado. \n ${getError(err)}`);
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<RequestResponse>(`${this.url}/feriado/toggle-active/${id}`, {})
            .pipe(tap({
                next: (res) => {
                    if (res.success) {
                        res.object = this.mapFeriado(res.object);
                        replace(this, res.object, 'list');
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar feriado. \n ${getError(err)}`);
                }
            }));
    }


}
