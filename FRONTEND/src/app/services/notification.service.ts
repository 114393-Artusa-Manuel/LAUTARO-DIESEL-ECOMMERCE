import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export type ToastType = 'info' | 'success' | 'warning' | 'danger' | 'error';

export interface ToastMessage {
  id: string;
  text: string;
  type?: ToastType;
  ttl?: number; // ms
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private subject = new Subject<ToastMessage>();

  // stream of new toasts
  get toasts$(): Observable<ToastMessage> {
    return this.subject.asObservable();
  }

  push(text: string, type: ToastType = 'success', ttl = 3000) {
    const msg: ToastMessage = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, text, type, ttl };
    this.subject.next(msg);
  }
}
