import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Crypto } from './crypto';
import { FilterMatchMode } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class Table {

    loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    selectedItems: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
    selectedItem: BehaviorSubject<any | undefined> = new BehaviorSubject<any | undefined>(undefined);
    constructor(
        private crypto: Crypto,
    ) { }

}

export enum DisplayType {
    text = 'text',
    numeric = 'numeric',
    currency = 'currency',
    decimal = 'decimal',
    date = 'date',
    dateTime = 'dateTime',
    options = 'options',
    color = 'color',
    time = 'time',
    mask = 'mask',
    link = 'link',
}

export enum FilterType {
    text = 'text',
    numeric = 'numeric',
    decimal = 'decimal',
    date = 'date',
    dateTime = 'dateTime',
    time = 'time',
    none = 'none',
}


export class ColumnTable {
    field: string = '';
    label: string = '';
    filterType: FilterType = FilterType.text;
    displayType?: DisplayType = DisplayType.text;
    filterMatchMode?: string = FilterMatchMode.CONTAINS.toString();
    options?: any;
    filterValue?: any = '';
    filterOptions?: FilterOptions;
    sortable?: boolean = true;
    frozen?: boolean = false;
}

export interface FilterOptions {
    icon?: string;
    value?: any;
    matchMode: string;
    type: string;
    primeElement: 'inputtext' | 'datepicker' | 'inputmask' | 'select' | 'multiselect';
    primeElementOptions: any;
}

