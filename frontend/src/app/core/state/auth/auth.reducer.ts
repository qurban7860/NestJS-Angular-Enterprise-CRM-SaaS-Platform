import { createFeature, createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { User } from '../../services/auth.service';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('access_token'),
  isLoading: false,
  error: null,
};

export const authFeature = createFeature({
  name: 'auth',
  reducer: createReducer(
    initialState,
    on(AuthActions.login, AuthActions.register, (state) => ({
      ...state,
      isLoading: true,
      error: null,
    })),
    on(AuthActions.loginSuccess, AuthActions.registerSuccess, (state, { user, accessToken }) => ({
      ...state,
      user,
      accessToken,
      isLoading: false,
      error: null,
    })),
    on(AuthActions.loginFailure, AuthActions.registerFailure, (state, { error }) => ({
      ...state,
      isLoading: false,
      error,
    })),
    on(AuthActions.loadProfileSuccess, (state, { user }) => ({
      ...state,
      user,
      isLoading: false,
    })),
    on(AuthActions.logout, (state) => ({
      ...state,
      user: null,
      accessToken: null,
    })),
  ),
});

export const {
  name: authFeatureKey,
  reducer: authReducer,
  selectUser,
  selectAccessToken,
  selectIsLoading,
  selectError,
} = authFeature;
