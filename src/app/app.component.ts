import { Component } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    standalone: false,
    providers: [MessageService]
})
export class AppComponent {
  title = 'Supera - PED4U';
}
