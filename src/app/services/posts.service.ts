import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, Observable, forkJoin } from 'rxjs';
import { Post } from '../interfaces/post';

type FirebaseList<T> = { [id: string]: T } | null;

@Injectable({ providedIn: 'root' })
export class PostsService {
  private http = inject(HttpClient);
  private base = environment.firebaseDbUrl;

  getAll(): Observable<Post[]> {
    return this.http.get<FirebaseList<Omit<Post,'id'>>>(`${this.base}/posts.json`).pipe(
      map(data => {
        if (!data) return [];
        return Object.entries(data).map(([id, p]) => ({ id, ...(p as any) })) as Post[];
      })
    );
  }

  create(post: Omit<Post, 'id'>): Observable<{ name: string }> {
    return this.http.post<{ name: string }>(`${this.base}/posts.json`, post);
  }
   seedExamples(): Observable<unknown> {
    const now = Date.now();
    const items = [
      {
        title: 'Ejemplo 1',
        description: 'Referencia 1',
        imageUrl: 'https://i.pinimg.com/736x/a1/c2/72/a1c2723c400784f92b5d234be21b0c64.jpg',
        createdAt: now,
      },
      {
        title: 'Ejemplo 2',
        description: 'Referencia 2',
        imageUrl: 'https://i.pinimg.com/736x/d4/53/d4/d453d42d88f2497971aa41c4debde47c.jpg',
        createdAt: now + 1,
      },
      {
        title: 'Pinterest 3',
        description: 'Referencia 3',
        imageUrl: 'https://i.pinimg.com/736x/f8/99/f7/f899f7a1ea7169324d7a884a504ee9d2.jpg',
        createdAt: now + 2,
      },
    ];

    const reqs = items.map(p => this.create(p)); 
    return forkJoin(reqs);                   
  }
}
