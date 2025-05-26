import { Component, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table } from 'primeng/table';
import { ColumnTable, Crypto, DisplayType, FilterType, showError, insertOrReplace } from '../../../utils';
import { Role } from '../../../models/account-perfil.model';
import { MobileService, ScreenWidth } from '../../../utils/mobile';
import { Turma, turmaColumns } from '../../../models/turma.model';
import { TurmaService } from '../../../services/turma.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { playAlert, playSuccess } from '../../../utils/audio';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.css',
    providers: [ConfirmationService],
    standalone: false
})
export class ListComponent implements OnDestroy {
    list: Turma[] = [];
    tableLoading = false;
    tableSearch: string = '';
    tableColumns: ColumnTable[] = [];
    tableGlobalFilterFields: string[] = [];
    tableSelectedItem: any;
    tableMenu: MenuItem[] = [];
    DisplayType: typeof DisplayType = DisplayType;
    FilterType: typeof FilterType = FilterType;
    Role: typeof Role = Role;
    screen: ScreenWidth = ScreenWidth.lg;
    subscription: Subscription[] = [];

    constructor(
        private confirmationService: ConfirmationService,
        private service: TurmaService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private mobileService: MobileService,
        private toastrService: ToastrService,
    ) {
        this.tableColumns = turmaColumns;
        this.tableGlobalFilterFields = this.tableColumns.map(x => x.field);

        this.update();

        var screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        var list = this.service.list.subscribe(res => {
            this.list = res.map(turma => {
                turma.perfilCognitivoString = turma.perfilCognitivo.map(x => x.nome).join(', ');
                turma.active = !turma.deactivated;

                if (turma.numeroSala != 0 && turma.andar != 0)
                    turma.salaDeAulaString = `${turma.numeroSala} ${turma.andar} º andar`
                else turma.salaDeAulaString = 'ONLINE'

                return turma
            })
        });
        this.subscription.push(list);

    }


    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    update() {
        this.list = [];
        this.tableLoading = true;
        lastValueFrom(this.service.getList())
            .then(res => this.tableLoading = false)
            .catch(res => {
                this.tableLoading = false;

            });
    }

    contextMenuSelectionChange(item: any) {
        this.tableMenu = [
            {
                label: 'Menu',
                disabled: true,
                styleClass: 'text-500 font-bold opacity-100',
            },
            { separator: true },
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen text-orange-500',
                command: () => {
                    var encrypted = this.crypto.encrypt(item.id);
                    this.router.navigate(['editar', encrypted], { relativeTo: this.activatedRoute });
                }
            },
            {
                label: item.active ? 'Desabilitar' : 'Habilitar',
                icon: item.active ? 'fa-solid fa-lock text-red-500' : 'fa-solid fa-lock-open text-green-400',
                command: (event: any) => this.deactivated(event, item)
            },
            { separator: true },
            {
                label: 'Calendário de aulas',
                icon: 'fa-solid fa-calendar',
                command: () => {
                    var encrypted = this.crypto.encrypt(item.id);
                    this.router.navigate(['calendario', encrypted], { relativeTo: this.activatedRoute });
                }
            },

        ];
    }


    clear(dt: Table) {
        this.tableSearch = '';
        dt.clear();
    }

    @HostListener('keydown.escape', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        this.unselectItems();
    }

    selectionChange(e: any) {
    }

    unselectItems() {
        this.tableSelectedItem = undefined;
    }


    deactivated(e: any, item: any) {
        var deactivated = !item.active;

        playAlert();

        this.confirmationService.confirm({
            target: e.target,
            message: `Tem certeza que deseja ${deactivated ? 'habilitar' : 'desabilitar'} a turma “<b>${item.nome}</b>”?`,
            header: deactivated ? 'Habilitar' : 'Desabilitar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            acceptLabel: `${deactivated ? 'Habilitar' : 'Desabilitar'}`,
            rejectLabel: 'Cancelar',
            accept: () => {
                lastValueFrom(this.service.deactivated(item.id, deactivated))
                    .then(res => {
                        if (res.success) {
                            this.toastrService.success(deactivated ? `O registro foi habilitado com sucesso.` : `O registro foi desabilitado com sucesso.`);
                            item.active = res.object.active;
                            item.deactivated = res.object.deactivated;
                            insertOrReplace(this.service, item);
                            item = res.object;
                            playSuccess();
                        } else {
                            this.showError('Erro', res.message, e);
                        }
                    })
                    .catch((res: HttpErrorResponse) => {
                        this.showError('Erro', res.error.message, e);
                    })
            },
        });
    }


    showError(header: string, message: string, e: any) {
        showError(this.confirmationService, header, message, e);
    }

    getOption(col: ColumnTable, row: any) {
        var item = col.options.items.find((x: any) => x.value == row[col.field]);
        return item;
    }


}

