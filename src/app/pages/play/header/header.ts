import { Component, inject } from '@angular/core';
import { CdkMenuModule } from '@angular/cdk/menu';
import { Router } from '@angular/router';
import { SocketService } from '../../../services/socket/socket.service';

@Component({
  selector: 'app-header',
  imports: [CdkMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  private readonly socketService = inject(SocketService);
  
  readonly menuItems = [
    {
      label: 'Home',
      action: () => this.goHome(),
    },
    {
      label: "Restart",
      action: () => this.restartGame()
    }
  ];

  goHome() {
    this.router.navigateByUrl('/');
  }

  restartGame() {
    this.socketService.send({
      kind: "restart game"
    });
  }
}