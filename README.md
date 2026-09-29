# Marea Online · Web

Web corporativa de Marea Online: home, cuatro páginas de servicio, contacto y textos legales.
HTML, CSS y JavaScript sin paso de compilación. No carga nada de servidores de terceros.

La documentación completa está en la propia web:

- **`guia.html`**: marca, maquetación, plantillas, contenido, cómo conectar el formulario y lista para producción.
- **`kit.html`**: cada pieza en vivo con su HTML listo para copiar.

## Arrancar en local

```bash
python3 -m http.server 8080   # o: npx serve .
# http://localhost:8080
```

Añade `?static` a cualquier URL para verla sin animaciones.

## Estructura

```
*.html            Páginas (index, webs, redes-sociales, apps, automatizaciones, contacto,
                  gracias, 404, aviso-legal, privacidad, cookies) + kit y guía
css/tokens.css    Valores de marca: color, tipografía, espaciado, radios, sombras
css/base.css      Reset, tipografía, contenedor, secciones, retículas
css/componentes.css  Todas las piezas (numeradas igual que en el kit)
js/config.js      Datos a conectar: destino del formulario, WhatsApp, email, teléfono
js/main.js        Cabecera, menú móvil, canales y formulario
js/animaciones.js Animaciones (GSAP + ScrollTrigger en js/vendor/)
fonts/            Bricolage Grotesque e Instrument Sans (OFL)
img/              Logo (SVG y PNG), imagen de fondo, favicon, imagen para redes
tokens.json       Los tokens en JSON, para llevarlos a otro stack
```

`css/sistema.css`, `js/sistema.js`, `kit.html` y `guia.html` son solo de la vista previa y no se publican.

## Conectar

Todo en `js/config.js`:

```js
window.MAREA_CONFIG = {
  formEndpoint: 'https://api.tudominio.es/leads', // POST con JSON; vacío = modo demostración
  thanksPage: 'gracias.html',
  whatsapp: '34600000000',
  whatsappText: 'Hola, me gustaría pedir presupuesto.',
  email: 'hola@mareaonline.es',
  phone: ''
};
```

El formulario envía:

```json
{
  "nombre": "Ana García",
  "email": "ana@ejemplo.es",
  "telefono": "600000000",
  "servicio": "web-ia",
  "mensaje": "…",
  "consentimiento": true,
  "origen": "/contacto.html",
  "enviado_en": "2026-10-01T10:24:00.000Z"
}
```

Una respuesta 2xx redirige a `gracias.html`. Valores de `servicio`: `web`, `web-ia`, `redes-presencia`,
`redes-marca`, `app`, `automatizacion`, `otro`. El servidor debe volver a validar, guardar el lead,
avisar al equipo y permitir CORS desde el dominio. Las claves van solo en el servidor.

## Antes de publicar

1. Borrar `<meta name="robots" content="noindex, nofollow">` de las páginas públicas.
2. Poner el dominio final en `canonical`, `og:url`, `og:image`, `sitemap.xml` y `robots.txt` (ahora: `https://www.mareaonline.es`).
3. Quitar `css/sistema.css` y `js/sistema.js` de todas las páginas. No publicar `kit.html` ni `guia.html`.
4. Completar los textos legales: buscar `class="dato"` hasta que no quede ninguno. Borrar los avisos de plantilla y hacerlos revisar por un asesor legal.
5. Rellenar `js/config.js` y probar un envío real de punta a punta.
6. Si se añade analítica o píxeles: banner de consentimiento y actualizar `cookies.html`.

La lista completa está en `guia.html#g-produccion`.

## Licencias

- Tipografías: SIL Open Font License 1.1 (`fonts/LICENCIAS.txt`).
- GSAP 3.13: licencia estándar gratuita de GSAP (gsap.com/standard-license).
- Logo, imágenes, textos y diseño: propiedad de Marea Online.
