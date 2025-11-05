import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Service } from '../helpers/service.service';
import moment from 'moment';
import 'moment/locale/pt-br';
import { Dashboard_Aluno_Aula_Reposicao, Dashboard_Item_Status, Dashboard_Request, Dashboard } from '../models/dashboard.model';

@Injectable({
    providedIn: 'root',
})
export class MonitoramentoService extends Service {
    dashboard = new BehaviorSubject<Dashboard>({ alunos: [], mesesRoteiro: [] });
    onReload = new EventEmitter<any>();

    getDashboard(request: Dashboard_Request) {
        return this.http.post<Dashboard>(`${this.url}/monitoramento`, request)
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

                    return aluno
                })
                this.dashboard.next(res)
                return res;
            }));
    }


    getStatus(item: Dashboard_Aluno_Aula_Reposicao) {
        let aula = item.aula.aula;
        let participacao = item.aula.participacao;
        let reposicaoPara = item.reposicaoPara;

        if (aula.recesso)
            return Dashboard_Item_Status.Recesso;

        else if (aula.active === false && !aula.feriado)
            return Dashboard_Item_Status.Cancelada;

        else if (aula.active === false && aula.feriado)
            return Dashboard_Item_Status.Feriado;

        else if (reposicaoPara) {
            if (reposicaoPara.aula.finalizado === false
                && reposicaoPara.participacao.active === true
            )
                return Dashboard_Item_Status.ReposicaoAgendada;

            else if (reposicaoPara.aula.finalizado == false
                && reposicaoPara.participacao.presente == false
                && reposicaoPara.participacao.active == false
            )
                return Dashboard_Item_Status.ReposicaoDesmarcada;

            else if (reposicaoPara.aula.finalizado === true
                && reposicaoPara.participacao.presente === false
                && reposicaoPara.participacao.active === true
            )
                return Dashboard_Item_Status.FaltaReposicao;

            else if (reposicaoPara.aula.finalizado === true
                && reposicaoPara.participacao.presente === true
                && reposicaoPara.participacao.active === true
            )
                return Dashboard_Item_Status.PresenteReposicao;
        }
        else if (!reposicaoPara) {

            if (aula.finalizado === true
                && participacao.presente === false
                && participacao.active === true
                && participacao.alunoContactado
            )
                return Dashboard_Item_Status.FaltaAlunoContatado;

            else if (aula.finalizado === true
                && participacao.presente === false
                && participacao.active === true
                && !participacao.alunoContactado
            )
                return Dashboard_Item_Status.FaltaAula;

            else if (participacao.presente === false
                && participacao.active === false
            )
                return Dashboard_Item_Status.FaltaAgendada;

            else if (aula.finalizado === false
                && participacao.presente === false
                && participacao.active === false
            )
                return Dashboard_Item_Status.FaltaAgendada;

            else if (aula.finalizado === true
                && participacao.presente === true
            )
                return Dashboard_Item_Status.PresenteNaAula;
        }
        return Dashboard_Item_Status.Aula;
    }
}