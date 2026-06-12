import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SocketService } from './services/socket/socket.service';
import { Background } from './components/background/background';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Background],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly socketService = inject(SocketService);
}
