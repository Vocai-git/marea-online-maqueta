/* ==========================================================================
   Marea Online · Configuración
   Único archivo a tocar para conectar la web con los datos reales.
   Ningún secreto aquí: este archivo es público. Las claves van en el servidor.
   ========================================================================== */
window.MAREA_CONFIG = {
  /* URL que recibe el formulario (POST con JSON). Ver README → "Conectar el formulario".
     Vacío = modo demostración: valida pero no envía nada. */
  formEndpoint: '',

  /* Página a la que se redirige tras enviar el formulario con éxito */
  thanksPage: 'gracias.html',

  /* WhatsApp en formato internacional, sin "+" ni espacios. Ej.: 34600000000 */
  whatsapp: '',
  whatsappText: 'Hola, me gustaría pedir presupuesto.',

  /* Email público de contacto */
  email: 'hola@mareaonline.es',

  /* Teléfono público (se muestra tal cual) */
  phone: ''
};
