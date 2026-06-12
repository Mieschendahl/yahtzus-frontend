import { Component, inject } from '@angular/core';
import { CdkMenuModule } from '@angular/cdk/menu';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CdkMenuModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private readonly router = inject(Router);
  
  readonly menuItems = [
    {
      label: 'Home',
      action: () => this.goHome(),
    },
    {
      label: 'Info',
      action: () => this.showInfo(),
    },
  ];

  goHome() {
    this.router.navigateByUrl('/');
  }

  showInfo() {
    console.log('No info set yet');
  }
}