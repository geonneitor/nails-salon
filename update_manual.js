const fs = require('fs');
const path = require('path');

const manualPath = path.join(__dirname, 'src', 'components', 'settings', 'ManualOperativo.tsx');
let content = fs.readFileSync(manualPath, 'utf8');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Manual Operativo Oficial · Zen Nail Salon</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --background: #FAF8F5; --primary: #1A1F14; --primary-green: #344623;
      --primary-light: #51643e; --primary-bg: rgba(52, 70, 35, 0.04);
      --text: #2C3326; --text-muted: #596150; --accent-gold: #D4AF37;
      --accent-gold-dark: #b5912a; --border: rgba(52, 70, 35, 0.12);
      --card-bg: #ffffff; --font-serif: 'Libre Caslon Text', serif;
      --font-sans: 'Manrope', sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: var(--background); color: var(--text); font-family: var(--font-sans); line-height: 1.6; padding-bottom: 6rem; }
    .container { max-width: 900px; margin: 0 auto; padding: 2rem 1.25rem; }
    header { text-align: center; margin-bottom: 3rem; border-bottom: 1px solid var(--border); padding-bottom: 2.5rem; }
    .logo-text { font-family: var(--font-serif); font-size: 1.8rem; letter-spacing: 0.15em; color: var(--primary-green); text-transform: uppercase; }
    .logo-sub { font-size: 0.65rem; letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent-gold-dark); font-weight: 700; margin-top: 0.25rem; }
    .badge { display: inline-flex; align-items: center; background-color: var(--primary-bg); color: var(--primary-green); padding: 0.5rem 1.25rem; border-radius: 9999px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; margin: 1.5rem 0 1rem; border: 1px solid rgba(52, 70, 35, 0.08); }
    h1 { font-family: var(--font-serif); font-size: 2.2rem; color: var(--primary-green); margin-bottom: 0.75rem; line-height: 1.2; }
    .subtitle { font-size: 0.9rem; color: var(--text-muted); font-weight: 300; max-width: 600px; margin: 0 auto; }
    .quick-nav { background: var(--card-bg); border: 1px solid var(--border); border-radius: 1.5rem; padding: 1.25rem; margin-bottom: 3rem; }
    .quick-nav-title { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: var(--accent-gold-dark); margin-bottom: 0.75rem; text-align: center; }
    .quick-nav-links { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; justify-content: center; }
    .quick-nav-links a { color: var(--primary-green); text-decoration: none; font-size: 0.8rem; font-weight: 500; transition: color 0.2s; }
    h2 { font-family: var(--font-serif); font-size: 1.6rem; color: var(--primary-green); margin-top: 3.5rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem; }
    h3 { font-family: var(--font-serif); font-size: 1.2rem; color: var(--primary-light); margin-top: 2rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
    p { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.25rem; }
    strong { color: var(--primary); font-weight: 600; }
    .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 1.5rem; padding: 1.75rem; margin-bottom: 1.5rem; box-shadow: 0 4px 15px rgba(52, 70, 35, 0.01); }
    details.usecase-accordion { background: var(--card-bg); border: 1px solid var(--border); border-radius: 1.5rem; margin-bottom: 1.25rem; overflow: hidden; }
    summary.usecase-summary { padding: 1.25rem 1.5rem; font-family: var(--font-serif); font-size: 1.1rem; color: var(--primary-green); font-weight: 700; cursor: pointer; user-select: none; display: flex; justify-content: space-between; align-items: center; }
    summary.usecase-summary::-webkit-details-marker { display: none; }
    .usecase-content { padding: 0 1.5rem 1.5rem 1.5rem; border-top: 1px solid var(--border); }
    .usecase-table { width: 100%; border-collapse: collapse; margin-top: 1rem; font-size: 0.85rem; }
    .usecase-table tr { border-bottom: 1px solid var(--border); }
    .usecase-label { padding: 0.75rem 0.5rem; font-weight: 700; color: var(--primary-green); width: 140px; vertical-align: top; background: var(--primary-bg); border-right: 1px solid var(--border); }
    .usecase-value { padding: 0.75rem 1rem; color: var(--text-muted); vertical-align: top; }
    ul, ol { margin-left: 1.25rem; margin-bottom: 1rem; font-size: 0.85rem; color: var(--text-muted); }
    li { margin-bottom: 0.4rem; }
    .print-actions { display: flex; justify-content: center; margin-top: 3.5rem; }
    .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; background-color: var(--primary-green); color: #ffffff; border: none; cursor: pointer; }
    @media print { body { background-color: #ffffff; padding-bottom: 0; } .quick-nav, .print-actions { display: none !important; } }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-text">Zen Nail Salon</div>
      <div class="logo-sub">Rituales de Calma</div>
      <div class="badge">Documentación Oficial de Operación v3.0</div>
      <h1>Manual Integral y Casos de Uso</h1>
      <p class="subtitle">Guía oficial de administración, gestión de agenda, cajón diario, perfiles clínicos de clientas y flujos de trabajo premium.</p>
    </header>

    <div class="quick-nav">
      <div class="quick-nav-title">Índice del Manual</div>
      <div class="quick-nav-links">
        <a href="#magia-calendario">1. Gestión de Agenda</a>
        <a href="#alta-rapida">2. Perfiles y Clientas</a>
        <a href="#caja-diaria">3. Caja y Cierre Diario</a>
        <a href="#cobros-anticipos">4. Cobros y Anticipos</a>
        <a href="#servicios-catalogo">5. Servicios y Ajustes</a>
      </div>
    </div>

    <section id="magia-calendario">
      <h2>1. Gestión de Agenda y Calendario Maestro</h2>
      <div class="card">
        <p>El calendario maestro interactivo te permite ver y controlar las citas diarias, semanales o mensuales. Diseñado con una interfaz Premium Zen para minimizar la fatiga visual (soporte Modo Oscuro).</p>
        <h3 style="color: var(--primary-green);">Reprogramación Instantánea (Arrastrar y Soltar)</h3>
        <p>¿Una clienta te pidió cambiar su hora o quieres pasarle una cita a otra manicurista? Simplemente <strong>mantén presionada la cita, arrástrala hacia arriba, abajo o hacia los lados, y suéltala</strong>. El sistema ajustará la hora (en bloques de 15 minutos) sin recargar la página.</p>
        <h3 style="color: var(--primary-green);">Bloqueos de Tiempo (TimeBlocks)</h3>
        <p>Para registrar horas de comida o reuniones, toca cualquier espacio vacío en el calendario y selecciona <strong>Añadir Bloqueo</strong>. El espacio será eliminado de la página pública web, evitando reservas accidentales.</p>
      </div>
    </section>

    <section id="alta-rapida">
      <h2>2. Perfiles Clínicos de Clientas</h2>
      <div class="card">
        <p>La pestaña de <strong>Clientas</strong> ofrece una lista con búsqueda avanzada, ordenamiento por última visita y acceso rápido al Perfil Clínico. Puedes ver el historial completo de citas, los ingresos generados por cada clienta y notas cruciales.</p>
        <h3 style="color: var(--primary-green);">Alta Rápida en Citas Nuevas</h3>
        <p>Al crear una nueva cita manual, si la clienta no existe, puedes ingresarla con su <strong>Nombre Completo y WhatsApp</strong> directamente en el formulario. Se registrará automáticamente y podrás completar detalles extra (alergias, cumpleaños) luego.</p>
      </div>
    </section>

    <section id="caja-diaria">
      <h2>3. Caja y Cierre Diario</h2>
      <div class="card">
        <p>La vista de <strong>Caja</strong> (\`/caja\`) te permite tener un panorama financiero exacto del día actual, consolidando todas las citas finalizadas y sus montos.</p>
        <details class="usecase-accordion" open>
          <summary class="usecase-summary">Flujo del Cierre Diario</summary>
          <div class="usecase-content">
            <table class="usecase-table">
              <tr>
                <td class="usecase-label">1. Revisar Operaciones</td>
                <td class="usecase-value">Asegúrate de que todas las citas del día estén marcadas como "Cobrada" o "Cancelada" en el calendario.</td>
              </tr>
              <tr>
                <td class="usecase-label">2. Confirmar Efectivo</td>
                <td class="usecase-value">Ingresa el Efectivo Real que tienes en caja registradora en la página de Caja para que el sistema calcule el descuadre (si lo hay).</td>
              </tr>
              <tr>
                <td class="usecase-label">3. Cerrar Caja</td>
                <td class="usecase-value">Al presionar "Generar Cierre", el sistema guardará un snapshot de las ventas del día, el desempeño por empleada y te generará un mensaje automático de WhatsApp con el resumen contable.</td>
              </tr>
            </table>
          </div>
        </details>
      </div>
    </section>

    <section id="cobros-anticipos">
      <h2>4. Cobros, Reservas Públicas y Anticipos</h2>
      <div class="card">
        <p>El portal web público (\`/reserva\`) cotiza el servicio a la clienta en tiempo real. Al finalizar, la clienta ve los datos bancarios del salón para hacer su transferencia de anticipo, y la cita se guarda en color <strong>Amarillo (Pendiente)</strong>.</p>
        <p>Cuando verificas el pago en tu banca, simplemente tocas la cita en el calendario y cambias su estado a <strong>Confirmada (Color Verde)</strong>.</p>
      </div>
    </section>

    <section id="servicios-catalogo">
      <h2>5. Ajustes de Salón y Catálogo de Servicios</h2>
      <div class="card">
        <p>Desde la sección <strong>Ajustes</strong> tienes el control total:</p>
        <ul>
          <li><strong>Datos del Negocio:</strong> Personaliza el Nombre del salón, teléfono de WhatsApp para los comprobantes, y datos bancarios.</li>
          <li><strong>Catálogo Dinámico:</strong> Cambia precios, añade variantes y complementos. Cualquier cambio se actualiza de inmediato en el motor de reservas público.</li>
          <li><strong>Empleadas:</strong> Da de alta al staff para que aparezcan sus columnas independientes en el calendario diario.</li>
        </ul>
      </div>
    </section>

    <div class="print-actions">
      <button onclick="window.print()" class="btn">Guardar PDF / Imprimir Manual</button>
    </div>
  </div>
</body>
</html>`;

content = content.replace(/const htmlContent = `[\s\S]*?`;/, 'const htmlContent = `' + htmlContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`;');

fs.writeFileSync(manualPath, content, 'utf8');
console.log('Manual actualizado correctamente.');
