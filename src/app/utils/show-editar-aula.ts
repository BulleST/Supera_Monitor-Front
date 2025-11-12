import { DialogService } from "primeng/dynamicdialog";
import { Evento } from "../models/evento.model";
import { EditarAulaComponent, EditarAulaView } from "../shared/evento/editar-aula/editar-aula.component";

export function showAula(evento: Evento, dialogService: DialogService) {
    var view: EditarAulaView = {
        evento: evento,
    }
    return dialogService.open(EditarAulaComponent, {
        showHeader: false,
        closable: true,
        maximizable: true,
        closeOnEscape: true,
        draggable: true,
        dismissableMask: true,
        duplicate: true,
        modal: true,
        width: '1100px',
        style: {
            maxWidth: '95vw',
            maxHeight: '95vh',
        },
        data: {
            view: view
        }
    });
}