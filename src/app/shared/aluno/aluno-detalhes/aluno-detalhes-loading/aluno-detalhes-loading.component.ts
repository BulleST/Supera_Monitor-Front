import { Component } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';

@Component({
  selector: 'app-aluno-detalhes-loading',
  standalone: false,
  templateUrl: './aluno-detalhes-loading.component.html',
  styleUrl: './aluno-detalhes-loading.component.css'
})
export class AlunoDetalhesLoadingComponent {
    object: Aluno = new Aluno;

}
