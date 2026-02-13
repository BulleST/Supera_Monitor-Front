import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { Professor, Professor_NivelCertificacao, ProfessorCreateRequest, ProfessorEditRequest } from '../models/professor.model';
import { MyMap } from '../utils/map';
import moment from 'moment';
import { Service } from '../helpers/service.service';
import { getError, insert, replace } from '../utils';
import { sortBy } from 'sort-by-typescript';
import { UrlService } from '../utils/url.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { UserService } from './user.service';

@Injectable({
    providedIn: 'root',
})
export class ProfessorService extends Service {
    override list = new BehaviorSubject<Professor[]>([]);

    constructor(
        private userService: UserService,
         http: HttpClient,
        toastrService: ToastrService,
         urlService: UrlService

    ) {
        super(http, toastrService, urlService);
    }

    mapProfessor(item: Professor) {
        if (item.expedienteInicio)
            item.expedienteInicio = new Date(moment().format('YYYY-MM-DD') + 'T' + item.expedienteInicio);
        if (item.expedienteFim)
            item.expedienteFim = new Date(moment().format('YYYY-MM-DD') + 'T' + item.expedienteFim);
        if (item.dataNascimento)
            item.dataNascimento = new Date(moment(item.dataNascimento).format('YYYY-MM-DD'))
        if (item.dataInicio)
            item.dataInicio = new Date(moment(item.dataInicio).format('YYYY-MM-DD'))
        
        item.active = item.deactivated ? false : true; 
        item.activeString = item.active ? 'Ativo' : 'Inativo';
        return item;
    }

    getNivelCertificacao() {
        return this.http.get<Professor_NivelCertificacao[]>(`${this.url}/professor/certificacao/all`)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível carregar nível de certificação. \n ${getError(err)}`);
                }
            }));
    }

    getList() {
        return this.http.get<Professor[]>(`${this.url}/professor/all/`)
            .pipe(tap({
                next: list => {
                    list = list.map(item => this.mapProfessor(item));
                    list = list.sort(sortBy('nome'));
                    
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar professores. \n ${getError(err)}`);
                }
            }));
    }

    get(id: number) {
        return this.http.get<Professor>(`${this.url}/professor/${id}`).pipe(tap({
            next: res => {
                return of(this.mapProfessor(res));
            },
            error: err => {
                this.toastrService.error(`Não foi possível carregar educador(a). \n ${getError(err)}`);
            }
        }));
        // return new Promise<Professor>(async (resolve, reject) => {
        //     if (this.list.value.length == 0)
        //         await lastValueFrom(this.getList());

        //     var item = this.list.value.find(x => x.id == id) as Professor;
        //     if (!item) {
        //         this.toastrService.error(`Professor não encontrado.`);
        //         return reject('Professor não encontrado.')
        //     }

        //     return resolve(item);
        // })
    }

    create(model: Professor) {
        var request = MyMap(model, new ProfessorCreateRequest);
        request.expedienteInicio = model.expedienteInicio ? moment(model.expedienteInicio).format('HH:mm:ss') : undefined;
        request.expedienteFim = model.expedienteInicio ? moment(model.expedienteFim).format('HH:mm:ss') : undefined;
        return this.http.post<RequestResponse>(`${this.url}/professor`, request)
            .pipe(tap({
                next: res => {
                    if (res.success) {
                        res.object = this.mapProfessor(res.object);
                        // let list = this.list.value;
                        // list.push(res.object);
                        // list = list.sort(sortBy('nome'));
                        // this.list.next(list);
                        insert(this, res.object, 'list', ['nome'])
                    }
                    return res;
                },
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
                next: res => {
                    if (res.success) {
                        res.object = this.mapProfessor(res.object);
                        // let list = this.list.value;
                        // let index = list.findIndex(x => x.id == model.id);
                        // if (index == -1) list.push(res.object);
                        // else list.splice(index, 1, res.object)
                        // list = list.sort(sortBy('nome'));
                        // this.list.next(list);
                        replace(this, res.object, 'list', ['nome'])
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível editar professor. \n ${getError(err)}`);
                }
            }));
    }

    deactivated(item: Professor, activated: boolean = true) {
        return this.userService.deactivated(item.account_Id, activated)
        .pipe(tap({
                next: res => {
                    if (res.success) {
                        item.active = res.object.active;
                        item.deactivated = res.object.deactivated;
                        
                        item = this.mapProfessor(item);
                        replace(this, item, 'list', ['nome'])
                        
                        // let list = this.list.value;
                        // let index = list.findIndex(x => x.id == item.id);
                        // if (index == -1) list.push(item);
                        // else list.splice(index, 1, item)
                        // list = list.sort(sortBy('nome'));
                        // this.list.next(list);

                        res.object = item;
                    }
                    return res;
                },
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar professor. \n ${getError(err)}`);
                }
            }));
    }


}
