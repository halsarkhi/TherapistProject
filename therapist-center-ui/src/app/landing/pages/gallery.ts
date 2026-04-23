import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList, inject, computed, signal, HostListener } from '@angular/core';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { TranslationService } from '../../core/services/translation.service';

interface GalleryItem {
  title: string;
  category: string;
  filter: string;
  image: string;
  tall?: boolean;
  wide?: boolean;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="page-hero">
      <div class="container">
        <span class="page-badge">{{ 'gal_badge' | translate }}</span>
        <h1>{{ 'gal_hero_title' | translate }}</h1>
        <p>{{ 'gal_hero_desc' | translate }}</p>
      </div>
    </section>

    <section class="gallery-section">
      <div class="container">
        <div class="gallery-filters" #animateEl>
          @for (filter of filters(); track filter.key) {
            <button
              [class.active]="activeFilter() === filter.key"
              (click)="activeFilter.set(filter.key)">
              {{ filter.label }}
            </button>
          }
        </div>

        <div class="gallery-grid">
          @for (item of filteredItems(); track item.image; let i = $index) {
            <div
              class="gallery-item"
              [class.tall]="item.tall"
              [class.wide]="item.wide"
              #animateEl
              [style.transition-delay]="(i * 60) + 'ms'"
              (click)="openLightbox(i)">
              <img [src]="item.image" [alt]="item.title" loading="lazy" />
              <div class="gallery-overlay">
                <span class="gallery-category">{{ item.category }}</span>
                <h3>{{ item.title }}</h3>
              </div>
              <div class="gallery-zoom">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                  <path d="M11 8v6M8 11h6"/>
                </svg>
              </div>
            </div>
          }
        </div>

        @if (filteredItems().length === 0) {
          <div class="empty-state">
            <p>{{ 'gal_no_items' | translate }}</p>
          </div>
        }
      </div>
    </section>

    @if (lightboxIndex() !== null) {
      <div class="lightbox" (click)="closeLightbox()">
        <button class="lightbox-close" (click)="closeLightbox(); $event.stopPropagation()" aria-label="إغلاق">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <button class="lightbox-nav lightbox-prev" (click)="prev(); $event.stopPropagation()" aria-label="السابق">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <img [src]="filteredItems()[lightboxIndex()!].image" [alt]="filteredItems()[lightboxIndex()!].title" />
          <div class="lightbox-caption">
            <span>{{ filteredItems()[lightboxIndex()!].category }}</span>
            <h3>{{ filteredItems()[lightboxIndex()!].title }}</h3>
            <small>{{ (lightboxIndex()! + 1) }} / {{ filteredItems().length }}</small>
          </div>
        </div>
        <button class="lightbox-nav lightbox-next" (click)="next(); $event.stopPropagation()" aria-label="التالي">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    }
  `,
  styles: `
    :host { display: block; }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .page-hero {
      background: linear-gradient(135deg, var(--off-white) 0%, var(--light-green) 100%);
      padding: 4rem 0 3.5rem;
      text-align: center;
    }

    .page-badge {
      display: inline-block;
      background: color-mix(in srgb, var(--primary) 12%, transparent);
      color: var(--primary);
      padding: 0.35rem 1.1rem;
      border-radius: var(--radius-xl);
      font-size: 0.82rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }

