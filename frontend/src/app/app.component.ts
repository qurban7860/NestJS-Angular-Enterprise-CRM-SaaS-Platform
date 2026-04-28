import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastContainerComponent } from './core/components/toast-container/toast-container.component';
import { UpgradeModalComponent } from './features/premium/components/upgrade-modal/upgrade-modal.component';
import { BroadcastComponent } from './core/components/broadcast/broadcast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, ToastContainerComponent, UpgradeModalComponent, BroadcastComponent],
  template: `
    <app-broadcast-overlay></app-broadcast-overlay>
    <router-outlet></router-outlet>
    <app-toast-container></app-toast-container>
    <app-upgrade-modal></app-upgrade-modal>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
