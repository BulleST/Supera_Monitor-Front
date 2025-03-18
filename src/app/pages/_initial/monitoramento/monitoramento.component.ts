import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Aluno_CheckList_Item, Checklist } from '../../../models/checklist.model';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { getError, Header, MobileService } from '../../../utils';
import $ from 'jquery'
import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragMove, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ScreenWidth } from '../../../utils/mobile';
import { lastValueFrom, Subscription } from 'rxjs';
import { ChecklistService } from '../../../services/checklist.service';
import { AlunoService } from '../../../services/alunos.service';
import { Aluno } from '../../../models/alunos.model';
import { CalendarioAlunoChecklistView } from '../../../models/calendario.model';
import moment from 'moment';
import { ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-monitoramento',
    standalone: false,
    templateUrl: './monitoramento.component.html',
    styleUrl: './monitoramento.component.css',
    providers: [ConfirmationService]
})
export class MonitoramentoComponent implements OnDestroy {
    
    checklists: Checklist[] = []; // checklists;
    alunos: Aluno[] = [];
    
    subscription: Subscription[] = [];
    @ViewChild('dragScroll', { read: DragScrollComponent }) dragScroll!: DragScrollComponent;
    width: string = ''
    height: string = ''
    disabled = false
    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth:typeof ScreenWidth = ScreenWidth;

    loadingChecklist = false;
    loadingAlunos = false;
    

