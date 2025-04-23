using Supera_Monitor_Back.Models;

namespace Supera_Monitor_Back.Entities.Views;

public partial class CalendarioEventoList {

    public int Id { get; set; }

    public int Evento_Tipo_Id { get; set; }

    public DateTime Data { get; set; }

    public int? Sala_Id { get; set; }

    public string Descricao { get; set; } = null!;

    public string? Observacao { get; set; }

    public int DuracaoMinutos { get; set; }

    public bool Finalizado { get; set; }

    public DateTime Created { get; set; }

    public DateTime? LastUpdated { get; set; }

    public DateTime? Deactivated { get; set; }

	public int? ReagendamentoDe_Evento_Id { get; set; }

	public int? ReagendamentoPara_Evento_Id { get; set; }

    public int? Professor_Id { get; set; }

    public int? Turma_Id { get; set; }

    public int? CapacidadeMaximaAlunos { get; set; }

    public int? Roteiro_Id { get; set; }

    public string? CorLegenda { get; set; }

    public string? Professor { get; set; }

    public string? Tema { get; set; }

    public int? Semana { get; set; }

    public int? Andar { get; set; }

    public int? NumeroSala { get; set; }

    public string? Turma { get; set; }

    public string Evento_Tipo { get; set; } = null!;

    public int? Account_Created_Id { get; set; }

    public string? Account_Created { get; set; }

    public bool IsActive => Deactivated == null;

    public virtual ICollection<CalendarioAlunoList> Alunos { get; set; } = new List<CalendarioAlunoList>();

    public virtual ICollection<CalendarioProfessorList> Professores { get; set; } = new List<CalendarioProfessorList>();

    public virtual ICollection<PerfilCognitivoModel> PerfilCognitivo { get; set; } = new List<PerfilCognitivoModel>();
}


namespace Supera_Monitor_Back.Entities.Views;

public class CalendarioAlunoList {
    public int Id { get; set; }

    public int Aluno_Id { get; set; }

    public int Evento_Id { get; set; }

    public string? Checklist { get; set; }

    public int? Checklist_Id { get; set; }

    public string? Aluno { get; set; }

    public string? Celular { get; set; }

    public string? Aluno_Foto { get; set; }

    public int Turma_Id { get; set; }

    public string? Turma { get; set; }

	public int? ReposicaoDe_Evento_Id { get; set; }
	public int? ReposicaoPara_Evento_Id { get; set; }

	public bool? Presente { get; set; }

    public int? Apostila_Kit_Id { get; set; }

    public string? Kit { get; set; }

    public string? Apostila_Abaco { get; set; }

    public int? Apostila_Abaco_Id { get; set; }

    public string? Apostila_AH { get; set; }

    public int? Apostila_AH_Id { get; set; }

    public int? NumeroPaginaAbaco { get; set; }

    public int? NumeroPaginaAH { get; set; }

    public string? Observacao { get; set; }

	public DateTime? Deactivated { get; set; }

	public DateTime? DataInicioVigencia { get; set; }

	public DateTime? DataFimVigencia{ get; set; }

	public int? PerfilCognitivo_Id { get; set; }

    public string PerfilCognitivo { get; set; } = null!;

    public bool FlagAlunoNovo => false;
}
using Supera_Monitor_Back.Entities.Views;

namespace Supera_Monitor_Back.Models.Eventos;

public class Dashboard {
    public bool Show { get; set; } = false;
	public bool PrimeiraAula { get; set; } = false;
	public int Roteiro_Id { get; set; }
    public int Aluno_Id { get; set; }
	public CalendarioEventoList Aula { get; set; } = null!;
	public CalendarioAlunoList Participacao { get; set; } = null!;
}

[HttpGet("dashboard/{ano}")]
public ActionResult<List<Dashboard>> Dashboard(int ano)
{
    try {
        // Se ano for menor que 2025, ele será ajustado para 2025
        // Se ano for maior que o ano atual, ele será ajustado para o ano atual
        // Se ano já estiver dentro do intervalo, ele permanece inalterado.
        ano = Math.Clamp(ano, 2025, DateTime.Now.Year);

        var response = _eventoService.Dashboard(ano);

        return Ok(response);
    } catch (Exception e) {
        _logger.LogError(e, MethodBase.GetCurrentMethod()!.DeclaringType!.Name.ToString() + "." + MethodBase.GetCurrentMethod()!.ToString());
        return StatusCode(500, e);
    }
}
public List<Dashboard> Dashboard(int ano);

