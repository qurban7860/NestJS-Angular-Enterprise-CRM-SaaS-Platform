import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'contact' | 'task' | 'deal' | 'page';
  url: string;
  icon?: string;
}

export interface SearchGroup {
  type: string;
  results: SearchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class GlobalSearchService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  search(query: string): Observable<SearchGroup[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    return this.http.get<{success: boolean, data: SearchGroup[]}>(`${this.apiUrl}/search?q=${query}`).pipe(
      map(res => res.data || []),
      catchError(() => of([]))
    );
  }
}
