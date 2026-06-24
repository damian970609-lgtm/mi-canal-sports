"use strict";

// Bloqueo estricto del clic derecho para evitar copias del código fuente
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

// Configuración global del ecosistema Damian Fútbol
const miWhatsApp = "+5927214741"; 
const BOT_TOKEN = "8652269504:AAHym7kWVD4sc06pDXLu8-oSzI_9ZOuYVkY"; 
const CHAT_ID = "-1003896740516"; 
const BIN_ID = "6a3b58e2f5f4af5e2926dce9"; 
const MASTER_KEY = "$2a$10$KZ0aonIRfrJKnpUt..qFheU8V1.KQkqRcd9BDbQbrFivmA4hsNBCS";
const APP_API_KEY = "e60cefc007830775fd903cfa62c38818";

// Arrays de datos dinámicos locales
let partidosLocales = [];
let noticiasLocales = [];
let listaIpsAutorizadas = [];
let historialChat = [];

// Estado inicial del ruteo interno
let categoriaActual = "Todos";
let seccionActual = "live";
let clicksTituloAdmin = 0;
let userIpAddress = "0.0.0.0";
let esIpConfirmada = false;

// Inicialización de la seguridad de dirección IP para el chat seguro
async function inicializarControlIP() {
    const ipDisplay = document.getElementById("chat-ip-display");
    const statusBadge = document.getElementById("chat-status-badge");
    const msgInput = document.getElementById("chat-mensaje-txt");
    const sendBtn = document.getElementById("chat-send-btn");

    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        userIpAddress = data.ip;
        
        if (ipDisplay) {
            ipDisplay.innerText = `🌐 Tu IP: ${userIpAddress}`;
        }

        // Validación de privilegios
        if (listaIpsAutorizadas.includes(userIpAddress) || localStorage.getItem("esCreador") === "true") {
            esIpConfirmada = true;
            if (statusBadge) { 
                statusBadge.innerText = "⭐ IP CONFIRMADA"; 
                statusBadge.style.background = "#10b981"; 
            }
            if (msgInput) { 
                msgInput.removeAttribute("disabled"); 
                msgInput.placeholder = "Escribe un mensaje para el chat..."; 
            }
            if (sendBtn) {
                sendBtn.removeAttribute("disabled");
            }
        } else {
            esIpConfirmada = false;
            if (statusBadge) { 
                statusBadge.innerText = "❌ NO AUTORIZADO"; 
                statusBadge.style.background = "#ef4444"; 
            }
            if (msgInput) { 
                msgInput.setAttribute("disabled", "true"); 
                msgInput.placeholder = "Bloqueado por Damian."; 
            }
            if (sendBtn) {
                sendBtn.setAttribute("disabled", "true");
            }
        }
    } catch (error) {
        if (ipDisplay) {
            ipDisplay.innerText = "🌐 IP: Error de enlace local";
        }
    }
}

// Contador secreto de pulsaciones para activar el panel (Modo Creador)
function toqueSecreto() {
    clicksTituloAdmin++;
    if (clicksTituloAdmin >= 5) {
        document.getElementById("btn-admin-auto").style.display = "block";
        clicksTituloAdmin = 0;
    }
}

// Elevación de privilegios para persistencia local de desarrollador
function activarModoCreador() {
    localStorage.setItem("esCreador", "true");
    document.getElementById("panel-admin").style.display = "block";
    document.getElementById("btn-admin-auto").style.display = "none";
    inicializarControlIP();
    alert("⚙️ Acceso de administrador revelado con éxito.");
}

// Validación rápida para mantener el panel activo si se recarga la app
function verificarDispositivo() { 
    if (localStorage.getItem("esCreador") === "true" || window.location.search.includes("admin=true")) {
        document.getElementById("panel-admin").style.display = "block";
    }
}

// Sincronización y descarga en tiempo real desde la nube de JSONBin
async function descargarServidorCloud() {
    try {
        const respuesta = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 
                "X-Master-Key": MASTER_KEY, 
                "meta": "false" 
            }
        });
        const dataCloud = await respuesta.json();
        
        const rawPartidos = dataCloud.partidos || [];
        partidosLocales = rawPartidos.map(function(p) {
            return {
                nombre: p.nombre || p.name || "Partido",
                link: p.link || p.url || "#",
                categoria: p.categoria || p.category || "Otros",
                visitas: p.visitas || p.visits || 0,
                favorito: p.favorito || p.fav || false,
                fecha: p.fecha || p.ts || Date.now()
            };
        });

        noticiasLocales = dataCloud.noticias || [];
        listaIpsAutorizadas = dataCloud.ips_autorizadas || [];
        
        document.getElementById("ip-whitelist-input").value = listaIpsAutorizadas.join("\n");
        historialChat = dataCloud.historial_chat || [];

        localStorage.setItem("misPartidos", JSON.stringify(partidosLocales));
        localStorage.setItem("misNoticias", JSON.stringify(noticiasLocales));
        
        renderizarPartidos();
        renderizarNoticias();
        renderizarChat();
        inicializarControlIP();
        ejecutarRuteoDirecto();
    } catch (e) {
        partidosLocales = JSON.parse(localStorage.getItem("misPartidos") || "[]");
        noticiasLocales = JSON.parse(localStorage.getItem("misNoticias") || "[]");
        renderizarPartidos();
        renderizarNoticias();
    }
}

