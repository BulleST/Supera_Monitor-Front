import { DialogService } from "primeng/dynamicdialog";
import { Evento } from "../models/evento.model";
import { Aluno } from "../models/alunos.model";
import { AgendarReposicaoComponent, AgendarReposicaoView } from "../shared/evento/agendar/agendar-reposicao/agendar-reposicao.component";

export function showAgendarReposicao(dialogService: DialogService, aluno?: Aluno, reposicaoDe?: Evento, reposicaoPara?: Evento) {
    var view: AgendarReposicaoView = {
        eventoReposicaoDe: reposicaoDe,
        eventoReposicaoPara: reposicaoPara,
        aluno: aluno,
    }
    return dialogService.open(AgendarReposicaoComponent, {
        showHeader: false,
        closable: true,
        maximizable: true,
        closeOnEscape: true,
        draggable: true,
        dismissableMask: true,
        duplicate: true,
        modal: true,
        width: '500px',
        style: {
            maxWidth: '95vw',
            maxHeight: '95vh',
        },
        data: {
            view: view
        }
    });
}