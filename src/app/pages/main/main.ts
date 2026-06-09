import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  imports: [],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
  private router = inject(Router);

  username = signal('');

  setUsername(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.username.set(value);
  }

  play() {
    const user = this.username().trim();

    if (!user) {
      return;
    }

    this.router.navigate(['/play'], {
      queryParams: { user },
    });
  }
}