import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { TopNavComponent } from '../../components/top-nav/top-nav.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SideNavComponent, TopNavComponent],
  template: `
    <div class="flex h-screen w-full overflow-hidden bg-brand-dark">
      <!-- Sidebar -->
      <app-side-nav></app-side-nav>

      <!-- Main Content Area -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
        <!-- Header -->
        <app-top-nav></app-top-nav>

        <!-- Dynamic Content -->
        <main class="flex-1 overflow-y-auto p-8 relative">
          <!-- Ambient Background Globs -->
          <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
          
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {}
