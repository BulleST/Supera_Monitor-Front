import { Component, HostListener, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Subscription } from 'rxjs';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Table, TableEditCancelEvent, TableEditCompleteEvent, TableEditInitEvent } from 'primeng/table';
import { ColumnTable, Crypto, DisplayType, FilterType, getError, insertOrReplace } from '../../../utils';
import { Role } from '../../../models/account-perfil.model';
import { MobileService, ScreenWidth } from '../../../utils/mobile';
import { AlunoService } from '../../../services/alunos.service';
import { Aluno, alunosColumns } from '../../../models/alunos.model';
import { MensagemWhatsapp } from '../../../utils/mensagem-whatsapp';
import { showError } from '../../../utils';
import { ContextMenu } from 'primeng/contextmenu';
import { Turma } from '../../../models/turma.model';
import { PerfilCognitivo } from '../../../models/perfil-cognitivo.model';
import { Apostila, Apostila_Kit } from '../../../models/apostila.model';
import { TurmaService } from '../../../services/turma.service';
import { ApostilaService } from '../../../services/apostila.service';
import { PerfilCognitivoService } from '../../../services/perfil-cognitivo.services';
import { NgModel } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SelectChangeEvent } from 'primeng/select';
import { SalaAndar } from '../../../models/sala-aula.model';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.css',
    standalone: false,
        providers: [ConfirmationService]
    
})
export class ListComponent implements OnDestroy {
    list: Aluno[] = [];
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

    SalaAndar = SalaAndar;

    @ViewChild('cm') cm!: ContextMenu;

    turmas: Turma[] = [];
    turmasDisponiveis: Turma[] = [];
    loadingTurmas = false;

    perfisFiltered: PerfilCognitivo[] = [];
    perfilCognitivos: PerfilCognitivo[] = [];
    loadingPerfilCognitivo = false;

    listKits: Apostila_Kit[] = [];
    loadingKit = false;

    listApostila: Apostila[] = [];
    loadingApostilas = false;

    oldRow?: Aluno;

    constructor(
        private confirmationService: ConfirmationService,
        private service: AlunoService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private crypto: Crypto,
        private mobileService: MobileService,
        private mensagemWhatsapp: MensagemWhatsapp,
        private turmaService: TurmaService,
        private apostilaService: ApostilaService,
        private perfilCognitivoService: PerfilCognitivoService,
        private toastr: ToastrService,

    ) {
        this.tableColumns = alunosColumns;
        this.tableGlobalFilterFields = this.tableColumns.map(x => x.field);

        let screen = this.mobileService.get().subscribe(res => this.screen = res);
        this.subscription.push(screen);

        let list = this.service.list.subscribe(res => this.list = res);
        this.subscription.push(list);

        let turmas = this.turmaService.list.subscribe(res => this.turmas = res);
        this.subscription.push(turmas);

        let listKits = this.apostilaService.listKits.subscribe(res => this.listKits = res);
        this.subscription.push(listKits);

        let listApostila = this.apostilaService.listApostila.subscribe(res => this.listApostila = res);
        this.subscription.push(listApostila);

        let perfilCognitivos = this.perfilCognitivoService.list.subscribe(res => this.perfilCognitivos = res);
        this.subscription.push(perfilCognitivos);

        if (!this.turmas.length) {
            this.loadTurmas();
        }

        if (!this.perfilCognitivos.length) {
            this.loadPerfis();
        }

        if (!this.listKits.length) {
            this.loadKits();
        }

        if (!this.listApostila.length) {
            this.loadApostilas();
        }

        if (!this.list.length) this.update()
    }

    ngOnDestroy(): void {
        this.subscription.forEach(item => item.unsubscribe());
    }

    loadAlunos() {
        this.tableLoading = true;
        return lastValueFrom(this.service.getList())
            .then(res => this.tableLoading = false)
            .catch(res => this.tableLoading = false);
    }

    loadTurmas() {
        this.loadingTurmas = true;
        return lastValueFrom(this.turmaService.getList())
            .then(res => this.loadingTurmas = false)
            .catch(res => this.loadingTurmas = false);

    }
    loadPerfis() {
        this.loadingPerfilCognitivo = true;
        return lastValueFrom(this.perfilCognitivoService.getList())
            .then(res => this.loadingPerfilCognitivo = false)
            .catch(res => this.loadingPerfilCognitivo = false);

    }
    loadKits() {
        this.loadingKit = true;
        return lastValueFrom(this.apostilaService.getKit())
            .then(res => this.loadingKit = false)
            .catch(res => this.loadingKit = false);
    }
    loadApostilas() {
        this.loadingApostilas = true;
        return lastValueFrom(this.apostilaService.getApostilas())
            .then(res => this.loadingApostilas = false)
            .catch(res => this.loadingApostilas = false);
    }

