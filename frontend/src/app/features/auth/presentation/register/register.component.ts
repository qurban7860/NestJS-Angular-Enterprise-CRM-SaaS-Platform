import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { RouterLink } from '@angular/router';
import { AuthActions } from '../../../../core/state/auth/auth.actions';
import { selectIsLoading, selectError } from '../../../../core/state/auth/auth.reducer';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#0a0a0b] relative overflow-hidden">
      <!-- Ambient Background Decoration -->
      <div class="absolute top-0 left-0 w-full h-full -z-10">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[100px] animate-pulse" style="animation-delay: 2s"></div>
      </div>

      <div class="w-full max-w-lg animate-in fade-in zoom-in duration-500">
        <div class="glass-panel border border-white/10 p-6 sm:p-10">
          <div class="flex flex-col items-center mb-10">
            <div class="relative group">
              <div class="absolute inset-0 bg-gradient-premium rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-premium flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-2xl overflow-hidden relative z-10">
                <img src="assets/astraeus_logo_3d.png" alt="A" class="w-full h-full object-cover">
              </div>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-center mt-6">Create Your Account</h1>
            <p class="text-brand-secondary text-center mt-2 text-sm sm:text-base">Start your enterprise transformation journey</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-2" for="firstName">First Name</label>
                <input 
                  id="firstName"
                  type="text" 
                  formControlName="firstName"
                  placeholder="John" 
                  class="py-3 px-4 input-field"
                  [ngClass]="{'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20': registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched}">
                @if (registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched) {
                  <p class="text-red-400 text-xs ml-1 mt-1">First name is required</p>
                }
              </div>
              <div>
                <label class="block text-sm font-medium text-brand-secondary mb-2" for="lastName">Last Name</label>
                <input 
                  id="lastName"
                  type="text" 
                  formControlName="lastName"
                  placeholder="Doe" 
                  class="input-field py-3 px-4"
                  [ngClass]="{'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20': registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched}">
                @if (registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched) {
                  <p class="text-red-400 text-xs ml-1 mt-1">Last name is required</p>
                }
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-2" for="orgName">Organization Name</label>
              <input 
                id="orgName"
                type="text" 
                formControlName="orgName"
                placeholder="Acme Corp" 
                class="input-field py-3 px-4"
                [ngClass]="{'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20': registerForm.get('orgName')?.invalid && registerForm.get('orgName')?.touched}">
              @if (registerForm.get('orgName')?.invalid && registerForm.get('orgName')?.touched) {
                <p class="text-red-400 text-xs ml-1 mt-1">Organization name is required</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-2" for="email">Work Email</label>
              <input 
                id="email"
                type="email" 
                formControlName="email"
                placeholder="john.doe@enterprise.com" 
                class="input-field py-3 px-4"
                [ngClass]="{'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20': registerForm.get('email')?.invalid && registerForm.get('email')?.touched}">
              @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                <p class="text-red-400 text-xs ml-1 mt-1">
                  @if (registerForm.get('email')?.hasError('required')) { Work email is required }
                  @if (registerForm.get('email')?.hasError('email')) { Please enter a valid email }
                </p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-brand-secondary mb-2" for="password">Password</label>
              <div class="relative">
                <input 
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'" 
                  formControlName="password"
                  placeholder="••••••••" 
                  class="input-field py-3 px-4 pr-12"
                  [ngClass]="{'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20': registerForm.get('password')?.invalid && registerForm.get('password')?.touched}">
                <button type="button" (click)="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-white transition-colors p-1">
                  @if (showPassword()) {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  } @else {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <p class="text-red-400 text-xs ml-1 mt-1">
                  @if (registerForm.get('password')?.hasError('required')) { Password is required }
                  @if (registerForm.get('password')?.hasError('minlength')) { Password must be at least 8 characters }
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
              [disabled]="registerForm.invalid || (isLoading$ | async)"
              class="premium-button w-full py-3.5 mt-4 disabled:opacity-50"
            >
              @if (isLoading$ | async) {
                <span class="flex items-center justify-center">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              } @else {
                Get Started for Free
              }
            </button>
          </form>

          <p class="text-sm text-brand-secondary mt-10 text-center">
            Already using Enterprise? <a routerLink="/auth/login" class="text-brand-primary font-medium hover:underline">Sign In</a>
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
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  isLoading$ = this.store.select(selectIsLoading);
  errorMessage$ = this.store.select(selectError);
  showPassword = signal(false);


  ngOnInit() {
    this.store.dispatch(AuthActions.clearAuthErrors());
  }

  registerForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    orgName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.store.dispatch(AuthActions.register({ data: this.registerForm.value as any }));
      return;
    }

    this.registerForm.markAllAsTouched();
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }
}
