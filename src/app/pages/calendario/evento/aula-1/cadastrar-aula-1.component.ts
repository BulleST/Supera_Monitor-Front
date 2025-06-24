import { AfterViewInit, Component, OnDestroy } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import { ToastrService } from 'ngx-toastr'
import { ConfirmationService } from 'primeng/api'
import { SelectChangeEvent } from 'primeng/select'
import { lastValueFrom, Subscription } from 'rxjs'

import { Aluno } from '../../../../models/alunos.model'

import { AlunoService } from '../../../../services/alunos.service'
import { EventoService } from '../../../../services/evento.service'
import { Evento } from '../../../../models/evento.model'

@Component({
  selector: 'app-cadastrar-aula-1',
  standalone: false,
  templateUrl: './cadastrar-aula-1.component.html',
  styleUrl: './cadastrar-aula-1.component.css',
  providers: [ConfirmationService],
})
export class CadastrarAula1Component implements OnDestroy, AfterViewInit {
  visible: boolean = false
  subscription: Subscription[] = []

  alunos: Aluno[] = []
  loadingAlunos = false

  eventos: Evento[] = []
  loadingEventos = false

  selectedEvento?: Evento = undefined
  selectedAluno?: Aluno = undefined

  onSelectAluno(e: SelectChangeEvent) {
    // this.selectedAluno = e.value
    // if (this.selectedAluno != null) {
    //   this.eventos.filter((e) =>
    //     e.perfilCognitivo
    //       .flatMap((perfilCognitivo) => perfilCognitivo.id)
    //       .includes(this.selectedAluno!.perfilCognitivo_Id),
    //   )
    // }
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private eventoService: EventoService,
    private alunoService: AlunoService,
    private toastrService: ToastrService,
    private confirmationService: ConfirmationService,
  ) {
    var alunos = this.alunoService.list.subscribe((res) => {
      this.alunos = res.filter(
        (x) => x.active == true && x.primeiraAula_Id === null,
      )
    })
    this.subscription.push(alunos)

    if (this.alunos.length == 0) {
      this.loadingAlunos = true
      lastValueFrom(this.alunoService.getList())
        // .then((res) => console.log(res))
        .finally(() => (this.loadingAlunos = false))
    }

    var eventos = this.eventoService.eventos.subscribe((res) => {
      this.eventos = res
    })
    this.subscription.push(eventos)

    this.visible = true
  }
  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.subscription.forEach((e) => e.unsubscribe())
  }

  visibleChange() {
    if (!this.visible) {
      this.router.navigate(['../../'], { relativeTo: this.activatedRoute })
    }
  }
}
