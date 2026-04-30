import { Component, inject, OnInit, HostListener, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectUser } from '../../state/auth/auth.reducer';
import { AuthActions } from '../../state/auth/auth.actions';
import { selectUnreadCount, selectItems, selectIsDropdownOpen } from '../../state/notifications/notifications.reducer';
import { NotificationActions } from '../../state/notifications/notifications.actions';
import { NavService } from '../../services/nav.service';
import { BillingService, SubscriptionStatus } from '../../services/billing.service';
import { GlobalSearchService, SearchGroup } from '../../services/global-search.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap, finalize } from 'rxjs/operators';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <header class="h-16 glass-panel !rounded-none border-x-0 border-t-0 flex items-center justify-between px-4 sm:px-8 relative z-20">

      <div class="flex items-center gap-4 flex-1">
        <button (click)="navService.toggleSidebar()" class="lg:hidden p-2 text-brand-secondary hover:text-white transition-colors hover:bg-white/5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div #searchContainer class="relative w-full max-w-md group hidden sm:block">

          <div class="relative">
            <input
              type="text"
              [formControl]="searchControl"
              (focus)="showResults = true"
              (keydown.escape)="closeSearch()"
              placeholder="Search anything..."
            class="input-field rounded-lg py-2 pl-10 pr-4"
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 absolute left-3 top-2.5 text-brand-secondary group-focus-within:text-brand-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            @if (isSearching()) {
              <div class="absolute right-3 top-2.5 flex items-center">
                <div class="w-4 h-4 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
              </div>
            }
          </div>

          @if (showResults && searchControl.value) {
            <div class="absolute top-full left-0 w-full mt-2 glass-panel glass-elevated p-2 animate-in fade-in slide-in-from-top-2 duration-200 z-[150] max-h-[70vh] overflow-y-auto rounded-b-xl">
              @if (searchResults$ | async; as groups) {
                @if (groups.length > 0) {
                  @for (group of groups; track group.type) {
                    <div class="mb-4 last:mb-0">
                      <h3 class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60">{{ group.type }}</h3>
                      <div class="space-y-1 mt-1">
                        @for (item of group.results; track item.id) {
                          <a [routerLink]="item.url" (click)="onSearchResultClick($event, item.url)" class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/10 transition-colors group/item">
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
                              <p class="text-sm font-semibold text-white truncate">{{ item.title }}</p>
                              <p class="text-xs text-brand-secondary truncate">{{ item.subtitle }}</p>
                            </div>
                          </a>
                        }
                      </div>
                    </div>
                  }
                } @else if (!isSearching()) {
                  <div class="p-8 text-center">
                    <p class="text-sm text-brand-secondary">No results found for "{{ searchControl.value }}"</p>
                  </div>
                }
              }
            </div>
          }
        </div>

        <!-- Mobile Search Toggle -->
        <button (click)="toggleMobileSearch()" class="sm:hidden p-2 text-brand-secondary hover:text-white transition-colors hover:bg-white/5 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-2 sm:gap-4">

        @if (subscription$ | async; as sub) {
          @if (sub.plan && sub.plan !== 'FREE') {
            <div class="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-premium text-white shadow-lg">
              <span>{{ sub.plan }}</span>
              @if (sub.status === 'ACTIVE') {
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              }
            </div>
          }
        }

        <div #notifContainer class="relative notification-container">
          <button (click)="toggleNotifications()" class="p-2 text-brand-secondary hover:text-white transition-colors relative group">
            <svg class="w-5 h-5 group-hover:animate-swing" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            @if ((unreadCount$ | async) || 0; as count) {
              <span class="absolute top-1.5 right-1.5 flex h-4 min-w-[1rem] px-1 items-center justify-center bg-brand-primary rounded-full border-2 border-brand-dark text-[10px] font-bold text-white shadow-sm">
                {{ count > 9 ? '9+' : count }}
              </span>
            }
          </button>

          @if (isNotificationOpen$ | async) {
            <div class="fixed top-16 left-2 right-2 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-3 sm:w-96 sm:translate-x-0 w-auto sm:max-w-none glass-panel glass-elevated animate-in fade-in slide-in-from-top-2 duration-200 z-[150] overflow-hidden rounded-b-xl">

              <div class="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 class="font-bold text-sm">Notifications</h3>
                <span class="text-[10px] bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {{ (unreadCount$ | async) || 0 }} New
                </span>
              </div>

              <div class="max-h-[400px] overflow-y-auto">
                @if (notifications$ | async; as notifications) {
                  @if (notifications.length > 0) {
                    <div class="divide-y divide-white/5">
                      @for (n of notifications; track n.id) {
                        <div [ngClass]="{ 'bg-brand-primary/5': !n.isRead }" class="p-4 hover:bg-white/5 transition-colors cursor-pointer group" (click)="markAsRead(n.id)">
                          <div class="flex gap-3">
                            <div class="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm font-semibold text-white truncate">{{ n.title }}</p>
                              <p class="text-xs text-brand-secondary line-clamp-2 mt-0.5">{{ n.body }}</p>
                              <p class="text-[10px] text-brand-secondary/50 mt-2">{{ n.createdAt | date:'shortTime' }}</p>
                            </div>
                            @if (!n.isRead) {
                              <div class="w-2 h-2 rounded-full bg-brand-primary mt-1.5 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="p-8 text-center text-brand-secondary">
                      <p class="text-sm font-medium">All caught up!</p>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

        <div class="w-px h-6 bg-brand-border mx-1 sm:mx-2"></div>
        
        <a routerLink="/billing/pricing" class="premium-button !py-1.5 !px-4 text-xs sm:text-sm whitespace-nowrap">
          Upgrade
        </a>
      </div>
  </header>

  <!-- Mobile Search Overlay -->
  @if (showMobileSearch) {
    <div class="fixed inset-0 z-[250] bg-brand-dark/95 backdrop-blur-lg flex flex-col animate-in fade-in duration-200">
      <div class="p-4 border-b border-brand-border">
        <div class="flex items-center gap-3 max-w-2xl mx-auto">
          <div class="relative flex-1">
            <input
              type="text"
              [formControl]="searchControl"
              (focus)="showResults = true"
              (keydown.escape)="closeMobileSearch()"
              placeholder="Search anything..."
              class="input-field rounded-lg py-3 pl-12 pr-12 text-base mobile-search-input"
              autofocus
            >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 absolute left-4 top-3.5 text-brand-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            @if (isSearching()) {
              <div class="absolute right-12 top-3.5 flex items-center">
                <div class="w-5 h-5 border-2 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
              </div>
            }
            @if (searchControl.value) {
              <button (click)="searchControl.setValue('')" class="absolute right-4 top-3.5 text-brand-secondary hover:text-white transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            }
          </div>
          <button (click)="closeMobileSearch()" class="p-2 text-brand-secondary hover:text-white transition-colors whitespace-nowrap text-sm font-medium">Cancel</button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto p-4">
        <div class="max-w-2xl mx-auto">
          @if (showResults && searchControl.value) {
            @if (searchResults$ | async; as groups) {
              @if (groups.length > 0) {
                @for (group of groups; track group.type) {
                  <div class="mb-4 last:mb-0">
                    <h3 class="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60">{{ group.type }}</h3>
                    <div class="space-y-1 mt-1">
                      @for (item of group.results; track item.id) {
                        <a [routerLink]="item.url" (click)="onMobileSearchResultClick($event, item.url)" class="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group/item">
                          <div class="w-10 h-10 rounded bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover/item:bg-brand-primary group-hover/item:text-white transition-all">
                            @if (item.type === 'contact') {
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            } @else if (item.type === 'task') {
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            } @else {
                              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-base font-semibold text-white truncate">{{ item.title }}</p>
                            <p class="text-sm text-brand-secondary truncate">{{ item.subtitle }}</p>
                          </div>
                        </a>
                      }
                    </div>
                  </div>
                }
              } @else if (!isSearching()) {
                <div class="p-8 text-center">
                  <p class="text-base text-brand-secondary">No results found for "{{ searchControl.value }}"</p>
                </div>
              }
            }
          }
        </div>
      </div>
    </div>
  }
  `,
})

export class TopNavComponent implements OnInit {
  private store = inject(Store);
  private billing = inject(BillingService);
  private searchService = inject(GlobalSearchService);
  private router = inject(Router);
  navService = inject(NavService);

  @ViewChild('searchContainer') searchContainer!: ElementRef;
  @ViewChild('notifContainer') notifContainer!: ElementRef;

  user$ = this.store.select(selectUser);
  unreadCount$ = this.store.select(selectUnreadCount);
  notifications$ = this.store.select(selectItems);
  isNotificationOpen$ = this.store.select(selectIsDropdownOpen);
  subscription$: Observable<SubscriptionStatus | null> = of(null);

  searchControl = new FormControl('');
  searchResults$: Observable<SearchGroup[]> = of([]);
  showResults = false;
  showMobileSearch = false;
  isSearching = signal(false); // Signal for better performance


  ngOnInit() {
    this.store.dispatch(NotificationActions.loadNotifications());
    this.subscription$ = this.billing.getSubscriptionStatus();

    this.searchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((val) => {
        if (val) {
          this.isSearching.set(true);
          this.showResults = true;
        }
      }),
      switchMap(query => 
        query ? this.searchService.search(query).pipe(
          finalize(() => this.isSearching.set(false))
        ) : of([])
      )
    );
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    
    // Using ElementRef for reliable target checking
    if (this.searchContainer && !this.searchContainer.nativeElement.contains(target)) {
      this.showResults = false;
    }

    if (this.notifContainer && !this.notifContainer.nativeElement.contains(target)) {
      this.store.dispatch(NotificationActions.toggleDropdown({ isOpen: false }));
    }
  }

  closeSearch() {
    this.showResults = false;
    this.isSearching.set(false);
    this.searchControl.setValue('');
  }

  toggleMobileSearch() {
    this.showMobileSearch = !this.showMobileSearch;
    if (this.showMobileSearch) {
      this.showResults = true;
      // Focus improvement for mobile browsers
      setTimeout(() => {
        const input = document.querySelector('.mobile-search-input') as HTMLInputElement;
        input?.focus();
      }, 150);
    }
  }

  closeMobileSearch() {
    this.showMobileSearch = false;
    this.closeSearch();
  }

  onSearchResultClick(event: Event, url: string) {
    event.preventDefault();
    event.stopPropagation();
    this.showResults = false;
    this.router.navigateByUrl(this.normalizeUrl(url));
  }

  onMobileSearchResultClick(event: Event, url: string) {
    event.preventDefault();
    event.stopPropagation();
    this.showMobileSearch = false;
    this.router.navigateByUrl(this.normalizeUrl(url));
  }


  toggleNotifications() {
    this.store.dispatch(NotificationActions.toggleDropdown({}));
  }

  markAsRead(id: string) {
    this.store.dispatch(NotificationActions.markAsRead({ id }));
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }

  private normalizeUrl(url: string): string {
    if (!url) return '/dashboard';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return cleanUrl.replace(/\/+/g, '/'); // Sanitize double slashes
  }
}
