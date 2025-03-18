import { Component, ViewChild } from '@angular/core';
import { Checklist } from '../../../../models/checklist.model';
import { DragScrollComponent } from 'ngx-drag-scroll';

@Component({
  selector: 'app-checklist',
  standalone: false,
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.css'
})
export class ChecklistComponent {
    @ViewChild('dragScroll', { read: DragScrollComponent }) dragScroll!: DragScrollComponent;
    checklists: Checklist[] = [];
    
        scrollDragStart(e: DragScrollComponent) {
            this.dragScroll._contentRef.nativeElement.style.cursor = 'grab'
            this.dragScroll._contentRef.nativeElement.style.pointerEvents = 'auto'
    
        }
        scrollDragEnd(e: DragScrollComponent) {
            this.dragScroll._contentRef.nativeElement.style.cursor = 'pointer'
        }

}
