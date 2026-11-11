import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../services/confirm';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  host: { '(document:keydown.escape)': 'confirmService.answer(false)' },
})
export class ConfirmDialog {
  confirmService = inject(ConfirmService);
}