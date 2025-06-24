import {  Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { lastValueFrom, Subscription } from 'rxjs';
import { Aluno_CheckList_Item, Checklist } from '../../../models/checklist.model';
import { ChecklistService } from '../../../services/checklist.service';
import { Aluno } from '../../../models/alunos.model';
import { AlunoChecklistCompleto } from '../../../models/calendario.model';
import moment from 'moment';

@Component({
    selector: 'app-aluno-checklist',
    standalone: false,
    templateUrl: './aluno-checklist.component.html',
    styleUrl: './aluno-checklist.component.css',
})
export class AlunoChecklistComponent implements OnChanges, OnDestroy {
    @Input() aluno_Id!: number;
    @Input() aluno!: Aluno;
    @Input() showChecklist = false;
    
    atrasado = false;
    subscription: Subscription[] = [];
    loading = false;
    visibleDialog = false;
    checklistVigente?: AlunoChecklistCompleto;

    checklists: Checklist[] = [];
    loadingChecklist = false;

    status = '';
    texto = '';
    icon = '';
    textColor = '';
    
    @Output() alunoChanged = new EventEmitter<Aluno>();

    constructor(
        private checklistService: ChecklistService,
    ) {

        var checklists = checklistService.list.subscribe(res => this.checklists = res);
        this.subscription.push(checklists)

        if (!this.checklists.length) {
            this.loadingChecklist = true;
            lastValueFrom(this.checklistService.getList())
                .then(res => this.loadingChecklist = false)
                .catch(res => this.loadingChecklist = false);
        }

    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['aluno_Id']) {
            this.aluno_Id = changes['aluno_Id'].currentValue;
            console.log('aluno-checklist.component aluno_Id', this.aluno_Id)
        }
        if (changes['showChecklist']) {
            this.showChecklist = changes['showChecklist'].currentValue;
        }
        if (changes['aluno']) {
            this.aluno = changes['aluno'].currentValue;
            if (this.aluno.id) {
                console.log('aluno-checklist.component aluno', this.aluno)
                this.loadChecklist();
            }
        }
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    async loadChecklist() {
        if (this.showChecklist) {

            this.loading = true;

            let alunoChecklist: Aluno_CheckList_Item[] = this.aluno.alunoChecklist;

            if (!this.aluno.alunoChecklist?.length && this.aluno_Id) {
                console.log('if', JSON.parse(JSON.stringify(this.aluno_Id)), JSON.parse(JSON.stringify(this.aluno.alunoChecklist)))
                alunoChecklist = await lastValueFrom(this.checklistService.getChecklistAluno(this.aluno_Id))
            }

            this.aluno.alunoChecklist = alunoChecklist.map(checklistAluno => {
                checklistAluno.finalizado = !!checklistAluno.dataFinalizacao;
                return checklistAluno
            });

            this.aluno.checklistCompleto = this.checklists
                .map(checklist => {
                    var checklistAluno = new AlunoChecklistCompleto;
                    checklistAluno.id = checklist.id;
                    checklistAluno.nome = checklist.nome;
                    checklistAluno.items = alunoChecklist.filter(x => x.checklist_Id == checklist.id);
                    checklistAluno.prazo = checklistAluno.items[0]?.prazo ?? undefined;
                    checklistAluno.itensFinalizados = checklistAluno.items.filter((x: any) => x.finalizado)
                    checklistAluno.itensAtrasados = checklistAluno.items.filter((x: any) => !x.finalizado && moment(x.prazo).week() < moment(new Date).week());
                    checklistAluno.itensEmAndamento = checklistAluno.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);
                    return checklistAluno;
                });

            this.alunoChanged.emit(this.aluno);

            this.checklistVigente = this.aluno.checklistCompleto.find(x => x.id == this.aluno.checklist_Id);

            const itensEmAndamento = this.aluno.checklistCompleto.filter(x => x.itensEmAndamento.length)
            const itensAtrasados = this.aluno.checklistCompleto.filter(x => x.itensAtrasados.length > 0);
            this.atrasado = itensAtrasados.length > 0;

            //  Se tem um checklist vigente
            if (this.checklistVigente) {
                this.texto = this.checklistVigente.nome;
                
                // Finalizado
                if (this.checklistVigente.itensFinalizados.length == this.checklistVigente.items.length) {
                    this.status = 'Finalizado';
                    this.textColor = 'text-green-500';
                    this.icon = 'pi pi-check-circle';
                } 
                // Em andamento
                else if (this.checklistVigente.itensEmAndamento.length > 0 && this.checklistVigente.itensFinalizados.length < this.checklistVigente.items.length) {
                    this.status = 'Em andamento';
                    this.textColor = 'text-orange-500';
                    this.icon = 'pi pi-exclamation-triangle';
                }
            }
            // Se não tem um checklist vigente e o aluno possui checklist em atraso
            else if (!this.checklistVigente && itensAtrasados.length > 0) {
                this.texto = '90 dias vencidos com pendências';
            }
            // Se não tem checklist vigente e o aluno não possui checklist em atraso
            else if (!this.checklistVigente && itensAtrasados.length == 0 && itensEmAndamento.length == 0) {
                this.texto = '90 dias concluídos';
            }
        
            // Atrasado
            if (this.atrasado 
                || (this.checklistVigente 
                && this.checklistVigente.itensAtrasados.length > 0 
                && this.checklistVigente.itensFinalizados.length < this.checklistVigente.items.length)) {
                this.status = 'Atrasado';
                this.textColor = 'text-red-500';
                this.icon = 'pi pi-times-circle';
            }             
            this.loading = false;
        }
    }

}
