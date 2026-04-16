import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User } from '../../services/auth.service';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    'Login': props<{ credentials: any }>(),
    'Login Success': props<{ user: User; accessToken: string }>(),
    'Login Failure': props<{ error: string }>(),
    
    'Register': props<{ data: any }>(),
    'Register Success': props<{ user: User; accessToken: string }>(),
    'Register Failure': props<{ error: string }>(),
    
    'Logout': emptyProps(),
    'Load Profile': emptyProps(),
    'Load Profile Success': props<{ user: User }>(),
    'Load Profile Failure': emptyProps(),
  }
});
