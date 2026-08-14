const botones = document.querySelectorAll(".pestanas button");
const ventanas = document.querySelectorAll(".contenidos section");
botones.forEach(boton => {
    boton.addEventListener("click", () => {
        ventanas.forEach(ventana => {
            ventana.style.display = "none";
        });
        const nombreVentana = boton.dataset.ventana;
        const ventanaSeleccionada =
            document.getElementById(nombreVentana);
        ventanaSeleccionada.style.display = "block";

        if (nombreVentana === "batalla") {
            prepararBatalla();
        }
    });
});
function cambiarSubpestana(subpestana) {
    const btnPersonajes = document.getElementById("btn-sub-personajes");
    const btnTarjetas = document.getElementById("btn-sub-tarjetas");
    const subPersonajes = document.getElementById("sub-personajes");
    const subTarjetas = document.getElementById("sub-tarjetas");

    if (subpestana === "personajes") {
        btnPersonajes.classList.add("activo");
        btnTarjetas.classList.remove("activo");
        subPersonajes.style.display = "block";
        subPersonajes.classList.add("activo");
        subTarjetas.style.display = "none";
        subTarjetas.classList.remove("activo");
    } else if (subpestana === "tarjetas") {
        btnTarjetas.classList.add("activo");
        btnPersonajes.classList.remove("activo");
        subTarjetas.style.display = "block";
        subTarjetas.classList.add("activo");
        subPersonajes.style.display = "none";
        subPersonajes.classList.remove("activo");
    }
}
let personajes = [];
let tarjetasGuardadas = [];

async function cargarTarjetas() {
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasGuardadas = await respuesta.json();
            mostrarTarjetas(tarjetasGuardadas);
        }
    } catch (error) {
        console.warn("No hay tarjetas previas o hubo un error al cargar tarjeta.json");
    }
}
cargarTarjetas();
function mostrarTarjetas(lista) {
    const contenedorGrid = document.getElementById("grid-tarjetas-galeria");
    if (!contenedorGrid) return;
    contenedorGrid.innerHTML = "";
    
    lista.forEach(tarjeta => {
        const div = document.createElement("div");
        div.className = "tarjeta-personaje tarjeta-mini";
        div.onclick = () => abrirModalTarjeta(tarjeta);
        
        div.innerHTML = `
            <h3 class="titulo-carta">${tarjeta.nombre}</h3>
            <img src="${tarjeta.imagen || ''}" alt="${tarjeta.nombre}" class="imagen-personaje">
            <span class="tipo-personaje" style="font-size: 10px; text-align: center; display: block; margin-top: 2px; font-weight: bold; color: #88c0d0;">[ ${tarjeta.tipo || 'Tarjeta'} ]</span>
        `;
        contenedorGrid.appendChild(div);
    });
}

function abrirModalTarjeta(tarjeta) {
    const modal = document.getElementById("modal-detalle-tarjeta");
    const detalle = document.getElementById("contenido-detalle-tarjeta");
    
    let efectosHtml = "";
    if (tarjeta.efectos && tarjeta.efectos.length > 0) {
        efectosHtml = "<ul style='padding-left: 20px; margin-top: 10px; color: #eeeeee; font-size: 14px;'>" + tarjeta.efectos.map(e => `<li style="margin-bottom: 6px;"><strong>${e.atributo ? e.atributo.toUpperCase() : ''}:</strong> <span style="color: #88ff88;">${e.modificacion > 0 ? '+' : ''}${e.modificacion || e.valor || ''}</span></li>`).join("") + "</ul>";
    } else {
        efectosHtml = "<p style='color: #888; font-size: 13px; margin-top: 10px;'>Sin efectos registrados.</p>";
    }

    let excepcionesHtml = "";
    if (tarjeta.excepciones && tarjeta.excepciones.length > 0) {
        excepcionesHtml = "<ul style='padding-left: 20px; margin-top: 10px; color: #eeeeee; font-size: 14px;'>" + tarjeta.excepciones.map(ex => {
            let objetivo = ex.personajeId ? "Un personaje específico" : (ex.tipo || "Todos");
            return `<li style="margin-bottom: 6px;"><strong>Objetivo:</strong> ${objetivo} <br><span style="color: #ff8888;">➤ Condición: ${ex.condicion} ${ex.porcentaje ? '('+ex.porcentaje+'%)' : ''}</span></li>`;
        }).join("") + "</ul>";
    } else {
        excepcionesHtml = "<p style='color: #888; font-size: 13px; margin-top: 10px;'>Sin excepciones.</p>";
    }

    detalle.innerHTML = `
        <div class="detalle-modal">
            <img src="${tarjeta.imagen || ''}" alt="${tarjeta.nombre}" class="detalle-imagen">
            <div class="detalle-info">
                <h2>${tarjeta.nombre}</h2>
                <div class="contenedor-tipos" style="margin-top: -10px; margin-bottom: 10px;">
                    <span class="etiqueta-tipo tipo-portador">${tarjeta.tipo || 'Tarjeta'}</span>
                </div>
                <div style="background-color: #1a1a1a; padding: 15px; border-radius: 6px; border: 1px solid #333; margin-bottom: 15px;">
                    <p style="color: #cccccc; font-size: 14px; font-style: italic; margin: 0; line-height: 1.5;">"${tarjeta.descripcion || 'Sin descripción detallada.'}"</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background-color: #2b2b2b; padding: 15px; border-radius: 6px; border: 1px solid #4a3621;">
                        <h4 style="color: #ffcc00; margin: 0; border-bottom: 1px solid #4a3621; padding-bottom: 8px;">⚔️ Efectos</h4>
                        ${efectosHtml}
                    </div>
                    <div style="background-color: #2b2b2b; padding: 15px; border-radius: 6px; border: 1px solid #4a3621;">
                        <h4 style="color: #ff8888; margin: 0; border-bottom: 1px solid #4a3621; padding-bottom: 8px;">⚠️ Excepciones</h4>
                        ${excepcionesHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = "block";
}

function cerrarModalTarjetaDetalle() {
    document.getElementById("modal-detalle-tarjeta").style.display = "none";
}
function abrirModalTarjetaPorId(idTarjeta) {
    const tarjeta = tarjetasGuardadas.find(t => t.idTarjeta === idTarjeta);
    if(tarjeta) {
        abrirModalTarjeta(tarjeta);
    }
}
function generarEtiquetasTipo(tiposString) {
    if (!tiposString) return '';
    const tipos = tiposString.split(',').map(t => t.trim());
    return `<div class="contenedor-tipos">` + tipos.map(tipo => {
        const claseTipo = "tipo-" + tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
        return `<span class="etiqueta-tipo ${claseTipo}">${tipo}</span>`;
    }).join('') + `</div>`;
}
async function cargarPersonajes() {
    try {
        const respuesta = await fetch("personajes.json");
        personajes = await respuesta.json();
        mostrarPersonajes(personajes);
    } catch (error) {
        console.error("Error al cargar el archivo de personajes:", error);
    }
}
function mostrarPersonajes(lista) {
    const contenedorSub = document.getElementById("sub-personajes");
    if (!contenedorSub) return;
    contenedorSub.innerHTML = "";
    const contenedorGrid = document.createElement("div");
    contenedorGrid.className = "galeria-grid";
    lista.forEach(personaje => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-personaje";
        tarjeta.onclick = () => abrirModal(personaje);
        tarjeta.innerHTML = `
            <h3 class="titulo-carta">${personaje.nombre}</h3>
            <img src="${personaje.imagen}" alt="${personaje.nombre}" class="imagen-personaje">
            <span class="tipo-personaje">[ ${personaje.tipo} ]</span>
        `;
        contenedorGrid.appendChild(tarjeta);
    });
    contenedorSub.appendChild(contenedorGrid);
}
const modal = document.getElementById("modal-personaje");
const btnCerrar = document.querySelector(".cerrar-modal");
function abrirModal(personaje) {
    const detalle = document.getElementById("detalle-personaje");
    const stats = personaje.atributos || {};
    
    const tarjetasPersonaje = tarjetasGuardadas.filter(t => t.propietarioId === personaje.id);
    let htmlTarjeta = "";
    if (tarjetasPersonaje.length > 0) {
        htmlTarjeta = `<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">`;
        tarjetasPersonaje.forEach(tarjeta => {
            let efectosTexto = "Sin efectos";
            if (tarjeta.efectos && tarjeta.efectos.length > 0) {
                efectosTexto = tarjeta.efectos.map(e => `${e.atributo.toUpperCase()}: ${e.modificacion > 0 ? '+' : ''}${e.modificacion}`).join(", ");
            }
            htmlTarjeta += `
                <div onclick="abrirModalTarjetaPorId('${tarjeta.idTarjeta}')" style="flex: 1; min-width: 150px; cursor: pointer; border: 1px solid #d97706; padding: 10px; border-radius: 4px; background-color: rgba(217, 119, 6, 0.1);" onmouseover="this.style.backgroundColor='rgba(217, 119, 6, 0.3)'" onmouseout="this.style.backgroundColor='rgba(217, 119, 6, 0.1)'">
                    <h4 style="color: #f59e0b; margin-bottom: 5px; font-size: 14px;">🗡️ ${tarjeta.nombre} (${tarjeta.tipo})</h4>
                    <p style="font-size: 12px; color: #eeeeee; margin: 0;"><strong>Efectos:</strong> ${efectosTexto}</p>
                </div>
            `;
        });
        htmlTarjeta += `</div>`;
    }

    detalle.innerHTML = `
        <div class="detalle-modal">
            <img src="${personaje.imagen}" alt="${personaje.nombre}" class="detalle-imagen">
            <div class="detalle-info">
                <h2>${personaje.nombre}</h2>
            ${generarEtiquetasTipo(personaje.tipo)}
            <p class="historia-personaje modal-historia">${personaje.historia}</p>
                <div class="atributos-personaje">
                    ${["velocidad", "inteligencia", "fuerza", "defensa", "magia"].map(a => {
                        const info = getStatInfo(a, stats[a] ?? 0);
                        return `<p ${info.esEv ? 'class="texto-dorado"' : ''}><strong>${info.nombreDisplay}:</strong> ${info.valorDisplay}</p>`;
                    }).join("")}
                </div>
                ${htmlTarjeta}
               <div style="margin-top: 15px; border-top: 1px solid #333; padding-top: 10px;">
                    <p>
                        <span style="color: #88ff88; font-weight: bold;">+ Puntos Positivos:</span> ${personaje.puntosPositivos ?? 0}
                        ${((personaje.puntosPositivos || 0) + (personaje.puntosNegativos || 0)) >= 25 ? `<button id="btn-evolucion-pendiente" onclick="abrirModalEvolucion('${personaje.id}')" style="margin-left: 10px; background: #ffcc00; color: #111; border: none; padding: 4px 8px; font-weight: bold; cursor: pointer; border-radius: 4px;">EVOLUCIÓN PENDIENTE</button>` : ''}
                    </p>
                    <p><span style="color: #ff8888; font-weight: bold;">- Puntos Negativos:</span> ${personaje.puntosNegativos ?? 0}</p>
                    <p>
                        <span style="color: #88c0d0; font-weight: bold;">Duelos Librados:</span> ${personaje.duelos ?? 0}
${(personaje.duelos || 0) >= 15 ? `<button id="btn-tarjeta-disponible" onclick="abrirModalTarjetaHistoria('${personaje.id}')" style="margin-left: 10px; background: #88c0d0; color: #111; border: none; padding: 4px 8px; font-weight: bold; cursor: pointer; border-radius: 4px;">TARJETA DISPONIBLE</button>` : ''}                    </p>
                </div>
            </div>
        </div>
    `;
    modal.style.display = "block";
}
btnCerrar.onclick = () => {
    modal.style.display = "none";
}
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
cargarPersonajes();
let mazosGuardados = [];
let mazoActual = [];
const MAX_CARTAS = 50;

const modalMazo = document.getElementById("modal-nuevo-mazo");
const btnNuevoMazo = document.getElementById("btn-nuevo-mazo");
const btnCerrarMazo = document.querySelector(".cerrar-modal-mazo");
const contenedorDisponibles = document.getElementById("personajes-disponibles");
const contenedorMazo = document.getElementById("personajes-mazo");
const contadorMazo = document.getElementById("contador-mazo");
const btnGuardarMazo = document.getElementById("btn-guardar-mazo");
const listaMazosContenedor = document.getElementById("lista-mazos");

async function cargarMazos() {
    try {
        const respuesta = await fetch("mazos.json");
        if (respuesta.ok) {
            mazosGuardados = await respuesta.json();
            mostrarMazosGuardados();
        }
    } catch (error) {
        console.warn("No hay mazos previos o hubo un error al cargar mazos.json");
    }
}

function mostrarMazosGuardados() {
    listaMazosContenedor.innerHTML = "";
    mazosGuardados.forEach((mazo, index) => {
        const divMazo = document.createElement("div");
        divMazo.className = "item-mazo";
        divMazo.innerHTML = `<h3>Mazo ${index + 1} - (${mazo.length} Cartas)</h3>`;
        listaMazosContenedor.appendChild(divMazo);
    });
}