    .page-hero h1 {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--heading-color);
      margin-bottom: 0.75rem;
    }

    .page-hero > .container > p {
      font-size: 1.05rem;
      color: var(--text-muted);
      max-width: 600px;
      margin: 0 auto;
    }

    .gallery-section { padding: 3rem 0 5rem; }

    .gallery-filters {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      opacity: 0;
      transform: translateY(15px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .gallery-filters.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .gallery-filters button {
      padding: 0.5rem 1.25rem;
      border-radius: var(--radius-xl);
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--white);
      border: 1.5px solid var(--border-light);
      transition: var(--transition);
      cursor: pointer;
    }

    .gallery-filters button:hover {
      border-color: var(--primary);
      color: var(--primary);
    }

    .gallery-filters button.active {
      background: var(--primary);
      color: var(--white);
      border-color: var(--primary);
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: 220px;
      gap: 1rem;
    }

    .gallery-item {
      border-radius: var(--radius-lg);
      overflow: hidden;
      position: relative;
      cursor: pointer;
      opacity: 0;
      transform: scale(0.95);
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      background: var(--off-white);
    }

    .gallery-item.visible {
      opacity: 1;
      transform: scale(1);
      transition: opacity 0.5s ease, transform 0.5s ease, box-shadow 0.3s ease;
    }

    .gallery-item:hover {
      box-shadow: 0 12px 32px rgba(0,0,0,0.15);
    }

    .gallery-item.tall { grid-row: span 2; }
    .gallery-item.wide { grid-column: span 2; }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .gallery-item:hover img {
      transform: scale(1.07);
    }

    .gallery-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(45, 62, 40, 0.92));
      padding: 2.5rem 1.25rem 1.25rem;
      transform: translateY(40%);
      opacity: 0.85;
      transition: transform 0.35s ease, opacity 0.35s ease;
    }

    .gallery-item:hover .gallery-overlay {
      transform: translateY(0);
      opacity: 1;
    }

    .gallery-overlay h3 {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--white);
      margin: 0;
    }

    .gallery-category {
      display: inline-block;
      font-size: 0.72rem;
      color: rgba(255, 255, 255, 0.85);
      background: rgba(255,255,255,0.18);
      padding: 0.2rem 0.6rem;
      border-radius: var(--radius-xl);
      margin-bottom: 0.4rem;
      backdrop-filter: blur(6px);
    }

    .gallery-zoom {
      position: absolute;
      top: 0.75rem;
      inset-inline-end: 0.75rem;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.8);
      transition: opacity 0.3s ease, transform 0.3s ease;
      backdrop-filter: blur(8px);
    }

    .gallery-zoom svg {
      width: 18px;
      height: 18px;
      color: var(--primary);
    }

    .gallery-item:hover .gallery-zoom {
      opacity: 1;
      transform: scale(1);
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
    }

    /* Lightbox */
    .lightbox {
      position: fixed;
      inset: 0;
      background: rgba(15, 20, 15, 0.94);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
      padding: 2rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .lightbox-content {
      max-width: 90vw;
      max-height: 85vh;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .lightbox-content img {
      max-width: 100%;
      max-height: 75vh;
      object-fit: contain;
      border-radius: var(--radius-lg);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .lightbox-caption {
      text-align: center;
      color: var(--white);
    }

    .lightbox-caption span {
      display: inline-block;
      font-size: 0.75rem;
      padding: 0.2rem 0.7rem;
      background: rgba(255,255,255,0.15);
      border-radius: var(--radius-xl);
      margin-bottom: 0.4rem;
    }

    .lightbox-caption h3 {
      color: var(--white);
      font-size: 1.1rem;
      margin: 0 0 0.3rem;
    }

    .lightbox-caption small {
      color: rgba(255,255,255,0.6);
      font-size: 0.78rem;
    }

    .lightbox-close,
    .lightbox-nav {
      position: absolute;
      background: rgba(255,255,255,0.12);
      border: none;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      color: var(--white);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease, transform 0.2s ease;
      backdrop-filter: blur(8px);
    }

    .lightbox-close:hover,
    .lightbox-nav:hover {
      background: rgba(255,255,255,0.25);
      transform: scale(1.08);
    }

    .lightbox-close svg,
    .lightbox-nav svg {
      width: 22px;
      height: 22px;
    }

    .lightbox-close {
      top: 1.5rem;
      inset-inline-end: 1.5rem;
    }

    .lightbox-prev {
      inset-inline-start: 1.5rem;
      top: 50%;
      transform: translateY(-50%);
    }

    .lightbox-next {
      inset-inline-end: 1.5rem;
      top: 50%;
      transform: translateY(-50%);
    }

    :host-context([dir="rtl"]) .lightbox-prev svg,
    :host-context([dir="rtl"]) .lightbox-next svg {
      transform: scaleX(-1);
    }

    @media (max-width: 1024px) {
      .gallery-grid {
        grid-template-columns: repeat(3, 1fr);
        grid-auto-rows: 200px;
      }
    }

    @media (max-width: 768px) {
      .gallery-grid {
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: 180px;
      }
      .page-hero h1 { font-size: 1.8rem; }
      .container { padding: 0 1.25rem; }
      .lightbox-close { top: 1rem; inset-inline-end: 1rem; }
      .lightbox-prev { inset-inline-start: 0.5rem; }
      .lightbox-next { inset-inline-end: 0.5rem; }
    }

    @media (max-width: 480px) {
      .gallery-grid {
        grid-template-columns: 1fr;
        grid-auto-rows: 240px;
      }
      .gallery-item.wide { grid-column: span 1; }
      .gallery-item.tall { grid-row: span 1; }
    }
  `,
})
export class GalleryComponent implements AfterViewInit {
  @ViewChildren('animateEl') animateElements!: QueryList<ElementRef>;

  private readonly ts = inject(TranslationService);

  activeFilter = signal<string>('all');
  lightboxIndex = signal<number | null>(null);

  filters = computed(() => [
    { key: 'all', label: this.ts.t('gal_filter_all') },
    { key: 'therapy', label: this.ts.t('gal_filter_therapy') },
    { key: 'activities', label: this.ts.t('gal_filter_activities') },
    { key: 'events', label: this.ts.t('gal_filter_events') },
    { key: 'facilities', label: this.ts.t('gal_filter_facilities') },
  ]);

  galleryItems = computed<GalleryItem[]>(() => [
    { title: this.ts.t('gal_item1'), category: this.ts.t('gal_filter_therapy'), filter: 'therapy', image: 'assets/images/gallery/gallery-1.jpg', tall: true },
    { title: this.ts.t('gal_item2'), category: this.ts.t('gal_filter_activities'), filter: 'activities', image: 'assets/images/gallery/gallery-2.jpg', wide: true },
    { title: this.ts.t('gal_item3'), category: this.ts.t('gal_filter_facilities'), filter: 'facilities', image: 'assets/images/gallery/gallery-3.jpg' },
    { title: this.ts.t('gal_item4'), category: this.ts.t('gal_filter_events'), filter: 'events', image: 'assets/images/gallery/gallery-4.jpg' },
    { title: this.ts.t('gal_item5'), category: this.ts.t('gal_filter_therapy'), filter: 'therapy', image: 'assets/images/gallery/gallery-5.jpg', wide: true },
    { title: this.ts.t('gal_item6'), category: this.ts.t('gal_filter_activities'), filter: 'activities', image: 'assets/images/gallery/gallery-6.jpg', tall: true },
  ]);

  filteredItems = computed<GalleryItem[]>(() => {
    const items = this.galleryItems();
    const f = this.activeFilter();
    return f === 'all' ? items : items.filter(i => i.filter === f);
  });

  openLightbox(index: number) {
    this.lightboxIndex.set(index);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.lightboxIndex.set(null);
    document.body.style.overflow = '';
  }

  next() {
    const current = this.lightboxIndex();
    if (current === null) return;
    const total = this.filteredItems().length;
    this.lightboxIndex.set((current + 1) % total);
  }

  prev() {
    const current = this.lightboxIndex();
    if (current === null) return;
    const total = this.filteredItems().length;
    this.lightboxIndex.set((current - 1 + total) % total);
  }

  @HostListener('document:keydown', ['$event'])
  handleKey(e: KeyboardEvent) {
    if (this.lightboxIndex() === null) return;
    if (e.key === 'Escape') this.closeLightbox();
    else if (e.key === 'ArrowRight') this.next();
    else if (e.key === 'ArrowLeft') this.prev();
  }

  ngAfterViewInit() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );
    this.animateElements.forEach(el => observer.observe(el.nativeElement));
  }
}
