import { DialogService } from "primeng/dynamicdialog";
import { Evento } from "../models/evento.model";
import { EditarParticipacaoContatoComponent, EditarContatoTipo, EditarContatoView } from "../shared/evento/editar-participacao-contato/editar-participacao-contato.component";
import { Evento_Participacao_Aluno } from "../models/evento-participacao-aluno.model";


function getTipo( evento: Evento, participacao: Evento_Participacao_Aluno) {

		
		if (participacao.active && participacao.presente === false && participacao.reposicaoDe_Evento_Id)
			return EditarContatoTipo.FaltaReposicao;

		else if (participacao.active && participacao.reposicaoDe_Evento_Id)
			return EditarContatoTipo.ReposicaoAgendada;

		else if (!participacao.active && participacao.reposicaoDe_Evento_Id)
			return EditarContatoTipo.ReposicaoDesmarcada;
        
		else if (!evento.active) 
			return EditarContatoTipo.Cancelamento;

		else if (!participacao.active)
			return EditarContatoTipo.FaltaAgendada;

		else if (participacao.presente === false)
			return EditarContatoTipo.Falta;

        return EditarContatoTipo.Falta;
}

export function showContato(dialogService: DialogService,
    evento: Evento,
    participacao: Evento_Participacao_Aluno
) {
    const tipo = getTipo(evento, participacao);

    const view: EditarContatoView = {
        evento,
        participacao,
        tipo
    };
    
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