import { Injectable, signal, computed, Signal } from '@angular/core';
import { UserRole } from '../models/enums';

export type SenderRole = UserRole | 'External';

export interface BusMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: SenderRole;
  recipientRole: UserRole;
  subject?: string;
  content: string;
  createdAt: string;
  readBy: string[];
}

const STORAGE_KEY = 'himam_msg_bus_v1';

@Injectable({ providedIn: 'root' })
export class LocalMessageBusService {
  private readonly _messages = signal<BusMessage[]>(this.load());
  readonly messages = this._messages.asReadonly();

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        this._messages.set(this.load());
      }
    });
  }

  send(input: {
    senderId: string;
    senderName: string;
    senderRole: SenderRole;
    recipientRole: UserRole;
    content: string;
    subject?: string;
  }): BusMessage {
    const msg: BusMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      senderId: input.senderId,
      senderName: input.senderName,
      senderRole: input.senderRole,
      recipientRole: input.recipientRole,
      subject: input.subject,
      content: input.content,
      createdAt: new Date().toISOString(),
      readBy: [input.senderId],
    };
    const list = [msg, ...this._messages()];
    this._messages.set(list);
    this.save(list);
    return msg;
  }

  inboxFor(role: UserRole): Signal<BusMessage[]> {
    return computed(() =>
      this._messages().filter((m) => m.recipientRole === role),
    );
  }

  sentBy(userId: string): Signal<BusMessage[]> {
    return computed(() => this._messages().filter((m) => m.senderId === userId));
  }

  markRead(id: string, userId: string): void {
    const list = this._messages().map((m) =>
      m.id === id && !m.readBy.includes(userId)
        ? { ...m, readBy: [...m.readBy, userId] }
        : m,
    );
    this._messages.set(list);
    this.save(list);
  }

  markAllReadFor(role: UserRole, userId: string): void {
    const list = this._messages().map((m) => {
      if (m.recipientRole !== role) return m;
      if (m.readBy.includes(userId)) return m;
      return { ...m, readBy: [...m.readBy, userId] };
    });
    this._messages.set(list);
    this.save(list);
  }

  clearAll(): void {
    this._messages.set([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  private load(): BusMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as BusMessage[]) : [];
    } catch {
      return [];
    }
  }

  private save(list: BusMessage[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}
