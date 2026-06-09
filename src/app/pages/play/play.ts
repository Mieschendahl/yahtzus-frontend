import { Component } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [MenubarModule],
  templateUrl: './play.html',
})
export class Play {
  items: MenuItem[] = [
    { label: 'Home' },
    { label: 'Info' },
    { label: 'More' }
  ];
}
