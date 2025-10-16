
export interface Evento_Participacao_Professor {
    id: number;
    evento_Id: number;
    nome: string;
    telefone?: string;
    professor_Id: number;
    presente?: boolean;
    observacao?: string;
    corLegenda: string;

    created: Date 
    deactivated?: Date;
    active: boolean;
}