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
      label: 'Go Home',
      action: () => this.goHome(),
    },
    {
      label: "Restart Game",
      action: () => this.restartGame()
    },
    {
      label: "Reset Room",
      action: () => this.resetRoom()
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

  resetRoom() {
    this.socketService.send({
      kind: "reset room"
    });
  }
}