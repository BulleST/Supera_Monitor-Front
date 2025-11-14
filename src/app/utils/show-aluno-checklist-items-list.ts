import { DialogService } from "primeng/dynamicdialog";
import { JornadaSupera_List_Aluno } from "../models/jornada-supera-list.model";
import { AlunoJornadaComponent, AlunoChecklistItemListView } from "../shared/checklist/aluno-jornada/aluno-jornada.component";
import { Aluno } from "../models/alunos.model";

export function showAlunoJornada(
    dialogService: DialogService,
    aluno_Id: number,
    aluno: Aluno,
    jornada?: JornadaSupera_List_Aluno
) {
    let view: AlunoChecklistItemListView = {
        aluno_Id,
        aluno,
        jornada
    }
    return dialogService.open(AlunoJornadaComponent, {
        showHeader: false,
        closable: true,
        maximizable: true,
        closeOnEscape: true,
        draggable: true,
        dismissableMask: true,
        duplicate: true,
        modal: true,
        width: '450px',
        style: {
            maxWidth: '95vw',
            maxHeight: '95vh',
        },
        data: { view }
    });
}