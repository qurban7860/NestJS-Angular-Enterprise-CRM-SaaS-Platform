import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { AuthActions } from '../../../../core/state/auth/auth.actions';
import { selectIsLoading, selectError } from '../../../../core/state/auth/auth.reducer';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0a0a0b] relative overflow-hidden">
      <!-- Ambient Background Decoration -->
      <div class="absolute top-0 left-0 w-full h-full -z-10">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[150px]"></div>
      </div>

      <div class="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div class="glass-panel border border-white/10 p-6 sm:p-10 flex flex-col items-center">
          <!-- Logo with Glow Effect -->
          <div class="relative group">
            <div class="absolute inset-0 bg-gradient-premium rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-premium flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-2xl overflow-hidden relative z-10">
              <img src="assets/astraeus_logo_3d.png" alt="A" class="w-full h-full object-cover">
            </div>
          </div>

          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-center mt-6">Welcome Back</h1>
          <p class="text-brand-secondary text-center mt-2 mb-8 text-sm sm:text-base">Sign in to access your enterprise dashboard</p>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="w-full space-y-5">
            <div class="space-y-1">
              <label class="block text-sm font-medium text-brand-secondary ml-1" for="email">Email Address</label>
              <div class="relative">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary/50">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="admin@enterprise.com"
                  class="w-full bg-white/5 border rounded-xl py-3 pl-10 pr-4 outline-none ring-0 focus:ring-2 transition-all duration-200"
                  [ngClass]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched
                    ? 'border-red-500 bg-red-500/5 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-brand-border focus:ring-blue-500/30 focus:border-blue-500'">
              </div>
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <p class="text-red-400 text-xs ml-1 mt-1">
                  @if (loginForm.get('email')?.hasError('required')) { Email is required }
                  @if (loginForm.get('email')?.hasError('email')) { Please enter a valid email }
                </p>
              }
            </div>

            <div class="space-y-1">
              <div class="flex justify-between items-center ml-1">
                <label class="block text-sm font-medium text-brand-secondary" for="password">Password</label>
                <!-- <a routerLink="/auth/forgot-password" (click)="forgotPassword($event)" class="text-xs text-brand-primary hover:underline">Forgot?</a> -->
              </div>
              <div class="relative">
                <div class="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary/50">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Enter your password"
                  class="w-full bg-white/5 border rounded-xl py-3 pl-10 pr-12 outline-none ring-0 focus:ring-2 transition-all duration-200"
                  [ngClass]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched
                    ? 'border-red-500 bg-red-500/5 focus:ring-red-500/20 focus:border-red-500'
                    : 'border-brand-border focus:ring-blue-500/30 focus:border-blue-500'">
                <button type="button" (click)="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-white transition-colors">
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
              </div>
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <p class="text-red-400 text-xs ml-1 mt-1">
                  @if (loginForm.get('password')?.hasError('required')) { Password is required }
                  @if (loginForm.get('password')?.hasError('minlength')) { Password must be at least 6 characters }
                </p>
              }
            </div>

            @if (errorMessage$ | async; as error) {
              <div class="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-shake">
                {{ error }}
              </div>
            }

            <button 
              type="submit" 
              [disabled]="loginForm.invalid || (isLoading$ | async)"
              class="premium-button w-full py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              @if (isLoading$ | async) {
                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              } @else {
                <span>Sign In</span>
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              }
            </button>
          </form>

          <p class="text-sm text-brand-secondary mt-8">
            Don't have an account? <a routerLink="/auth/register" class="text-brand-primary font-medium hover:underline">Create One</a>
          </p>
        </div>
        
        <!-- Back to Home -->
        <div class="text-center mt-6">
          <a routerLink="/" class="text-sm text-brand-secondary hover:text-white transition-colors flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  isLoading$ = this.store.select(selectIsLoading);
  errorMessage$ = this.store.select(selectError);
  showPassword = signal(false);

  ngOnInit() {
    this.store.dispatch(AuthActions.clearAuthErrors());
  }

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.store.dispatch(AuthActions.login({ credentials: this.loginForm.value }));
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  forgotPassword(event: Event) {
    event.preventDefault();
    alert('Password reset link will be sent to your email.');
  }
}
