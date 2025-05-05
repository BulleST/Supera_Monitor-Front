import { Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom, of, tap } from 'rxjs';
import { RequestResponse } from '../helpers/request-response.interface';
import { TurmaRequest, Turma } from '../models/turma.model';
import moment from 'moment';
import { MyMap } from '../utils/map';
import { Service } from '../helpers/service.service';
import { getError } from '../utils';

@Injectable({
    providedIn: 'root',

})
export class TurmaService extends Service {
    override list = new BehaviorSubject<Turma[]>([]);

    getList() {
        return this.http.get<Turma[]>(`${this.url}/turmas/all/`)
            .pipe(tap({
                next: list => {                    
                    
                    var semana = [ "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", ]
                    list.map(turma => {
                        turma.perfilCognitivoString = turma.perfilCognitivo.map(x => x.nome).join(', ');
                        turma.horario = new Date(moment().format('YYYY-MM-DD') + 'T' + turma.horario);
                        turma.diasDeAulaString = semana[turma.diaSemana] + ' às ' + moment(turma.horario).format('HH[h]mm')
                        turma.active = !turma.deactivated;
                        
                        if (turma.numeroSala != 0 && turma.andar != 0)
                             turma.salaDeAulaString = `${turma.numeroSala} ${turma.andar} º andar`
                        else turma.salaDeAulaString = 'ONLINE'

                        return turma;
                    })

                    this.list.next(list);
                    return of(list);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível carregar turmas. \n ${getError(err)}`);
                }
            }));
    }

    get(id: number) {
        return new Promise<Turma>(async (resolve, reject) => {
            if (this.list.value.length == 0)
                await lastValueFrom(this.getList());

            var item = this.list.value.find(x => x.id == id) as Turma;
            if (!item) {
                this.toastrService.error(`Turma não encontrada.`);
               return reject('Turma não encontrada.')
            }

            return resolve(item);
        })
    }

    create(model: Turma) {
        var request = MyMap(model, new TurmaRequest);

        request.horario = moment(model.horario).format('HH:mm:ss') as unknown as any;
        request.perfilCognitivo = model.perfilCognitivo.map(x => x.id);

        return this.http.post<RequestResponse>(`${this.url}/turmas`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar turma. \n ${getError(err)}`);
                }
            }));
    }

    edit(model: Turma) {
        var request = MyMap(model, new TurmaRequest) as TurmaRequest;
        
        request.horario = moment(model.horario).format('HH:mm:ss') as unknown as any;
        request.perfilCognitivo = model.perfilCognitivo.map(x => x.id);

        return this.http.put<RequestResponse>(`${this.url}/turmas`, request)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível editar turma. \n ${getError(err)}`);
                }
            }));
    }

    deactivated(id: number, activated: boolean = true) {
        return this.http.patch<RequestResponse>(`${this.url}/turmas/toggle-active/${id}`, {})
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível habilitar/desabilitar turma. \n ${getError(err)}`);
                }
            }));
    }


}
