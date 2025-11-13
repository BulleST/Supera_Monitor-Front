import { DialogService } from "primeng/dynamicdialog";
import { Evento } from "../models/evento.model";
import { EditarParticipacaoContatoComponent, EditarContatoTipo, EditarContatoView } from "../shared/evento/editar-participacao-contato/editar-participacao-contato.component";
import { Evento_Participacao_Aluno } from "../models/evento-participacao-aluno.model";

export function showContatoFalta(dialogService: DialogService,
    evento: Evento,
    participacao: Evento_Participacao_Aluno,
    tipo: EditarContatoTipo
) {
    var view: EditarContatoView = {
        evento,
        participacao,
        tipo
    }
    return dialogService.open(EditarParticipacaoContatoComponent, {
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