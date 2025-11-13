import { DialogService } from "primeng/dynamicdialog";
import { Evento_Participacao_Aluno } from "../models/evento-participacao-aluno.model";
import { Evento } from "../models/evento.model";
import { AgendarReposicaoConfirmView, ReposicaoConfirmComponent } from "../shared/evento/agendar/agendar-reposicao/_reposicao-confirm/reposicao-confirm.component";
import { Aluno } from "../models/alunos.model";

export function showAgendarReposicaoConfirm(
    dialogService: DialogService,
    aluno: Aluno, 
    participacao: Evento_Participacao_Aluno, 
    reposicaoDe: Evento, 
    reposicaoPara: Evento
) {
    var view: AgendarReposicaoConfirmView = {
        aluno,
        participacao,
        reposicaoDe,
        reposicaoPara,
        observacaoReposicao: '',
    }
    return dialogService.open(ReposicaoConfirmComponent, {
        showHeader: false,
        closable: true,
        maximizable: true,
        closeOnEscape: true,
        draggable: true,
        dismissableMask: true,
        duplicate: true,
        modal: true,
        width: '450px',
        style: {
            maxWidth: '95vw',
            maxHeight: '95vh',
        },
        data: {
            view: view
        }
    });
}