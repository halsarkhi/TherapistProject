import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-download-button',
  standalone: true,
  template: `
    <a
      class="form-dl"
      [href]="'assets/forms/' + fileName"
      [download]="fileName"
      target="_blank"
      rel="noopener"
    >
      <svg
        class="icon"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        @switch (format) {
          @case ('pdf') {
            <text x="7" y="17" font-size="6" font-weight="700" stroke="none" fill="currentColor">PDF</text>
          }
          @case ('docx') {
            <text x="6" y="17" font-size="6" font-weight="700" stroke="none" fill="currentColor">DOC</text>
          }
          @case ('xlsx') {
            <text x="7" y="17" font-size="6" font-weight="700" stroke="none" fill="currentColor">XLS</text>
          }
        }
      </svg>
      <span class="label">{{ label }}</span>
    </a>
  `,
  styles: [`
    :host { display: inline-block; }
    .form-dl {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 500;
      color: var(--primary);
      background: transparent;
      border: 1px solid var(--border-light);
      border-radius: var(--radius-sm);
      text-decoration: none;
      transition: var(--transition);
      cursor: pointer;
      line-height: 1.2;
    }
    .form-dl:hover {
      background: color-mix(in srgb, var(--primary) 8%, transparent);
      border-color: var(--primary);
    }
    .form-dl:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }
    .icon { flex-shrink: 0; }
    .label { white-space: nowrap; }
  `],
})
export class FormDownloadButtonComponent {
  @Input({ required: true }) fileName!: string;
  @Input({ required: true }) label!: string;
  @Input({ required: true }) format!: 'pdf' | 'docx' | 'xlsx';
}
