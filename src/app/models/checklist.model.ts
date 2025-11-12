import { Aluno } from "./alunos.model";

export interface Checklist {
    id: number;
    nome: string;
    items: Checklist_Item[];
    ordem: number;
}

export interface Checklist_Item {
    id: number;
    checklist_Id: number;
    nome: string;
    ordem: number;
}

