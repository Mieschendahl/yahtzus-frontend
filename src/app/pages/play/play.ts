import { Component, inject, signal, viewChild } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Menu, MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-play',
  imports: [ButtonModule, DialogModule, MenuModule, ToastModule],
  providers: [MessageService],
  templateUrl: './play.html',
  styleUrl: './play.css',
})
export class Play {
  readonly showInfo = signal(false);

  readonly menu = viewChild.required<Menu>('menu');

  readonly menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: '/',
    },
    {
      label: 'Info',
      icon: 'pi pi-info-circle',
      command: () => this.showInfo.set(true),
    },
  ];

  private readonly messageService = inject(MessageService);

  constructor() {}

  openMenu(event: MouseEvent): void {
    this.menu().toggle(event);
  }

  async inviteFriend(): Promise<void> {
    const url = new URL(window.location.href);
    url.searchParams.delete('user');

    await navigator.clipboard.writeText(url.toString());

    this.messageService.add({
      severity: 'success',
      summary: 'Copied invite link',
    });
  }

  startGame(): void {
    // TODO
  }
}