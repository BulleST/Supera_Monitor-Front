import { DialogService } from "primeng/dynamicdialog";
import { AgendarAula0Component } from "../shared/evento/agendar/agendar-aula-0/agendar-aula-0.component";

export function showAgendarAulaZero(dialogService: DialogService, aluno_Id?: number) {
    return dialogService.open(AgendarAula0Component, {
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