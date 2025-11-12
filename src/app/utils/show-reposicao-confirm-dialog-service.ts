import { DialogService } from "primeng/dynamicdialog";
import { Evento_Participacao_Aluno } from "../models/evento-participacao-aluno.model";
import { Evento } from "../models/evento.model";
import { AgendarReposicaoConfirmComponent, AgendarReposicaoConfirmView } from "../shared/evento/agendar-reposicao-confirm/agendar-reposicao-confirm.component";

export function showAgendarReposicaoConfirm(aluno: Evento_Participacao_Aluno, source: Evento, target: Evento, dialogService: DialogService) {
    var view: AgendarReposicaoConfirmView = {
        reposicaoDe: source,
        reposicaoPara: target,
        participacao: aluno,
        observacaoReposicao: '',
    }
    return dialogService.open(AgendarReposicaoConfirmComponent, {
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