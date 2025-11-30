import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toasts.html',
  styleUrls: ['./toasts.css']
})
export class Toasts implements OnDestroy {
  private notifications = inject(NotificationService);
  toasts: ToastMessage[] = [];
  private sub: Subscription;

  constructor() {
    this.sub = this.notifications.toasts$.subscribe(t => this.showToast(t));
  }

  showToast(t: ToastMessage) {
    this.toasts.push(t);
    if (t.ttl && t.ttl > 0) {
      setTimeout(() => this.dismiss(t.id), t.ttl);
    }
  }

  dismiss(id: string) {
    this.toasts = this.toasts.filter(x => x.id !== id);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
