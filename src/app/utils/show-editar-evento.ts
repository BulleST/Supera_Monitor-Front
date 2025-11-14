import { DialogService } from "primeng/dynamicdialog";
import { Evento, EventoTipo } from "../models/evento.model";
import { EditarAulaView } from "../shared/evento/editar-aula/editar-aula.component";
import { EditarEventoComponent } from "../shared/evento/editar-evento/editar-evento.component";

export function showEvento(evento: Evento, dialogService: DialogService) {
    let view: EditarAulaView = {
        evento: evento,
    }
    let width = 
        evento.evento_Tipo_Id == EventoTipo.Aula ? '1000px' :
        evento.evento_Tipo_Id == EventoTipo.AulaZero ? '700px' :
        evento.evento_Tipo_Id == EventoTipo.TurmaExtra ? '1000px' :
        evento.evento_Tipo_Id == EventoTipo.Superacao ? '700px' :
        evento.evento_Tipo_Id == EventoTipo.Reuniao ? '600px' :
        evento.evento_Tipo_Id == EventoTipo.Oficina ? '650px' : '1000px';

    return dialogService.open(EditarEventoComponent, {
        showHeader: false,
        closable: true,
        maximizable: true,
        closeOnEscape: true,
        draggable: true,
        dismissableMask: true,
        duplicate: true,
        modal: true,
        width: width,
        style: {
            maxWidth: '95vw',
            maxHeight: '95vh',
        },
        data: {
            view: view
        }
    });
}