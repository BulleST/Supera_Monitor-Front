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
    boolean = 'boolean',
    none = 'none',
}


export interface ColumnTable {
    field: string;
    label: string;
    displayType: DisplayType;
    filterOptions: FilterOptions;
    options?: any;
    sortable?: boolean;
    frozen?: boolean;
}

export interface FilterOptions {
    type: string;
    icon?: string;
    value?: any;
    matchMode?: string;
    primeElement?: 'inputtext' | 'datepicker' | 'inputmask' | 'select' | 'multiselect' | 'inputnumber' | 'toggleswitch';
    primeElementOptions?: any;
}