// Motor de enlaces directos entrantes para reproducir sin buscar en listas
function ejecutarRuteoDirecto() {
    const urlParams = new URLSearchParams(window.location.search);
    const partidoParam = urlParams.get('play');
    const directFallback = urlParams.get('direct');
    
    if (partidoParam) {
        const nombreBuscado = decodeURIComponent(partidoParam).toLowerCase();
        const idx = partidosLocales.findIndex(function(p) {
            return p.nombre.toLowerCase() === nombreBuscado;
        });
        
        if (idx !== -1) {
            verPartido(idx);
        } else if (directFallback) {
            document.getElementById("visor-titulo").innerText = `${decodeURIComponent(partidoParam)}`;
            document.getElementById("marca-capa").style.display = "flex";
            document.getElementById("visor-iframe").src = decodeURIComponent(directFallback);
            document.getElementById("visor-contenedor").style.display = "flex";
            setTimeout(function() { 
                document.getElementById("marca-capa").style.display = "none"; 
            }, 4000);
        }
    }
}

// FUNCIÓN CLAVE REQUERIDA: CAPTURA, PEGA Y CARGA CUALQUIER WEB EXTERNA AL INSTANTE
function cargarWebInmediata() {
    const urlExterna = document.getElementById("urlWebExternaInput").value.trim();
    if (!urlExterna) {
        alert("⚠️ Por favor pega una URL válida.");
        return;
    }
    
    document.getElementById("visor-titulo").innerText = "🌐 Web Clonada Sincronizada";
    document.getElementById("marca-capa").style.display = "flex";
    
    const iframe = document.getElementById("visor-iframe");
    iframe.src = urlExterna;
    document.getElementById("visor-contenedor").style.display = "flex";
    
    const baseAppUrl = window.location.origin + window.location.pathname;
    const linkExclusivo = `${baseAppUrl}?play=${encodeURIComponent("Sitio Web Forzado")}&direct=${encodeURIComponent(urlExterna)}`;
    
    enviarNotificacionTelegram("Enlace Forzado por Clonador", linkExclusivo);
    
    setTimeout(function() { 
        document.getElementById("marca-capa").style.display = "none"; 
    }, 4000);
    
    document.getElementById("urlWebExternaInput").value = "";
}

// Conmutador del iframe centralizado para los feeds automatizados solicitados
function cambiarOrigenFeed(idBoton, urlDestino) {
    document.getElementById("iframe-feed-auto").src = urlDestino;
    document.querySelectorAll("#modulo-feed-auto .tab-btn").forEach(function(btn) {
        if (btn.id === `fhub-${idBoton}`) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// Volcado general y actualización definitiva a la nube virtual
async function subirServidorCloud() {
    try {
        const payload = {
            config: { 
                version: "2.7.0", 
                api_key_reference: APP_API_KEY, 
                last_mod: new Date().toLocaleDateString() 
            },
            partidos: partidosLocales.map(function(p) {
                return {
                    name: p.nombre,
                    url: p.link,
                    category: p.categoria,
                    visits: p.visitas,
                    fav: p.favorito,
                    ts: p.fecha
                };
            }),
            noticias: noticiasLocales, 
            ips_autorizadas: listaIpsAutorizadas, 
            historial_chat: historialChat
        };
        
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: "PUT", 
            headers: { 
                "Content-Type": "application/json", 
                "X-Master-Key": MASTER_KEY 
            }, 
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            alert("☁️ Base de datos guardada en la nube global.");
        }
    } catch (e) { 
        alert("Error de red al sincronizar."); 
    }
}

// Integración inmediata con el canal de Telegram Oficial
async function enviarNotificacionTelegram(nombre, linkExclusivo) { 
    try { 
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
                chat_id: CHAT_ID, 
                text: `⚽ SEÑAL DISPONIBLE EN APK\n\n🔥 ${nombre}\n\nAccede directamente sin publicidad:\n${linkExclusivo}` 
            })
        });
    } catch (e) {} 
}

