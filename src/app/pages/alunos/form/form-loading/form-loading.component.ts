import { Component } from '@angular/core';
import { Aluno } from '../../../../models/alunos.model';

@Component({
    selector: 'app-form-loading',
    standalone: false,
    templateUrl: './form-loading.component.html',
})
export class FormLoadingComponent {
    object: Aluno = new Aluno
}
