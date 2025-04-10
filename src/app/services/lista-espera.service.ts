import { Injectable } from '@angular/core';
import {  tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { Service } from '../helpers/service.service';
import { getError } from '../utils';
import { ListaEspera, ListaEsperaRequest } from '../models/lista-espera.model';

@Injectable({
    providedIn: 'root',

})
export class ListaEsperaService extends Service {

    getList(aula_Id: number) {
        return this.http.get<ListaEspera[]>(`${this.url}/lista-espera/all/${aula_Id}`);
    }

    inserirAlunoListaEspera(model: ListaEsperaRequest) {
        return this.http.post<Response>(`${this.url}/lista-espera`, model)
            .pipe(tap({
                error: err => {
                    this.toastrService.error(`Não foi possível inserir aluno na lista de espera. \n ${getError(err)}`)
                }
            }));
    }

}
