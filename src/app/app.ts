import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from './services/socket/socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly socketService = inject(SocketService);
}
