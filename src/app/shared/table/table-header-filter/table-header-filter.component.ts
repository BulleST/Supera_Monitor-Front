import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ColumnTable, FilterType } from '../../../utils';
import { FilterMatchMode } from 'primeng/api';

@Component({
    selector: 'app-table-header-filter',
    standalone: false,
    templateUrl: './table-header-filter.component.html',
    styleUrl: './table-header-filter.component.css'
})
export class TableHeaderFilterComponent implements OnChanges {
    @Input() col!: ColumnTable;
    FilterType = FilterType;
    FilterMatchMode = FilterMatchMode;

    ngOnChanges(changes: SimpleChanges): void {
        if(changes['col']) this.col = changes['col'].currentValue;

    }
}
