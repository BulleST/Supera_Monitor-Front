import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccordionModule } from 'primeng/accordion';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InplaceModule } from 'primeng/inplace';
import { InputIconModule } from 'primeng/inputicon';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
// import { InputTextareaModule } from 'primeng/inputtextarea';
import { MegaMenuModule } from 'primeng/megamenu';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MultiSelectModule } from 'primeng/multiselect';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { OverlayModule } from 'primeng/overlay';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SliderModule } from 'primeng/slider';
// import { SlideMenuModule } from 'primeng/slidemenu';
import { SpeedDialModule } from 'primeng/speeddial';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { TreeSelectModule } from 'primeng/treeselect';

import { ConfirmationService, FilterMatchMode /*, PrimeNGConfig */ } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';
import { PrimeNG } from 'primeng/config';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

@NgModule({
    imports: [
        CommonModule,
        AccordionModule,
        AvatarModule,
        BadgeModule,
        ButtonModule,
        ButtonGroupModule,
        BreadcrumbModule,
        CalendarModule,
        CardModule,
        CheckboxModule,
        ChipModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ContextMenuModule,
        DatePickerModule,
        DialogModule,
        DividerModule,
        DragDropModule,
        DropdownModule,
        EditorModule,
        FieldsetModule,
        FileUploadModule,
        FloatLabelModule,
        IconFieldModule,
        InplaceModule,
        InputIconModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputMaskModule,
        InputNumberModule,
        InputSwitchModule,
        InputTextModule,
        // InputTextareaModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MultiSelectModule,
        OrganizationChartModule,
        OverlayModule,
        OverlayPanelModule,
        PanelMenuModule,
        PanelModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        ProgressSpinnerModule,
        RippleModule,
        ScrollPanelModule,
        SelectButtonModule,
        SelectModule,
        SidebarModule,
        SkeletonModule,
        // SlideMenuModule,
        SliderModule,
        SplitButtonModule,
        SpeedDialModule,
        TableModule,
        TabViewModule,
        TagModule,
        ToastModule,
        ToolbarModule,
        ToggleButtonModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        TreeSelectModule,
    ],
    exports: [
        CommonModule,
        AccordionModule,
        AvatarModule,
        BadgeModule,
        ButtonModule,
        ButtonGroupModule,
        BreadcrumbModule,
        CalendarModule,
        CardModule,
        CheckboxModule,
        ChipModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ContextMenuModule,
        DatePickerModule,
        DialogModule,
        DividerModule,
        DragDropModule,
        DropdownModule,
        EditorModule,
        FieldsetModule,
        FileUploadModule,
        FloatLabelModule,
        IconFieldModule,
        InplaceModule,
        InputIconModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputMaskModule,
        InputNumberModule,
        InputSwitchModule,
        InputTextModule,
        // InputTextareaModule,
        MegaMenuModule,
        MenuModule,
        MenubarModule,
        MultiSelectModule,
        OrganizationChartModule,
        OverlayModule,
        OverlayPanelModule,
        PanelMenuModule,
        PanelModule,
        PasswordModule,
        PickListModule,
        ProgressBarModule,
        ProgressSpinnerModule,
        RippleModule,
        ScrollPanelModule,
        SelectButtonModule,
        SelectModule,
        SidebarModule,
        SkeletonModule,
        // SlideMenuModule,
        SliderModule,
        SplitButtonModule,
        SpeedDialModule,
        TableModule,
        TabViewModule,
        TagModule,
        ToastModule,
        ToolbarModule,
        TooltipModule,
        ToggleButtonModule,
        TreeModule,
        TreeTableModule,
        TreeSelectModule,
    ],
    providers: [
        ConfirmationService,
    ]
})
export class PrimengModule {
    constructor(
        // private config: PrimeNGConfig,
        private primeng: PrimeNG
    ) {
        // this.translateService.setDefaultLang('pt-BR');
        // this.translateService.use('pt-BR');

        this.primeng.setTranslation({
            startsWith: 'Começa com',
            contains: 'Contém',
            notContains: 'Não contem',
            endsWith: 'Termina com',
            equals: 'Igual a',
            notEquals: 'Diferente de',
            noFilter: 'Sem filtro',
            lt: 'Menor que', // Less Than
            lte: 'Menor que ou igual a', // Less Than or Equal to
            gt: 'Maior que', // Greater than
            gte: 'Maior que ou igual a', // Greater than or equal to
            is: 'Igual a',
            isNot: 'Diferente de',
            before: 'Anterior a',
            after: 'Posterior a',
            dateIs: 'Data igual a',
            dateIsNot: 'Data diferente de',
            dateBefore: 'Data anterior a',
            dateAfter: 'Data posterior a',
            clear: 'Limpar filtro',
            apply: 'Filtrar',
            matchAll: 'Filtrar todos que',
            matchAny: 'Filtrar qualquer um que',
            addRule: 'Adicionar filtro',
            removeRule: 'Remover filtro',
            weak: 'Fraca',
            medium: 'Média',
            strong: 'Forte',
            emptyMessage: 'Nenhum resultado encontrado',
            emptyFilterMessage: 'Nenhum resultado encontrado',
            dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
            dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
            dayNamesMin: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
            monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            chooseYear: 'Ano',
            chooseMonth: 'Mês',
            chooseDate: 'Dia',
            today: 'Hoje',
            dateFormat: 'dd/mm/yy',
            prevYear: 'Anterior',
            nextYear: 'Próximo',
            prevMonth: 'Anterior',
            nextMonth: 'Próximo',
        })

        this.primeng.filterMatchModeOptions = {
            text: [
                FilterMatchMode.STARTS_WITH,
                FilterMatchMode.CONTAINS,
                FilterMatchMode.NOT_CONTAINS,
                FilterMatchMode.ENDS_WITH,
                FilterMatchMode.EQUALS,
                FilterMatchMode.NOT_EQUALS
            ],
            numeric: [
                FilterMatchMode.EQUALS,
                FilterMatchMode.NOT_EQUALS,
                FilterMatchMode.LESS_THAN,
                FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
                FilterMatchMode.GREATER_THAN,
                FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
            ],
            date: [
                FilterMatchMode.DATE_IS,
                FilterMatchMode.DATE_IS_NOT,
                FilterMatchMode.DATE_BEFORE,
                FilterMatchMode.DATE_AFTER,
                FilterMatchMode.STARTS_WITH,
                FilterMatchMode.CONTAINS,
                FilterMatchMode.NOT_CONTAINS,
                FilterMatchMode.ENDS_WITH,
                FilterMatchMode.EQUALS,
                FilterMatchMode.NOT_EQUALS
            ]
        }

    }
}
