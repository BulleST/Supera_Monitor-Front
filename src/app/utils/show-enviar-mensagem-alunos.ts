import { DialogService } from "primeng/dynamicdialog";
import { EnviarMensagemAlunosComponent, EnviarMensagemAlunosView, MensagemTipo } from "../shared/evento/enviar-mensagem-alunos/enviar-mensagem-alunos.component";
import { Aluno } from "../models/alunos.model";
import { Evento } from "../models/evento.model";

export function showEnviarMensagemAlunos(dialogService: DialogService, 
    alunos: Aluno[], 
    evento: Evento, 
    tipo: MensagemTipo,
    reposicaoDe?: Evento,
    reposicaoPara?: Evento
) {
    var view: EnviarMensagemAlunosView = {
        alunos,
        evento,
        tipo,
        reposicaoDe,
        reposicaoPara
    }
    return dialogService.open(EnviarMensagemAlunosComponent, {
        showHeader: false,
        closable: true,
        maximizable: false,
        closeOnEscape: true,
        draggable: true,
        dismissableMask: true,
        duplicate: true,
        modal: true,
        width: '300px',
        style: {
            maxWidth: '95vw',
            maxHeight: '95vh',
        },
        data: { view }
    });
}