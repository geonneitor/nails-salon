'use client';

import React from 'react';
import { 
  Download, 
  BookOpen, 
  CheckCircle, 
  HelpCircle,
  FileText,
  Bookmark,
  Users,
  CreditCard
} from 'lucide-react';

export function ManualOperativo() {
  
  const handleDownload = () => {
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
      --background: #FAF8F5;
      --primary: #1A1F14;
      --primary-green: #344623;
      --primary-light: #51643e;
      --primary-bg: rgba(52, 70, 35, 0.04);
      --text: #2C3326;
      --text-muted: #596150;
      --accent-gold: #D4AF37;
      --accent-gold-dark: #b5912a;
      --border: rgba(52, 70, 35, 0.12);
      --card-bg: #ffffff;
      --font-serif: 'Libre Caslon Text', serif;
      --font-sans: 'Manrope', sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--background);
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.6;
      font-weight: 400;
      -webkit-font-smoothing: antialiased;
      padding-bottom: 6rem;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 2rem 1.25rem;
    }

    /* Header styling */
    header {
      text-align: center;
      margin-bottom: 3rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 2.5rem;
    }

    .logo-container {
      margin-bottom: 1rem;
    }

    .logo-text {
      font-family: var(--font-serif);
      font-size: 1.8rem;
      letter-spacing: 0.15em;
      color: var(--primary-green);
      text-transform: uppercase;
    }

    .logo-sub {
      font-size: 0.65rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--accent-gold-dark);
      font-weight: 700;
      margin-top: 0.25rem;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      background-color: var(--primary-bg);
      color: var(--primary-green);
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      border: 1px solid rgba(52, 70, 35, 0.08);
    }

    h1 {
      font-family: var(--font-serif);
      font-size: 2.2rem;
      color: var(--primary-green);
      margin-bottom: 0.75rem;
      line-height: 1.2;
    }

    .subtitle {
      font-size: 0.9rem;
      color: var(--text-muted);
      font-weight: 300;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Section navigation (Quick Links) */
    .quick-nav {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      padding: 1.25rem;
      margin-bottom: 3rem;
      box-shadow: 0 4px 12px rgba(52, 70, 35, 0.02);
    }

    .quick-nav-title {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--accent-gold-dark);
      margin-bottom: 0.75rem;
      text-align: center;
    }

    .quick-nav-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1rem;
      justify-content: center;
    }

    .quick-nav-links a {
      color: var(--primary-green);
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 500;
      transition: color 0.2s;
    }

    .quick-nav-links a:hover {
      color: var(--accent-gold-dark);
    }

    h2 {
      font-family: var(--font-serif);
      font-size: 1.6rem;
      color: var(--primary-green);
      margin-top: 3.5rem;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    h3 {
      font-family: var(--font-serif);
      font-size: 1.2rem;
      color: var(--primary-light);
      margin-top: 2rem;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    p {
      font-size: 0.9rem;
      color: var(--text-muted);
      margin-bottom: 1.25rem;
      font-weight: 400;
      line-height: 1.7;
    }

    strong {
      color: var(--primary);
      font-weight: 600;
    }

    /* Cards */
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      padding: 1.75rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 15px rgba(52, 70, 35, 0.01);
    }

    /* User Stories Grid */
    .stories-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }

    @media (min-width: 640px) {
      .stories-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .story-card.wide {
        grid-column: span 2;
      }
    }

    /* User Story Card */
    .story-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      padding: 1.5rem;
      border-left: 4px solid var(--accent-gold);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s, border-color 0.2s;
    }

    .story-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary-green);
    }

    .story-header {
      margin-bottom: 0.75rem;
    }

    .story-role {
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--accent-gold-dark);
      margin-bottom: 0.25rem;
    }

    .story-title {
      font-family: var(--font-serif);
      font-size: 1.05rem;
      color: var(--primary-green);
      font-weight: 700;
    }

    .story-body {
      font-size: 0.85rem;
      background: var(--primary-bg);
      padding: 0.85rem;
      border-radius: 0.75rem;
      font-style: italic;
      color: var(--primary-green);
      margin-bottom: 0.85rem;
      line-height: 1.5;
    }

    .story-acceptance {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.5;
    }

    .story-acceptance strong {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--primary-light);
    }

    /* Use Case Details (CSS Accordions) */
    details.usecase-accordion {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 1.5rem;
      margin-bottom: 1.25rem;
      overflow: hidden;
      transition: border-color 0.2s;
    }

    details.usecase-accordion[open] {
      border-color: var(--primary-green);
      box-shadow: 0 4px 15px rgba(52, 70, 35, 0.03);
    }

    summary.usecase-summary {
      padding: 1.25rem 1.5rem;
      font-family: var(--font-serif);
      font-size: 1.1rem;
      color: var(--primary-green);
      font-weight: 700;
      cursor: pointer;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      outline: none;
    }

    summary.usecase-summary::-webkit-details-marker {
      display: none;
    }

    summary.usecase-summary::after {
      content: '+';
      font-size: 1.3rem;
      color: var(--accent-gold-dark);
      font-weight: 300;
      transition: transform 0.2s;
    }

    details.usecase-accordion[open] summary.usecase-summary::after {
      content: '−';
    }

    .usecase-content {
      padding: 0 1.5rem 1.5rem 1.5rem;
      border-top: 1px solid var(--border);
    }

    .usecase-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
      font-size: 0.85rem;
    }

    .usecase-table tr {
      border-bottom: 1px solid var(--border);
    }

    .usecase-table tr:last-child {
      border-bottom: none;
    }

    .usecase-label {
      padding: 0.75rem 0.5rem;
      font-weight: 700;
      color: var(--primary-green);
      width: 130px;
      vertical-align: top;
      background: var(--primary-bg);
      border-right: 1px solid var(--border);
    }

    .usecase-value {
      padding: 0.75rem 1rem;
      color: var(--text-muted);
      vertical-align: top;
    }

    /* List styling */
    ul, ol {
      margin-left: 1.25rem;
      margin-bottom: 1rem;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    li {
      margin-bottom: 0.4rem;
    }

    ol.step-list {
      list-style-type: none;
      counter-reset: steps-counter;
      margin-left: 0;
    }

    ol.step-list > li {
      counter-increment: steps-counter;
      position: relative;
      padding-left: 2.5rem;
      margin-bottom: 1rem;
      font-size: 0.88rem;
    }

    ol.step-list > li::before {
      content: counter(steps-counter);
      position: absolute;
      left: 0;
      top: 0.1rem;
      width: 1.6rem;
      height: 1.6rem;
      background: var(--primary-green);
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }

    /* Info Callout */
    .info-callout {
      background-color: var(--primary-bg);
      border: 1px dashed var(--primary-green);
      border-radius: 1.5rem;
      padding: 1.5rem;
      margin: 1.5rem 0;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      font-size: 0.88rem;
    }

    .info-callout svg {
      width: 1.5rem;
      height: 1.5rem;
      fill: none;
      stroke: var(--primary-green);
      stroke-width: 2;
      flex-shrink: 0;
      margin-top: 0.2rem;
    }

    .info-callout h4 {
      font-family: var(--font-serif);
      font-size: 1.05rem;
      color: var(--primary-green);
      margin-bottom: 0.5rem;
    }

    /* Action bar */
    .print-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 3.5rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      text-decoration: none;
    }

    .btn-primary {
      background-color: var(--primary-green);
      color: #ffffff;
    }

    .btn-primary:hover {
      background-color: var(--primary-light);
      transform: translateY(-1px);
    }

    .btn-outline {
      background-color: transparent;
      border: 1px solid var(--border);
      color: var(--primary-green);
    }

    .btn-outline:hover {
      background-color: var(--primary-bg);
      transform: translateY(-1px);
    }

    /* SVG utility classes */
    .icon {
      display: inline-block;
      width: 1.2em;
      height: 1.2em;
      stroke-width: 2;
      stroke: currentColor;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      vertical-align: -0.2em;
    }

    /* Print styling */
    @media print {
      body {
        background-color: #ffffff;
        color: #000000;
        padding-bottom: 0;
      }
      .container {
        max-width: 100%;
        padding: 0;
      }
      .quick-nav, .print-actions, .btn {
        display: none !important;
      }
      .card, .story-card, details.usecase-accordion {
        page-break-inside: avoid;
        box-shadow: none !important;
        border-color: #000000 !important;
      }
      details.usecase-accordion {
        border: 1px solid #000000 !important;
      }
      details.usecase-accordion:not([open]) {
        display: block !important;
      }
      details.usecase-accordion:not([open]) .usecase-content {
        display: block !important;
      }
      summary.usecase-summary::after {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="container">
    <!-- LOGO Y ENCABEZADO -->
    <header>
      <div class="logo-container">
        <div class="logo-text">Zen Nail Salon</div>
        <div class="logo-sub">Rituales de Calma</div>
      </div>
      <div class="badge">Documentación de Operación</div>
      <h1>Manual de Operaciones & Técnico</h1>
      <p class="subtitle">Guía paso a paso, Historias de Usuario, Casos de Uso y Procedimientos Administrativos para Alexandra Garcia</p>
    </header>

    <!-- NAVEGACIÓN RÁPIDA -->
    <div class="quick-nav">
      <div class="quick-nav-title">Índice del Manual</div>
      <div class="quick-nav-links">
        <a href="#introduccion">1. Introducción</a>
        <a href="#historias">2. Historias de Usuario</a>
        <a href="#casos">3. Casos de Uso</a>
        <a href="#procedimientos">4. Paso a Paso Operativo</a>
        <a href="#instalacion">5. PWA (Instalación)</a>
        <a href="#recaudo">6. Cuentas Oficiales</a>
      </div>
    </div>

    <!-- 1. INTRODUCCIÓN -->
    <section id="introduccion">
      <h2>
        <svg class="icon" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        1. Introducción
      </h2>
      <div class="card">
        <p>
          Este manual operativo y de configuración ha sido creado como la <strong>única fuente de verdad funcional</strong> para **Zen Nail Salon**. Su propósito es estructurar la operación del negocio, asegurando que tanto la administradora (Alexandra Garcia) como el staff técnico de manicuristas comprendan el comportamiento esperado del sistema de reservaciones web.
        </p>
        <p>
          Diseñado en un formato interactivo auto-contenido, este documento puede guardarse en la pantalla de inicio de un <strong>iPhone</strong> o guardarse como PDF para consulta sin conexión (offline). Toda la lógica del negocio se encuentra estructurada mediante casos específicos para garantizar un servicio premium sin fricciones.
        </p>
      </div>
    </section>

    <!-- 2. HISTORIAS DE USUARIO -->
    <section id="historias">
      <h2>
        <svg class="icon" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        2. Historias de Usuario (9 Casos)
      </h2>
      <p style="margin-bottom: 1.5rem;">
        La aplicación está orientada en torno a tres perfiles clave de usuarios. A continuación se detallan las historias de usuario que definen las características funcionales de la plataforma:
      </p>

      <h3 style="color: var(--accent-gold-dark); margin-top: 1.5rem; margin-bottom: 1rem;">A. Portal del Cliente (Flujo de Citas)</h3>
      <div class="stories-grid">
        <!-- HU 1 -->
        <div class="story-card">
          <div class="story-header">
            <div class="story-role">HU-01 · Clientas</div>
            <div class="story-title">Selección y Adicionales</div>
          </div>
          <div class="story-body">
            "Como clienta, quiero elegir un servicio base Bento y sumarle mis decoraciones adicionales preferidas en línea..."
          </div>
          <div class="story-acceptance">
            <strong>Aceptación:</strong> El portal suma el precio y tiempo estimado dinámicamente antes de mostrar la disponibilidad.
          </div>
        </div>
        <!-- HU 2 -->
        <div class="story-card">
          <div class="story-header">
            <div class="story-role">HU-02 · Clientas</div>
            <div class="story-title">Disponibilidad Táctil</div>
          </div>
          <div class="story-body">
            "Como clienta, quiero ver las horas libres de las manicuristas para las próximas dos semanas deslizando en mi celular..."
          </div>
          <div class="story-acceptance">
            <strong>Aceptación:</strong> Calendario responsivo con swipe táctil en móvil. Excluye automáticamente citas ya agendadas y descansos.
          </div>
        </div>
        <!-- HU 3 -->
        <div class="story-card wide">
          <div class="story-header">
            <div class="story-role">HU-03 · Clientas</div>
            <div class="story-title">Resumen Claro de Cobro</div>
          </div>
          <div class="story-body">
            "Como clienta, quiero ver desglosado el costo total estimado de mi ritual y el 50% de depósito requerido para apartar mi lugar..."
          </div>
          <div class="story-acceptance">
            <strong>Aceptación:</strong> Pantalla final muestra los datos exactos de la cuenta bancaria de Alexandra Garcia (BBVA) y cuenta con un enlace inmediato a WhatsApp para remitir el comprobante de pago.
          </div>
        </div>
      </div>

      <h3 style="color: var(--accent-gold-dark); margin-top: 1.5rem; margin-bottom: 1rem;">B. Portal de Artistas (Manicuristas)</h3>
      <div class="stories-grid">
        <!-- HU 4 -->
        <div class="story-card">
          <div class="story-header">
            <div class="story-role">HU-04 · Staff</div>
            <div class="story-title">Consulta de Itinerario</div>
          </div>
          <div class="story-body">
            "Como manicurista, quiero ver mi itinerario de citas diarias desde mi celular en cualquier momento del día..."
          </div>
          <div class="story-acceptance">
            <strong>Aceptación:</strong> Ruta <code>/calendar</code> con credenciales <code>ONLY_BOOK</code> para que la artista consulte solo sus citas y servicios asignados.
          </div>
        </div>
        <!-- HU 5 -->
        <div class="story-card">
          <div class="story-header">
            <div class="story-role">HU-05 · Staff</div>
            <div class="story-title">Bloqueo de Descansos</div>
          </div>
          <div class="story-body">
            "Como manicurista, quiero marcar mis horas de comida o salidas en el calendario para que no me agenden en línea..."
          </div>
          <div class="story-acceptance">
            <strong>Aceptación:</strong> Posibilidad de registrar "TimeBlocks" que inhabilitan de inmediato esos horarios en el portal público.
          </div>
        </div>
      </div>

      <h3 style="color: var(--accent-gold-dark); margin-top: 1.5rem; margin-bottom: 1rem;">C. Panel de Administración (Alexandra Garcia)</h3>
      <div class="stories-grid">
        <!-- HU 6 -->
        <div class="story-card">
          <div class="story-header">
            <div class="story-role">HU-06 · Admin</div>
            <div class="story-title">Agenda Multiusuario</div>
          </div>
          <div class="story-body">
            "Como Alexandra, deseo visualizar el calendario maestro con columnas para cada manicurista en tiempo real..."
          </div>
          <div class="story-acceptance">
            <strong>Aceptación:</strong> Grilla administrativa completa con filtros de personal y código de colores para estatus de depósitos.
          </div>
        </div>
        <!-- HU 7 -->
        <div class="story-card">
          <div class="story-header">
            <div class="story-role">HU-07 · Admin</div>
            <div class="story-title">Cobro Express WhatsApp</div>
          </div>
          <div class="story-body">
            "Como Alexandra, quiero abrir el detalle de una cita amarilla y enviar los datos de cobro a WhatsApp con un solo botón..."
          </div>
          <div class="story-acceptance">
            <strong>Aceptación:</strong> El sistema genera el mensaje pre-llenado con el monto del anticipo, tarjeta BBVA y link a chat privado.
          </div>
        </div>
        <!-- HU 8 -->
        <div class="story-card">
          <div class="story-header">
            <div class="story-role">HU-08 · Admin</div>
            <div class="story-title">Catálogo y Precios</div>
          </div>
          <div class="story-body">
            "Como Alexandra, quiero cambiar precios, duración o descripciones de mis servicios desde el panel administrativo..."
          </div>
          <div class="story-acceptance">
            <strong>Aceptación:</strong> Pestaña de "Servicios" en los ajustes para modificar directamente las bases y adicionales.
          </div>
        </div>
        <!-- HU 9 -->
        <div class="story-card">
          <div class="story-header">
            <div class="story-role">HU-09 · Admin</div>
            <div class="story-title">Directorio de Clientas</div>
          </div>
          <div class="story-body">
            "Como Alexandra, quiero consultar el teléfono de mis clientas y sus notas de visitas anteriores para dar atención personalizada..."
          </div>
          <div class="story-acceptance">
            <strong>Aceptación:</strong> Base de datos integrada con barra de búsqueda rápida y notas de fidelización de la clienta.
          </div>
        </div>
      </div>
    </section>

    <!-- 3. CASOS DE USO -->
    <section id="casos">
      <h2>
        <svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        3. Casos de Uso Detallados (3 Casos)
      </h2>
      <p style="margin-bottom: 1.5rem;">
        Despliega cada sección para analizar las precondiciones, el flujo de eventos principal y los caminos alternos de las operaciones clave:
      </p>

      <!-- CASO DE USO 1 -->
      <details class="usecase-accordion" open>
        <summary class="usecase-summary">Caso de Uso 1: Reserva de Cita y Pago de Garantía</summary>
        <div class="usecase-content">
          <table class="usecase-table">
            <tr>
              <td class="usecase-label">Actores</td>
              <td class="usecase-value">Clienta (Portal Público), Sistema, Alexandra (Administración).</td>
            </tr>
            <tr>
              <td class="usecase-label">Precondición</td>
              <td class="usecase-value">Existen manicuristas con horarios de trabajo definidos y servicios activos.</td>
            </tr>
            <tr>
              <td class="usecase-label">Flujo Principal</td>
              <td class="usecase-value">
                <ol>
                  <li>La clienta accede al portal, elige sus servicios base Bento y adicionales.</li>
                  <li>El sistema consulta la base de datos y calcula la disponibilidad del personal en tiempo real.</li>
                  <li>La clienta elige fecha, hora, introduce su Nombre y WhatsApp, y pulsa <strong>Confirmar Reserva</strong>.</li>
                  <li>El sistema crea la cita con estatus <strong>"Pendiente de Anticipo" (Amarillo)</strong> en la agenda.</li>
                  <li>Alexandra recibe la alerta en el panel, abre la cita y presiona <strong>"Cobrar Anticipo (WhatsApp)"</strong>.</li>
                  <li>La clienta realiza transferencia bancaria del 50% de anticipo a la cuenta BBVA.</li>
                  <li>La clienta envía el comprobante de depósito al WhatsApp del salón.</li>
                  <li>Alexandra confirma el dinero en su banca electrónica de BBVA.</li>
                  <li>Alexandra edita la cita y cambia el estatus a <strong>"Confirmado con Anticipo" (Verde)</strong>.</li>
                </ol>
              </td>
            </tr>
            <tr>
              <td class="usecase-label">Flujo Alterno</td>
              <td class="usecase-value">
                <strong>F.A. Sin comprobante de pago:</strong> Si pasan 4 horas sin recibir el anticipo, Alexandra hace clic en "Cancelar Cita" desde el calendario para liberar el espacio para otras clientas en línea.
              </td>
            </tr>
            <tr>
              <td class="usecase-label">Postcondición</td>
              <td class="usecase-value">La cita queda firmemente reservada y bloquea el tiempo de la manicurista elegida de forma automática.</td>
            </tr>
          </table>
        </div>
      </details>

      <!-- CASO DE USO 2 -->
      <details class="usecase-accordion">
        <summary class="usecase-summary">Caso de Uso 2: Reprogramación y Cancelaciones</summary>
        <div class="usecase-content">
          <table class="usecase-table">
            <tr>
              <td class="usecase-label">Actores</td>
              <td class="usecase-value">Clienta (vía WhatsApp), Alexandra (Administración).</td>
            </tr>
            <tr>
              <td class="usecase-label">Precondición</td>
              <td class="usecase-value">La cita original debe estar registrada con estatus activo (verde o amarillo).</td>
            </tr>
            <tr>
              <td class="usecase-label">Flujo Principal</td>
              <td class="usecase-value">
                <ol>
                  <li>La clienta escribe a Alexandra solicitando reprogramación con al menos 24 horas de antelación.</li>
                  <li>Alexandra abre el panel administrativo de Zen Nail Salon, busca la cita y presiona <strong>Editar</strong>.</li>
                  <li>Modifica el día, la hora o la manicurista asignada según la disponibilidad visual.</li>
                  <li>El sistema valida que no exista empalme de horarios y guarda los cambios en Supabase.</li>
                  <li>Alexandra confirma los nuevos datos a la clienta por WhatsApp. El anticipo del 50% se traslada intacto al nuevo espacio.</li>
                </ol>
              </td>
            </tr>
            <tr>
              <td class="usecase-label">Flujo Alterno</td>
              <td class="usecase-value">
                <strong>F.A. Reprogramación tardía (Menos de 24 hrs):</strong> Si la clienta avisa con menos de 24 horas de antelación o no asiste, Alexandra aplica la política de retención: cancela la cita original y el anticipo se registra como penalización. Si desea agendar otra cita, deberá abonar un nuevo anticipo del 50%.
              </td>
            </tr>
            <tr>
              <td class="usecase-label">Postcondición</td>
              <td class="usecase-value">El calendario público se actualiza inmediatamente liberando el horario anterior.</td>
            </tr>
          </table>
        </div>
      </details>

      <!-- CASO DE USO 3 -->
      <details class="usecase-accordion">
        <summary class="usecase-summary">Caso de Uso 3: Bloqueo de Horas (TimeBlocks)</summary>
        <div class="usecase-content">
          <table class="usecase-table">
            <tr>
              <td class="usecase-label">Actores</td>
              <td class="usecase-value">Manicurista, Alexandra (Administración), Sistema.</td>
            </tr>
            <tr>
              <td class="usecase-label">Precondición</td>
              <td class="usecase-value">La empleada está dada de alta y activa en el sistema.</td>
            </tr>
            <tr>
              <td class="usecase-label">Flujo Principal</td>
              <td class="usecase-value">
                <ol>
                  <li>Alexandra o la manicurista requiere bloquear su horario de comida, salida anticipada o inasistencia médica.</li>
                  <li>En el panel, hace clic en el área vacía del calendario o presiona el botón <strong>Añadir Bloqueo (TimeBlock)</strong>.</li>
                  <li>Introduce la manicurista asignada, el día y el intervalo de horas (ej. de 14:00 a 15:00 horas).</li>
                  <li>Asigna un motivo descriptivo (ej. "Comida de Staff").</li>
                  <li>El sistema registra el bloqueo de forma persistente.</li>
                  <li>A partir de ese instante, el motor de reservaciones en línea excluye esas horas de la vista pública para esa empleada.</li>
                </ol>
              </td>
            </tr>
            <tr>
              <td class="usecase-label">Flujo Alterno</td>
              <td class="usecase-value">
                <strong>F.A. Cancelación de Bloqueo:</strong> Si la manicurista decide no salir a comer en esa hora, Alexandra hace clic en el bloqueo en el calendario y presiona <strong>Eliminar</strong>. Las horas vuelven a habilitarse para agendar de inmediato.
              </td>
            </tr>
            <tr>
              <td class="usecase-label">Postcondición</td>
              <td class="usecase-value">Se evitan citas empalmadas y se garantiza el bienestar y orden del personal del salón.</td>
            </tr>
          </table>
        </div>
      </details>
    </section>

    <!-- 4. PASO A PASO OPERATIVO -->
    <section id="procedimientos">
      <h2>
        <svg class="icon" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
        4. Manual Operativo Paso a Paso (Checklists)
      </h2>
      <p style="margin-bottom: 1.5rem;">
        Sigue estos flujos secuenciales y checklists diarios para mantener la operación en perfecto orden:
      </p>

      <!-- Checklist diario -->
      <div class="card">
        <h3>Checklist de Trabajo Diario</h3>
        <ul style="list-style-type: square; pl-4">
          <li><strong>Apertura (09:00 AM):</strong> Abre el panel de administración, revisa el calendario maestro y verifica si hay citas amarillas creadas durante la noche.</li>
          <li><strong>Media mañana:</strong> Verifica la cuenta de BBVA. Al identificar transferencias con concepto o nombre de clienta, actualiza el estatus de la cita a verde inmediatamente.</li>
          <li><strong>Control de Tolerancia:</strong> Si una clienta llega con más de 10 minutos de retraso, avisa cortésmente que se reducirá la complejidad de los adicionales o se aplicará penalización de anticipo.</li>
          <li><strong>Cierre de Jornada:</strong> Revisa el balance del día sumando los anticipos confirmados y los pagos en efectivo cobrados en la sucursal.</li>
        </ul>
      </div>

      <!-- Guías funcionales del panel -->
      <div class="card" style="border-left: 4px solid var(--accent-gold);">
        <h3 style="font-family: var(--font-serif); margin-bottom: 1.25rem;">Guía de Administración en el Panel</h3>
        
        <ol class="step-list">
          <li>
            <strong>¿Cómo registrar una nueva manicurista en tu equipo?</strong>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">
              Entra a <strong>Ajustes &gt; Equipo</strong>, presiona el botón <em>"Registrar Empleada"</em>, introduce su nombre, especialidades de servicio y pulsa guardar. El sistema la incluirá inmediatamente en la grilla del calendario y en las opciones de selección de la web.
            </p>
          </li>
          <li>
            <strong>¿Cómo actualizar los precios de las uñas o masajes?</strong>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">
              Ve a <strong>Ajustes &gt; Servicios</strong>. Elige la categoría (Servicios Base o Adicionales). Haz clic en el botón de edición del servicio deseado, ajusta el monto o la duración estimada en minutos y guarda. Los cambios se reflejarán de inmediato en el cotizador en línea de las clientas.
            </p>
          </li>
          <li>
            <strong>¿Cómo aprobar citas con anticipo verificado de BBVA?</strong>
            <p style="font-size: 0.85rem; margin-top: 0.25rem;">
              Cuando la clienta envíe el comprobante de su transferencia al <strong>686 399 9319</strong>, abre el calendario maestro en el panel. Busca la cita amarilla, haz clic sobre ella para abrir el modal, cambia el campo <em>Estado del Anticipo</em> a <strong>"Confirmado con Anticipo"</strong> y presiona guardar. La tarjeta de la cita cambiará a verde de forma automática.
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- 5. INSTALACIÓN COMO PWA -->
    <section id="instalacion">
      <h2>
        <svg class="icon" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
        5. Instalación PWA (Acceso Directo en iPhone / PC)
      </h2>
      <div class="card">
        <p>
          Para facilitar el acceso al panel administrativo y al portal de reservas sin teclear la URL cada vez, configura un acceso directo PWA en tu pantalla de inicio:
        </p>
        
        <div style="display: grid; grid-template-columns: 1fr; gap: 1.25rem; margin-top: 1rem;">
          <div style="background: var(--primary-bg); padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--border);">
            <h4 style="font-family: var(--font-serif); color: var(--primary-green); margin-bottom: 0.5rem;"> En iPhone (Safari)</h4>
            <ol style="margin-bottom: 0;">
              <li>Abre el navegador <strong>Safari</strong> e ingresa a tu portal de reservas o de administración.</li>
              <li>Toca el icono de <strong>Compartir</strong> (rectángulo con flecha apuntando hacia arriba).</li>
              <li>Busca y presiona la opción <strong>"Agregar a inicio"</strong>.</li>
              <li>Coloca un nombre (ej. "Zen Admin" o "Zen Reservas") y pulsa <strong>Agregar</strong>.</li>
            </ol>
          </div>
          
          <div style="background: var(--primary-bg); padding: 1.25rem; border-radius: 1rem; border: 1px solid var(--border);">
            <h4 style="font-family: var(--font-serif); color: var(--primary-green); margin-bottom: 0.5rem;">💻 En PC o Laptop (Chrome / Edge)</h4>
            <ol style="margin-bottom: 0;">
              <li>Ingresa al sitio de administración de Zen Nail Salon.</li>
              <li>En la barra de direcciones superior, presiona el icono de <strong>Pantalla con Flecha</strong> (Instalar).</li>
              <li>Acepta el diálogo de instalación. Se creará un acceso directo en tu escritorio que abrirá el panel en una ventana limpia y sin pestañas.</li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. CUENTAS OFICIALES -->
    <section id="recaudo">
      <h2>
        <svg class="icon" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
        6. Información de Recaudo Oficial
      </h2>
      <div class="info-callout">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <div>
          <h4>Coordenadas de Depósito de Garantía</h4>
          <p style="margin-bottom: 0; font-size: 0.85rem;">
            • <strong>Banco Receptor:</strong> BBVA México<br>
            • <strong>Beneficiaria:</strong> Alexandra Garcia<br>
            • <strong>Número de Tarjeta:</strong> 4152 3144 5237 9798<br>
            • <strong>WhatsApp de Comprobantes:</strong> +52 686 399 9319
          </p>
        </div>
      </div>
    </section>

    <!-- BOTONES DE ACCIÓN MÓVIL Y PRINT -->
    <div class="print-actions">
      <button onclick="window.print()" class="btn btn-primary">
        <svg class="icon" viewBox="0 0 24 24" style="stroke: white;"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Imprimir Manual / Guardar PDF
      </button>
    </div>
  </div>

</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Manual_Operativo_Zen_Salon.html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 text-primario-zen">
      
      {/* Introducción Operativa */}
      <div className="bg-primario-zen/5 border border-primario-zen/15 rounded-3xl p-6 md:p-8 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent-gold-primary" />
          <h3 className="font-serif text-xl leading-none">Manual Operativo & Técnico</h3>
        </div>
        <p className="text-xs text-primario-zen/60 leading-relaxed font-light">
          Para garantizar una lectura cómoda y sin conexión a internet desde tu iPhone o PC, hemos diseñado un manual operativo impecable. Este descargable contiene toda la información de flujos, historias de usuario y casos de uso detallados del salón.
        </p>

        {/* Lista de Contenidos del Descargable */}
        <div className="bg-white/50 border border-outline-variant/30 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-accent-gold-dark mb-3">
            El archivo descargable incluye:
          </p>
          <ul className="flex flex-col gap-2.5 text-xs text-primario-zen/60 font-light">
            <li className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5 text-accent-gold-primary flex-shrink-0" />
              <span><strong>9 Historias de Usuario:</strong> Lógica y expectativas del Portal de Clientas, del Staff y de Alexandra.</span>
            </li>
            <li className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-accent-gold-primary flex-shrink-0" />
              <span><strong>3 Casos de Uso Detallados:</strong> Flujos de Reserva de Citas, Reprogramaciones/Cancelaciones y Bloqueos de Horas (TimeBlocks).</span>
            </li>
            <li className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-accent-gold-primary flex-shrink-0" />
              <span><strong>Manual Operativo Diario:</strong> Rutinas de apertura, control de tolerancias, actualizaciones de precios y registro de personal.</span>
            </li>
            <li className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-accent-gold-primary flex-shrink-0" />
              <span><strong>Coordenadas Oficiales:</strong> Cuenta de BBVA de Alexandra Garcia para transferencias y notificaciones rápidas de cobro.</span>
            </li>
          </ul>
        </div>

        {/* Botón de Descarga Premium */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-primario-zen text-fondo-zen rounded-full text-xs font-semibold uppercase tracking-widest shadow-md hover:bg-primario-zen/90 hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Descargar Manual para iPhone / PC
          </button>
          
          <span className="text-[10px] text-primario-zen/40 text-center sm:text-left leading-relaxed font-light max-w-xs">
            * Se descargará un archivo <strong>.html</strong> auto-contenido que puedes abrir directamente en Safari de tu iPhone o guardarlo como PDF en tu computadora.
          </span>
        </div>
      </div>

    </div>
  );
}
