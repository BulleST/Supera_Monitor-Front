

insert into Aluno_Checklist_Item (Aluno_Id, Checklist_Item_Id, Prazo)
select 
	Aluno_Id,
	Checklist_Item_Id,
	case datepart(weekday, DataInicioVigencia) 
		when 7 then DATEADD(DAY, ( datepart(weekday, Prazo)) , Prazo)
		else dATEADD(DAY, datepart(weekday, Prazo) + 1 , Prazo)
	end as Prazo
from (
	select 
		aluno.Id as Aluno_Id,
		checklistItem.Id as Checklist_Item_Id,
		checklist.nome as Checklist,
		checklist.NumeroSemana,
		aluno.DataInicioVigencia,
		dateadd(week, checklist.NumeroSemana, aluno.DataInicioVigencia) as Prazo
	from Aluno as aluno
	join Checklist_Item as checklistItem on 1 = 1
	join Checklist as checklist on checklist.Id = checklistItem.Checklist_Id
) as dados