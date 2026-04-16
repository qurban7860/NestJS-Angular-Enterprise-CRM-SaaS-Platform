import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state/auth/auth.reducer';
import { AuthActions } from '../../state/auth/auth.actions';
import { selectUnreadCount } from '../../state/notifications/notifications.reducer';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="h-16 glass-panel !rounded-none border-x-0 border-t-0 flex items-center justify-between px-8">
      <div class="flex items-center flex-1 max-w-md">
        <div class="relative w-full group">
          <input 
            type="text" 
            placeholder="Search anything..." 
            class="w-full bg-white/5 border border-brand-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-primary/50 transition-all duration-300"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-3 top-2.5 text-brand-secondary group-focus-within:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <!-- Notification Bell -->
        <button class="p-2 text-brand-secondary hover:text-white transition-colors relative group">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 group-hover:animate-swing" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          
          @if ((unreadCount$ | async) || 0; as count) {
            @if (count > 0) {
              <span class="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] px-1 items-center justify-center bg-brand-primary rounded-full border-2 border-brand-dark text-[10px] font-bold text-white leading-none">
                {{ count > 9 ? '9+' : count }}
              </span>
            }
          }
        </button>

        <div class="w-px h-6 bg-brand-border mx-2"></div>

        <button (click)="logout()" class="text-sm font-medium text-brand-secondary hover:text-white transition-colors">
          Logout
        </button>

        <button class="premium-button !py-1.5 !px-4 text-sm">
          Upgrade
        </button>
      </div>
    </header>
  `,
})
export class TopNavComponent {
  private store = inject(Store);
  
  user$ = this.store.select(selectUser);
  unreadCount$ = this.store.select(selectUnreadCount);

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
