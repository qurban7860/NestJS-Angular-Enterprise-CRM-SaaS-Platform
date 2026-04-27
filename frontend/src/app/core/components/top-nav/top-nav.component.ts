import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state/auth/auth.reducer';
import { AuthActions } from '../../state/auth/auth.actions';
import { selectUnreadCount } from '../../state/notifications/notifications.reducer';
import { NavService } from '../../services/nav.service';
import { BillingService, SubscriptionStatus } from '../../services/billing.service';
import { GlobalSearchService, SearchGroup } from '../../services/global-search.service';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <header class="h-16 glass-panel !rounded-none border-x-0 border-t-0 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-[60]">
      <div class="flex items-center gap-4 flex-1">
        <!-- Sidebar Toggle (Mobile) -->
        <button
          (click)="navService.toggleSidebar()"
          class="lg:hidden p-2 text-brand-secondary hover:text-white transition-colors hover:bg-white/5 rounded-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Search -->
        <div class="relative w-full max-w-md group hidden sm:block">
          <input
            type="text"
            [formControl]="searchControl"
            (focus)="showResults = true"
            (keydown.escape)="closeSearch()"
            placeholder="Search anything..."
            class="w-full bg-white/5 border border-brand-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-primary/50 outline-none ring-0 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
          >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-3 top-2.5 text-brand-secondary group-focus-within:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <!-- Search Results Dropdown -->
          @if (showResults && (searchResults$ | async); as groups) {
            @if (groups.length > 0) {
              <div class="absolute top-full left-0 w-full mt-2 glass-panel p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-[100] max-h-[70vh] overflow-y-auto">
                @for (group of groups; track group.type) {
                  <div class="mb-4 last:mb-0">
                    <h3 class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60">{{ group.type }}</h3>
                    <div class="space-y-1 mt-1">
                      @for (item of group.results; track item.id) {
                        <a 
                          [routerLink]="item.url" 
                          (click)="closeSearch()"
                          class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors group/item"
                        >
                          <div class="w-8 h-8 rounded bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover/item:bg-brand-primary group-hover/item:text-white transition-all">
                            @if (item.type === 'contact') {
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            } @else if (item.type === 'task') {
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            } @else {
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium truncate">{{ item.title }}</p>
                            @if (item.subtitle) {
                              <p class="text-xs text-brand-secondary truncate">{{ item.subtitle }}</p>
                            }
                          </div>
                        </a>
                      }
                    </div>
                  </div>
                }
              </div>
            } @else if (searchControl.value) {
              <div class="absolute top-full left-0 w-full mt-2 glass-panel p-6 text-center shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                <p class="text-sm text-brand-secondary">No results found for "{{ searchControl.value }}"</p>
              </div>
            }
          }
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Subscription Plan Badge -->
        @if (subscription$ | async; as sub) {
          @if (sub.plan && sub.plan !== 'FREE') {
            <div class="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-premium text-white">
              <span>{{ sub.plan }}</span>
              @if (sub.status === 'ACTIVE') {
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              }
            </div>
          }
        }

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

        <div class="w-px h-6 bg-brand-border mx-1 sm:mx-2"></div>
        

        <!-- Upgrade Button -->
        <a routerLink="/billing/pricing" class="premium-button !py-1.5 !px-4 text-xs sm:text-sm whitespace-nowrap">
          Upgrade
        </a>
      </div>
    </header>
  `,
})
export class TopNavComponent implements OnInit {
  private store = inject(Store);
  private billing = inject(BillingService);
  private searchService = inject(GlobalSearchService);
  navService = inject(NavService);

  user$ = this.store.select(selectUser);
  unreadCount$ = this.store.select(selectUnreadCount);
  subscription$: Observable<SubscriptionStatus | null> = of(null);

  searchControl = new FormControl('');
  searchResults$: Observable<SearchGroup[]> = of([]);
  showResults = false;

  ngOnInit() {
    this.subscription$ = this.billing.getSubscriptionStatus();

    this.searchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.showResults = true),
      switchMap(query => this.searchService.search(query || '')),
      tap(results => {
        if (!results || results.length === 0) {
          // Keep showing "No results" if there's a value
        }
      })
    );
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const searchContainer = document.querySelector('.relative.w-full.max-w-md');
    if (searchContainer && !searchContainer.contains(target)) {
      this.showResults = false;
    }
  }

  closeSearch() {
    this.showResults = false;
    this.searchControl.setValue('', { emitEvent: false });
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}