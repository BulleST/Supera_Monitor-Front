import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Service } from '../helpers/service.service';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Monitoramento_Aluno_Item, Monitoramento_Item_Status, Monitoramento_Request, Monitoramento_Response } from '../models/monitoramento.model';
import { MyMap } from '../utils/map';
import { sortBy } from 'sort-by-typescript';

@Injectable({
    providedIn: 'root',
})
export class MonitoramentoService extends Service {
    dashboard = new BehaviorSubject<Monitoramento_Response>({ alunos: [], mesesRoteiro: [] });
    onReload = new EventEmitter<any>();

    getDashboard(request: Monitoramento_Request) {
        return this.http.post<Monitoramento_Response>(`${this.url}/monitoramento`, request)
            .pipe(map(res => {
                res.mesesRoteiro.map(mes => {
                    mes.roteiros.map(roteiro => {
                        roteiro.dataInicio = moment(roteiro.dataInicio).toDate();
                        roteiro.dataFim = moment(roteiro.dataFim).toDate();
                        return roteiro;
                    });
                    return mes;
                });

                res.alunos.map(aluno => {
                    aluno.dataNascimento = aluno.dataNascimento ? moment(aluno.dataNascimento).toDate() : undefined;
                    aluno.items.map(item => {
                        let status = this.getStatus(item);
                        item.status = status;
                        return item;
                    });
                    // aluno.items = aluno.items.sort(sortBy('aula.aula.data'))

                    return aluno
                })

                res.mesesRoteiro = res.mesesRoteiro.sort(sortBy('mes'))
                res.alunos = res.alunos.sort(sortBy('mes'))
                

                this.dashboard.next(res)
                return res;
            }));
    }


    getStatus(item: Monitoramento_Aluno_Item) {
        let aula = item.aula.aula;
        let participacao = item.aula.participacao;
        let reposicaoPara = item.reposicaoPara;

        if (aula.recesso === true)
            return Monitoramento_Item_Status.Recesso;

        else if (aula.active === false && !aula.feriado)
            return Monitoramento_Item_Status.Cancelada;

        else if (aula.active === false && aula.feriado)
            return Monitoramento_Item_Status.Feriado;

        else if (reposicaoPara) {
            if (reposicaoPara.aula.finalizado === false
                && reposicaoPara.participacao.active === true
            )
                return Monitoramento_Item_Status.ReposicaoAgendada;

            else if (reposicaoPara.aula.finalizado == false
                && reposicaoPara.participacao.active == false
            )
                return Monitoramento_Item_Status.ReposicaoDesmarcada;

            else if (reposicaoPara.aula.finalizado === true
                && reposicaoPara.participacao.presente === false
                && reposicaoPara.participacao.active === true
            )
                return Monitoramento_Item_Status.FaltaReposicao;

            else if (reposicaoPara.aula.finalizado === true
                && reposicaoPara.participacao.presente === true
                && reposicaoPara.participacao.active === true
            )
                return Monitoramento_Item_Status.PresenteReposicao;
        }
        else if (!reposicaoPara) {

            if (aula.finalizado === true
                && participacao.presente === false
                && participacao.active === true
                && participacao.alunoContactado
            )
                return Monitoramento_Item_Status.FaltaAlunoContatado;

            else if (aula.finalizado === true
                && participacao.presente === false
                && participacao.active === true
                && !participacao.alunoContactado
            )
                return Monitoramento_Item_Status.FaltaAula;

            else if (participacao.active === false)
                return Monitoramento_Item_Status.FaltaAgendada;

            else if (aula.finalizado === true
                && participacao.presente === true
            )
                return Monitoramento_Item_Status.PresenteNaAula;
        }
        return Monitoramento_Item_Status.Aula;
    }
}