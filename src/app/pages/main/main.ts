import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-main',
  imports: [ButtonModule, CardModule, InputTextModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class MainPage {
  private readonly router = inject(Router);

  readonly username = signal('');

  setUsername(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.username.set(input.value);
  }

  play(): void {
    const user = this.username().trim();

    if (!user) {
      return;
    }

    this.router.navigate(['/play'], {
      queryParams: { user },
    });
  }
}