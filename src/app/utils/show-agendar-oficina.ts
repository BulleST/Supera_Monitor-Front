import { DialogService } from "primeng/dynamicdialog";
import { Evento } from "../models/evento.model";
import { Aluno } from "../models/alunos.model";
import { AgendarOficinaComponent, AgendarOficinaView } from "../shared/evento/agendar/agendar-oficina/agendar-oficina.component";

export function showAgendarOficina(dialogService: DialogService, aluno?: Aluno, evento?: Evento) {
    var view: AgendarOficinaView = {
        evento: evento,
        aluno: aluno,
    }
    return dialogService.open(AgendarOficinaComponent, {
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