btnNuevoMazo.addEventListener("click", () => {
    mazoActual = [];
    actualizarInterfazConstructor();
    modalMazo.style.display = "block";
});

btnCerrarMazo.onclick = () => {
    modalMazo.style.display = "none";
}

window.addEventListener("click", (event) => {
    if (event.target == modalMazo) {
        modalMazo.style.display = "none";
    }
});

function actualizarInterfazConstructor() {
    contenedorDisponibles.innerHTML = "";
    contenedorMazo.innerHTML = "";
    contadorMazo.textContent = mazoActual.length;

    const disponibles = personajes.filter(p => !mazoActual.some(m => m.id === p.id));
    
    disponibles.forEach(personaje => {
        const tarjeta = crearTarjetaMini(personaje);
        tarjeta.onclick = () => agregarAlMazo(personaje);
        contenedorDisponibles.appendChild(tarjeta);
    });

    for (let i = 0; i < MAX_CARTAS; i++) {
        if (i < mazoActual.length) {
            const personaje = mazoActual[i];
            const tarjeta = crearTarjetaMini(personaje);
            tarjeta.onclick = () => quitarDelMazo(personaje);
            contenedorMazo.appendChild(tarjeta);
        } else {
            const vacio = document.createElement("div");
            vacio.className = "espacio-vacio";
            contenedorMazo.appendChild(vacio);
        }
    }
}

function crearTarjetaMini(personaje) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-personaje";
    tarjeta.innerHTML = `
        <h3 class="titulo-carta">${personaje.nombre}</h3>
    <img src="${personaje.imagen}" alt="${personaje.nombre}" class="imagen-personaje">
    ${generarEtiquetasTipo(personaje.tipo)}
`;
    return tarjeta;
}

function agregarAlMazo(personaje) {
    if (mazoActual.length < MAX_CARTAS) {
        mazoActual.push(personaje);
        actualizarInterfazConstructor();
    } else {
        alert("El mazo ya tiene 50 cartas.");
    }
}

function quitarDelMazo(personaje) {
    mazoActual = mazoActual.filter(p => p.id !== personaje.id);
    actualizarInterfazConstructor();
}

