import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Aluno_CheckList_Item, Checklist, Checklist_Item } from '../../../models/checklist.model';
// import { DragScrollComponent } from 'ngx-drag-scroll';
import { getError, Header, MobileService } from '../../../utils';
import $ from 'jquery'
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ScreenWidth } from '../../../utils/mobile';
import { lastValueFrom, Subscription } from 'rxjs';
import { ChecklistService } from '../../../services/checklist.service';
import { AlunoService } from '../../../services/alunos.service';
import { Aluno } from '../../../models/alunos.model';
import  moment  from 'moment';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';

@Component({
    selector: 'app-monitoramento',
    standalone: false,
    templateUrl: './monitoramento.component.html',
    styleUrl: './monitoramento.component.css',
    providers: [ConfirmationService]
})
export class MonitoramentoComponent implements OnDestroy {
    checklists: Checklist[] = []; 
    items: Checklist_Item[] = [];
    
    alunos: Aluno[] = [];
    checklistObservacao = '';
    subscription: Subscription[] = [];
    // @ViewChild('dragScroll', { read: DragScrollComponent }) dragScroll!: DragScrollComponent;
    width: string = ''
    height: string = ''
    disabled = false
    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth: typeof ScreenWidth = ScreenWidth;
    loadingChecklist = true;
    loadingAlunos = false;

    constructor(
        private header: Header,
        private mobileService: MobileService,
        private service: ChecklistService,
        private alunoService: AlunoService,
        private confirmationService: ConfirmationService,
        private toastr: ToastrService,
        private mensagemWhatsapp: MensagemWhatsapp,
    ) {

        var screen = this.mobileService.get().subscribe(res => this.screen = res)
        this.subscription.push(screen);
        var menuAsideOpen = this.header.menuAsideOpen.subscribe(res => {
            // if (this.dragScroll) {
            //     this.width = $('#dragContainer').width()?.toString() as string;
            //     setTimeout(() => {
            //         this.dragScroll.scrollbarWidth = $('#dragContainer').width()?.toString() ?? null;
            //         this.dragScroll.elWidth = $('#dragContainer').width()?.toString() ?? null;
            //     }, 200);
            // }
        })
        this.subscription.push(menuAsideOpen);

        this.update();

    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }
    async update() {
        if (!this.checklists.length) 
            await this.getChecklists();

        this.getChecklistAlunos();
    }

    async getChecklists() {
        this.loadingChecklist = true;
        await lastValueFrom(this.service.getList())
            .then(res => {
                this.checklists = res;
                this.items = res.flatMap(x => x.items);
            })
        this.loadingChecklist = false;
    }

     getChecklistAlunos() {
        this.loadingAlunos = true;
        lastValueFrom(this.alunoService.getListWithChecklist())
            .then(alunos => {
                var alunosChecklistItem: Aluno_CheckList_Item[] = alunos.flatMap(x => x.alunoChecklist);
                this.checklists = this.checklists.map(checklist => {
                        checklist.items.map(checklistItem => {
                            var naoFinalizados = alunosChecklistItem.filter(x => x.checklist_Item_Id == checklistItem.id && x.finalizado == false && moment(x.prazo).week() <= moment(new Date).week() );

                            checklistItem.alunos = naoFinalizados
                                .filter(x => !x.prazo || moment(x.prazo).isSameOrBefore(new Date, 'dates'))
                                .map(x => {
                                    var aluno = alunos.find(aluno => aluno.id == x.aluno_Id) as Aluno;
                                    x.aluno = aluno;
                                    if (!x.finalizado && moment(x.prazo).week() < moment(new Date).week())
                                        x.status = 'Atrasado';
                                    else if (moment(x.prazo).week() == moment(new Date).week() && !x.finalizado)
                                        x.status = 'Pendente'
                                    else if (x.finalizado)
                                        x.status = 'Finalizado'
                                    return x;
                                });
                        })
                        return checklist;
                })
                this.alunos = alunos;
              
                this.loadingAlunos = false;
            })
            .catch(res => {
                this.loadingAlunos = false;
            })
    }

    drop(event: CdkDragDrop<Aluno_CheckList_Item[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );

            this.height = ($('#dragContainer')!.height()! + 50 + 20).toString()
            // this.dragScroll.elHeight = this.height


            event.item.data.status = 'Pendente'

        }
    }

    // scrollDragStart(e: DragScrollComponent) {
    //     this.dragScroll._contentRef.nativeElement.style.cursor = 'grab'
    //     this.dragScroll._contentRef.nativeElement.style.pointerEvents = 'auto'

    // }

    // scrollDragEnd(e: DragScrollComponent) {
    //     this.dragScroll._contentRef.nativeElement.style.cursor = 'pointer'
    // }
    
    enviarMensagem(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
    }
    
    enviarMensagemApresentacaoDiretorFranqueado(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemApresentacaoDiretorFranqueado(aluno.nome, aluno.celular);
    }
    enviarMensagemBoasVindas(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemBoasVindas(aluno.nome, aluno.celular);
    }
    enviarMensagemAdequacaoTurma(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemAdequacaoTurma(aluno.nome, aluno.celular);
    }
    enviarMensagemLembreteOficina(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemLembreteOficina(aluno.nome, aluno.celular);
    }
    enviarMensagemLembreteSuperacao(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemLembreteSuperacao(aluno.nome, aluno.celular);
    }
    enviarMensagemFeedbackPosVenda(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemFeedbackPosVenda(aluno.nome, aluno.celular);
    }
    enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno: Aluno) {
        return this.mensagemWhatsapp.enviarMensagemConfirmacaoPreenchimentoFeedbackPosVenda(aluno.nome, aluno.celular);
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target ?? e,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-4xl -mr-2 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    finalizarChecklist(e: any, item: Aluno_CheckList_Item) {
        this.confirmationService.confirm({
            key: 'checklistConfirmation',
            message: `Tem certeza que deseja marcar o item <b>"${item.nome}"</b> para o(a) aluno(a) <b>${item.aluno.nome}</b> como finalizado?`,
            header: 'Finalizar item da jornada',
            icon: 'pi pi-exclamation-triangle',
            acceptIcon: 'pi pi-check',
            acceptLabel: 'Finalizar',
            acceptButtonStyleClass: 'p-button-rounded p-button-sm px-3 mr-0',
            rejectVisible: true,
            rejectIcon: 'pi pi-times',
            rejectLabel: 'Cancelar',
            rejectButtonStyleClass: 'p-button-rounded p-button-sm p-button-outlined',
            accept: async () => {
                this.loadingAlunos = true;
                item.observacoes = this.checklistObservacao
                lastValueFrom(this.service.markAsDone(item.id, this.checklistObservacao))
                    .then(res => {
                        this.checklistObservacao = '';
                        // this.getChecklistAlunos();
                        this.toastr.success('Checkelist finalizado.');

                        // var checklist = this.checklists.find(x => x.id == item.checklist_Id) as Checklist; 
                        // var checklistItem = checklist.items.find(x => x.id == item.checklist_Item_Id) as Checklist_Item;
                        // var index = checklistItem?.alunos.findIndex(x => x.id == item.id);
                        // console.log('checklist', checklist)
                        // console.log('checklistItem', checklistItem)
                        // console.log('index', index)
                        // if (index != -1) checklistItem?.alunos.splice(index, 1)


                    })
                    .catch(res => {
                        this.loadingAlunos = false;
                        this.showError('Não foi possível finalizar checklist.', getError(res), e)
                    })
            },
            reject: () => {
            }
        });

    }
}
