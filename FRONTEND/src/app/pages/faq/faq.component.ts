import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  faqList = [
    {
      pregunta: '¿Cómo crear mi cuenta?',
      respuesta: 'Podés registrarte desde el menú principal seleccionando “Registrarse”, completando tus datos personales.',
      open: false
    },
    {
      pregunta: '¿Cómo recuperar mi contraseña?',
      respuesta: 'Desde la pantalla de inicio de sesión hacé clic en “¿Olvidaste tu contraseña?” y seguí las instrucciones enviadas a tu correo.',
      open: false
    },
    {
      pregunta: '¿Qué medios de pago aceptan?',
      respuesta: 'Aceptamos tarjetas de crédito, débito y pagos a través de Mercado Pago.',
      open: false
    },
    {
      pregunta: '¿Cómo consultar el estado de mi pedido?',
      respuesta: 'Ingresá a tu perfil y seleccioná la opción “Mis Órdenes” para ver el estado de tus compras.',
      open: false
    }
  ];

  abrirCorreo() {
  const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=manulautarodiesel@gmail.com&su=Consulta%20desde%20Lautaro%20Diesel%20Ecommerce';
  window.open(gmailUrl, '_blank');
}


  toggle(item: any) {
    this.faqList.forEach(i => {
      if (i !== item) i.open = false;
    });
    item.open = !item.open;
  }
}
