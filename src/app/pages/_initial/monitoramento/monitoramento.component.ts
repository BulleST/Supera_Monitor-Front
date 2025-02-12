import { Component, OnDestroy, ViewChild } from '@angular/core';
import { Aluno_CheckList, Checklist, checklists } from '../../../models/checklist.model';
import { DragScrollComponent } from 'ngx-drag-scroll';
import { Header, MobileService } from '../../../utils';
import $ from 'jquery'
import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragMove, CdkDragStart, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ScreenWidth } from '../../../utils/mobile';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-monitoramento',
    standalone: false,
    templateUrl: './monitoramento.component.html',
    styleUrl: './monitoramento.component.css',
})
export class MonitoramentoComponent implements OnDestroy {
    subscription: Subscription[] = [];
    checklists: Checklist[] = checklists;
    @ViewChild('dragScroll', { read: DragScrollComponent }) dragScroll!: DragScrollComponent;
    width: string = ''
    height: string = ''
    disabled = false
    screen: ScreenWidth = ScreenWidth.lg;
    ScreenWidth:typeof ScreenWidth = ScreenWidth;
    
    constructor(
        private header: Header,
        private mobileService: MobileService
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

    }
    ngOnDestroy(): void {
        this.subscription.forEach(e => e.unsubscribe());
    }


    onScroll(e: WheelEvent) {
    }
    moveLeft() {
        this.dragScroll.moveLeft();
    }

    moveRight() {
        this.dragScroll.moveRight();
    }
    drop(event: CdkDragDrop<Aluno_CheckList[]>) {
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

    cdkDragMoved(e: CdkDragMove<Aluno_CheckList>) {
        if (e.pointerPosition.x > 500 &&  e.delta.x == 1) {
            this.dragScroll.disabled = false
            $('.drag-scroll-content').scrollLeft($('.drag-scroll-content')!.scrollLeft()! + 10)
        } else if (e.pointerPosition.x < 500 &&  e.delta.x == -1) {
            this.dragScroll.disabled = false
            $('.drag-scroll-content').scrollLeft($('.drag-scroll-content')!.scrollLeft()! - 10)
        }

    }
    
    private dragStart = false
    cdkDragStarted(e: CdkDragStart<Aluno_CheckList>) {
        this.dragStart = true;
        this.disabled = true
        this.dragScroll.dragDisabled = true
        this.dragScroll._contentRef.nativeElement.style.pointerEvents = 'all'
    }
    
    cdkDragEnded(e: CdkDragEnd<Aluno_CheckList>) {
        this.dragStart = false;
        this.disabled = false
        this.dragScroll.dragDisabled = false
        this.dragScroll._contentRef.nativeElement.style.pointerEvents = 'auto'
    }

    private start!: Date;
    private interval!: NodeJS.Timeout
    addClass(div: HTMLDivElement, drag: CdkDrag<Aluno_CheckList>) {
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
}
