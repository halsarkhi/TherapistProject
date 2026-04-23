import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div class="avatar" [style.background-color]="bgColor" [style.width]="size" [style.height]="size" [style.font-size]="fontSize">
      @if (imageUrl) {
        <img [src]="imageUrl" [alt]="name" />
      } @else {
        {{ initials }}
      }
    </div>
  `,
  styles: `
    .avatar {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-family: 'Cairo', sans-serif;
      overflow: hidden;
      flex-shrink: 0;
    }
    .avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `
})
export class AvatarComponent {
  @Input() name = '';
  @Input() imageUrl = '';
  @Input() size = '40px';

  get initials(): string {
    return this.name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2);
  }

  get bgColor(): string {
    let hash = 0;
    for (const char of this.name) hash = char.charCodeAt(0) + ((hash << 5) - hash);
    const colors = ['#6B8068', '#4A7C9B', '#7B6BA5', '#C47B5A', '#5B8C6B', '#8B6B4A', '#6B7B9B'];
    return colors[Math.abs(hash) % colors.length];
  }

  get fontSize(): string {
    const px = parseInt(this.size);
    return `${Math.round(px * 0.4)}px`;
  }
}