btnGuardarMazo.addEventListener("click", () => {
    if (mazoActual.length === 0) {
        alert("El mazo está vacío. Agrega personajes antes de guardar.");
        return;
    }
    
    const nuevoMazoIds = mazoActual.map(p => p.id);
    mazosGuardados.push(nuevoMazoIds);
    
    const blob = new Blob([JSON.stringify(mazosGuardados, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    
    a.href = url;
    a.download = "mazos.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    mostrarMazosGuardados();
    modalMazo.style.display = "none";
});

cargarMazos();
// --- SISTEMA DE BATALLA ---
let mazoBatallaSeleccionado = [];
let personajesPrincipales = [];
let mazoBatallaRival = [];
let mazoRestanteUsuario = [];
let mazoRestanteRival = [];
let manoUsuario = [];
let manoRival = [];
let estadisticasBatallaPrincipales = {};
let tarjetasEntornoUsadas = [];

const pantallaSeleccionMazo = document.getElementById("pantalla-seleccion-mazo");
const pantallaSeleccionPersonajes = document.getElementById("pantalla-seleccion-personajes");
const pantallaBatallaActiva = document.getElementById("pantalla-batalla-activa");
const listaMazosBatalla = document.getElementById("lista-mazos-batalla");
const gridPersonajesBatalla = document.getElementById("grid-personajes-batalla");
const contadorPrincipales = document.getElementById("contador-principales");
const btnAleatorioBatalla = document.getElementById("btn-aleatorio-batalla");
const btnConfirmarPrincipales = document.getElementById("btn-confirmar-principales");
const btnVolverMazos = document.getElementById("btn-volver-mazos");

function prepararBatalla() {
    pantallaSeleccionMazo.style.display = "block";
    pantallaSeleccionPersonajes.style.display = "none";
    pantallaBatallaActiva.style.display = "none";
    personajesPrincipales = [];
    mostrarMazosParaBatalla();
}

function mostrarMazosParaBatalla() {
    listaMazosBatalla.innerHTML = "";
    if (mazosGuardados.length === 0) {
        listaMazosBatalla.innerHTML = "<p>No hay mazos guardados. Crea uno en la pestaña Mazo.</p>";
        return;
    }

    mazosGuardados.forEach((mazoIds, index) => {
        const divMazo = document.createElement("div");
        divMazo.className = "item-mazo tarjeta-mazo-batalla";
        divMazo.innerHTML = `<h3>Mazo ${index + 1} - (${mazoIds.length} Cartas)</h3>`;
        divMazo.onclick = () => seleccionarMazoBatalla(mazoIds);
        listaMazosBatalla.appendChild(divMazo);
    });
}

function seleccionarMazoBatalla(mazoIds) {
    mazoBatallaSeleccionado = mazoIds.map(id => personajes.find(p => p.id === id)).filter(Boolean);
    personajesPrincipales = [];
    
    pantallaSeleccionMazo.style.display = "none";
    pantallaSeleccionPersonajes.style.display = "block";
    actualizarInterfazSeleccionPrincipales();
}

function actualizarInterfazSeleccionPrincipales() {
    gridPersonajesBatalla.innerHTML = "";
    contadorPrincipales.textContent = personajesPrincipales.length;
    btnConfirmarPrincipales.disabled = personajesPrincipales.length !== 3;

    mazoBatallaSeleccionado.forEach(personaje => {
        const tarjeta = crearTarjetaMini(personaje);
        const esSeleccionado = personajesPrincipales.some(p => p.id === personaje.id);
        
        if (esSeleccionado) {
            tarjeta.classList.add("tarjeta-seleccionada-principal");
        }

        tarjeta.onclick = () => toggleSeleccionPrincipal(personaje);
        gridPersonajesBatalla.appendChild(tarjeta);
    });
}

function toggleSeleccionPrincipal(personaje) {
    const index = personajesPrincipales.findIndex(p => p.id === personaje.id);
    if (index !== -1) {
        personajesPrincipales.splice(index, 1);
    } else {
        if (personajesPrincipales.length < 3) {
            personajesPrincipales.push(personaje);
        } else {
            alert("Ya has seleccionado 3 personajes principales.");
        }
    }
    actualizarInterfazSeleccionPrincipales();
}

btnAleatorioBatalla.addEventListener("click", () => {
    if (mazoBatallaSeleccionado.length < 3) {
        alert("El mazo debe tener al menos 3 cartas para elegir aleatoriamente.");
        return;
    }
    const copiaMazo = [...mazoBatallaSeleccionado];
    copiaMazo.sort(() => 0.5 - Math.random());
    personajesPrincipales = copiaMazo.slice(0, 3);
    actualizarInterfazSeleccionPrincipales();
});

btnVolverMazos.addEventListener("click", () => {
    prepararBatalla();
});

btnConfirmarPrincipales.addEventListener("click", () => {
    pantallaSeleccionPersonajes.style.display = "none";
    
    const modalBatalla = document.getElementById("modal-batalla");
    if (modalBatalla) {
        modalBatalla.style.display = "flex";
        iniciarRondaBatalla();
    }
});
let asignacionesUsuario = {};
let asignacionesRival = {};
const ATRIBUTOS = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];
function iniciarRondaBatalla() {
    mazoRestanteUsuario = [...personajesPrincipales];
    mazoRestanteUsuario.sort(() => 0.5 - Math.random());
    
    estadisticasBatallaPrincipales = {};
    personajesPrincipales.forEach(p => {
        estadisticasBatallaPrincipales[p.id] = {
            historialDuelos: [],
            duelos: 0
        };
    });
    
    let mazoRivalIds = [];
    if (mazosGuardados.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * mazosGuardados.length);
        mazoRivalIds = mazosGuardados[indiceAleatorio];
    }
    let mazoRival = mazoRivalIds.map(id => personajes.find(p => p.id === id)).filter(Boolean);
    if (mazoRival.length < 7) {
        mazoRival = [...personajes];
    }
    mazoRestanteRival = [...mazoRival];
    mazoRestanteRival.sort(() => 0.5 - Math.random());

    manoUsuario = [];
    manoRival = [];
    tarjetasEntornoUsadas = [];
    
    repartirCartas();
}
function iniciarRondaBatalla() {
    mazoRestanteUsuario = [...mazoBatallaSeleccionado];
    mazoRestanteUsuario.sort(() => 0.5 - Math.random());
    
    estadisticasBatallaPrincipales = {};
    personajesPrincipales.forEach(p => {
        estadisticasBatallaPrincipales[p.id] = {
            historialDuelos: []
        };
    });

    let mazoRivalIds = [];
    if (mazosGuardados.length > 0) {
        const indiceAleatorio = Math.floor(Math.random() * mazosGuardados.length);
        mazoRivalIds = mazosGuardados[indiceAleatorio];
    }
    let mazoRival = mazoRivalIds.map(id => personajes.find(p => p.id === id)).filter(Boolean);
    if (mazoRival.length < 7) {
        mazoRival = [...personajes];
    }
    mazoRestanteRival = [...mazoRival];
    mazoRestanteRival.sort(() => 0.5 - Math.random());

    manoUsuario = [];
    manoRival = [];
    
    repartirCartas();
}
const TIPOS_EQUIPAMIENTO_PERMANENTE = ["Arma", "Armadura", "Reliquia", "Montura"];
const TIPOS_EFECTOS_NO_EQUIPAMIENTO = ["Bendición", "Maldición", "Conocimiento", "Bendicion", "Maldicion"];
const TIPOS_MODIFICADORES_PERMANENTES = [...TIPOS_EQUIPAMIENTO_PERMANENTE, ...TIPOS_EFECTOS_NO_EQUIPAMIENTO];

function aplicarEquipamientoInicial(personaje) {
    if (typeof tarjetasGuardadas === 'undefined' || !tarjetasGuardadas) return;
    const tarjetasEquip = tarjetasGuardadas.filter(t => t.propietarioId === personaje.id && TIPOS_MODIFICADORES_PERMANENTES.includes(t.tipo));
    tarjetasEquip.forEach(tarjeta => {
        if (tarjeta.efectos && tarjeta.efectos.length > 0) {
            tarjeta.efectos.forEach(efecto => {
                const attr = efecto.atributo ? efecto.atributo.toLowerCase() : null;
                if (attr && personaje.atributos && personaje.atributos[attr] !== undefined) {
                    let valBase = getStatInfo(attr, personaje.atributos[attr]).statValue;
                    personaje.atributos[attr] = Math.max(0, valBase + (parseInt(efecto.modificacion) || 0));
                }
            });
        }
    });

    const tarjetasConsumibles = tarjetasGuardadas.filter(t => t.propietarioId === personaje.id && t.tipo === "Consumible");
    personaje.consumibles = [];
    tarjetasConsumibles.forEach(tarjeta => {
        if (tarjeta.efectos && tarjeta.efectos.length > 0) {
            tarjeta.efectos.forEach(efecto => {
                personaje.consumibles.push({
                    atributo: efecto.atributo.toLowerCase(),
                    valor: parseInt(efecto.modificacion) || 0,
                    turnos: tarjeta.turnos || 1
                });
            });
        }
    });
}
function repartirCartas() {
        while (manoUsuario.length < 7 && mazoRestanteUsuario.length > 0) {
            let p = JSON.parse(JSON.stringify(mazoRestanteUsuario.pop()));
            aplicarEquipamientoInicial(p);
            manoUsuario.push(p);
        }
        while (manoRival.length < 7 && mazoRestanteRival.length > 0) {
            let p = JSON.parse(JSON.stringify(mazoRestanteRival.pop()));
            aplicarEquipamientoInicial(p);
            manoRival.push(p);
        }
       if (manoUsuario.length === 0 || manoRival.length === 0) {
            document.getElementById("casilleros-atributos").style.display = "none";
            document.getElementById("btn-iniciar-duelo").style.display = "none";
            
            const equipoGano = manoRival.length === 0;
            const contenedorRecompensas = document.getElementById("contenedor-recompensas-personajes");
            contenedorRecompensas.innerHTML = "";

            personajesPrincipales.forEach(p => {
                let stats = estadisticasBatallaPrincipales[p.id] || { historialDuelos: [] };
                let pos = 0;
                let neg = 0;

                if (equipoGano) {
                    pos += 3;
                } else {
                    neg += 3;
                }

                const duelos = stats.historialDuelos;
                if (duelos.length === 0) {
                    pos += 1;
                    neg += 1;
                } else if (duelos[0] === false) {
                    neg += 2;
                } else if (duelos[0] === true && duelos[1] === false) {
                    pos += 1;
                    neg += 1;
                } else if (duelos.filter(v => v === true).length >= 2 || (duelos[0] === true && duelos[1] === true)) {
                    pos += 2;
                } else {
                    pos += 1;
                    neg += 1;
                }

                p.puntosPositivos = (p.puntosPositivos || 0) + pos;
                p.puntosNegativos = (p.puntosNegativos || 0) + neg;
                p.duelos = (p.duelos || 0) + (stats.duelos || 0);

                const divPersonaje = document.createElement("div");
                divPersonaje.className = "recompensa-personaje";
                divPersonaje.innerHTML = `
                    <img src="${p.imagen}" alt="${p.nombre}" class="recompensa-imagen">
                    <p class="recompensa-nombre">${p.nombre}</p>
                    <div class="recompensa-puntos">
                        <span class="puntos-positivos">+${pos}</span>
                        <span class="puntos-negativos">-${neg}</span>
                    </div>
                `;
                contenedorRecompensas.appendChild(divPersonaje);
            });

            const btnFinalizar = document.getElementById("btn-finalizar-batalla");
            btnFinalizar.style.display = "block";
            btnFinalizar.onclick = () => {
                document.getElementById("modal-batalla").style.display = "none";
                document.getElementById("casilleros-atributos").style.display = "flex";
                document.getElementById("btn-iniciar-duelo").style.display = "none";
                btnFinalizar.style.display = "none";
                
                document.getElementById("modal-recompensas").style.display = "flex";
                
                document.getElementById("btn-cerrar-recompensas").onclick = () => {
                    document.getElementById("modal-recompensas").style.display = "none";
                    
                    const blob = new Blob([JSON.stringify(personajes, null, 4)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    
                    a.href = url;
                    a.download = "personajes.json";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    const ventanas = document.querySelectorAll(".contenidos section");
                    ventanas.forEach(ventana => {
                        ventana.style.display = "none";
                    });
                    document.getElementById("galeria").style.display = "block";
                    mostrarPersonajes(personajes);
                };
            };
            return;
        }
    asignacionesUsuario = {};
    asignacionesRival = {};
    reiniciarCasilleros();
    
    renderizarCartasBatalla(manoRival, "sector-a1", true);
    renderizarCartasBatalla(manoUsuario, "sector-a3", false);
    
    document.getElementById("sector-b1").innerHTML = `<h3 style="color: #ff8888; text-align: center; width: 100%;">Rival: ${manoRival.length + mazoRestanteRival.length} cartas</h3>`;
    document.getElementById("sector-b3").innerHTML = `<h3 style="color: #88ff88; text-align: center; width: 100%;">Tú: ${manoUsuario.length + mazoRestanteUsuario.length} cartas</h3>`;
}

function reiniciarCasilleros() {
    document.querySelectorAll(".casillero").forEach(cas => {
        cas.classList.remove("brillando");
        cas.textContent = cas.dataset.attr.toUpperCase();
    });
    const btnDuelo = document.getElementById("btn-iniciar-duelo");
    if(btnDuelo) {
        btnDuelo.classList.remove("listo", "brillando");
        btnDuelo.disabled = true;
        btnDuelo.onclick = ejecutarDuelo;
    }
}
function obtenerPuntosConTarjetas(personaje, attr) {
    let valBase = (personaje.atributos && personaje.atributos[attr]) ? getStatInfo(attr, personaje.atributos[attr]).statValue : 0;
    return calcularPuntosBatallaConTarjeta(personaje, null, attr, valBase);
}
function renderizarCartasBatalla(cartas, contenedorId, esRival) {
    const contenedor = document.getElementById(contenedorId);
    contenedor.innerHTML = "";
    const fila = document.createElement("div");
    fila.className = "fila-cartas-batalla";

    cartas.forEach((personaje, index) => {
        const intPuntos = obtenerPuntosConTarjetas(personaje, 'inteligencia');
        const fuePuntos = obtenerPuntosConTarjetas(personaje, 'fuerza');
        const defPuntos = obtenerPuntosConTarjetas(personaje, 'defensa');
        const velPuntos = obtenerPuntosConTarjetas(personaje, 'velocidad');
        const magPuntos = obtenerPuntosConTarjetas(personaje, 'magia');

        const carta = document.createElement("div");
        carta.className = "carta-batalla";
        carta.id = `carta-${esRival ? 'rival' : 'usuario'}-${index}`;
        
        let htmlBotones = '';
        if (!esRival) {
            htmlBotones = `
                <div class="botones-atributos">
                    <button onclick="asignarAtributo('inteligencia', ${index})">Int: ${intPuntos}</button>
                    <button onclick="asignarAtributo('fuerza', ${index})">Fue: ${fuePuntos}</button>
                    <button onclick="asignarAtributo('defensa', ${index})">Def: ${defPuntos}</button>
                    <button onclick="asignarAtributo('velocidad', ${index})">Vel: ${velPuntos}</button>
                    <button onclick="asignarAtributo('magia', ${index})">Mag: ${magPuntos}</button>
                </div>
            `;
        } else {
            htmlBotones = `
                <div class="botones-atributos">
                    <button disabled>Vel: ${velPuntos}</button>
                    <button disabled>Int: ${intPuntos}</button>
                    <button disabled>Fue: ${fuePuntos}</button>
                    <button disabled>Def: ${defPuntos}</button>
                    <button disabled>Mag: ${magPuntos}</button>
                </div>
            `;
        }

        carta.innerHTML = `
            <h4 class="titulo-carta-batalla">${personaje.nombre}</h4>
            <img src="${personaje.imagen}" alt="${personaje.nombre}" class="imagen-carta-batalla">
            ${htmlBotones}
        `;
        fila.appendChild(carta);
    });
    contenedor.appendChild(fila);
}
function asignarAtributo(atributo, indexCarta) {
        if (asignacionesUsuario[atributo] !== undefined) return;
        
        if (manoUsuario.length >= 5) {
            if (Object.values(asignacionesUsuario).includes(indexCarta)) return;
        }

        asignacionesUsuario[atributo] = indexCarta;
    const casillero = document.querySelector(`.casillero[data-attr="${atributo}"]`);
        if(casillero) {
            casillero.classList.add("brillando");
            casillero.textContent = manoUsuario[indexCarta].nombre.substring(0,8);
        }
        
        if (manoUsuario.length >= 5) {
            document.getElementById(`carta-usuario-${indexCarta}`).classList.add("asignada");
        }

        comprobarListos();
    }

function comprobarListos() {
    if (Object.keys(asignacionesUsuario).length === 5) {
        const btnDuelo = document.getElementById("btn-iniciar-duelo");
        if(btnDuelo) {
            btnDuelo.classList.add("listo");
            btnDuelo.disabled = false;
        }
    }
}

function asignarRivalAleatorio() {
        let indicesDisponibles = manoRival.map((_, i) => i);
        indicesDisponibles.sort(() => 0.5 - Math.random());
        
        ATRIBUTOS.forEach((attr, i) => {
            asignacionesRival[attr] = indicesDisponibles[i % indicesDisponibles.length];
        });
    }

function calcularModificadorEquipamiento(tarjeta, personaje, oponente, attr, totalActual = 0) {
    if (!tarjeta || !TIPOS_EQUIPAMIENTO_PERMANENTE.includes(tarjeta.tipo) || tarjeta.propietarioId !== personaje.id) {
        return 0;
    }

    const efecto = tarjeta.efectos?.find(e => e.atributo && e.atributo.toLowerCase() === attr.toLowerCase());
    if (!efecto || !oponente || !tarjeta.excepciones || tarjeta.excepciones.length === 0) {
        return 0;
    }

    return tarjeta.excepciones.reduce((modificador, exc) => {
        const aplicaPorPersonaje = exc.personajeId && exc.personajeId === oponente.id;
        const aplicaPorTipo = !exc.personajeId && exc.tipo && (oponente.tipo || "").includes(exc.tipo);
        if (!aplicaPorPersonaje && !aplicaPorTipo) {
            return modificador;
        }

        const porcentaje = (parseInt(exc.porcentaje) || 50) / 100;
        const valorEfecto = Math.abs(parseInt(efecto.modificacion) || 0);

        if (exc.condicion === "Aumento") {
            return modificador + (valorEfecto * porcentaje);
        }
        if (exc.condicion === "Debilidad") {
            return modificador - (valorEfecto * porcentaje);
        }
        if (exc.condicion === "Inmune") {
            return modificador + 999;
        }
        if (exc.condicion === "Destino") {
            return modificador + totalActual;
        }
        return modificador;
    }, 0);
}

function calcularPuntosBatallaConTarjeta(personaje, oponente, attr, valBase) {
    let total = valBase;
    if (typeof tarjetasGuardadas === 'undefined') return total;
    
    let todasLasTarjetasEnJuego = [];
    manoUsuario.forEach(p => {
        const tarjetasP = tarjetasGuardadas.filter(t => t.propietarioId === p.id);
        todasLasTarjetasEnJuego.push(...tarjetasP.map(t => ({...t, bando: 'usuario'})));
    });
    manoRival.forEach(p => {
        const tarjetasP = tarjetasGuardadas.filter(t => t.propietarioId === p.id);
        todasLasTarjetasEnJuego.push(...tarjetasP.map(t => ({...t, bando: 'rival'})));
    });

    const bandoPersonaje = manoUsuario.includes(personaje) ? 'usuario' : 'rival';

    todasLasTarjetasEnJuego.forEach(tarjeta => {
        if (tarjeta.tipo === "Territorio" || tarjeta.tipo === "Campo De Fuerza") {
            if ((personaje.tipo || "").includes(tarjeta.tipoAfectado)) {
                if (tarjeta.tipo === "Campo De Fuerza" && tarjeta.bando !== bandoPersonaje) {
                    return; 
                }
                const efecto = tarjeta.efectos?.find(e => e.atributo && e.atributo.toLowerCase() === attr.toLowerCase());
                if (efecto) {
                    total += parseInt(efecto.modificacion) || 0;
                }
            }
        }
    });
    const tarjetas = tarjetasGuardadas.filter(t => {
        if (t.tipo === "Territorio" || t.tipo === "Campo De Fuerza" || TIPOS_EFECTOS_NO_EQUIPAMIENTO.includes(t.tipo)) return false;
        if (t.propietarioId === personaje.id) return true;
        if (["Aliado", "Rival", "Grupo", "Pareja", "Amor", "Odio"].includes(t.tipo) && t.vinculadosIds && t.vinculadosIds.includes(personaje.id)) {
            const tieneTarjetaPropia = tarjetasGuardadas.some(tp => tp.propietarioId === personaje.id && tp.tipo === t.tipo && tp.vinculadosIds && tp.vinculadosIds.includes(t.propietarioId));
            return !tieneTarjetaPropia;
        }
        return false;
    });

    tarjetas.forEach(tarjeta => {
        if (TIPOS_EQUIPAMIENTO_PERMANENTE.includes(tarjeta.tipo)) {
            total += calcularModificadorEquipamiento(tarjeta, personaje, oponente, attr, total);
        } else if (tarjeta.efectos && !["Aliado", "Rival", "Grupo", "Pareja", "Amor", "Odio"].includes(tarjeta.tipo)) {
            const efecto = tarjeta.efectos.find(e => e.atributo && e.atributo.toLowerCase() === attr.toLowerCase());
            if (efecto) {
                total += parseInt(efecto.modificacion) || 0;
            }
        }

       if (tarjeta.tipo === "Aliado" || tarjeta.tipo === "Rival") {
            let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
            let otraMano = bandoPersonaje === 'usuario' ? manoRival : manoUsuario;
            
            let involucrados = [tarjeta.propietarioId];
            if (tarjeta.vinculadosIds) {
                if (Array.isArray(tarjeta.vinculadosIds)) {
                    involucrados.push(...tarjeta.vinculadosIds);
                } else {
                    involucrados.push(tarjeta.vinculadosIds);
                }
            }
            let personajeB = involucrados.filter(id => id !== personaje.id);

            let bEnMismaMano = personajeB.some(vid => miMano.some(p => p.id === vid));
            let bEnOtraMano = personajeB.some(vid => otraMano.some(p => p.id === vid));

            let pts = parseInt(tarjeta.puntosVinculo || tarjeta.puntos) || 0;
            if (pts === 0 && tarjeta.efectos) {
                const ef = tarjeta.efectos.find(e => e.atributo && e.atributo.toLowerCase() === attr.toLowerCase());
                if (ef) pts = Math.abs(parseInt(ef.modificacion) || 0);
            }
            
            if (tarjeta.tipo === "Aliado") {
                if (bEnMismaMano) {
                    total += pts;
                }
                if (bEnOtraMano) {
                    total -= pts;
                }
            } else if (tarjeta.tipo === "Rival") {
                if (bEnMismaMano) {
                    total -= pts;
                }
                if (bEnOtraMano) {
                    total += pts;
                }
            }
        }
        if (tarjeta.tipo === "Pareja") {
            let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
            let otraMano = bandoPersonaje === 'usuario' ? manoRival : manoUsuario;
            
            let involucrados = [tarjeta.propietarioId];
            if (tarjeta.vinculadosIds) {
                if (Array.isArray(tarjeta.vinculadosIds)) {
                    involucrados.push(...tarjeta.vinculadosIds);
                } else {
                    involucrados.push(tarjeta.vinculadosIds);
                }
            }
            let otrosInvolucrados = involucrados.filter(id => id !== personaje.id);

            let cantidadMismaMano = otrosInvolucrados.filter(vid => miMano.some(p => p.id === vid)).length;
            let cantidadManoContraria = otrosInvolucrados.filter(vid => otraMano.some(p => p.id === vid)).length;

            let pts = parseInt(tarjeta.puntosVinculo || tarjeta.puntos) || 0;
            let sumaPuntos = (cantidadMismaMano - cantidadManoContraria) * pts;
            
            total += sumaPuntos;
        }

        if (tarjeta.tipo === "Grupo") {
            let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
            
            let involucrados = [tarjeta.propietarioId];
            if (tarjeta.vinculadosIds) {
                if (Array.isArray(tarjeta.vinculadosIds)) {
                    involucrados.push(...tarjeta.vinculadosIds);
                } else {
                    involucrados.push(tarjeta.vinculadosIds);
                }
            }

            let personajesEnMismaMano = involucrados.filter(vid => miMano.some(p => p.id === vid)).length;
            let pts = parseInt(tarjeta.puntosVinculo || tarjeta.puntos) || 0;
            
            total += (personajesEnMismaMano * pts);
        }

        if (tarjeta.tipo === "Amor") {
            let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
            let otraMano = bandoPersonaje === 'usuario' ? manoRival : manoUsuario;
            let vincIds = Array.isArray(tarjeta.vinculadosIds) ? tarjeta.vinculadosIds : [tarjeta.vinculadosIds];
            if (miMano.some(p => vincIds.includes(p.id))) {
                total += 25;
            } else if (otraMano.some(p => vincIds.includes(p.id))) {
                total -= 50;
            }
        }

        if (tarjeta.tipo === "Odio") {
            let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
            let otraMano = bandoPersonaje === 'usuario' ? manoRival : manoUsuario;
            let vincIds = Array.isArray(tarjeta.vinculadosIds) ? tarjeta.vinculadosIds : [tarjeta.vinculadosIds];
            if (miMano.some(p => vincIds.includes(p.id))) {
                total -= 10;
            } else if (otraMano.some(p => vincIds.includes(p.id))) {
                total += 60;
            }
        }

       if (tarjeta.tipo === "Miedo" && tarjeta.excepciones && tarjeta.excepciones.length > 0) {
            let miMano = bandoPersonaje === 'usuario' ? manoUsuario : manoRival;
            let otraMano = bandoPersonaje === 'usuario' ? manoRival : manoUsuario;
            
            tarjeta.excepciones.forEach(exc => {
                let aplica = false;
                let enPropia = miMano.some(p => (exc.personajeId && p.id === exc.personajeId) || (!exc.personajeId && exc.tipo && (p.tipo || "").includes(exc.tipo)));
                let enRival = otraMano.some(p => (exc.personajeId && p.id === exc.personajeId) || (!exc.personajeId && exc.tipo && (p.tipo || "").includes(exc.tipo)));
                
                if (enPropia || enRival) {
                    aplica = true;
                }

                if (aplica) {
                    if (exc.condicion === "Aumento") {
                        total += total * ((exc.porcentaje || 50) / 100);
                    } else if (exc.condicion === "Debilidad") {
                        total -= total * ((exc.porcentaje || 50) / 100);
                    } else if (exc.condicion === "Inmune") {
                        total += 999;
                    } else if (exc.condicion === "Destino") {
                        total *= 2; 
                    } else {
                        total -= total * 0.5;
                    }
                }
            });
        } else if (!TIPOS_EQUIPAMIENTO_PERMANENTE.includes(tarjeta.tipo) && tarjeta.excepciones && tarjeta.excepciones.length > 0 && oponente) {
            tarjeta.excepciones.forEach(exc => {
                let aplica = false;
                if (exc.personajeId && exc.personajeId === oponente.id) {
                    aplica = true;
                } else if (!exc.personajeId && exc.tipo && (oponente.tipo || "").includes(exc.tipo)) {
                    aplica = true;
                }

                if (aplica) {
                    if (exc.condicion === "Aumento") {
                        total += total * (exc.porcentaje / 100);
                    } else if (exc.condicion === "Debilidad") {
                        total -= total * (exc.porcentaje / 100);
                    } else if (exc.condicion === "Inmune") {
                        total += 999;
                    } else if (exc.condicion === "Destino") {
                        total *= 2; 
                    }
                }
            });
        }
    });

    if (personaje.consumibles) {
        personaje.consumibles.forEach(c => {
            if (c.atributo === attr.toLowerCase() && c.turnos > 0) {
                total += c.valor;
            }
        });
    }

    return Math.max(0, Math.round(total));
}
function ejecutarDuelo() {
    const btnDuelo = document.getElementById("btn-iniciar-duelo");
    btnDuelo.classList.add("brillando");
    
    asignarRivalAleatorio();

    if (typeof tarjetasGuardadas !== 'undefined') {
        ATRIBUTOS.forEach(attr => {
            let idxUsuario = asignacionesUsuario[attr];
            if (idxUsuario !== undefined && manoUsuario[idxUsuario] && manoRival) {
                let pUsuario = manoUsuario[idxUsuario];
                
                let tarjetaOdioUsu = tarjetasGuardadas.find(t => t.tipo === "Odio" && t.propietarioId === pUsuario.id);
                if (tarjetaOdioUsu && manoRival.some(r => tarjetaOdioUsu.vinculadosIds.includes(r.id))) {
                    let idxRivalCorrecto = manoRival.findIndex(r => tarjetaOdioUsu.vinculadosIds.includes(r.id));
                    let attrRival = Object.keys(asignacionesRival).find(k => asignacionesRival[k] === idxRivalCorrecto);
                    if (attrRival && attrRival !== attr) {
                        let temp = asignacionesRival[attr];
                        asignacionesRival[attr] = idxRivalCorrecto;
                        asignacionesRival[attrRival] = temp;
                    }
                }
                
                let rivalQueOdia = manoRival.find(r => tarjetasGuardadas.some(t => t.tipo === "Odio" && t.propietarioId === r.id && t.vinculadosIds.includes(pUsuario.id)));
                if (rivalQueOdia) {
                    let idxRivalCorrecto = manoRival.findIndex(r => r.id === rivalQueOdia.id);
                    let attrRival = Object.keys(asignacionesRival).find(k => asignacionesRival[k] === idxRivalCorrecto);
                    if (attrRival && attrRival !== attr) {
                        let temp = asignacionesRival[attr];
                        asignacionesRival[attr] = idxRivalCorrecto;
                        asignacionesRival[attrRival] = temp;
                    }
                }
            }
        });
    }
    
    setTimeout(() => {
        let cartasAEliminarUsuario = [];
        let cartasAEliminarRival = [];
        let historialRonda = "";

        const calcularYAsignarDaño = (personaje, attr, valTotal, daño) => {
            let yOld = 0;
            let cons = null;
            if (personaje.consumibles) {
                cons = personaje.consumibles.find(c => c.atributo === attr && c.turnos > 0);
                if (cons) yOld = cons.valor;
            }
            
            let yNew = yOld;
            let dañoRestante = daño;
            
            if (dañoRestante <= yOld) {
                yNew = yOld - dañoRestante;
                dañoRestante = 0;
            } else {
                dañoRestante -= yOld;
                yNew = 0;
            }
            
            if (cons) cons.valor = yNew;
            
            let baseOld = (personaje.atributos && personaje.atributos[attr]) ? personaje.atributos[attr] : 0;
            let newBase = baseOld - daño + (yOld - yNew);
            
            personaje.atributos[attr] = Math.max(0, newBase);
            return Math.max(0, valTotal - daño);
        };
        
        ATRIBUTOS.forEach(attr => {
            let idxUsuario = asignacionesUsuario[attr];
            let idxRival = asignacionesRival[attr];
            
            let pUsuario = manoUsuario[idxUsuario];
            let pRival = manoRival[idxRival];
            
            if (estadisticasBatallaPrincipales[pUsuario.id]) {
                estadisticasBatallaPrincipales[pUsuario.id].duelos = (estadisticasBatallaPrincipales[pUsuario.id].duelos || 0) + 1;
            }
            
            let valBaseUsuario = (pUsuario.atributos && pUsuario.atributos[attr]) ? getStatInfo(attr, pUsuario.atributos[attr]).statValue : 0;
            let valBaseRival = (pRival.atributos && pRival.atributos[attr]) ? getStatInfo(attr, pRival.atributos[attr]).statValue : 0;
            
            let valUsuario = calcularPuntosBatallaConTarjeta(pUsuario, pRival, attr, valBaseUsuario);
            let valRival = calcularPuntosBatallaConTarjeta(pRival, pUsuario, attr, valBaseRival);
            
            let sonPareja = false;
            if (typeof tarjetasGuardadas !== 'undefined') {
                sonPareja = tarjetasGuardadas.some(t => 
                    t.tipo === "Pareja" && 
                    ((t.propietarioId === pUsuario.id && t.vinculadosIds.includes(pRival.id)) || 
                     (t.propietarioId === pRival.id && t.vinculadosIds.includes(pUsuario.id)))
                );
                
                let amaARival = tarjetasGuardadas.some(t => t.tipo === "Amor" && t.propietarioId === pUsuario.id && t.vinculadosIds.includes(pRival.id));
                if (amaARival) valUsuario = 0;
                
                let rivalAmaAUsuario = tarjetasGuardadas.some(t => t.tipo === "Amor" && t.propietarioId === pRival.id && t.vinculadosIds.includes(pUsuario.id));
                if (rivalAmaAUsuario) valRival = 0;
            }
            
            let ganador, perdedor, puntosRestantes;
            
            if (!sonPareja && valUsuario > valRival) {
                let salvadorIdx = manoRival.findIndex(r => tarjetasGuardadas.some(t => t.tipo === "Amor" && t.propietarioId === r.id && t.vinculadosIds.includes(pRival.id)));
                if (salvadorIdx !== -1) {
                    cartasAEliminarRival.push(salvadorIdx);
                    historialRonda += `<p style="margin-bottom: 8px; color: #ff88ff;"><strong>SACRIFICIO POR AMOR:</strong> ${pRival.nombre} iba a ser eliminado en la categoría ${attr.toUpperCase()}, pero ${manoRival[salvadorIdx].nombre} se descartó en su lugar para salvarlo.</p>`;
                } else {
                    cartasAEliminarRival.push(idxRival);
                }
                
                puntosRestantes = calcularYAsignarDaño(pUsuario, attr, valUsuario, valRival);
                ganador = pUsuario.nombre;
                perdedor = pRival.nombre;
                
                if (estadisticasBatallaPrincipales[pUsuario.id]) {
                    estadisticasBatallaPrincipales[pUsuario.id].historialDuelos.push(true);
                }
historialRonda += `<p style="margin-bottom: 8px;"><strong>${attr.toUpperCase()}:</strong> ${pUsuario.nombre} con ${valUsuario} puntos se enfrentó a ${pRival.nombre} con ${valRival} puntos. El ganador fue ${ganador} y quedó con ${puntosRestantes} puntos de ${attr}. El personaje ${perdedor} quedó eliminado de la batalla.</p>`;            } else if (!sonPareja && valRival > valUsuario) {
                let salvadorIdx = manoUsuario.findIndex(u => tarjetasGuardadas.some(t => t.tipo === "Amor" && t.propietarioId === u.id && t.vinculadosIds.includes(pUsuario.id)));
                if (salvadorIdx !== -1) {
                    cartasAEliminarUsuario.push(salvadorIdx);
                    historialRonda += `<p style="margin-bottom: 8px; color: #ff88ff;"><strong>SACRIFICIO POR AMOR:</strong> ${pUsuario.nombre} iba a ser eliminado en la categoría ${attr.toUpperCase()}, pero ${manoUsuario[salvadorIdx].nombre} se descartó en su lugar para salvarlo.</p>`;
                } else {
                    cartasAEliminarUsuario.push(idxUsuario);
                }

                puntosRestantes = calcularYAsignarDaño(pRival, attr, valRival, valUsuario);
                ganador = pRival.nombre;
                perdedor = pUsuario.nombre;
                
                if (estadisticasBatallaPrincipales[pUsuario.id]) {
                    estadisticasBatallaPrincipales[pUsuario.id].historialDuelos.push(false);
                }
historialRonda += `<p style="margin-bottom: 8px;"><strong>${attr.toUpperCase()}:</strong> ${pUsuario.nombre} con ${valUsuario} puntos se enfrentó a ${pRival.nombre} con ${valRival} puntos. El ganador fue ${ganador} y quedó con ${puntosRestantes} puntos de ${attr}. El personaje ${perdedor} quedó eliminado de la batalla.</p>`;            } else {
                let ptsUsu = calcularYAsignarDaño(pUsuario, attr, valUsuario, Math.round(valUsuario / 2));
                let ptsRiv = calcularYAsignarDaño(pRival, attr, valRival, Math.round(valRival / 2));
                
                if (sonPareja) {
                    historialRonda += `<p style="margin-bottom: 8px; color: #ff88ff;"><strong>${attr.toUpperCase()}:</strong> ${pUsuario.nombre} y ${pRival.nombre} se encontraron en duelo, pero al ser <strong>PAREJA</strong> se niegan a lastimarse mutuamente. ¡El duelo es un EMPATE automático! Ninguno se hace daño fatal y reducen su atributo a la mitad (${ptsUsu} puntos).</p>`;
                } else {
                    historialRonda += `<p style="margin-bottom: 8px;"><strong>${attr.toUpperCase()}:</strong> ${pUsuario.nombre} con ${valUsuario} puntos se enfrentó a ${pRival.nombre} con ${valRival} puntos. ¡Fue un EMPATE! Ambos personajes redujeron su atributo a la mitad (${ptsUsu} puntos) y continúan en la batalla.</p>`;
                }
            }
        });
        
        document.getElementById("sector-b2").innerHTML = `<div style="padding: 15px; overflow-y: auto; height: 100%; box-sizing: border-box; font-size: 13px; text-align: left; width: 100%;">
            <h3 style="margin-bottom: 10px; color: #88c0d0; text-align: center;">Historial de Duelos</h3>
            ${historialRonda}
        </div>`;
        
        cartasAEliminarUsuario = [...new Set(cartasAEliminarUsuario)];
        cartasAEliminarRival = [...new Set(cartasAEliminarRival)];
        
        cartasAEliminarUsuario.sort((a,b)=>b-a).forEach(idx => manoUsuario.splice(idx, 1));
        cartasAEliminarRival.sort((a,b)=>b-a).forEach(idx => manoRival.splice(idx, 1));

        manoUsuario.forEach(p => {
            if (p.consumibles) p.consumibles.forEach(c => { if (c.turnos > 0) c.turnos--; });
        });
        manoRival.forEach(p => {
            if (p.consumibles) p.consumibles.forEach(c => { if (c.turnos > 0) c.turnos--; });
        });
        
        setTimeout(() => {
            btnDuelo.classList.remove("brillando");
            repartirCartas();
        }, 1500);
        
    }, 500);
}
// --- SISTEMA DE EVOLUCIÓN ---
function getStatInfo(nombreAttr, P) {
    P = Math.max(0, P || 0);
    let ciclo = Math.floor(P / 110);
    let offset = P % 110;
    
    if (P > 0 && offset === 0) {
        ciclo -= 1;
        offset = 110;
    }

    let nivel = ciclo + 1;
    let esEv = offset > 100;
    let evValue = esEv ? (offset - 100) : 0;
    let statValue = esEv ? (ciclo * 100 + 100) : (ciclo * 100 + offset);

    let nombreBase = nombreAttr.charAt(0).toUpperCase() + nombreAttr.slice(1);
    let nombreDisplay = esEv ? `${nombreBase} Ev.` : nombreBase;

    return {
        nivel: nivel,
        statValue: statValue,
        evValue: evValue,
        esEv: esEv,
        nombreDisplay: nombreDisplay,
        valorDisplay: esEv ? `${evValue}/10` : statValue
    };
}

function puedeIncrementarAtributo(attr, atributos) {
    const info = getStatInfo(attr, atributos[attr] || 0);
    if (info.esEv || (info.statValue % 100 === 0 && info.statValue > 0)) {
        const N = info.statValue / 100;
        const umbralMinimo = (N - 1) * 100;
        
        const listaAtributos = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];
        for (let clave of listaAtributos) {
            if (clave !== attr) {
                const infoOtro = getStatInfo(clave, atributos[clave] || 0);
                if (infoOtro.statValue < umbralMinimo) {
                    return false;
                }
            }
        }
    }
    return true;
}
let personajeEnEvolucion = null;
let posRestantes = 0;
let negRestantes = 0;
let atributosEvol = {};
let posAsignados = {};
let negAsignados = {};

function abrirModalEvolucion(idPersonaje) {
    document.getElementById("modal-personaje").style.display = "none";
    personajeEnEvolucion = personajes.find(p => p.id === idPersonaje);
    if (!personajeEnEvolucion) return;

    posRestantes = personajeEnEvolucion.puntosPositivos || 0;
    negRestantes = personajeEnEvolucion.puntosNegativos || 0;
    atributosEvol = { ...(personajeEnEvolucion.atributos || { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 }) };
    
    posAsignados = { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 };
    negAsignados = { fuerza: 0, inteligencia: 0, velocidad: 0, magia: 0, defensa: 0 };

    renderizarEvolucion();
    document.getElementById("modal-evolucion").style.display = "block";
}

function renderizarEvolucion() {
    const contenedor = document.getElementById("contenido-evolucion");
    if (!contenedor) return;

    const listaAtributos = ["fuerza", "inteligencia", "velocidad", "magia", "defensa"];

    let html = `
        <h2 style="color: #ffcc00; margin-bottom: 15px; text-align: center;">Evolución de ${personajeEnEvolucion.nombre}</h2>
        <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; margin-bottom: 20px; display: flex; justify-content: space-around;">
            <p><span style="color: #88ff88; font-weight: bold;">Puntos Positivos Restantes:</span> ${posRestantes}</p>
            <p><span style="color: #ff8888; font-weight: bold;">Puntos Negativos a Restar:</span> ${negRestantes}</p>
        </div>
        <div class="contenedor-atributos-evolucion">
    `;

    listaAtributos.forEach(attr => {
        const valActual = atributosEvol[attr] || 0;
        const info = getStatInfo(attr, valActual);
        const pos = posAsignados[attr] || 0;
        const neg = negAsignados[attr] || 0;
        const puedeIncrementar = puedeIncrementarAtributo(attr, atributosEvol);
        const estancado = !puedeIncrementar && (info.esEv || (info.statValue % 100 === 0 && info.statValue > 0));

        html += `
            <div class="fila-atributo-evol">
                <span class="nombre-attr-evol ${info.esEv ? 'texto-dorado' : ''}">
                    ${info.nombreDisplay.toUpperCase()}: ${info.valorDisplay} ${estancado ? '<span style="color:#ff4444; font-size:10px;">(ESTANCADO)</span>' : ''}
                </span>
                <div class="controles-attr-evol">
                    <span style="color: #88ff88; font-size: 12px;">(+${pos})</span>
                    <button class="btn-evol-puntos" onclick="modificarPuntoEvol('${attr}', 'pos', 1)" ${posRestantes <= 0 || !puedeIncrementar ? 'disabled' : ''}>+ Positivo</button>
                    <button class="btn-evol-puntos" onclick="modificarPuntoEvol('${attr}', 'pos', -1)" ${pos <= 0 ? 'disabled' : ''}>- Deshacer</button>
                    
                    <span style="color: #ff8888; font-size: 12px; margin-left: 10px;">(-${neg})</span>
                    <button class="btn-evol-puntos neg" onclick="modificarPuntoEvol('${attr}', 'neg', 1)" ${negRestantes <= 0 || valActual <= 0 ? 'disabled' : ''}>- Restar Atributo</button>
                    <button class="btn-evol-puntos neg" onclick="modificarPuntoEvol('${attr}', 'neg', -1)" ${neg <= 0 ? 'disabled' : ''}>+ Deshacer</button>
                </div>
            </div>
        `;
    });

    const listoParaGuardar = (posRestantes === 0 && negRestantes === 0);

    html += `
        </div>
        <button id="btn-guardar-evolucion" onclick="guardarEvolucion()" ${!listoParaGuardar ? 'disabled' : ''} class="${listoParaGuardar ? 'activo' : ''}">GUARDAR EVOLUCIÓN</button>
    `;

    contenedor.innerHTML = html;
}

function modificarPuntoEvol(attr, tipo, delta) {
    if (tipo === 'pos') {
        if (delta > 0 && posRestantes > 0) {
            if (!puedeIncrementarAtributo(attr, atributosEvol)) return;
            posRestantes--;
            posAsignados[attr]++;
            atributosEvol[attr]++;
        } else if (delta < 0 && posAsignados[attr] > 0) {
            posRestantes++;
            posAsignados[attr]--;
            atributosEvol[attr]--;
        }
    } else if (tipo === 'neg') {
        if (delta > 0 && negRestantes > 0 && atributosEvol[attr] > 0) {
            negRestantes--;
            negAsignados[attr]++;
            atributosEvol[attr]--;
        } else if (delta < 0 && negAsignados[attr] > 0) {
            negRestantes++;
            negAsignados[attr]--;
            atributosEvol[attr]++;
        }
    }
    renderizarEvolucion();
}

function guardarEvolucion() {
    if (posRestantes !== 0 || negRestantes !== 0) return;

    personajeEnEvolucion.atributos = { ...atributosEvol };
    personajeEnEvolucion.puntosPositivos = 0;
    personajeEnEvolucion.puntosNegativos = 0;

    const blob = new Blob([JSON.stringify(personajes, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = "personajes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    document.getElementById("modal-evolucion").style.display = "none";

    const ventanas = document.querySelectorAll(".contenidos section");
    ventanas.forEach(v => v.style.display = "none");
    document.getElementById("galeria").style.display = "block";
    mostrarPersonajes(personajes);
}

function cerrarModalEvolucion() {
    document.getElementById("modal-evolucion").style.display = "none";
}
let idPropietarioTarjetaActual = null;

function abrirModalTarjetaHistoria(idPersonaje) {
    idPropietarioTarjetaActual = idPersonaje;
    document.getElementById("modal-personaje").style.display = "none";
    document.getElementById("modal-tarjeta-historia").style.display = "block";
}

function cerrarModalTarjetaHistoria() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
}
function abrirFormularioArma() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-arma").style.display = "block";
    document.getElementById("lista-efectos-arma").innerHTML = "";
    document.getElementById("lista-excepciones-arma").innerHTML = "";
    document.getElementById("arma-nombre").value = "";
    document.getElementById("arma-descripcion").value = "";
}

function cerrarFormularioArma() {
    document.getElementById("modal-formulario-arma").style.display = "none";
}

let contadorEfectosArma = 0;
function agregarEfectoArma() {
    contadorEfectosArma++;
    const div = document.createElement("div");
    div.className = "item-efecto";
    div.innerHTML = `
        <select class="efecto-atributo">
            <option value="fuerza">Fuerza</option>
            <option value="inteligencia">Inteligencia</option>
            <option value="magia">Magia</option>
            <option value="velocidad">Velocidad</option>
            <option value="defensa">Defensa</option>
        </select>
        <input type="number" class="efecto-valor" placeholder="+/- Puntos">
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-efectos-arma").appendChild(div);
}

let contadorExcepcionesArma = 0;
function agregarExcepcionArma() {
    contadorExcepcionesArma++;
    const tiposDisponibles = [...new Set(personajes.flatMap(p => (p.tipo || "").split(',').map(t => t.trim())))];
    
    const div = document.createElement("div");
    div.className = "item-excepcion";
    
    let opcionesTipos = `<option value="">Selecciona un Tipo</option>` + tiposDisponibles.map(t => `<option value="${t}">${t}</option>`).join('');
    
    div.innerHTML = `
        <select class="exc-tipo" onchange="actualizarPersonajesExcepcion(this, ${contadorExcepcionesArma})">
            ${opcionesTipos}
        </select>
        <select class="exc-personaje" id="exc-pers-${contadorExcepcionesArma}">
            <option value="">Aplicar a todos del tipo</option>
        </select>
        <select class="exc-condicion" onchange="actualizarInputCondicion(this, ${contadorExcepcionesArma})">
            <option value="Inmune">Inmune</option>
            <option value="Destino">Destino</option>
            <option value="Aumento">Aumento</option>
            <option value="Debilidad">Debilidad</option>
        </select>
        <span id="exc-val-container-${contadorExcepcionesArma}" style="display:none;">
            <input type="number" class="exc-porcentaje" placeholder="%">
        </span>
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-excepciones-arma").appendChild(div);
}

function actualizarPersonajesExcepcion(selectTipo, id) {
    const tipoSel = selectTipo.value;
    const selectPers = document.getElementById(`exc-pers-${id}`);
    selectPers.innerHTML = `<option value="">Aplicar a todos del tipo</option>`;
    if (tipoSel) {
        const persFiltrados = personajes.filter(p => (p.tipo || "").includes(tipoSel));
        persFiltrados.forEach(p => {
            selectPers.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
        });
    }
}

function actualizarInputCondicion(selectCond, id) {
    const valCont = document.getElementById(`exc-val-container-${id}`);
    if (selectCond.value === "Aumento" || selectCond.value === "Debilidad") {
        valCont.style.display = "inline-block";
    } else {
        valCont.style.display = "none";
        valCont.querySelector('.exc-porcentaje').value = "";
    }
}

async function guardarTarjetaArma() {
    const nombre = document.getElementById("arma-nombre").value;
    const desc = document.getElementById("arma-descripcion").value;
    
    if (!nombre) { alert("¡Debe incluir un nombre para el Arma!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    
    const efectos = Array.from(document.getElementById("lista-efectos-arma").children).map(div => ({
        atributo: div.querySelector('.efecto-atributo').value,
        modificacion: parseInt(div.querySelector('.efecto-valor').value) || 0
    }));
    
    const excepciones = Array.from(document.getElementById("lista-excepciones-arma").children).map(div => ({
        tipo: div.querySelector('.exc-tipo').value,
        personajeId: div.querySelector('.exc-personaje').value,
        condicion: div.querySelector('.exc-condicion').value,
        porcentaje: parseInt(div.querySelector('.exc-porcentaje')?.value) || 0
    }));
    
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Arma",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: rutaImagen,
        efectos: efectos,
        excepciones: excepciones
    };
    
    let tarjetasRegistradas = [];
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasRegistradas = await respuesta.json();
        }
    } catch(error) {
        console.warn("No se encontró tarjeta.json previo, se generará uno nuevo.");
    }
    
    tarjetasRegistradas.push(nuevaTarjeta);
    
    const blob = new Blob([JSON.stringify(tarjetasRegistradas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cerrarFormularioArma();
    alert("¡Tarjeta guardada y descargada exitosamente!");
    abrirEditorHistoria();
}
function abrirFormularioConsumible() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-consumible").style.display = "block";
    document.getElementById("lista-efectos-consumible").innerHTML = "";
    document.getElementById("consumible-nombre").value = "";
    document.getElementById("consumible-descripcion").value = "";
    document.getElementById("consumible-turnos").value = "";
}

function cerrarFormularioConsumible() {
    document.getElementById("modal-formulario-consumible").style.display = "none";
}

let contadorEfectosConsumible = 0;
function agregarEfectoConsumible() {
    contadorEfectosConsumible++;
    const div = document.createElement("div");
    div.className = "item-efecto";
    div.innerHTML = `
        <select class="efecto-atributo">
            <option value="fuerza">Fuerza</option>
            <option value="inteligencia">Inteligencia</option>
            <option value="magia">Magia</option>
            <option value="velocidad">Velocidad</option>
            <option value="defensa">Defensa</option>
        </select>
        <input type="number" class="efecto-valor" placeholder="+/- Puntos">
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-efectos-consumible").appendChild(div);
}

async function guardarTarjetaConsumible() {
    const nombre = document.getElementById("consumible-nombre").value;
    const desc = document.getElementById("consumible-descripcion").value;
    const turnos = parseInt(document.getElementById("consumible-turnos").value);
    
    if (!nombre) { alert("¡Debe incluir un nombre para el Consumible!"); return; }
    if (isNaN(turnos) || turnos < 1 || turnos > 3) { alert("¡El tiempo del efecto debe ser un número entre 1 y 3!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    
    const efectos = Array.from(document.getElementById("lista-efectos-consumible").children).map(div => ({
        atributo: div.querySelector('.efecto-atributo').value,
        modificacion: parseInt(div.querySelector('.efecto-valor').value) || 0
    }));
    
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Consumible",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: rutaImagen,
        turnos: turnos,
        efectos: efectos
    };
    
    let tarjetasRegistradas = [];
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasRegistradas = await respuesta.json();
        }
    } catch(error) {
        console.warn("No se encontró tarjeta.json previo, se generará uno nuevo.");
    }
    
    tarjetasRegistradas.push(nuevaTarjeta);
    
    const blob = new Blob([JSON.stringify(tarjetasRegistradas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cerrarFormularioConsumible();
    alert("¡Tarjeta Consumible guardada y descargada exitosamente!");
    abrirEditorHistoria();
}
function abrirFormularioArmadura() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-armadura").style.display = "block";
    document.getElementById("lista-efectos-armadura").innerHTML = "";
    document.getElementById("lista-excepciones-armadura").innerHTML = "";
    document.getElementById("armadura-nombre").value = "";
    document.getElementById("armadura-descripcion").value = "";
    contadorEfectosArmadura = 0;
    contadorExcepcionesArmadura = 0;
    agregarEfectoArmadura(true);
}

function cerrarFormularioArmadura() {
    document.getElementById("modal-formulario-armadura").style.display = "none";
}

let contadorEfectosArmadura = 0;
function agregarEfectoArmadura(esPrincipal = false) {
    contadorEfectosArmadura++;
    const div = document.createElement("div");
    div.className = "item-efecto";
    
    if (esPrincipal === true) {
        div.innerHTML = `
            <select class="efecto-atributo" disabled style="opacity: 1; -webkit-text-fill-color: white;">
                <option value="defensa" selected>Defensa</option>
            </select>
            <input type="number" class="efecto-valor" placeholder="+ Puntos">
            <button type="button" style="visibility: hidden;">X</button>
        `;
    } else {
        div.innerHTML = `
            <select class="efecto-atributo">
                <option value="fuerza">Fuerza</option>
                <option value="inteligencia">Inteligencia</option>
                <option value="magia">Magia</option>
                <option value="velocidad">Velocidad</option>
            </select>
            <input type="number" class="efecto-valor" placeholder="- Puntos" max="-1" onchange="if(this.value >= 0) { alert('El valor debe ser negativo'); this.value = -1; }">
            <button type="button" onclick="this.parentElement.remove()">X</button>
        `;
    }
    document.getElementById("lista-efectos-armadura").appendChild(div);
}

let contadorExcepcionesArmadura = 0;
function agregarExcepcionArmadura() {
    contadorExcepcionesArmadura++;
    const tiposDisponibles = [...new Set(personajes.flatMap(p => (p.tipo || "").split(',').map(t => t.trim())))];
    
    const div = document.createElement("div");
    div.className = "item-excepcion";
    
    let opcionesTipos = `<option value="">Selecciona un Tipo</option>` + tiposDisponibles.map(t => `<option value="${t}">${t}</option>`).join('');
    
    div.innerHTML = `
        <select class="exc-tipo" onchange="actualizarPersonajesExcepcion(this, 'armadura-${contadorExcepcionesArmadura}')">
            ${opcionesTipos}
        </select>
        <select class="exc-personaje" id="exc-pers-armadura-${contadorExcepcionesArmadura}">
            <option value="">Aplicar a todos del tipo</option>
        </select>
        <select class="exc-condicion" onchange="actualizarInputCondicion(this, 'armadura-${contadorExcepcionesArmadura}')">
            <option value="Inmune">Inmune</option>
            <option value="Destino">Destino</option>
            <option value="Aumento">Aumento</option>
            <option value="Debilidad">Debilidad</option>
        </select>
        <span id="exc-val-container-armadura-${contadorExcepcionesArmadura}" style="display:none;">
            <input type="number" class="exc-porcentaje" placeholder="%">
        </span>
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-excepciones-armadura").appendChild(div);
}

async function guardarTarjetaArmadura() {
    const nombre = document.getElementById("armadura-nombre").value;
    const desc = document.getElementById("armadura-descripcion").value;
    
    if (!nombre) { alert("¡Debe incluir un nombre para la Armadura!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    
    const efectos = Array.from(document.getElementById("lista-efectos-armadura").children).map(div => {
        const select = div.querySelector('.efecto-atributo');
        const atributo = select.disabled ? "defensa" : select.value;
        let modificacion = parseInt(div.querySelector('.efecto-valor').value) || 0;
        
        if (atributo !== "defensa" && modificacion > 0) {
            modificacion = -modificacion;
        }
        
        return {
            atributo: atributo,
            modificacion: modificacion
        };
    });
    
    const excepciones = Array.from(document.getElementById("lista-excepciones-armadura").children).map(div => ({
        tipo: div.querySelector('.exc-tipo').value,
        personajeId: div.querySelector('.exc-personaje').value,
        condicion: div.querySelector('.exc-condicion').value,
        porcentaje: parseInt(div.querySelector('.exc-porcentaje')?.value) || 0
    }));
    
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Armadura",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: rutaImagen,
        efectos: efectos,
        excepciones: excepciones
    };
    
    let tarjetasRegistradas = [];
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasRegistradas = await respuesta.json();
        }
    } catch(error) {
        console.warn("No se encontró tarjeta.json previo, se generará uno nuevo.");
    }
    
    tarjetasRegistradas.push(nuevaTarjeta);
    
    const blob = new Blob([JSON.stringify(tarjetasRegistradas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cerrarFormularioArmadura();
    alert("¡Tarjeta guardada y descargada exitosamente!");
    abrirEditorHistoria();
}
function abrirFormularioReliquia() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-reliquia").style.display = "block";
    document.getElementById("lista-efectos-reliquia").innerHTML = "";
    document.getElementById("lista-excepciones-reliquia").innerHTML = "";
    document.getElementById("reliquia-nombre").value = "";
    document.getElementById("reliquia-descripcion").value = "";
}

function cerrarFormularioReliquia() {
    document.getElementById("modal-formulario-reliquia").style.display = "none";
}

let contadorEfectosReliquia = 0;
function agregarEfectoReliquia() {
    contadorEfectosReliquia++;
    const div = document.createElement("div");
    div.className = "item-efecto";
    div.innerHTML = `
        <select class="efecto-atributo">
            <option value="fuerza">Fuerza</option>
            <option value="inteligencia">Inteligencia</option>
            <option value="magia">Magia</option>
            <option value="velocidad">Velocidad</option>
            <option value="defensa">Defensa</option>
        </select>
        <input type="number" class="efecto-valor" placeholder="+/- Puntos">
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-efectos-reliquia").appendChild(div);
}

let contadorExcepcionesReliquia = 0;
function agregarExcepcionReliquia() {
    contadorExcepcionesReliquia++;
    const tiposDisponibles = [...new Set(personajes.flatMap(p => (p.tipo || "").split(',').map(t => t.trim())))];
    
    const div = document.createElement("div");
    div.className = "item-excepcion";
    
    let opcionesTipos = `<option value="">Selecciona un Tipo</option>` + tiposDisponibles.map(t => `<option value="${t}">${t}</option>`).join('');
    
    div.innerHTML = `
        <select class="exc-tipo" onchange="actualizarPersonajesExcepcion(this, 'reliquia-${contadorExcepcionesReliquia}')">
            ${opcionesTipos}
        </select>
        <select class="exc-personaje" id="exc-pers-reliquia-${contadorExcepcionesReliquia}">
            <option value="">Aplicar a todos del tipo</option>
        </select>
        <select class="exc-condicion" onchange="actualizarInputCondicion(this, 'reliquia-${contadorExcepcionesReliquia}')">
            <option value="Inmune">Inmune</option>
            <option value="Destino">Destino</option>
            <option value="Aumento">Aumento</option>
            <option value="Debilidad">Debilidad</option>
        </select>
        <span id="exc-val-container-reliquia-${contadorExcepcionesReliquia}" style="display:none;">
            <input type="number" class="exc-porcentaje" placeholder="%">
        </span>
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-excepciones-reliquia").appendChild(div);
}

async function guardarTarjetaReliquia() {
    const nombre = document.getElementById("reliquia-nombre").value;
    const desc = document.getElementById("reliquia-descripcion").value;
    
    if (!nombre) { alert("¡Debe incluir un nombre para la Reliquia!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    
    const efectos = Array.from(document.getElementById("lista-efectos-reliquia").children).map(div => ({
        atributo: div.querySelector('.efecto-atributo').value,
        modificacion: parseInt(div.querySelector('.efecto-valor').value) || 0
    }));
    
    const excepciones = Array.from(document.getElementById("lista-excepciones-reliquia").children).map(div => ({
        tipo: div.querySelector('.exc-tipo').value,
        personajeId: div.querySelector('.exc-personaje').value,
        condicion: div.querySelector('.exc-condicion').value,
        porcentaje: parseInt(div.querySelector('.exc-porcentaje')?.value) || 0
    }));
    
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Reliquia",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: rutaImagen,
        efectos: efectos,
        excepciones: excepciones
    };
    
    let tarjetasRegistradas = [];
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasRegistradas = await respuesta.json();
        }
    } catch(error) {
        console.warn("No se encontró tarjeta.json previo, se generará uno nuevo.");
    }
    
    tarjetasRegistradas.push(nuevaTarjeta);
    
    const blob = new Blob([JSON.stringify(tarjetasRegistradas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cerrarFormularioReliquia();
    alert("¡Tarjeta guardada y descargada exitosamente!");
    abrirEditorHistoria();
}

function abrirFormularioMontura() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-montura").style.display = "block";
    document.getElementById("lista-efectos-montura").innerHTML = "";
    document.getElementById("lista-excepciones-montura").innerHTML = "";
    document.getElementById("montura-nombre").value = "";
    document.getElementById("montura-descripcion").value = "";
    contadorEfectosMontura = 0;
    contadorExcepcionesMontura = 0;
    agregarEfectoMontura(true);
}

function cerrarFormularioMontura() {
    document.getElementById("modal-formulario-montura").style.display = "none";
}

let contadorEfectosMontura = 0;
function agregarEfectoMontura(esPrincipal = false) {
    contadorEfectosMontura++;
    const div = document.createElement("div");
    div.className = "item-efecto";
    
    if (esPrincipal === true) {
        div.innerHTML = `
            <select class="efecto-atributo" disabled style="opacity: 1; -webkit-text-fill-color: white;">
                <option value="velocidad" selected>Velocidad</option>
            </select>
            <input type="number" class="efecto-valor" placeholder="+ Puntos">
            <button type="button" style="visibility: hidden;">X</button>
        `;
    } else {
        div.innerHTML = `
            <select class="efecto-atributo">
                <option value="fuerza">Fuerza</option>
                <option value="inteligencia">Inteligencia</option>
                <option value="magia">Magia</option>
                <option value="defensa">Defensa</option>
            </select>
            <input type="number" class="efecto-valor" placeholder="- Puntos" max="-1" onchange="if(this.value >= 0) { alert('El valor debe ser negativo'); this.value = -1; }">
            <button type="button" onclick="this.parentElement.remove()">X</button>
        `;
    }
    document.getElementById("lista-efectos-montura").appendChild(div);
}
async function guardarYDescargarGenerico(nuevaTarjeta, callbackCerrar, tipoNombre) {
    let tarjetasRegistradas = [];
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasRegistradas = await respuesta.json();
        }
    } catch(error) {
        console.warn("No se encontró tarjeta.json previo, se generará uno nuevo.");
    }
    
    tarjetasRegistradas.push(nuevaTarjeta);
    
    const blob = new Blob([JSON.stringify(tarjetasRegistradas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    callbackCerrar();
    alert(`¡Tarjeta de ${tipoNombre} guardada y descargada exitosamente!`);
    abrirEditorHistoria();
}

// FORMULARIO DE MIEDO
function abrirFormularioMiedo() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-miedo").style.display = "block";
    document.getElementById("miedo-nombre").value = "";
    document.getElementById("miedo-descripcion").value = "";
    
    const selectTipo = document.getElementById("miedo-tipo-afectado");
    const tiposDisponibles = [...new Set(personajes.flatMap(p => (p.tipo || "").split(',').map(t => t.trim())))];
    selectTipo.innerHTML = `<option value="">Selecciona un Tipo</option>` + tiposDisponibles.map(t => `<option value="${t}">${t}</option>`).join('');
    actualizarPersonajesMiedo();
}

function cerrarFormularioMiedo() {
    document.getElementById("modal-formulario-miedo").style.display = "none";
}

function actualizarPersonajesMiedo() {
    const tipoSel = document.getElementById("miedo-tipo-afectado").value;
    const selectPers = document.getElementById("miedo-personaje");
    selectPers.innerHTML = `<option value="">Cualquiera del tipo seleccionado</option>`;
    if (tipoSel) {
        const persFiltrados = personajes.filter(p => (p.tipo || "").includes(tipoSel));
        persFiltrados.forEach(p => {
            selectPers.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
        });
    }
}

async function guardarTarjetaMiedo() {
    const nombre = document.getElementById("miedo-nombre").value;
    const desc = document.getElementById("miedo-descripcion").value;
    const tipoAfectado = document.getElementById("miedo-tipo-afectado").value;
    const personajeId = document.getElementById("miedo-personaje").value;
    
    if (!nombre) { alert("¡Debe incluir un nombre para la tarjeta de Miedo!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Miedo",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: `Tarjetas/${nombreLimpio}.jpg`,
        condicionRival: { tipo: tipoAfectado, personajeId: personajeId },
        efectos: [{ atributo: "inteligencia", modificacion: 1, esFijo: true }] // La inteligencia baja a 1
    };
    
    guardarYDescargarGenerico(nuevaTarjeta, cerrarFormularioMiedo, "Miedo");
}

// FORMULARIO DE DEBILIDAD
let contadorCondicionesDebilidad = 0;
function abrirFormularioDebilidad() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-debilidad").style.display = "block";
    document.getElementById("debilidad-nombre").value = "";
    document.getElementById("debilidad-descripcion").value = "";
    document.getElementById("lista-condiciones-debilidad").innerHTML = "";
    document.getElementById("lista-efectos-debilidad").innerHTML = "";
    contadorCondicionesDebilidad = 0;
    agregarCondicionDebilidad();
}

function cerrarFormularioDebilidad() {
    document.getElementById("modal-formulario-debilidad").style.display = "none";
}

function agregarCondicionDebilidad() {
    contadorCondicionesDebilidad++;
    const tiposDisponibles = [...new Set(personajes.flatMap(p => (p.tipo || "").split(',').map(t => t.trim())))];
    const div = document.createElement("div");
    div.className = "item-excepcion";
    let opcionesTipos = `<option value="">Selecciona un Tipo</option>` + tiposDisponibles.map(t => `<option value="${t}">${t}</option>`).join('');
    
    div.innerHTML = `
        <select class="exc-tipo" onchange="actualizarPersonajesExcepcion(this, 'debilidad-${contadorCondicionesDebilidad}')">
            ${opcionesTipos}
        </select>
        <select class="exc-personaje" id="exc-pers-debilidad-${contadorCondicionesDebilidad}">
            <option value="">Aplicar a todos del tipo</option>
        </select>
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-condiciones-debilidad").appendChild(div);
}
function abrirEditorHistoria() {
    if (!idPropietarioTarjetaActual) return;
    const personaje = personajes.find(p => p.id === idPropietarioTarjetaActual);
    if (!personaje) return;
    
    document.getElementById("editor-historia-texto").value = personaje.historia || "";
    document.getElementById("modal-editor-historia").style.display = "block";
}

function cerrarEditorHistoria() {
    document.getElementById("modal-editor-historia").style.display = "none";
}

function guardarHistoriaPersonaje() {
    if (!idPropietarioTarjetaActual) return;
    const personaje = personajes.find(p => p.id === idPropietarioTarjetaActual);
    if (!personaje) return;

    personaje.historia = document.getElementById("editor-historia-texto").value;
    personaje.duelos = 0;

    const blob = new Blob([JSON.stringify(personajes, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "personajes.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cerrarEditorHistoria();
    alert("¡Historia actualizada y contador de duelos reiniciado a 0!");
    
    // Refrescar vista
    mostrarPersonajes(personajes);
}
function agregarEfectoDebilidad() {
    const div = document.createElement("div");
    div.className = "item-efecto";
    div.innerHTML = `
        <select class="efecto-atributo">
            <option value="fuerza">Fuerza</option>
            <option value="inteligencia">Inteligencia</option>
            <option value="magia">Magia</option>
            <option value="velocidad">Velocidad</option>
            <option value="defensa">Defensa</option>
        </select>
        <input type="number" class="efecto-valor" placeholder="- Puntos a restar" min="1">
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-efectos-debilidad").appendChild(div);
}

async function guardarTarjetaDebilidad() {
    const nombre = document.getElementById("debilidad-nombre").value;
    const desc = document.getElementById("debilidad-descripcion").value;
    
    if (!nombre) { alert("¡Debe incluir un nombre para la tarjeta de Debilidad!"); return; }
    
    const condiciones = Array.from(document.getElementById("lista-condiciones-debilidad").children).map(div => ({
        tipo: div.querySelector('.exc-tipo').value,
        personajeId: div.querySelector('.exc-personaje').value
    }));

    const efectos = Array.from(document.getElementById("lista-efectos-debilidad").children).map(div => ({
        atributo: div.querySelector('.efecto-atributo').value,
        modificacion: -(Math.abs(parseInt(div.querySelector('.efecto-valor').value) || 0)) // Aseguramos que reste
    }));
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Debilidad",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: `Tarjetas/${nombreLimpio}.jpg`,
        condicionesRival: condiciones,
        efectos: efectos
    };
    
    guardarYDescargarGenerico(nuevaTarjeta, cerrarFormularioDebilidad, "Debilidad");
}

// FORMULARIO DE INMUNIDAD
function abrirFormularioInmunidad() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-inmunidad").style.display = "block";
    document.getElementById("inmunidad-nombre").value = "";
    document.getElementById("inmunidad-descripcion").value = "";
}

function cerrarFormularioInmunidad() {
    document.getElementById("modal-formulario-inmunidad").style.display = "none";
}

async function guardarTarjetaInmunidad() {
    const nombre = document.getElementById("inmunidad-nombre").value;
    const desc = document.getElementById("inmunidad-descripcion").value;
    if (!nombre) { alert("¡Debe incluir un nombre para la tarjeta de Inmunidad!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Inmunidad",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: `Tarjetas/${nombreLimpio}.jpg`,
        efectoEspecial: "Anula todos los efectos de tarjetas del rival en duelo"
    };
    
    guardarYDescargarGenerico(nuevaTarjeta, cerrarFormularioInmunidad, "Inmunidad");
}

// FORMULARIO DE MUTACIÓN
function abrirFormularioMutacion() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-mutacion").style.display = "block";
    document.getElementById("mutacion-nombre").value = "";
    document.getElementById("mutacion-descripcion").value = "";
}

function cerrarFormularioMutacion() {
    document.getElementById("modal-formulario-mutacion").style.display = "none";
}

async function guardarTarjetaMutacion() {
    const nombre = document.getElementById("mutacion-nombre").value;
    const desc = document.getElementById("mutacion-descripcion").value;
    if (!nombre) { alert("¡Debe incluir un nombre para la tarjeta de Mutación!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Mutación",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: `Tarjetas/${nombreLimpio}.jpg`,
        efectoEspecial: "Suma todos los puntos de todos sus atributos y permite redistribuirlos a gusto"
    };
    
    guardarYDescargarGenerico(nuevaTarjeta, cerrarFormularioMutacion, "Mutación");
}

let contadorExcepcionesMontura = 0;
function agregarExcepcionMontura() {
    contadorExcepcionesMontura++;
    const tiposDisponibles = [...new Set(personajes.flatMap(p => (p.tipo || "").split(',').map(t => t.trim())))];
    
    const div = document.createElement("div");
    div.className = "item-excepcion";
    
    let opcionesTipos = `<option value="">Selecciona un Tipo</option>` + tiposDisponibles.map(t => `<option value="${t}">${t}</option>`).join('');
    
    div.innerHTML = `
        <select class="exc-tipo" onchange="actualizarPersonajesExcepcion(this, 'montura-${contadorExcepcionesMontura}')">
            ${opcionesTipos}
        </select>
        <select class="exc-personaje" id="exc-pers-montura-${contadorExcepcionesMontura}">
            <option value="">Aplicar a todos del tipo</option>
        </select>
        <select class="exc-condicion" onchange="actualizarInputCondicion(this, 'montura-${contadorExcepcionesMontura}')">
            <option value="Inmune">Inmune</option>
            <option value="Destino">Destino</option>
            <option value="Aumento">Aumento</option>
            <option value="Debilidad">Debilidad</option>
        </select>
        <span id="exc-val-container-montura-${contadorExcepcionesMontura}" style="display:none;">
            <input type="number" class="exc-porcentaje" placeholder="%">
        </span>
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-excepciones-montura").appendChild(div);
}

async function guardarTarjetaMontura() {
    const nombre = document.getElementById("montura-nombre").value;
    const desc = document.getElementById("montura-descripcion").value;
    
    if (!nombre) { alert("¡Debe incluir un nombre para la Montura!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    
    const efectos = Array.from(document.getElementById("lista-efectos-montura").children).map(div => {
        const select = div.querySelector('.efecto-atributo');
        const atributo = select.disabled ? "velocidad" : select.value;
        let modificacion = parseInt(div.querySelector('.efecto-valor').value) || 0;
        
        if (atributo !== "velocidad" && modificacion > 0) {
            modificacion = -modificacion;
        }
        
        return {
            atributo: atributo,
            modificacion: modificacion
        };
    });
    
    const excepciones = Array.from(document.getElementById("lista-excepciones-montura").children).map(div => ({
        tipo: div.querySelector('.exc-tipo').value,
        personajeId: div.querySelector('.exc-personaje').value,
        condicion: div.querySelector('.exc-condicion').value,
        porcentaje: parseInt(div.querySelector('.exc-porcentaje')?.value) || 0
    }));
    
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Montura",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: rutaImagen,
        efectos: efectos,
        excepciones: excepciones
    };
    
    let tarjetasRegistradas = [];
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasRegistradas = await respuesta.json();
        }
    } catch(error) {
        console.warn("No se encontró tarjeta.json previo, se generará uno nuevo.");
    }
    
    tarjetasRegistradas.push(nuevaTarjeta);
    
    const blob = new Blob([JSON.stringify(tarjetasRegistradas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cerrarFormularioMontura();
    alert("¡Tarjeta guardada y descargada exitosamente!");
}
function abrirFormularioEnfermedad() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-enfermedad").style.display = "block";
    document.getElementById("enfermedad-nombre").value = "";
    document.getElementById("enfermedad-descripcion").value = "";
    document.getElementById("enfermedad-atributo").value = "fuerza"; // Valor por defecto
}

function cerrarFormularioEnfermedad() {
    document.getElementById("modal-formulario-enfermedad").style.display = "none";
}

async function guardarTarjetaEnfermedad() {
    const nombre = document.getElementById("enfermedad-nombre").value;
    const desc = document.getElementById("enfermedad-descripcion").value;
    const atributoElegido = document.getElementById("enfermedad-atributo").value;
    
    if (!nombre) { alert("¡Debe incluir un nombre para la tarjeta de Enfermedad!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Enfermedad",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: `Tarjetas/${nombreLimpio}.jpg`,
        atributoSeleccionado: atributoElegido,
        efectoEspecial: "Cada turno disminuye un número aleatorio del 1 al 15 en todos sus atributos (sea o no usado)"
    };
    
    // Aprovechamos la función genérica que ya tienes en el código
    guardarYDescargarGenerico(nuevaTarjeta, cerrarFormularioEnfermedad, "Enfermedad");
}
let tipoEntornoActual = "Territorio";

function abrirFormularioTerritorio() {
    tipoEntornoActual = "Territorio";
    abrirFormularioEntornoBase();
}

function abrirFormularioCampoFuerza() {
    tipoEntornoActual = "Campo De Fuerza";
    abrirFormularioEntornoBase();
}

function abrirFormularioEntornoBase() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-entorno").style.display = "block";
    document.getElementById("titulo-formulario-entorno").innerText = "CREAR TARJETA: " + tipoEntornoActual.toUpperCase();
    document.getElementById("lista-efectos-entorno").innerHTML = "";
    document.getElementById("entorno-nombre").value = "";
    document.getElementById("entorno-descripcion").value = "";
    
    const selectTipo = document.getElementById("entorno-tipo-afectado");
    const tiposDisponibles = [...new Set(personajes.flatMap(p => (p.tipo || "").split(',').map(t => t.trim())))];
    selectTipo.innerHTML = `<option value="">Selecciona un Tipo</option>` + tiposDisponibles.map(t => `<option value="${t}">${t}</option>`).join('');
}

function cerrarFormularioEntorno() {
    document.getElementById("modal-formulario-entorno").style.display = "none";
}

let contadorEfectosEntorno = 0;
function agregarEfectoEntorno() {
    contadorEfectosEntorno++;
    const div = document.createElement("div");
    div.className = "item-efecto";
    div.innerHTML = `
        <select class="efecto-atributo">
            <option value="fuerza">Fuerza</option>
            <option value="inteligencia">Inteligencia</option>
            <option value="magia">Magia</option>
            <option value="velocidad">Velocidad</option>
            <option value="defensa">Defensa</option>
        </select>
        <input type="number" class="efecto-valor" placeholder="+/- Puntos">
        <button type="button" onclick="this.parentElement.remove()">X</button>
    `;
    document.getElementById("lista-efectos-entorno").appendChild(div);
}

async function guardarTarjetaEntorno() {
    const nombre = document.getElementById("entorno-nombre").value;
    const desc = document.getElementById("entorno-descripcion").value;
    const tipoAfectado = document.getElementById("entorno-tipo-afectado").value;
    
    if (!nombre) { alert(`¡Debe incluir un nombre para el ${tipoEntornoActual}!`); return; }
    if (!tipoAfectado) { alert("¡Debe seleccionar el tipo de personaje afectado!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    
    const efectos = Array.from(document.getElementById("lista-efectos-entorno").children).map(div => ({
        atributo: div.querySelector('.efecto-atributo').value,
        modificacion: parseInt(div.querySelector('.efecto-valor').value) || 0
    }));

    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: tipoEntornoActual,
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: rutaImagen,
        efectos: efectos,
        tipoAfectado: tipoAfectado
    };
    
    let tarjetasRegistradas = [];
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasRegistradas = await respuesta.json();
        }
    } catch(error) {
        console.warn("No se encontró tarjeta.json previo.");
    }
    
    tarjetasRegistradas.push(nuevaTarjeta);
    
    const blob = new Blob([JSON.stringify(tarjetasRegistradas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cerrarFormularioEntorno();
    alert(`¡Tarjeta ${tipoEntornoActual} guardada y descargada exitosamente!`);
}
function abrirFormularioConocimiento() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-conocimiento").style.display = "block";
    document.getElementById("conocimiento-nombre").value = "";
    document.getElementById("conocimiento-descripcion").value = "";
    document.getElementById("conocimiento-puntos").value = "";
}

function cerrarFormularioConocimiento() {
    document.getElementById("modal-formulario-conocimiento").style.display = "none";
}

async function guardarTarjetaConocimiento() {
    const nombre = document.getElementById("conocimiento-nombre").value;
    const desc = document.getElementById("conocimiento-descripcion").value;
    const puntos = parseInt(document.getElementById("conocimiento-puntos").value) || 0;
    
    if (!nombre) { alert("¡Debe incluir un nombre para el Conocimiento!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    
    const efectos = [
        { atributo: "inteligencia", modificacion: puntos }
    ];
    
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Conocimiento",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: rutaImagen,
        efectos: efectos
    };
    
    guardarYDescargarGenerico(nuevaTarjeta, cerrarFormularioConocimiento, "Conocimiento");
}

function abrirFormularioBendicion() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-bendicion").style.display = "block";
    document.getElementById("bendicion-nombre").value = "";
    document.getElementById("bendicion-descripcion").value = "";
    document.getElementById("bendicion-puntos").value = "";
}

function cerrarFormularioBendicion() {
    document.getElementById("modal-formulario-bendicion").style.display = "none";
}

async function guardarTarjetaBendicion() {
    const nombre = document.getElementById("bendicion-nombre").value;
    const desc = document.getElementById("bendicion-descripcion").value;
    const puntos = parseInt(document.getElementById("bendicion-puntos").value) || 0;
    
    if (!nombre) { alert("¡Debe incluir un nombre para la Bendición!"); return; }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    
    const atributosBase = ["fuerza", "inteligencia", "magia", "velocidad", "defensa"];
    const efectos = atributosBase.map(attr => ({
        atributo: attr,
        modificacion: puntos
    }));
    
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Bendición",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: rutaImagen,
        efectos: efectos
    };
    
    guardarYDescargarGenerico(nuevaTarjeta, cerrarFormularioBendicion, "Bendición");
}

function abrirFormularioMaldicion() {
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-maldicion").style.display = "block";
    document.getElementById("maldicion-nombre").value = "";
    document.getElementById("maldicion-descripcion").value = "";
    document.getElementById("maldicion-puntos").value = "";
}

function cerrarFormularioMaldicion() {
    document.getElementById("modal-formulario-maldicion").style.display = "none";
}

async function guardarTarjetaMaldicion() {
    const nombre = document.getElementById("maldicion-nombre").value;
    const desc = document.getElementById("maldicion-descripcion").value;
    let puntos = parseInt(document.getElementById("maldicion-puntos").value) || 0;
    
    if (!nombre) { alert("¡Debe incluir un nombre para la Maldición!"); return; }
    
    // Asegurarse de que los puntos sean negativos
    if (puntos > 0) {
        puntos = -puntos;
    }
    
    const nombreLimpio = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    
    const atributosBase = ["fuerza", "inteligencia", "magia", "velocidad", "defensa"];
    const efectos = atributosBase.map(attr => ({
        atributo: attr,
        modificacion: puntos
    }));
    
    const nuevaTarjeta = {
        idTarjeta: "T-" + Date.now(),
        tipo: "Maldición",
        propietarioId: idPropietarioTarjetaActual,
        nombre: nombre,
        descripcion: desc,
        imagen: rutaImagen,
        efectos: efectos
    };
    
    guardarYDescargarGenerico(nuevaTarjeta, cerrarFormularioMaldicion, "Maldición");
}

// Función auxiliar para no repetir código de guardado y descarga
async function guardarYDescargarGenerico(nuevaTarjeta, funcionCerrar, tipoNombre) {
    let tarjetasRegistradas = [];
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasRegistradas = await respuesta.json();
        }
    } catch(error) {
        console.warn("No se encontró tarjeta.json previo.");
    }
    
    tarjetasRegistradas.push(nuevaTarjeta);
    
    const blob = new Blob([JSON.stringify(tarjetasRegistradas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    funcionCerrar();
    alert(`¡Tarjeta ${tipoNombre} guardada y descargada exitosamente!`);
}

let tipoVinculoActual = "";

function abrirFormularioVinculo(tipo) {
    tipoVinculoActual = tipo;
    document.getElementById("modal-tarjeta-historia").style.display = "none";
    document.getElementById("modal-formulario-vinculo").style.display = "block";
    document.getElementById("titulo-formulario-vinculo").innerText = "CREAR TARJETA: " + tipo.toUpperCase();
    document.getElementById("vinculo-descripcion").value = "";
    document.getElementById("vinculo-puntos").value = "";
    document.getElementById("vinculo-nombre-generado").innerText = "";
    
    const selectPers = document.getElementById("vinculo-personajes");
    if (tipo === "Grupo") {
        selectPers.multiple = true;
        selectPers.style.height = "150px";
        document.getElementById("label-vinculo-personajes").innerText = "Selecciona los personajes (Mantén presionada la tecla Ctrl + clic para seleccionar varios):";
    } else {
        selectPers.multiple = false;
        selectPers.style.height = "auto";
        document.getElementById("label-vinculo-personajes").innerText = "Selecciona el personaje:";
    }

    selectPers.innerHTML = tipo === "Grupo" ? "" : `<option value="">Selecciona un Personaje</option>`;
    personajes.forEach(p => {
        if (p.id !== idPropietarioTarjetaActual) {
            selectPers.innerHTML += `<option value="${p.id}">${p.nombre}</option>`;
        }
    });

    selectPers.onchange = actualizarNombreVinculo;
}

function cerrarFormularioVinculo() {
    document.getElementById("modal-formulario-vinculo").style.display = "none";
}

function actualizarNombreVinculo() {
    const selectPers = document.getElementById("vinculo-personajes");
    const propietario = personajes.find(p => p.id === idPropietarioTarjetaActual);
    if (!propietario) return;

    let nombresSeleccionados = [];
    for (let option of selectPers.options) {
        if (option.selected && option.value) {
            nombresSeleccionados.push(option.text);
        }
    }

    if (nombresSeleccionados.length > 0) {
        document.getElementById("vinculo-nombre-generado").innerText = `Nombre de la Alianza: ${propietario.nombre} - ${nombresSeleccionados.join(" - ")}`;
    } else {
        document.getElementById("vinculo-nombre-generado").innerText = "";
    }
}

async function guardarTarjetaVinculo() {
    const selectPers = document.getElementById("vinculo-personajes");
    const desc = document.getElementById("vinculo-descripcion").value;
    const puntos = parseInt(document.getElementById("vinculo-puntos").value) || 0;
    
    let seleccionados = [];
    for (let option of selectPers.options) {
        if (option.selected && option.value) {
            seleccionados.push({ id: option.value, nombre: option.text });
        }
    }

    if (seleccionados.length === 0) { alert("¡Debe seleccionar al menos un personaje!"); return; }
    if (!puntos) { alert("¡Debe indicar la cantidad de puntos!"); return; }
    
    const propietario = personajes.find(p => p.id === idPropietarioTarjetaActual);
    const nombreTarjeta = `${propietario.nombre} - ${seleccionados.map(s => s.nombre).join(" - ")}`;
    const nombreLimpio = nombreTarjeta.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toLowerCase();
    const rutaImagen = `Tarjetas/${nombreLimpio}.jpg`;
    const idsSeleccionados = seleccionados.map(s => s.id);
    
    let tarjetasAguardar = [];

    tarjetasAguardar.push({
        idTarjeta: "T-" + Date.now() + "-1",
        tipo: tipoVinculoActual,
        propietarioId: idPropietarioTarjetaActual,
        vinculadosIds: idsSeleccionados,
        nombre: nombreTarjeta,
        descripcion: desc,
        imagen: rutaImagen,
        puntosVinculo: puntos,
        efectos: []
    });

    if (tipoVinculoActual === "Grupo") {
        idsSeleccionados.forEach((idVinculado, index) => {
            let vinculadosDeEste = [idPropietarioTarjetaActual, ...idsSeleccionados.filter(id => id !== idVinculado)];
            tarjetasAguardar.push({
                idTarjeta: "T-" + Date.now() + "-" + (index + 2),
                tipo: tipoVinculoActual,
                propietarioId: idVinculado,
                vinculadosIds: vinculadosDeEste,
                nombre: nombreTarjeta,
                descripcion: desc,
                imagen: rutaImagen,
                puntosVinculo: puntos,
                efectos: []
            });
        });
    } 
    else if (tipoVinculoActual === "Pareja") {
        tarjetasAguardar.push({
            idTarjeta: "T-" + Date.now() + "-2",
            tipo: tipoVinculoActual,
            propietarioId: idsSeleccionados[0],
            vinculadosIds: [idPropietarioTarjetaActual],
            nombre: nombreTarjeta,
            descripcion: desc,
            imagen: rutaImagen,
            puntosVinculo: puntos,
            efectos: []
        });
    }

    let tarjetasRegistradas = [];
    try {
        const respuesta = await fetch("tarjeta.json");
        if (respuesta.ok) {
            tarjetasRegistradas = await respuesta.json();
        }
    } catch(error) {
        console.warn("No se encontró tarjeta.json previo.");
    }
    
    tarjetasRegistradas.push(...tarjetasAguardar);
    
    const blob = new Blob([JSON.stringify(tarjetasRegistradas, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tarjeta.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cerrarFormularioVinculo();
    alert(`¡Tarjeta(s) de ${tipoVinculoActual} guardada(s) y descargada(s) exitosamente!`);
}