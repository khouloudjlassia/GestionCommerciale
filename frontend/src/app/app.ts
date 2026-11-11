import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from './services/notification';
import { ConfirmDialog } from './components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive,ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  notifier = inject(NotificationService);
}