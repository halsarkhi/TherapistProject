import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet],
  template: `
    <div class="admin-layout">
      <router-outlet />
    </div>
  `,
  styles: `
    .admin-layout {
      min-height: 100vh;
    }
  `,
})
export class AdminLayout {}
