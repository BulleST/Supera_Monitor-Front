import { DialogService } from "primeng/dynamicdialog";
import { Evento } from "../models/evento.model";
import { Aluno } from "../models/alunos.model";
import { AgendarFaltaComponent, AgendarFaltaView } from "../shared/evento/agendar/agendar-falta/agendar-falta.component";

export function showAgendarFalta(dialogService: DialogService, aluno?: Aluno, evento?: Evento) {
    var view: AgendarFaltaView = {
        evento: evento,
        aluno: aluno,
    }
    return dialogService.open(AgendarFaltaComponent, {
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