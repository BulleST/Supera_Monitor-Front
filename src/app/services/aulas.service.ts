import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { calendarioList, CalendarioList, CalendarioRequest, CalendarioView } from '../models/calendario.model';
import { Service } from '../helpers/service.service';
import { AulaCreateRequest, AulaEditRequest } from '../models/aulas.model';
import { ChamadaRequest } from '../models/chamada.model';
import moment from 'moment';
import { ReagendarAulaRequest, ReposicaoAluno } from '../models/reposicao.model';
import { getError } from '../utils';



@Injectable({
    providedIn: 'root',
})
export class AulaService extends Service {
    override list = new BehaviorSubject<CalendarioList[]>([]);

    aula = new BehaviorSubject<CalendarioList | undefined>(undefined);
    reposicao = new BehaviorSubject<ReposicaoAluno | undefined>(undefined);
    calendarView = new BehaviorSubject<CalendarioView>(CalendarioView.MeuCalendario);

    calendarioReload = new EventEmitter<boolean>();

    getCalendario(request: CalendarioRequest) {


        if (!request.intervaloDe) {
            request.intervaloDe = moment(new Date).add((new Date).getDay() - 6).toDate()
        }
        if (!request.intervaloAte) {
            request.intervaloAte = moment(new Date).add((new Date).getDay() + 6).toDate()
        }


        return this.http.post<CalendarioList[]>(`${this.url}/aulas/calendario/`, request)
            .pipe(tap({
                next: list => {
                    console.log('list', JSON.parse(JSON.stringify(list)))
                    list.map(x => {
                        x.data = moment(x.data, 'YYYY-MM-DD HH:mm:ss').toDate()
                        return x
                    })
                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar calendário. \n ${getError(err)}`);
                }
            }));
    }

    get(id?: number, data?: Date) {
        return new Observable<CalendarioList>((observer => {
            var item = this.list.value.find(x => x.aula_Id == id && x.data == data);
            if (item) 
                observer.next(item);
            else  {
                this.toastrService.error(`Aula não encontrada.`);
                observer.error('Aula não encontrada.')
            }
            
            observer.complete();
            return;
        }))
    }

    create(request: AulaCreateRequest) {
        return this.http.post<Response>(`${this.url}/aulas`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar aula. \n ${getError(err)}`);
                }
            }));
    }
    
    edit(request: AulaEditRequest) {
        return this.http.put<Response>(`${this.url}/aulas`, request)
        .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível editar aula. \n ${getError(err)}`);
                }
            }));
        }
        
        deactivated(id: number, activated: boolean = true) {
            return this.http.patch<Response>(`${this.url}/alunos/${id}/${activated}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar aluno. \n ${getError(err)}`);
                }
            }));
    }
    chamada(request: ChamadaRequest) {
        return this.http.post<Response>(`${this.url}/aulas/chamada`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar aula. \n ${getError(err)}`);
                }
            }));
    }

    reagendar(request: ReagendarAulaRequest) {
        return this.http.patch<Response>(`${this.url}/aulas/reagendar`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível reagendar aula. \n ${getError(err)}`);
                }
            }));
    }


}
