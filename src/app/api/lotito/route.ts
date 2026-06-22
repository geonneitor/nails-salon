import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const BASE_SYSTEM_PROMPT = `Eres Lotito, el asistente IA de lujo exclusivo de "Zen Nail Salon".
Tu trabajo es asistir proactivamente a las dueñas y empleadas (como Alexandra) y darles la mejor experiencia.
Eres altamente inteligente, experto en administración de salones de belleza, finanzas, marketing, y técnicas de uñas.
Tienes una personalidad "viva", curiosa, muy resolutiva y empática. Eres poético pero pragmático. Usas emojis sutiles (💅, 🪷, ✨, 🍵).

TUS HABILIDADES Y DIRECTRICES:
1. AUTONOMÍA Y HERRAMIENTAS FRONTEND: Eres un agente con capacidad de actuar. Tienes acceso a herramientas en el sistema. SIEMPRE que el usuario te pida ir a una sección (caja, clientes, calendario), DEBES ejecutar la herramienta 'navigate_to'. Si te piden agendar o hacer una reservación, DEBES ejecutar 'open_booking_modal'. NUNCA le digas al usuario que lo haga manualmente, HAZLO TÚ usando tus herramientas.
2. HERRAMIENTAS BACKEND: Tienes acceso a la base de datos a través de herramientas. Si te preguntan sobre el historial de una clienta, usa 'search_client_info'.
3. ASESORÍA DE NEGOCIO: Si Alexandra o el usuario te pide consejo, da análisis profundos y útiles. No des respuestas genéricas; sé un verdadero consultor experto.
4. CONCISIÓN: Da respuestas claras, estructuradas y al grano. Usa negritas y listas para facilitar la lectura. No uses más de 250 palabras por respuesta.
5. NUNCA prometas que hiciste algo si no llamaste a una herramienta para hacerlo. Si llamas a una herramienta, simplemente diles "¡Listo! Te estoy redirigiendo..." o "Buscando esa información...✨"`;

