import { DialogService } from "primeng/dynamicdialog";
import { AgendarSuperacaoComponent } from "../shared/evento/agendar/agendar-superacao/agendar-superacao.component";

export function showAgendarAulaZero(dialogService: DialogService, aluno_Id?: number) {
    return dialogService.open(AgendarSuperacaoComponent, {
        showHeader: false,
        closable: true,
        maximizable: true,
        closeOnEscape: true,
        draggable: true,
        dismissableMask: true,
        duplicate: true,
        modal: true,
        width: '95vw',
        style: {
            maxWidth: '500px',
            maxHeight: '95vh'
        },
        data: {
            aluno_Id
        }
    });
}