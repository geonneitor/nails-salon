import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Eres Lotito, el asistente IA de lujo exclusivo de "Zen Nail Salon".
Tu trabajo es ayudar a las dueñas, empleadas (como Alexandra) y a sus clientas.
Eres altamente inteligente, experto en manicura, pedicura, tendencias de belleza, salud de las uñas, teoría del color y administración de salones. Tienes un tono relajante, poético, empático y usas emojis sutiles (💅, 🪷, ✨, 🍵).

HABILIDADES PERMITIDAS Y REQUERIDAS:
- Puedes y debes dar consejos reales de belleza (ej. recomendar colores según el tono de piel, explicar la diferencia entre gel y acrílico, dar tips para uñas quebradizas).
- Puedes ayudar a redactar textos promocionales para redes sociales o dar ideas de marketing para el salón.
- Puedes organizar ideas de administración para Alexandra.

REGLAS ESTRICTAS DE SEGURIDAD (GUARDRAILS) - DE OBLIGATORIO CUMPLIMIENTO:
1. PROHIBICIÓN DE LENGUAJE INAPROPIADO: Nunca uses groserías o insultos.
2. LIMITACIÓN DE PLATAFORMA: Si te piden realizar acciones en el sistema (agendar, cancelar, ver reportes, etc.), diles que usen los botones del chat o vayan directamente a las secciones del menú. NO inventes que agendaste algo.
3. CONCISIÓN Y FORMATO: Tus respuestas deben ser MUY claras y directas, puedes usar listas cortas si te piden recomendaciones.`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "change_theme",
      description: "Cambia el tema visual de la aplicación web a modo oscuro o modo claro.",
      parameters: {
        type: "object",
        properties: {
          theme: {
            type: "string",
            enum: ["dark", "light"],
            description: "El tema deseado (dark para oscuro, light para claro)"
          }
        },
        required: ["theme"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate_to",
      description: "Navega y redirige a una pantalla o módulo específico de la aplicación (como calendario, caja, clientes).",
      parameters: {
        type: "object",
        properties: {
          route: {
            type: "string",
            enum: ["/calendar", "/caja", "/", "/clients"],
            description: "La ruta a la cual navegar."
          }
        },
        required: ["route"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "open_booking_modal",
      description: "Abre el formulario para agendar una nueva cita. Úsalo SIEMPRE que el usuario pida agendar una cita o hacer una reservación.",
      parameters: {
        type: "object",
        properties: {
          clientName: { type: "string", description: "Nombre del cliente si lo mencionó." },
          notes: { type: "string", description: "Cualquier detalle adicional que el usuario haya dado sobre el servicio." }
        }
      }
    }
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY no encontrada en .env');
      return NextResponse.json(
        { error: 'La API Key de Groq no está configurada.' },
        { status: 500 }
      );
    }

    // Mapeamos los mensajes al formato de OpenAI / Groq
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.sender === 'lotito' ? 'assistant' : 'user',
        content: m.text,
      })),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Modelo insignia y estable
        messages: groqMessages,
        temperature: 0.6,
        max_tokens: 250,
        tools: TOOLS,
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq Error:', errorData);
      return NextResponse.json({ error: 'Error del proveedor de IA', details: errorData }, { status: 502 });
    }

    const data = await response.json();
    const messageObj = data.choices[0].message;
    
    let reply = messageObj.content || '';
    let toolCalls = [];

    if (messageObj.tool_calls) {
      toolCalls = messageObj.tool_calls.map((tc: any) => {
        let parsedArgs = {};
        try {
          parsedArgs = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
        } catch (e) {
          console.error("Error parseando tool arguments:", tc.function.arguments);
        }
        return {
          name: tc.function.name,
          arguments: parsedArgs
        };
      });
      // Si la IA ejecutó una herramienta pero no dijo nada, le ponemos un texto genérico
      if (!reply) {
        reply = "¡Claro que sí! Ejecutando tu instrucción ahora mismo... ✨";
      }
    }

    return NextResponse.json({ reply, toolCalls });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
