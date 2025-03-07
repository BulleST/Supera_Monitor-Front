export class PerfilCognitivo {
    id: number = 0;
    nome: string = '';
    descricao: string = '';
}

var id = 1;
export var perfisCognitivos: PerfilCognitivo[] = [
    { id: id++, nome: 'Júnior 1', descricao: 'Idade entre 06 e 09 anos'},
    { id: id++, nome: 'Júnior 2', descricao: 'Idade entre 10 e 12 anos'},
    { id: id++, nome: 'Adolescente', descricao: 'Idade entre 13 e 17 anos'},
    { id: id++, nome: 'Adulto', descricao: 'Idade entre 18 e 59 anos'},
    { id: id++, nome: 'Demência Diagnosticada', descricao: 'Possui diagnóstico médico de algum tipo de demência. Há evidência objetiva de declínio cognitivo e interferência nas atividades da vida diária. A memória recente é afetada; há dificuldade em reter novas informações. Ocorrem problemas de linguagem, alteração de humor e mudança de personalidade. Não possuem autonomia para a realização das atividades de ábaco ou AH, necessitam de constante monitoramento do educador ou cuidador. Utilizam o KIT6 - ABC e mesmo assim precisam de assistência.'},
    { id: id++, nome: 'Comprometimento Cognitivo Leve (CCL)', descricao: 'Ocorrem alterações objetivas nas avaliações, porém sem prejuízo nas atividades diárias. Demonstram esquecimentos, porém quando relembrados conseguem produzir. Podem se perder nas conversas, confundir lugares ou ter dificuldade de acompanhar um livro ou um filme. Podem experimentar momentos de ansiedade ou apatia. Podem ter perdas cognitivas decorrentes de outras patologias. Utilizam o kit específico para idosos, mas não conseguiriam avançar além da intermediário 1 do ábaco e AH5.'},
    { id: id++, nome: 'Alterações Cognitivas Relacionadas à Idade', descricao: 'Observam-se objetivamente algumas alterações, principalmente relacionadas a multitarefas, velocidade de raciocínio, memória (principalmente ao recuperar aprendizados recentes), esquecimentos transitórios (não ocorrem constantemente) e habilidades visuoespaciais, mas não afetam a funcionalidade do paciente, que se mantém autônomo. Quando se queixam, comparam seu desempenho atual com o do passado. Geralmente, essas alterações vem acompanhadas da diminuição da percepção sensorial auditiva ou visual. Estão saudáveis.'},
    { id: id++, nome: 'Envelhecimento Saudável', descricao: 'Têm saúde física e são atentos à atitudes preventivas. Mantém a saúde cognitiva, talvez não com a mesma agilidade de quando mais jovens, mas não se queixam de perdas ou dificuldades. Contam com saúde emocional, boa estrutura familiar e se envolvem em atividades sociais.'},
    { id: id++, nome: 'Super Idoso', descricao: 'Estão na faixa dos 80 anos ou mais e, perante um teste cognitivo, apresentam um desempenho igual ou superior ao de pessoas na faixa de 50 a 60 anos. Não apresentam doenças crônicas e não utilizam medicamentos, ou tem poucas condições crônicas que estão perfeitamente controladas e monitoradas. São autônomos e talvez ainda estejam trabalhando. São ativos fisicamente.'},
]	
	
	
	
	
	
	
	
	