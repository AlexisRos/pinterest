import { Component, Input } from '@angular/core';
import { Post } from '../../interfaces/post';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [NgIf],
  template: `
  <article class="card">
    <img [src]="imgSrc" [alt]="post?.title" loading="lazy" />
    <div class="content">
      <h3>{{ post?.title }}</h3>
      <p *ngIf="post?.description">{{ post?.description }}</p>
    </div>
  </article>
  `,
  styles: [`
  .card {
    break-inside: avoid;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(0,0,0,.06);
    overflow: hidden;
    display: block;
    margin: 0 0 16px 0;
    border: 1px solid rgba(0,0,0,.06);
  }
  .card img { width: 100%; display:block; }
  .content { padding: 10px 12px; }
  .content h3 { margin: 4px 0 6px; font-size: 16px; }
  .content p { margin: 0; color: #555; font-size: 14px; line-height: 1.35; }
  `]
})
export class PostCardComponent {
  @Input() post!: Post;

  get imgSrc() {
    return this.post?.imageUrl || this.post?.imageData || '';
  }
}
