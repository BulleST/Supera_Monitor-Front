import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject,  tap } from 'rxjs';
import { Response } from '../helpers/request-response.interface';
import { Service } from '../helpers/service.service';
import { Aluno_Restricao } from '../models/aluno-restricao.model';
import { getError, insertOrReplace } from '../utils';

@Injectable({
    providedIn: 'root',

})
export class AlunoRestricaoService extends Service {
    override list = new BehaviorSubject<Aluno_Restricao[]>([]);
    restricaoCreated = new EventEmitter<Aluno_Restricao>();


    getList() {
        return this.http.get<Aluno_Restricao[]>(`${this.url}/alunos/restricao/all/`)
    }

    create(model: Aluno_Restricao) {
        return this.http.post<Response>(`${this.url}/alunos/restricao/`, Aluno_Restricao)
            .pipe(tap({
                next: (res: Response) => {
                    insertOrReplace(this, res.object, 'list');
                    this.restricaoCreated.emit(res.object);
                },
                error: err => {
                    this.toastrService.error(`Não foi possível cadastrar restrição. \n ${getError(err)}`)
                }
            }));
    }

}
