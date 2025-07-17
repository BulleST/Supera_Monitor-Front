import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Módulos essenciais - baseado na análise dos templates HTML
import { AccordionModule } from 'primeng/accordion';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { BadgeModule } from 'primeng/badge';
import { BlockUIModule } from 'primeng/blockui';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ColorPickerModule } from 'primeng/colorpicker'
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FluidModule } from 'primeng/fluid';
import { IconFieldModule } from 'primeng/iconfield';
import { ImageModule } from 'primeng/image';
import { InputIconModule } from 'primeng/inputicon';
import { InputMaskModule } from 'primeng/inputmask';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { PrimeNG } from 'primeng/config';
import { PopoverModule } from 'primeng/popover';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SelectModule } from 'primeng/select';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SliderModule } from 'primeng/slider';
import { SpeedDialModule } from 'primeng/speeddial';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { TreeSelectModule } from 'primeng/treeselect';

import { ConfirmationService, FilterMatchMode, MessageService} from 'primeng/api';

@NgModule({
    imports: [
        CommonModule,
        AccordionModule,
        AnimateOnScrollModule,
        BadgeModule,
        ButtonModule,
        BlockUIModule,
        CardModule,
        CheckboxModule,
        ChipModule,
        ColorPickerModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ContextMenuModule,
        DatePickerModule,
        DataViewModule,
        DialogModule,
        DividerModule,
        FieldsetModule,
        FileUploadModule,
        FloatLabelModule,
        FluidModule,
        IconFieldModule,
        ImageModule,
        InputIconModule,
        InputMaskModule,
        InputNumberModule,
        InputSwitchModule,
        InputTextModule,
        MenuModule,
        MenubarModule,
        MultiSelectModule,
        OverlayPanelModule,
        PanelModule,
        PasswordModule,
        PopoverModule,
        PickListModule,
        ProgressBarModule,
        ProgressSpinnerModule,
        RippleModule,
        ScrollPanelModule,
        SelectButtonModule,
        SelectModule,
        SidebarModule,
        SkeletonModule,
        SliderModule,
        SplitButtonModule,
        SpeedDialModule,
        TableModule,
        TabsModule,
        TagModule,
        TextareaModule,
        ToastModule,
        ToolbarModule,
        ToggleButtonModule,
        ToggleSwitchModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        TreeSelectModule,
    ],
    exports: [
        CommonModule,
        AccordionModule,
        AnimateOnScrollModule,
        BadgeModule,
        ButtonModule,
        BlockUIModule,
        CardModule,
        CheckboxModule,
        ChipModule,
        ColorPickerModule,
        ConfirmDialogModule,
        ConfirmPopupModule,
        ContextMenuModule,
        DatePickerModule,
        DataViewModule,
        DialogModule,
        DividerModule,
        FieldsetModule,
        FileUploadModule,
        FloatLabelModule,
        FluidModule,
        IconFieldModule,
        ImageModule,
        InputIconModule,
        InputMaskModule,
        InputNumberModule,
        InputSwitchModule,
        InputTextModule,
        MenuModule,
        MenubarModule,
        MultiSelectModule,
        OverlayPanelModule,
        PanelModule,
        PasswordModule,
        PopoverModule,
        PickListModule,
        ProgressBarModule,
        ProgressSpinnerModule,
        RippleModule,
        ScrollPanelModule,
        SelectButtonModule,
        SelectModule,
        SidebarModule,
        SkeletonModule,
        SliderModule,
        SplitButtonModule,
        SpeedDialModule,
        TableModule,
        TabsModule,
        TagModule,
        TextareaModule,
        ToastModule,
        ToolbarModule,
        ToggleButtonModule,
        ToggleSwitchModule,
        TooltipModule,
        TreeModule,
        TreeTableModule,
        TreeSelectModule,
    ],
    providers: [
        ConfirmationService,
        MessageService
    ]
})
export class PrimengModule {
    constructor(
        private primeng: PrimeNG
    ) {
        this.primeng.setTranslation({
            startsWith: 'Começa com',
            contains: 'Contém',
            notContains: 'Não contem',
            endsWith: 'Termina com',
            equals: 'Igual a',
            notEquals: 'Diferente de',
            noFilter: 'Sem filtro',
            lt: 'Menor que',
            lte: 'Menor que ou igual a',
            gt: 'Maior que',
            gte: 'Maior que ou igual a',
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
