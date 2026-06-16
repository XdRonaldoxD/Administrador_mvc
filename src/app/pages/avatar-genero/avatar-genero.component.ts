import { Component, Input } from '@angular/core';

/**
 * Avatar por género. Reemplaza las fotos hardcodeadas del header/sidebar por una
 * silueta (Font Awesome) sobre un círculo de color:
 *   - 'F' (femenino) → silueta femenina, fondo rosa.
 *   - 'M' (masculino) → silueta masculina, fondo azul.
 *   - cualquier otro/ausente → ícono neutro, fondo gris (p.ej. tokens viejos sin
 *     'sexo' antes de que el usuario vuelva a iniciar sesión).
 * El sexo viene del token (identificacion.sexo).
 */
@Component({
  selector: 'app-avatar-genero',
  templateUrl: './avatar-genero.component.html',
  styleUrls: ['./avatar-genero.component.css']
})
export class AvatarGeneroComponent {
  @Input() sexo: any;
  // Diámetro del avatar en px.
  @Input() size: number = 40;

  private get s(): string { return (this.sexo ?? '').toString().trim().toUpperCase(); }
  get esFemenino(): boolean { return this.s === 'F'; }
  get esMasculino(): boolean { return this.s === 'M'; }

  get iconClass(): string {
    if (this.esFemenino) { return 'fa fa-female'; }
    if (this.esMasculino) { return 'fa fa-male'; }
    return 'fa fa-user-o';
  }

  get claseFondo(): string {
    if (this.esFemenino) { return 'avatar-genero--f'; }
    if (this.esMasculino) { return 'avatar-genero--m'; }
    return 'avatar-genero--n';
  }
}