// Desglose de agendas masivas separadas por saltos de línea
function procesarAgenda() { 
    const texto = document.getElementById("agenda-input").value; 
    texto.split('\n').forEach(function(linea) { 
        if (linea.trim() !== "") {
            partidosLocales.push({ 
                nombre: linea, 
                link: "#", 
                categoria: "Otros", 
                visitas: 0, 
                favorito: false, 
                fecha: Date.now() 
            }); 
        }
    });
    localStorage.setItem("misPartidos", JSON.stringify(partidosLocales)); 
    renderizarPartidos(); 
    document.getElementById("agenda-input").value = "";
}

// Inyección tradicional e instantánea de transmisiones individuales
function procesarPartido() { 
    const url = document.getElementById("urlOriginal").value.trim(); 
    const categoria = document.getElementById("categoria").value; 
    const nombre = prompt("Nombre del partido:"); 
    if (!nombre || !url) return; 
    
    partidosLocales.unshift({ 
        nombre: nombre, 
        link: url, 
        categoria: categoria, 
        fecha: Date.now(), 
        visitas: 0, 
        favorito: false 
    }); 
    localStorage.setItem("misPartidos", JSON.stringify(partidosLocales)); 
    
    const baseAppUrl = window.location.origin + window.location.pathname;
    const linkExclusivo = `${baseAppUrl}?play=${encodeURIComponent(nombre)}&direct=${encodeURIComponent(url)}`;
    
    enviarNotificacionTelegram(nombre, linkExclusivo); 
    renderizarPartidos(); 
    document.getElementById("urlOriginal").value = "";
}

// Activador del Visor de Vídeo Integrado
function verPartido(index) { 
    partidosLocales[index].visitas++; 
    localStorage.setItem("misPartidos", JSON.stringify(partidosLocales)); 
    
    document.getElementById("visor-titulo").innerText = `Damian🇨🇺 ➔ ${partidosLocales[index].nombre}`;
    document.getElementById("marca-capa").style.display = "flex"; 
    document.getElementById("visor-iframe").src = partidosLocales[index].link; 
    document.getElementById("visor-contenedor").style.display = "flex"; 
    
    setTimeout(function() { 
        document.getElementById("marca-capa").style.display = "none"; 
    }, 4000);
    renderizarPartidos(); 
}

// Extractor de enlaces compartibles cifrados para la app
function compartirPartido(index) {
    const p = partidosLocales[index];
    const baseAppUrl = window.location.origin + window.location.pathname;
    const linkExclusivo = `${baseAppUrl}?play=${encodeURIComponent(p.nombre)}&direct=${encodeURIComponent(p.link)}`;
    prompt("Copia este enlace exclusivo de tu APK:", linkExclusivo);
}

// Creación e inyección manual de paneles informativos
function publicarNoticia() {
    const titulo = document.getElementById("news-titulo").value.trim();
    const contenido = document.getElementById("news-contenido").value.trim();
    const imagen = document.getElementById("news-imagen").value.trim();
    if (!titulo || !contenido) return;

    noticiasLocales.unshift({ 
        titulo: titulo, 
        contenido: contenido, 
        imagen: imagen || "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500", 
        fecha: new Date().toLocaleDateString() 
    });
    localStorage.setItem("misNoticias", JSON.stringify(noticiasLocales));
    renderizarNoticias();
    
    document.getElementById("news-titulo").value = "";
    document.getElementById("news-contenido").value = "";
    document.getElementById("news-imagen").value = "";
}

// Actualización manual de IPs seguras
function guardarListaIPs() {
    listaIpsAutorizadas = document.getElementById("ip-whitelist-input").value.split('\n').map(function(ip) {
        return ip.trim();
    }).filter(function(ip) {
        return ip !== "";
    });
    alert("IPs guardadas."); 
    inicializarControlIP();
}

// Renderizadores de Interfaz Gráfica (HTML Dinámico)
function renderizarPartidos() { 
    const contenedor = document.getElementById("lista-partidos"); 
    const query = document.getElementById("buscador").value.toLowerCase();
    let ordenados = [...partidosLocales].sort(function(a, b) {
        return b.favorito - a.favorito;
    }); 
    contenedor.innerHTML = ""; 
    
    ordenados.forEach(function(p, index) {
        if (categoriaActual !== "Todos" && p.categoria !== categoriaActual) return;
        if (query && !p.nombre.toLowerCase().includes(query)) return;
        
        contenedor.innerHTML += `
            <div class="canal-item">
                <div onclick="toggleFavorito(${index})" style="cursor:pointer; font-size:1.2rem; margin-right:10px;">${p.favorito ? '⭐' : '☆'}</div>
                <div style="flex:1;">
                    <small class="tag" style="background:var(--red)">${p.categoria}</small>
                    <strong style="display:block; margin-top:4px; font-size:0.9rem;">⚽ ${p.nombre}</strong>
                </div>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    <button onclick="verPartido(${index})" style="background:#22c55e; padding:5px 8px; font-size:0.7rem;">VER</button>
                    <button onclick="compartirPartido(${index})" style="background:#0088cc; padding:4px 6px; font-size:0.6rem;">🔗 Link</button>
                </div>
            </div>`; 
    });
}

