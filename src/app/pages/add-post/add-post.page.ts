import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PostsService } from '../../services/posts.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-add-post',
  template: `
  <section class="container">
    <header class="topbar">
      <h2>Nuevo Post</h2>
      <a class="btn-outline" routerLink="/">← Volver</a>
    </header>

    <form [formGroup]="form" (ngSubmit)="save()">
      <label>Título
        <input formControlName="title" placeholder="Buena imagen" />
      </label>

      <label>Descripción
        <textarea rows="3" formControlName="description" placeholder="Algo breve"></textarea>
      </label>

      <div class="mode">
        <label>
          <input type="radio" name="mode" value="url" [checked]="mode() === 'url'" (change)="setMode('url')">
          Usar URL
        </label>
        <label>
          <input type="radio" name="mode" value="file" [checked]="mode() === 'file'" (change)="setMode('file')">
          Subir archivo
        </label>
      </div>

      <!-- MODO URL -->
      <ng-container *ngIf="mode() === 'url'">
        <label>URL de la imagen
          <input formControlName="imageUrl" placeholder="https://..." />
        </label>
        <div class="preview" *ngIf="form.value.imageUrl">
          <p>Vista previa:</p>
          <img [src]="form.value.imageUrl" alt="preview" />
        </div>
      </ng-container>

      <!-- MODO FILE -->
      <ng-container *ngIf="mode() === 'file'">
        <label>Archivo (png/jpg, máx {{(maxKB)}} KB)
          <input type="file" accept="image/*" (change)="onFile($event)" />
        </label>
        <div class="preview" *ngIf="filePreview()">
          <p>Vista previa:</p>
          <img [src]="filePreview()" alt="preview" />
        </div>
        <p class="hint">
          Se guardará como <b>Data URL (base64)</b> en la base de datos (solo para demo).
        </p>
        <p class="error" *ngIf="errorMsg">{{ errorMsg }}</p>
      </ng-container>

      <button class="btn" type="submit" [disabled]="submitDisabled()">Guardar</button>
    </form>
  </section>
  `,
  styles: [`
  .container { max-width: 760px; margin: 0 auto; padding: 20px; }
  .topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom: 12px; }
  form { display:grid; gap: 14px; }
  input, textarea { width:100%; padding:10px 12px; border-radius:10px; border:1px solid #ddd; outline:none; }
  .btn { background:#e60023; color:#fff; padding:10px 14px; border-radius:10px; border:0; cursor:pointer; }
  .btn-outline { border:1px solid #ccc; padding:8px 12px; border-radius:999px; text-decoration:none; color:#333; }
  .mode { display:flex; gap:16px; align-items:center; }
  .preview { border:1px dashed #ccc; padding:10px; border-radius:12px; }
  .preview img { max-width: 100%; height: auto; display:block; border-radius:8px; }
  .hint { font-size: 12px; color:#666; margin:0; }
  .error { color:#b00020; font-size: 13px; margin: 0; }
  `]
})
export class AddPostPage {
  private fb = inject(FormBuilder);
  private postsSvc = inject(PostsService);
  protected router = inject(Router);

  // Estado
  mode = signal<'url' | 'file'>('url');
  filePreview = signal<string | null>(null);
  fileDataUrl: string | null = null; 
  loading = false;
  errorMsg = '';
  maxKB = 300; 

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    imageUrl: ['', []], 
  });

  setMode(m: 'url' | 'file') {
    this.mode.set(m);
    this.filePreview.set(null);
    this.fileDataUrl = null;
    this.errorMsg = '';

    const urlCtrl = this.form.controls.imageUrl;
    urlCtrl.clearValidators();
    if (m === 'url') {
      urlCtrl.addValidators([Validators.required, Validators.pattern(/^https?:\/\/.+/i)]);
    }
    urlCtrl.updateValueAndValidity();
  }

  onFile(ev: Event) {
    this.errorMsg = '';
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      this.filePreview.set(null);
      this.fileDataUrl = null;
      return;
    }

    const maxBytes = this.maxKB * 1024;
    if (file.size > maxBytes) {
      this.errorMsg = `Archivo demasiado grande. Máximo ${this.maxKB} KB para la demo.`;
      (ev.target as HTMLInputElement).value = '';
      this.filePreview.set(null);
      this.fileDataUrl = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      if (!result.startsWith('data:image/')) {
        this.errorMsg = 'El archivo no parece ser una imagen válida.';
        return;
      }
      this.fileDataUrl = result;
      this.filePreview.set(result);
    };
    reader.onerror = () => {
      this.errorMsg = 'No se pudo leer el archivo.';
    };
    reader.readAsDataURL(file);
  }

  submitDisabled() {
    if (this.loading) return true;
    if (this.mode() === 'url') return this.form.invalid;
    return !this.fileDataUrl;
  }

  save() {
    if (this.submitDisabled()) return;
    this.loading = true;
    this.errorMsg = '';

    const now = Date.now();
    const payload: any = {
      title: this.form.value.title?.trim(),
      description: this.form.value.description?.trim(),
      createdAt: now,
    };

    if (this.mode() === 'url') {
      payload.imageUrl = this.form.value.imageUrl;
    } else {
      if (!this.fileDataUrl) {
        this.loading = false;
        this.errorMsg = 'Selecciona una imagen válida.';
        return;
      }
      payload.imageData = this.fileDataUrl;
    }

    this.postsSvc.create(payload).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (err) => {
        console.error('Error creando post', err);
        this.loading = false;
        this.errorMsg = 'No se pudo guardar. Revisa consola y reglas de Firebase.';
      }
    });
  }
}
