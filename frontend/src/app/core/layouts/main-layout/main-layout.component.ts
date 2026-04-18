import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { SideNavComponent } from '../../components/side-nav/side-nav.component';
import { TopNavComponent } from '../../components/top-nav/top-nav.component';
import { NavService } from '../../services/nav.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SideNavComponent, TopNavComponent],
  template: `
    <div class="flex h-screen w-full overflow-hidden bg-brand-dark">
      <!-- Mobile Sidebar Overlay -->
      <div 
        *ngIf="navService.isSidebarOpen()"
        (click)="navService.closeSidebar()"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 animate-in fade-in"
      ></div>

      <!-- Sidebar -->
      <div 
        class="fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out"
        [class.-translate-x-full]="!navService.isSidebarOpen()"
        [class.translate-x-0]="navService.isSidebarOpen()"
      >
        <app-side-nav></app-side-nav>
      </div>

      <!-- Main Content Area -->
      <div class="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <!-- Header -->
        <app-top-nav></app-top-nav>

        <!-- Dynamic Content -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <!-- Ambient Background Globs -->
          <div class="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] -z-10 animate-pulse hidden sm:block"></div>
          
          <div class="max-w-7xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  navService = inject(NavService);
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.navService.closeSidebar();
    });
  }
}
