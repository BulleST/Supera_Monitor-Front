import { Component, OnInit } from '@angular/core';
import { faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-termos-de-uso',
    templateUrl: './termos-de-uso.component.html',
    styleUrls: ['./termos-de-uso.component.css']
})
export class TermosDeUsoComponent {
    faChevronCircleLeft = faChevronCircleLeft;
    constructor() { }

}
