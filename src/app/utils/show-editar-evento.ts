import { DialogService } from "primeng/dynamicdialog";
import { Evento } from "../models/evento.model";
import { EditarAulaView } from "../shared/evento/editar-aula/editar-aula.component";
import { EditarEventoComponent } from "../shared/evento/editar-evento/editar-evento.component";

export function showEvento(evento: Evento, dialogService: DialogService) {
    let view: EditarAulaView = {
        evento: evento,
    }
    return dialogService.open(EditarEventoComponent, {
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