function renderizarNoticias() {
    const contenedor = document.getElementById("feed-noticias-contenedor");
    contenedor.innerHTML = "";
    noticiasLocales.forEach(function(n) {
        contenedor.innerHTML += `
            <div class="news-card">
                <strong style="font-size:1rem; color:var(--gold);">⚡ ${n.titulo}</strong>
                <p style="font-size:0.85rem; margin:6px 0;">${n.contenido}</p>
                <img src="${n.imagen}" style="width:100%; max-height:140px; object-fit:cover; border-radius:6px;">
            </div>`;
    });
}

function renderizarChat() {
    const contenedor = document.getElementById("chat-box-mensajes");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    historialChat.forEach(function(c) {
        contenedor.innerHTML += `<div class="chat-msg ${c.admin ? 'admin' : ''}"><strong>${c.usuario}:</strong> ${c.texto}</div>`;
    });
    contenedor.scrollTop = contenedor.scrollHeight;
}

function enviarMensajeChat() {
    const input = document.getElementById("chat-mensaje-txt");
    if (!input.value.trim()) return;
    const soyAdmin = localStorage.getItem("esCreador") === "true";
    
    historialChat.push({ 
        usuario: soyAdmin ? "Damian🇨🇺" : `User_${userIpAddress.substr(-4)}`, 
        texto: input.value.trim(), 
        admin: soyAdmin 
    });
    input.value = ""; 
    renderizarChat();
}

// Conmutador del Menú de Navegación Principal
function alternarSeccionPrincipal(seccion) {
    seccionActual = seccion;
    document.getElementById("modulo-partidos").style.display = seccion === "live" ? "block" : "none";
    document.getElementById("modulo-feed-auto").style.display = seccion === "feedauto" ? "block" : "none";
    document.getElementById("modulo-juego").style.display = seccion === "juego" ? "block" : "none";
    document.getElementById("modulo-noticias").style.display = seccion === "news" ? "block" : "none";
    document.getElementById("modulo-chat").style.display = seccion === "chat" ? "block" : "none";
    
    document.querySelectorAll(".tab-btn").forEach(function(btn) {
        if (btn.id === `main-tab-${seccion}`) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}

// Filtro rápido de categorías deportivas
function filtrarCategoria(cat) {
    categoriaActual = cat;
    document.querySelectorAll(".tab-btn").forEach(function(b) {
        if (b.id === `cat-${cat}`) {
            b.classList.add("active");
        } else {
            b.classList.remove("active");
        }
    });
    renderizarPartidos();
}

// Conmutador de submódulos del Administrador
function cambiarAdminSubtab(subtab) {
    document.getElementById("admin-subtab-partidos").style.display = subtab === "partidos" ? "block" : "none";
    document.getElementById("admin-subtab-noticias").style.display = subtab === "noticias" ? "block" : "none";
    document.getElementById("admin-subtab-ips").style.display = subtab === "ips" ? "block" : "none";
}

// Utilidades del sistema de almacenamiento
function toggleFavorito(index) { 
    partidosLocales[index].favorito = !partidosLocales[index].favorito; 
    localStorage.setItem("misPartidos", JSON.stringify(partidosLocales)); 
    renderizarPartidos(); 
}

function cerrarVisor() { 
    document.getElementById("visor-contenedor").style.display = "none"; 
    document.getElementById("visor-iframe").src = ""; 
} 

function recargarVideo() { 
    const frame = document.getElementById("visor-iframe"); 
    const url = frame.src; 
    frame.src = ""; 
    setTimeout(function() { 
        frame.src = url; 
    }, 100); 
}

function exportarDatos() { 
    alert(JSON.stringify(partidosLocales)); 
} 

function importarDatos() { 
    const d = prompt("Backup:"); 
    if (d) { 
        partidosLocales = JSON.parse(d); 
        renderizarPartidos(); 
    } 
}

// Disparador de ejecución inicial del sistema al terminar de cargar el DOM
document.addEventListener("DOMContentLoaded", function() {
    verificarDispositivo(); 
    descargarServidorCloud();
});