public List<Dashboard> Dashboard(int ano)
{

    DateTime intervaloDe = new DateTime(ano, 1, 1);
    DateTime intervaloAte = intervaloDe.AddYears(1);

    List<Dashboard> response = new();

    List<CalendarioEventoList> eventos = _db.CalendarioEventoLists
        .Where(x => x.Data.Year == ano && x.Evento_Tipo_Id == ( int )EventoTipo.Aula)
        .OrderBy(x => x.Data)
        .ToList();

    var a = eventos.Find(x => x.Id == 279);

    List<CalendarioAlunoList> participacoes = _db.CalendarioAlunoLists.ToList();


    List<Turma> turmas = _db.Turmas
        .Where(t => t.Deactivated == null)
        .Include(t => t.Alunos!).ThenInclude(x => x.Apostila_Abaco)
        .Include(t => t.Alunos!).ThenInclude(x => x.Apostila_AH)
        .Include(t => t.Professor!).ThenInclude(t => t.Account)
        .Include(t => t.Sala)
        .OrderBy(x => x.Id)
        .ToList();

    List<AlunoList> alunos = _db.AlunoLists.Where(t => t.Deactivated == null)
        .ToList();


    List<Roteiro> roteiros = _db.Roteiros
        .Where(x => x.DataInicio.Date >= intervaloDe.Date && x.DataFim.Date <= intervaloAte.Date)
        .OrderBy(x => x.DataInicio)
        .ToList();

    //
    // Monta os roteiros
    // Se o mês tiver menos que 4 roteiros cadastrados, completa com 4
    //
    #region Roteiros
    List<string> meses = new List<string>() { "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro" };

    Roteiro lastRoteiro;
    int lastSemana;
    List<DateTime> lastIntervalo = new List<DateTime>();
    int mesIndex = 1;

    foreach (string mesString in meses) {
        var roteirosMes = roteiros.Where(x => x.DataInicio.Month == mesIndex).ToList();

        if (roteirosMes.Count > 0) {
            lastRoteiro = roteirosMes[roteirosMes.Count - 1];
            lastSemana = lastRoteiro.Semana;
            lastIntervalo = new List<DateTime>() { lastRoteiro.DataInicio, lastRoteiro.DataFim };
        } else {
            DateTime inicio = new DateTime(ano, mesIndex, 1);
            DateTime fim = inicio.AddDays(7);
            lastIntervalo = new List<DateTime>() { inicio, fim };
            lastSemana = 0;
        }

        if (roteirosMes.Count < 4) {
            int diff = 4 - roteirosMes.Count;

            for (int i = 1 ; i <= diff ; i++) {
                DateTime inicio = lastIntervalo[0].AddDays(7);
                DateTime fim = lastIntervalo[1].AddDays(7);

                roteiros.Add(new Roteiro() {
                    Id = -1,
                    Account_Created_Id = -1,
                    CorLegenda = "black",
                    Semana = ++lastSemana,
                    Tema = "Tema indefinido",
                    Created = DateTime.Now,
                    LastUpdated = null,
                    Deactivated = null,
                    DataInicio = inicio,
                    DataFim = fim,
                    Evento_Aulas = new List<Evento_Aula>() { }
                });

                lastIntervalo = new List<DateTime>() { inicio, fim };
            }
        }
        mesIndex += 1;
    }
    #endregion

    roteiros = roteiros.OrderBy(x => x.DataInicio).ToList();

    foreach (Roteiro roteiro in roteiros)
    {
    
        foreach (Turma turma in turmas)
        {

            // Encontra a Data da aula da turma naquela semana do roteiro
            List<AlunoList> alunosTurma = alunos.Where(x => x.Turma_Id == turma.Id).ToList();
            DayOfWeek roteiroWeek = roteiro.DataInicio.DayOfWeek;


            // Recupera o próximo data do dia da semana da turma a partir do inicio do roteiro
            var diff = 6 - (int)roteiroWeek + turma.DiaSemana;
            DateTime data = roteiro.DataInicio.AddDays(diff);


            // se a data do dia da semana estiver antes do inicio do roteiro ou depois do fim do roteiro
            // ou seja, fora do intervalo, procura a data mais próxima a partir do domingo da semana do roteiro
            if (data.Date < roteiro.DataInicio.Date || data.Date > roteiro.DataFim.Date)
            {
                DateTime domingo = roteiro.DataInicio.AddDays(-(int)roteiroWeek);
                data = domingo.AddDays(turma.DiaSemana);
            }

            // Calcular primeira Aula
            int diaSemanaTurma = (int)turma.DiaSemana;


            List<CalendarioEventoList>? aulas = eventos.Where(a => a.Roteiro_Id == roteiro.Id && a.Turma_Id == turma.Id).ToList();
            if (aulas.Count > 0 ) {
                
                foreach(CalendarioEventoList aula in aulas)
                {
                

                    var participacoesAula = participacoes.Where(x => x.Evento_Id == aula.Id).ToList();

                    foreach (CalendarioAlunoList participacao in participacoesAula) {

                        DateTime? dataInicioVigencia = participacao.DataInicioVigencia.Value;
                        DateTime novaData = dataInicioVigencia.Value.AddDays(diff);

                        Dashboard dashboard = new() {
                            Show = true,
                            Roteiro_Id = roteiro.Id,
                            Aluno_Id = participacao.Aluno_Id,
                            PrimeiraAula = novaData.Date == data.Date,
                            Aula = aula,
                            Participacao = participacao,
                        };
                        response.Add(dashboard);
                    }

                }

            } 
            else {
                if (data.Date >= roteiro.DataInicio.Date && data.Date <= roteiro.DataFim.Date)
                {

                    CalendarioEventoList pseudoAula = new()
                    {
                        Id = -1,
                        Data = new DateTime(data.Year, data.Month, data.Day, turma!.Horario!.Value.Hours, turma.Horario.Value.Minutes, 0),
                        Descricao = turma.Nome,
                        Evento_Tipo_Id = (int)EventoTipo.Aula,

                        DuracaoMinutos = 120,
                        Finalizado = false,
                        Roteiro_Id = roteiro.Id,
                        ReagendamentoDe_Evento_Id = null,
                        Deactivated = null,
                        Observacao = null,

                        Professor_Id = turma?.Professor_Id,
                        Professor = turma?.Professor is not null ? turma.Professor.Account.Name : "Professor indefinido",
                        CorLegenda = turma?.Professor is not null ? turma.Professor.CorLegenda : "#000",

                        Sala_Id = turma?.Sala_Id,
                        NumeroSala = turma?.Sala?.NumeroSala,
                        Andar = turma?.Sala?.Andar,

                        Turma_Id = turma.Id,
                        Turma = turma.Nome,
                        CapacidadeMaximaAlunos = turma.CapacidadeMaximaAlunos,

                    };
                
                    foreach (var aluno in alunosTurma)
                {

                    CalendarioAlunoList pseudoParticipacao = new()
                    {
                        Id = -1,
                        Evento_Id = -1,
                        Aluno_Id = aluno.Id,
                        Aluno = aluno.Nome!,
                        Celular = aluno.Celular!,
                        Checklist_Id = aluno.Checklist_Id,
                        Checklist = aluno.Checklist,
                        DataInicioVigencia = aluno.DataInicioVigencia,
                        DataFimVigencia = aluno.DataFimVigencia,

                        Apostila_Abaco = aluno.Apostila_Abaco,
                        Apostila_Abaco_Id = aluno.Apostila_Abaco_Id,
                        NumeroPaginaAbaco = aluno.NumeroPaginaAbaco,

                        Apostila_AH = aluno.Apostila_AH,
                        Apostila_AH_Id = aluno.Apostila_AH_Id,
                        NumeroPaginaAH = aluno.NumeroPaginaAH,

                        Turma_Id = turma.Id,
                        Turma = turma.Nome,
                    };

                    Dashboard dashboard = new()
                    {
                        Roteiro_Id = roteiro.Id,
                        Aluno_Id = aluno.Id,
                        Participacao = pseudoParticipacao,
                        Aula = pseudoAula
                    };

                    // Se o aluno não estiver vigente naquela data, não insere aula/participação para ele
                    if ((aluno.DataInicioVigencia.HasValue && data.Date >= aluno.DataInicioVigencia.Value.Date) && (!aluno.DataFimVigencia.HasValue || data.Date <= aluno.DataFimVigencia.Value.Date))
                    {
                        DateTime? dataInicioVigencia = aluno.DataInicioVigencia.Value;
                        DateTime novaData = dataInicioVigencia.Value.AddDays(diff);
                        dashboard.PrimeiraAula = novaData.Date == data.Date;
                        dashboard.Show = true;
                    }

                    response.Add(dashboard);
                }
                }

            }
        }
    }

    response = response.OrderByDescending(x => x.Aula.Data).ToList();

    return response;
}