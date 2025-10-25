import { Routes } from '@angular/router';
import { GalleryPage } from './pages/gallery/gallery.page';
import { AddPostPage } from './pages/add-post/add-post.page';

export const routes: Routes = [
  { path: '', component: GalleryPage },
  { path: 'add', component: AddPostPage },
  { path: '**', redirectTo: '' },
];
