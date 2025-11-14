import { DialogService } from "primeng/dynamicdialog";
import { FinalizarChecklistComponent, FinalizarChecklistComponentView } from "../shared/checklist/finalizar-checklist/finalizar-checklist.component";

export function showFinalizarChecklist(dialogService: DialogService, view: FinalizarChecklistComponentView) {
    return dialogService.open(FinalizarChecklistComponent, {
            showHeader: false,
            closable: true,
            maximizable: false,
            closeOnEscape: true,
            draggable: true,
            dismissableMask: true,
            duplicate: true,
            modal: true,
            width: '95vw',
            style: {maxWidth: '500px'},
            data: { view }
    });
}