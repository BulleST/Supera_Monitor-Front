import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom,  of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { Professor, Professor_NivelCertificacao, ProfessorCreateRequest, ProfessorEditRequest } from '../models/professor.model';
import { MyMap } from '../utils/map';
import moment from 'moment';
import { Service } from '../helpers/service.service';
import { getError } from '../utils';

@Injectable({
    providedIn: 'root',
})
export class ProfessorService extends Service {
    override list = new BehaviorSubject<Professor[]>([]);

    getNivelCertificacao() {
        return this.http.get<Professor_NivelCertificacao[]>(`${this.url}/professor/certificacao/all`)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível carregar nível de certificação. \n ${getError(err)}`);
                }
            }));
    }

 

    getList(where?: string) {
        console.log('professor.service getList', where)
        return this.http.get<Professor[]>(`${this.url}/professor/all/`)
            .pipe(tap({
                next: list => {
                    list.map(item => {
                        if(item.expedienteInicio)
                            item.expedienteInicio = new Date(moment().format('YYYY-MM-DD') + 'T' + item.expedienteInicio);
                        if(item.expedienteFim)
                            item.expedienteFim = new Date(moment().format('YYYY-MM-DD') + 'T' + item.expedienteFim);
                        if (item.dataNascimento)
                            item.dataNascimento = new Date(moment(item.dataNascimento).format('YYYY-MM-DD'))
                        if (item.dataInicio)
                            item.dataInicio = new Date(moment(item.dataInicio).format('YYYY-MM-DD'))
                    })
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar professores. \n ${getError(err)}`);
                }
            }));
    }

    get(id: number) {
        return new Promise<Professor>(async (resolve, reject) => {
            if (this.list.value.length == 0)
                await lastValueFrom(this.getList('get'));

            var item = this.list.value.find(x => x.id == id) as Professor;
            if (!item){
                this.toastrService.error(`Professor não encontrado.`);
               return reject('Professor não encontrado.')
            }

            if (item.dataInicio)
                item.dataInicio = new Date(moment(item.dataInicio).format('YYYY-MM-DD[T]HH:mm:ss'))

            return resolve(item);
        })
    }

    create(model: Professor) {
        var request = MyMap(model, new ProfessorCreateRequest);
        request.expedienteInicio = model.expedienteInicio ? moment(model.expedienteInicio).format('HH:mm:ss') : undefined;
        request.expedienteFim = model.expedienteInicio ? moment(model.expedienteFim).format('HH:mm:ss') : undefined;
        return this.http.post<RequestResponse>(`${this.url}/professor`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar professor. \n ${getError(err)}`);
                }
            }));
    }

    edit(model: Professor) {
        var request = MyMap(model, new ProfessorEditRequest);
        request.expedienteInicio = model.expedienteInicio ? moment(model.expedienteInicio).format('HH:mm:ss') : undefined;
        request.expedienteFim = model.expedienteInicio ? moment(model.expedienteFim).format('HH:mm:ss') : undefined;
        return this.http.put<RequestResponse>(`${this.url}/professor`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível editar professor. \n ${getError(err)}`);
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<RequestResponse>(`${this.url}/professor/${id}/${activated}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar professor. \n ${getError(err)}`);
                }
            }));
    }


}