    update() {
        // this.list = [];
        this.loadAlunos();
        this.loadTurmas();
        this.loadPerfis();
        this.loadKits();
        this.loadApostilas();
    }

    showContextMenu(e: any, item: Aluno) {
        const toggle = this.tableSelectedItem?.id == item.id;
        let idEncrypted = this.crypto.encrypt(item.id);
        
        this.tableSelectedItem = item;
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
                routerLink: ['./', 'editar', idEncrypted]
            },
            {
                label: item.active ? 'Desabilitar' : 'Habilitar',
                icon: item.active ? 'fa-solid fa-lock text-red-500' : 'fa-solid fa-lock-open text-green-400',
                command: e => this.deactivated(e, item)
            }
        ];

        if (toggle) {
            this.cm.toggle(e);
        } else {
            this.cm.show(e);
        }
    }

    clear(dt: Table) {
        this.tableSearch = '';
        dt.clear();
    }

    editar(aluno: Aluno) {
        var idEncrypted = this.crypto.encrypt(aluno.id)
        return  ['./', 'editar', idEncrypted]


    }

    @HostListener('keydown.escape', ['$event'])
    onKeydownHandler(event: any) {
        this.unselectItems();
    }

    selectionChange(e: any) {
    }

    unselectItems() {
        this.tableSelectedItem = undefined;
    }


    deactivated(e: any, item: Aluno) {
        let turma  = this.turmas.find(x => x.id == item.turma_Id)
        let deactivated = !item.active;
        let status = deactivated ?  'Habilitar' : 'Desabilitar';
        let mensagem = `<p>Tem certeza que deseja ${status.toLocaleLowerCase()} o aluno selecionado?</p>`
        
        if (!status && turma) {
            mensagem += `<p>Se continuar, a turma <b>${turma.nome}</b> ganhará uma vaga a ser preenchida por outra pessoa</p>`
        }
        // Se a turma não houver vagas, insere ele em outra turma
        else if (status && turma && turma.vagasDisponiveis == 0) {
            return this.showError(
                'Não autorizado', 
                'A turma em que esse aluno estava matriculado está lotada. Selecione outra turma antes de habilitar esse aluno',
                e)

        }

        this.confirmationService.confirm({
            target: e.target,
            message: mensagem,
            header: status,
            acceptIcon: `${deactivated ? 'pi pi-lock-open' : 'pi pi-lock'}`,
            rejectIcon: 'pi pi-times',
            acceptLabel: status,
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                lastValueFrom(this.service.deactivated(item.id, deactivated))
                    .then(async res => {
                        if (res.success) {
                            this.loadTurmas()
                            
                            item.active = res.object.active;
                            item.deactivated = res.object.deactivated;
                            item.turma = 'Indefinido';
                            item.turma_Id = undefined;


                            insertOrReplace(this.service, item);
                            item = res.object;
                        } else {
                            this.showError(`${status} aluno falhou.`, res.message, e);
                        }
                    })
                    .catch(res => {
                        this.showError(`${status} aluno falhou.`, getError(res), e);
                    })
            },
        });
    }

    
    showError(header: string, message: string, e: any, innerMessage?: string) {
        showError(this.confirmationService, header, message, e, innerMessage)
    }

    getOption(col: ColumnTable, row: any) {
        let item = col.options.items.find((x: any) => x.value == row[col.field]);
        return item;
    }

    enviarMensagem(aluno: Aluno) {
        let object = this.mensagemWhatsapp.enviarMensagem(aluno.nome, aluno.celular);
        window.open(object.link, '_blank');
        this.mensagemWhatsapp.copiarMensagem(object.mensagem);
    }

    turmaFocus(item: Aluno) {
        this.turmasDisponiveis = this.turmas.filter(turma => {
            const ehTurmaDoAluno = turma.id == item.turma_Id;
            const turmaAtiva = turma.active;
            const ehPerfilDoAluno = turma.perfilCognitivo.map(x => x.id).includes(item.perfilCognitivo_Id);
            const ehPerfilCompativel = !item.perfilCognitivo_Id || ehPerfilDoAluno;
            const turmaTemVagas = turma.vagasDisponiveis > 0;
            const ehAndarValido = turma.andar == SalaAndar.Terreo || !item.restricaoMobilidade
        
            const condicao = ehTurmaDoAluno 
            || (turmaAtiva
                && ehPerfilCompativel
                && turmaTemVagas
                && ehAndarValido);
                
                return condicao
        });
    }

    turmaChanged(item: Aluno, model: NgModel, e: SelectChangeEvent) {
        let restricoes = item.restricoes.filter(x => x.active);
        
        if (restricoes.length > 0 || item.restricaoMobilidade) {
            this.alunoRestricaoConfirm(item, model, e);
        }
        else {
            this.turmaTransferirConfirm(item, model, e)
        }

    }

    alunoRestricaoConfirm(item: Aluno, model: NgModel, e: SelectChangeEvent) {

        const restricoes = item.restricoes.filter(x => x.active);

        let mensagem = 'O aluno possui as seguintes restrições: <ul>';

        if (item.restricaoMobilidade) {
            mensagem += `<li>Mobilidade Reduzida</li>`
        }
        if (restricoes.length > 0) {
            mensagem += restricoes.map(x => `<li>${x.descricao}</li>`).join('');
        }

        mensagem += `</ul> Tem certeza que deseja continuar?`

        this.confirmationService.confirm({
            target: e.originalEvent.target as any,
            message: mensagem,
            header: 'Verificação de restrições',
            acceptLabel: 'Continuar',
            rejectLabel: 'Cancelar',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: () => {
                this.turmaTransferirConfirm(item, model, e);
            },
            reject: () => {
                this.turmaTransferenciaReject(item, model, e);
            }
        });
    }

    turmaTransferirConfirm(item: Aluno, model: NgModel, e: SelectChangeEvent) {
        let novaTurma = this.turmas.find(x => x.id == item.turma_Id) as Turma;

        let mensagem = `Tem certeza que deseja transferir o aluno(a) para a turma <span class="font-bold">${novaTurma.nome}</span>?`;
       
        this.confirmationService.confirm({
            target: e.originalEvent.target as any,
            message: mensagem,
            header: 'Transferência de turma',
            acceptLabel: 'Continuar',
            rejectLabel: 'Cancelar',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.tableLoading = true;

                item.turma = novaTurma.nome;
                item.turma_Id = novaTurma.id;
                item.corLegenda = novaTurma.corLegenda;
                item.professor = novaTurma.professor;
                item.professor_Id = novaTurma.professor_Id;
                item.diaSemana = novaTurma.diaSemana;
                item.horario = novaTurma.horario;
                item.linkGrupo = novaTurma.linkGrupo;

                let novoAluno = await lastValueFrom(this.service.get(item.id));
                novoAluno.turma_Id = novaTurma.id;
                if (!novoAluno.perfilCognitivo_Id) {
                    novoAluno.perfilCognitivo_Id = novaTurma.perfilCognitivo[0].id;
                    novoAluno.perfilCognitivo = novaTurma.perfilCognitivo[0].nome;
                }

                lastValueFrom(this.service.edit(novoAluno))
                    .then(async res => {
                        this.tableLoading = false;
                        if (res.success) {
                            this.toastr.success('Transferência finalizada com sucesso');
                        } else {
                            this.turmaTransferenciaReject(item, model, e)
                            this.showError('Ops', `Não foi possível finalizar transferência. <br> ${res.message}`, e.originalEvent)
                        }
                        this.loadTurmas()

                    })
                    .catch(res => {
                        this.tableLoading = false;
                        this.turmaTransferenciaReject(item, model, e)
                        this.showError('Ops', `Não foi possível finalizar transferência. <br> ${res.message}`, e, res.message)
                    })
            },
            reject: () => {
                this.turmaTransferenciaReject(item, model, e);
            }
        });
    }

    turmaTransferenciaReject(item: Aluno, model: NgModel, e: SelectChangeEvent) {
        if (this.oldRow) {
            item = this.service.mapAluno(this.oldRow);
            model.control.setValue(this.oldRow?.turma_Id)
        }
        else {
            delete item.turma;
            delete item.turmaDesc;
            delete item.turma_Id;
            delete item.corLegenda;
            delete item.professor;
            delete item.professor_Id;
            delete item.diaSemana;
            delete item.horario;
            delete item.linkGrupo;
            model.control.setValue(undefined)
        }

    }

    perfilFocus(item: Aluno) {
        this.perfisFiltered = this.perfilCognitivos;
    }

    perfilChangedConfirm(item: Aluno, model: NgModel, e: SelectChangeEvent) {
        let novoPerfil = this.perfilCognitivos.find(x => x.id == item.perfilCognitivo_Id) as PerfilCognitivo;

        item.perfilCognitivo = novoPerfil.nome;
        item.perfilCognitivo_Id = novoPerfil.id;

        this.confirmationService.confirm({
            target: e.originalEvent.target as any,
            message: 'Tem certeza que deseja alterar o perfil cognitivo desse aluno?',
            header: 'Alterar Perfil cognitivo',
            acceptLabel: 'Continuar',
            rejectLabel: 'Cancelar',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.tableLoading = true;

                let novoAluno = await lastValueFrom(this.service.get(item.id));
                novoAluno.perfilCognitivo_Id = novoPerfil.id;

                lastValueFrom(this.service.edit(novoAluno))
                    .then(res => {
                        this.tableLoading = false;
                        if (res.success) {
                            this.toastr.success('Perfil Cognitivo alterado com sucesso');
                        } else {
                            this.showError('Ops', `Não foi possível finalizar alteração. <br> ${res.message}`, e)
                            this.perfilChangedReject(item, model, e)
                        }
                    })
                    .catch(res => {
                        this.tableLoading = false;
                        this.showError('Ops', `Não foi possível finalizar alteração.`, e, res.message)
                        this.perfilChangedReject(item, model, e)
                    })
            },
            reject: () => {

                this.perfilChangedReject(item, model, e)
            }
        });
    }

    perfilChangedReject(item: Aluno, model: NgModel, e: any) {
        let oldPerfil = this.perfilCognitivos.find(x => x.id == item.perfilCognitivo_Id);
        model.control.setValue(oldPerfil)
    }

    kitFocus(item: Aluno) {
    }

    kitChangedConfirm(item: Aluno, model: NgModel, e: SelectChangeEvent) {
        let novoKit = this.listKits.find(x => x.id == item.apostila_Kit_Id) as Apostila_Kit;

        item.kit = novoKit.nome;
        item.apostila_Kit_Id = novoKit.id;

        this.confirmationService.confirm({
            target: e.originalEvent.target as any,
            message: 'Tem certeza que deseja alterar o kit desse aluno?',
            header: 'Alterar kit',
            acceptLabel: 'Continuar',
            rejectLabel: 'Cancelar',
            acceptIcon: 'pi pi-check',
            rejectIcon: 'pi pi-times',
            acceptButtonStyleClass: 'p-button-rounded',
            rejectButtonStyleClass: 'p-button-rounded p-button-outlined',
            accept: async () => {
                this.tableLoading = true;

                let novoAluno = await lastValueFrom(this.service.get(item.id));
                novoAluno.apostila_Kit_Id = novoKit.id;

                lastValueFrom(this.service.edit(novoAluno))
                    .then(res => {
                        this.tableLoading = false;
                        if (res.success) {
                            this.toastr.success('Kit alterado com sucesso');
                        } else {
                            this.showError('Ops', `Não foi possível finalizar alteração. <br> ${res.message}`, e)
                            this.apostilaKitChangedReject(item, model, e)
                        }
                    })
                    .catch(res => {
                        this.tableLoading = false;
                        this.showError('Ops', `Não foi possível finalizar alteração.`, e, res.message)
                        this.apostilaKitChangedReject(item, model, e)
                    })
            },
            reject: () => {

                this.apostilaKitChangedReject(item, model, e)
            }
        });
    }

    apostilaKitChangedReject(item: Aluno, model: NgModel, e: any) {
        let oldApostilaKit = this.listKits.find(x => x.id == item.apostila_Kit_Id);
        model.control.setValue(oldApostilaKit)
    }

    onEditInit(e: TableEditInitEvent) {
        let aluno = e.data as Aluno;
        this.oldRow = JSON.parse(JSON.stringify(aluno));

        if (e.field === 'turma_Id') {
            this.turmaFocus(aluno)
        }
        else if (e.field === 'perfilCognitivo_Id') {
            this.perfilFocus(aluno)
        }
    }

    onEditCancel(e: TableEditCancelEvent) {
        delete this.oldRow;
    }

    onEditComplete(e: TableEditCompleteEvent) {
        delete this.oldRow;
    }
}
