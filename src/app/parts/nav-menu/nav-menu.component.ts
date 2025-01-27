import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem, TreeNode } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { Sidebar } from 'primeng/sidebar';
import { Subscription } from 'rxjs';
import { Header } from '../../utils/header';

@Component({
    selector: 'app-nav-menu',
    templateUrl: './nav-menu.component.html',
    styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnDestroy, AfterViewInit{

    menuOpen: boolean = false;
    subscription: Subscription[] = [];
    treeNodes: TreeNode[] = [];
    loading = false;
    selectedNode: any;
    @ViewChild('sidebar') sidebar!: Sidebar;
    @ViewChild('cm') cm!: ContextMenu;

    treeMenu: MenuItem[] = [
        {
            label: 'Editar',
            icon: 'pi pi-pencil'
        },
        {
            label: 'Apagar',
            icon: 'pi pi-trash'
        },
    ];

    constructor(
        private header: Header,
    ) {

        this.menuOpen = this.header.menuAsideOpen.value;
        var open = this.header.menuAsideOpen.subscribe(res => {
            this.menuOpen = res;
            this.setWidth();
        });
        this.subscription.push(open);
        this.atualizar();
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    ngAfterViewInit(): void {
      
    }

    closeCallback(e: any): void {
        this.sidebar.close(e);
    }

    atualizar() {
        this.loading = true;
        this.loading = false
    }

    setTreeNode(list: any[], pai: any) {
        var nodes: TreeNode[] = [];
        return nodes;
    }

    setWidth() {
        var width = this.menuOpen ? this.sidebar.container?.offsetWidth : 0;
        this.header.sidebarWidth.next(width);
    }

    toggleButton(node: any, show: boolean) {
        node.node.data.showButton = show

    }

    onContextMenuSelect(e: any) {
        var node = e.node;
        this.setContextMenu(node);
    }
    selectNode(node: any, event: MouseEvent) {
        this.selectedNode = node;
        this.cm.show(event);
        this.setContextMenu(node.node);
    }

    setContextMenu(node: any) {
        var data = node.data;
        this.treeMenu = [];
        var editar = '';
        var excluir = '';
        var links: MenuItem[] = []


        this.treeMenu = [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                routerLink: editar
            },
            {
                label: 'Apagar',
                icon: 'pi pi-trash',
                routerLink: excluir
            },
        ];
        this.treeMenu =  links.concat(this.treeMenu)
    }


}