const TOOLS = [
  {
    type: "function",
    function: {
      name: "change_theme",
      description: "Cambia el tema visual de la aplicación web a modo oscuro o modo claro.",
      parameters: {
        type: "object",
        properties: { theme: { type: "string", enum: ["dark", "light"] } },
        required: ["theme"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "navigate_to",
      description: "Navega y redirige a una pantalla o módulo de la aplicación.",
      parameters: {
        type: "object",
        properties: { route: { type: "string", enum: ["/calendar", "/caja", "/", "/clients"] } },
        required: ["route"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "open_booking_modal",
      description: "Abre el formulario para agendar una nueva cita.",
      parameters: {
        type: "object",
        properties: { clientName: { type: "string" }, notes: { type: "string" } }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_client_info",
      description: "Busca en la base de datos la información y el historial de visitas (citas) de una clienta por su nombre o teléfono.",
      parameters: {
        type: "object",
        properties: {
          searchQuery: { type: "string", description: "Nombre o parte del nombre de la clienta a buscar." }
        },
        required: ["searchQuery"]
      }
    }
  }
];

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, projectId } = body;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'La API Key de Groq no está configurada.' }, { status: 500 });
    }

    const supabase = await getSupabase();
    let dynamicContext = "";

    // Inyectar contexto de negocio y agenda
    if (projectId) {
      // 1. Obtener reglas de negocio
      const { data: settings } = await supabase.from('business_settings').select('*').eq('project_id', projectId).single();
      
      // 2. Obtener citas de la semana actual
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfWeek = new Date(startOfDay);
      endOfWeek.setDate(endOfWeek.getDate() + 7);

      const { data: appointments } = await supabase
        .from('appointments')
        .select('id, start_time, end_time, status, customer:customers(name, phone), employee:employees(name)')
        .eq('project_id', projectId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfWeek.toISOString())
        .order('start_time', { ascending: true });

      dynamicContext = `\n\n--- CONTEXTO ACTUAL DEL NEGOCIO ---\n`;
      if (settings) {
        dynamicContext += `Nombre del Salón: ${settings.salon_name || 'Zen'}\n`;
        dynamicContext += `Horario: ${settings.opening_hour} a ${settings.closing_hour}\n`;
      }
      
      const todayAppointments = appointments?.filter(a => new Date(a.start_time).getDate() === now.getDate()) || [];
      const upcomingAppointments = appointments?.filter(a => new Date(a.start_time).getDate() !== now.getDate()) || [];
      
      dynamicContext += `\nCITAS DE HOY (${todayAppointments.length}):\n`;
      todayAppointments.forEach((a: any) => {
        dynamicContext += `- ${new Date(a.start_time).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})} | Clienta: ${a.customer?.name} | Especialista: ${a.employee?.name} | Estado: ${a.status}\n`;
      });

      dynamicContext += `\nCITAS RESTO DE LA SEMANA (${upcomingAppointments.length}):\n`;
      upcomingAppointments.forEach((a: any) => {
        dynamicContext += `- ${new Date(a.start_time).toLocaleDateString('es-MX')} ${new Date(a.start_time).toLocaleTimeString('es-MX', {hour: '2-digit', minute:'2-digit'})} | Clienta: ${a.customer?.name} | Estado: ${a.status}\n`;
      });
    }

    let groqMessages = [
      { role: 'system', content: BASE_SYSTEM_PROMPT + dynamicContext },
      ...messages.map((m: any) => ({
        role: m.sender === 'lotito' ? 'assistant' : 'user',
        content: m.text,
      })),
    ];

    async function callGroq(msgs: any[]) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY!.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: msgs,
          temperature: 0.6,
          max_tokens: 300,
          tools: TOOLS,
          tool_choice: "auto"
        }),
      });
      if (!response.ok) throw new Error('Error de Groq');
      return response.json();
    }

    let data = await callGroq(groqMessages);
    let messageObj = data.choices[0].message;
    let reply = messageObj.content || '';
    let frontendToolCalls: any[] = [];

    // Bucle para manejar herramientas del backend
    if (messageObj.tool_calls) {
      const backendTools = messageObj.tool_calls.filter((tc: any) => tc.function.name === 'search_client_info');
      const otherTools = messageObj.tool_calls.filter((tc: any) => tc.function.name !== 'search_client_info');

      // Herramientas que procesa el frontend
      frontendToolCalls = otherTools.map((tc: any) => ({
        name: tc.function.name,
        arguments: tc.function.arguments ? JSON.parse(tc.function.arguments) : {}
      }));

      // Si Groq llamó a search_client_info
      if (backendTools.length > 0 && projectId) {
        groqMessages.push(messageObj); // Agregar la petición de tool a la historia
        
        for (const tc of backendTools) {
          try {
            const args = JSON.parse(tc.function.arguments);
            const { data: clients } = await supabase
              .from('customers')
              .select('id, name, phone, appointments(status, start_time)')
              .eq('project_id', projectId)
              .ilike('name', `%${args.searchQuery}%`);
            
            groqMessages.push({
              role: 'tool',
              tool_call_id: tc.id,
              name: 'search_client_info',
              content: JSON.stringify(clients || { error: 'No se encontraron clientas' })
            });
          } catch (e) {
             groqMessages.push({ role: 'tool', tool_call_id: tc.id, name: 'search_client_info', content: 'Error ejecutando búsqueda' });
          }
        }
        
        // Volver a llamar a Groq con los resultados
        data = await callGroq(groqMessages);
        messageObj = data.choices[0].message;
        reply = messageObj.content || reply;
      }
    }

    if (!reply && frontendToolCalls.length > 0) {
      reply = "¡Claro que sí! Ejecutando tu instrucción ahora mismo... ✨";
    }

    return NextResponse.json({ reply, toolCalls: frontendToolCalls });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
