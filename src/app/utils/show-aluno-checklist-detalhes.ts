import { DialogService } from "primeng/dynamicdialog";
import { AlunoChecklistDetalhesComponent, AlunoChecklistDetalhesView } from "../shared/checklist/aluno-checklist-detalhes/aluno-checklist-detalhes.component";

export function showChecklistDetalhes(dialogService: DialogService, view: AlunoChecklistDetalhesView) {
    return dialogService.open(AlunoChecklistDetalhesComponent, {
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
        },
        data: {
            view: view
        }

    });
}