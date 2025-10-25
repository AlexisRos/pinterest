import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services/posts.service';
import { Post } from '../../interfaces/post';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, PostCardComponent, RouterLink],
  selector: 'app-gallery',
  template: `
  <section class="container">
    <header class="topbar">
      <h1>Pinterest</h1>

      <div class="actions">
        <!-- Buscador -->
        <input
          class="search"
          type="search"
          placeholder="Buscar por título o descripción..."
          (input)="onSearch($event)"
        />
        <a class="btn" routerLink="/add">+ Nuevo</a>
      </div>
    </header>

    <div class="masonry">
      @for (post of postsFiltered(); track post.id) {
        <app-post-card [post]="post"></app-post-card>
      }
    </div>
  </section>
  `,
  styles: [`
  .container { max-width: 1100px; margin: 0 auto; padding: 20px; }
  .topbar { display:flex; justify-content:space-between; align-items:center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
  .actions { display:flex; gap:8px; align-items:center; flex-wrap: wrap; }

  .search {
    min-width: 260px;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid #ddd;
    outline: none;
    background: #fff;
  }

  .btn { background:#e60023; color:#fff; padding:8px 14px; border-radius:999px; text-decoration:none; border:0; cursor:pointer; }
  .btn-outline { border:1px solid #ccc; background:#fff; padding:8px 12px; border-radius:999px; cursor:pointer; }

  .masonry { column-count: 1; column-gap: 16px; }
  @media (min-width: 600px) { .masonry { column-count: 2; } }
  @media (min-width: 900px) { .masonry { column-count: 3; } }
  @media (min-width: 1200px){ .masonry { column-count: 4; } }
  `]
})
export class GalleryPage implements OnInit {
  private postsSvc = inject(PostsService);

  posts = signal<Post[]>([]);
  loading = false;

  private q = signal<string>('');

  postsFiltered = computed(() => {
    const query = this.q().trim().toLowerCase();
    const list = this.posts().slice().sort((a,b) => b.createdAt - a.createdAt);

    if (!query) return list;
    return list.filter(p => {
      const txt = `${p.title ?? ''} ${p.description ?? ''}`.toLowerCase();
      return txt.includes(query);
    });
  });

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.postsSvc.getAll().subscribe(list => this.posts.set(list));
  }

  onSearch(ev: Event) {
    const value = (ev.target as HTMLInputElement)?.value ?? '';
    this.q.set(value);
  }

 loadExamples() {
  this.loading = true;
  this.postsSvc.seedExamples().subscribe({
    next: () => this.refresh(),
    error: () => { this.loading = false; },
    complete: () => { this.loading = false; }
  });
}

}

