import { Component, signal, viewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Menu, MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-play',
  imports: [ButtonModule, DialogModule, MenuModule],
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
    }
  ];

  openMenu(event: MouseEvent): void {
    this.menu().toggle(event);
  }
}