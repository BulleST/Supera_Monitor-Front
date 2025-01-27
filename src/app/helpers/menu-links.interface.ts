
export interface MenuTableLink {
    routePath: string[]; // Especifica apenas os paths da rota sem os params
    paramsFieldName?: string[]; // Especifica qual campo é usado para o alor do parametro
    fullRoute?: string[]; // É atribuido a junção de routePath + paramsFieldName criptografado
    label: string; // Texto do link
}