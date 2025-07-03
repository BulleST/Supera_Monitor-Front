
export interface Evento_Participacao_Professor {
    id: number;
    evento_Id: number;
    nome: string;
    phone?: string;
    professor_Id: number;
    presente?: boolean;
    observacao?: string;
    corLegenda: string;
}