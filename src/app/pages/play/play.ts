import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Menu, MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';

import { SocketService } from '../../services/socket/socket.service';

@Component({
  selector: 'app-play',
  imports: [ButtonModule, DialogModule, MenuModule, ToastModule],
  providers: [MessageService],
  templateUrl: './play.html',
  styleUrl: './play.css',
})
export class Play implements OnInit {
  readonly showInfo = signal(false);

  readonly menu = viewChild.required<Menu>('menu');

  private readonly route = inject(ActivatedRoute);
  private readonly socketService = inject(SocketService);
  private readonly messageService = inject(MessageService);

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

  ngOnInit(): void {
    const user = this.route.snapshot.queryParamMap.get('user')?.trim();

    if (!user) {
      return;
    }

    if (this.socketService.socket.connected) {
      // this.socketService.setUsername(user);
      return;
    }

    this.socketService.socket.once('connect', () => {
      // this.socketService.setUsername(user);
    });
  }

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