    constructor(
        private header: Header,
        private mobileService: MobileService,
        private service: ChecklistService,
        private alunoService: AlunoService,
                private confirmationService: ConfirmationService,
                private toastr: ToastrService,
    ) {

       var screen = this.mobileService.get().subscribe(res => this.screen = res)
        this.subscription.push(screen);
        var menuAsideOpen = this.header.menuAsideOpen.subscribe(res => {
            if (this.dragScroll) {
                this.width = $('#dragContainer').width()?.toString() as string;
                setTimeout(() => {
                    this.dragScroll.scrollbarWidth = $('#dragContainer').width()?.toString() ?? null;
                    this.dragScroll.elWidth = $('#dragContainer').width()?.toString() ?? null;
                }, 200);
            }
        })
        this.subscription.push(menuAsideOpen);

        this.update();

    }

    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }

    async getChecklists() {
        this.loadingChecklist = true;
        await lastValueFrom(this.service.getList())
        .then(res => {
            this.checklists = res;
            this.checklists.push({
                id: -1,
                nome: '',
                ordem: 999999,
                items: [
                    {
                        id: -1,
                        ordem: 999,
                        nome: 'Finalizados',
                        alunos: [],
                        checklist_Id: -1
                    }
                ],
                checklistAlunosItens: []
            });
        })
        this.loadingChecklist = false;
    }

    async getChecklistAlunos() {
        this.loadingAlunos = true;
        await lastValueFrom(this.alunoService.getList())
        .then(alunos => {
            var alunosChecklistItem: Aluno_CheckList_Item[] = alunos.flatMap(x => x.alunoChecklist);

            this.checklists.map(checklist => {
                checklist.items.map(item => {
                    var a = alunosChecklistItem.filter(x => x.checklist_Item_Id == item.id && x.finalizado == false );
                    item.alunos = a
                            .filter(x => (moment(x.prazo).isSameOrBefore(new Date, 'dates') || moment(x.prazo).week() == moment(new Date).week()) )
                        .map(x => {
                                var aluno = alunos.find(aluno => aluno.id == x.aluno_Id) as Aluno;
                            x.aluno = aluno;
                            if (moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week())
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
            var checklist: Checklist[] = JSON.parse(JSON.stringify(this.checklists));
            this.alunos = alunos.map(aluno => {
                aluno.checklistCompleto = checklist.map(ck => {
                    var alunoChecklistView = new CalendarioAlunoChecklistView;
                    alunoChecklistView.id = ck.id;
                    alunoChecklistView.nome = ck.nome;
                    alunoChecklistView.items = aluno.alunoChecklist.filter(x => x.checklist_Id == ck.id)
                    alunoChecklistView.prazo = alunoChecklistView.items[0].prazo;
                    alunoChecklistView.finalizados = alunoChecklistView.items.filter((x: any) => x.finalizado)
                    alunoChecklistView.atrasados = alunoChecklistView.items.filter((x: any) => moment(x.prazo).isSameOrBefore(new Date, 'dates') && !x.finalizado && moment(x.prazo).week() != moment(new Date).week());
                    alunoChecklistView.pendentesDaSemana = alunoChecklistView.items.filter((x: any) => moment(x.prazo).week() == moment(new Date).week() && !x.finalizado);
                    return alunoChecklistView;
                });
                return aluno
            });
            this.loadingAlunos = false;
        })
        .catch(res => {
            this.loadingAlunos = false;
        })
    }

    async update() {
        await this.getChecklists();
        await this.getChecklistAlunos();
    }

    onScroll(e: WheelEvent) {
    }
    
    moveLeft() {
        this.dragScroll.moveLeft();
    }

    moveRight() {
        this.dragScroll.moveRight();
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

        this.height = ($('#dragContainer')!.height()! + 50 + 20 ).toString()
        this.dragScroll.elHeight = this.height


        event.item.data.status = 'Pendente'

      }
    }

    cdkDragMoved(e: CdkDragMove<Aluno_CheckList_Item>) {
        if (e.pointerPosition.x > 500 &&  e.delta.x == 1) {
            this.dragScroll.disabled = false
            $('.drag-scroll-content').scrollLeft($('.drag-scroll-content')!.scrollLeft()! + 10)
        } else if (e.pointerPosition.x < 500 &&  e.delta.x == -1) {
            this.dragScroll.disabled = false
            $('.drag-scroll-content').scrollLeft($('.drag-scroll-content')!.scrollLeft()! - 10)
        }

    }
    
    private dragStart = false
    cdkDragStarted(e: CdkDragStart<Aluno_CheckList_Item>) {
        this.dragStart = true;
        this.disabled = true
        this.dragScroll.dragDisabled = true
        this.dragScroll._contentRef.nativeElement.style.pointerEvents = 'all'
    }
    
    cdkDragEnded(e: CdkDragEnd<Aluno_CheckList_Item>) {
        this.dragStart = false;
        this.disabled = false
        this.dragScroll.dragDisabled = false
        this.dragScroll._contentRef.nativeElement.style.pointerEvents = 'auto'
    }

    private start!: Date;
    private interval!: NodeJS.Timeout
    addClass(div: HTMLDivElement, drag: CdkDrag<Aluno_CheckList_Item>) {
        this.start = new Date();
        
        this.interval = setInterval(() => {
            var miliseconds = Date.now() - this.start.getTime(); // milliseconds elapsed since start
            var seconds = Math.floor(miliseconds / 1000);
            if (miliseconds > parseInt(drag.dragStartDelay.toString())) {
                div.classList.add('cdk-drag-on')
                this.dragScroll.dragDisabled = true;
            }
        }, 100);
        
    }
    
    removeClass(div: HTMLDivElement) {
        div.classList.remove('cdk-drag-on')
        clearInterval(this.interval)
        if (!this.dragStart){
            this.dragScroll.dragDisabled = false;
        }
    }

    scrollDragStart(e: DragScrollComponent) {
        this.dragScroll._contentRef.nativeElement.style.cursor = 'grab'
        this.dragScroll._contentRef.nativeElement.style.pointerEvents = 'auto'

    }

    scrollDragEnd(e: DragScrollComponent) {
        this.dragScroll._contentRef.nativeElement.style.cursor = 'pointer'
    }

    showError(header: string, message: string, e: any) {
        this.confirmationService.confirm({
            target: e.target ?? e,
            message: message,
            header: header,
            icon: 'pi pi-times-circle text-2xl -mr-2 text-red-500 text-red-500',
            acceptLabel: 'OK',
            acceptButtonStyleClass: 'p-button-sm p-button-rounded  px-3 mr-0',
            rejectVisible: false,
        })
    }

    finalizarChecklist(e: any, rel: Aluno_CheckList_Item) {
        if (moment(rel.prazo).week() > moment(new Date).week()) {
            this.showError('Checklist indisponível', 'Você não pode finalizar esse checklist ainda.', e);
            return;
        }
        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja marcar o checklist <b>"${rel.nome}"</b> para o(a) aluno(a) <b>${rel.aluno.nome}</b> como finalizado?`,
            header: 'Finalizar Checklist',
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
                lastValueFrom(this.service.markAsDone(rel.id))
                .then(res => {
                    this.getChecklistAlunos();
                    this.toastr.success('Checkelist finalizado.')
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
