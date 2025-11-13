import { DialogService } from "primeng/dynamicdialog";
import { Evento } from "../models/evento.model";
import { Aluno } from "../models/alunos.model";
import { AgendarPrimeiraAulaComponent, AgendarPrimeiraAulaView } from "../shared/evento/agendar/agendar-primeira-aula/agendar-primeira-aula.component";

export function showAgendarPrimeiraAula(dialogService: DialogService, aluno?: Aluno, evento?: Evento) {
    var view: AgendarPrimeiraAulaView = {
        evento: evento,
        aluno: aluno,
    }
    return dialogService.open(AgendarPrimeiraAulaComponent, {
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