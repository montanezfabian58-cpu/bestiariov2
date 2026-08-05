// State Management
let state = {
    characters: [],
    rotationPool: [],
    relationships: {},
    decks: []
};
// Constants
const CHARACTER_TYPES = ['Brujas','Titanes', 'Vampiros', 'Monstruo', 'Espíritus', 'Bestias', 'Humanos', 'Magos'];
const LOCAL_STORAGE_KEY = 'nexusRpgState';
const ATTRIBUTE_ASSIGNMENT_THRESHOLD = 50;
const LEVEL_TWO_ATTRIBUTE_BARRIER = 100;
const ATTRS = [
    { key: 'INT', name: 'Inteligencia', color: 'blue' },
    { key: 'STR', name: 'Fuerza', color: 'red' },
    { key: 'SPD', name: 'Velocidad', color: 'yellow' },
    { key: 'MAG', name: 'Magia', color: 'green' }
];


function addDomEvent(elementId, eventName, handler) {
    const bind = () => {
        const element = document.getElementById(elementId);
        if (element) element.addEventListener(eventName, handler);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bind, { once: true });
    } else {
        bind();
    }
}

const MILESTONE_CATEGORIES = [
    {
        label: '⚔️ Equipamiento y Posesiones',
        types: [
            { name: 'Arma', hint: 'Arma nueva o mejora de una existente.' },
            { name: 'Armadura', hint: 'Protección física o mágica.' },
            { name: 'Artefacto / Reliquia', hint: 'Objeto de poder que no es arma ni armadura.' },
            { name: 'Montura / Vehículo', hint: 'Transporte o bestia de carga.' },
            { name: 'Refugio / Territorio', hint: 'Lugar que ahora reclama como propio.' }
        ]
    },
    {
        label: '🧠 Desarrollo Personal y Mental',
        types: [
            { name: 'Acontecimiento', hint: 'Suceso impactante que cambió su perspectiva.' },
            { name: 'Sabiduría / Revelación', hint: 'Conocimiento profundo o secreto descubierto.' },
            { name: 'Miedo / Trauma', hint: 'Fobia o herida psicológica tras las batallas.' },
            { name: 'Debilidad', hint: 'Limitación física o mágica adquirida.' },
            { name: 'Mutación / Marca Física', hint: 'Cambio permanente en su cuerpo.' }
        ]
    },
    {
        label: '🤝 Relaciones y Estatus Social',
        types: [
            { name: 'Compañero', hint: 'Aliado incondicional, mascota o aprendiz.' },
            { name: 'Rival', hint: 'Alguien enfrentado múltiples veces.' },
            { name: 'Venganza / Traición', hint: 'Ruptura de una alianza.' },
            { name: 'Clan / Facción', hint: 'Ingreso o expulsión de un grupo.' },
            { name: 'Título / Apodo', hint: 'Reputación ganada en el mundo.' },
            { name: 'Misión / Objetivo Vital', hint: 'Meta que guiará sus pasos.' },
            { name: 'Deuda / Obligación', hint: 'Favor, vida o dinero pendiente.' }
        ]
    },
    {
        label: '🔮 Fuerzas Sobrenaturales o del Destino',
        types: [
            { name: 'Maldición', hint: 'Efecto negativo constante.' },
            { name: 'Bendición / Don', hint: 'Favor especial sobrenatural o genético.' },
            { name: 'Pacto / Juramento', hint: 'Contrato que no puede romper.' }
        ]
    }
];
const MILESTONE_TYPES = MILESTONE_CATEGORIES.flatMap(category => category.types);
const MILESTONE_COLORS = {
    'Arma': 'bg-red-950/70 text-red-200 border-red-700',
    'Armadura': 'bg-slate-800 text-slate-200 border-slate-500',
    'Artefacto / Reliquia': 'bg-amber-950/70 text-amber-200 border-amber-600',
    'Montura / Vehículo': 'bg-orange-950/70 text-orange-200 border-orange-600',
    'Refugio / Territorio': 'bg-emerald-950/70 text-emerald-200 border-emerald-600',
    'Acontecimiento': 'bg-indigo-950/70 text-indigo-200 border-indigo-600',
    'Sabiduría / Revelación': 'bg-cyan-950/70 text-cyan-200 border-cyan-600',
    'Miedo / Trauma': 'bg-purple-950/70 text-purple-200 border-purple-600',
    'Debilidad': 'bg-stone-900 text-stone-200 border-stone-500',
    'Mutación / Marca Física': 'bg-lime-950/70 text-lime-200 border-lime-600',
    'Compañero': 'bg-green-950/70 text-green-200 border-green-600',
    'Rival': 'bg-rose-950/70 text-rose-200 border-rose-600',
    'Venganza / Traición': 'bg-fuchsia-950/70 text-fuchsia-200 border-fuchsia-600',
    'Traición': 'bg-fuchsia-950/70 text-fuchsia-200 border-fuchsia-600',
    'Venganza': 'bg-fuchsia-950/70 text-fuchsia-200 border-fuchsia-600',
    'Clan / Facción': 'bg-blue-950/70 text-blue-200 border-blue-600',
    'Clan': 'bg-blue-950/70 text-blue-200 border-blue-600',
    'Título / Apodo': 'bg-yellow-950/70 text-yellow-200 border-yellow-600',
    'Misión / Objetivo Vital': 'bg-teal-950/70 text-teal-200 border-teal-600',
    'Misión': 'bg-teal-950/70 text-teal-200 border-teal-600',
    'Deuda / Obligación': 'bg-pink-950/70 text-pink-200 border-pink-600',
    'Maldición': 'bg-violet-950/70 text-violet-200 border-violet-600',
    'Bendición / Don': 'bg-sky-950/70 text-sky-200 border-sky-600',
    'Pacto / Juramento': 'bg-gray-900 text-gray-200 border-gray-500'
};

// Initialization
async function init() {
    hydrateCharacterTypeSelect();
    state = await loadInitialState();
    normalizeState();
    await loadMazos();
    renderGallery();
    renderDecks();
}

function hydrateCharacterTypeSelect() {
    const select = document.getElementById('char-type');
    if (!select) return;
    select.innerHTML = '<option value="">Selecciona un tipo...</option>' + CHARACTER_TYPES.map(type => `<option value="${escapeAttr(type)}">${escapeHtml(type)}</option>`).join('');
}

async function loadInitialState() {
    const bundledState = await loadBundledCharactersState();
    const savedState = readSavedState();

    if (!savedState) return bundledState;

    const savedHasCharacters = Array.isArray(savedState.characters) && savedState.characters.length > 0;
    const bundledHasCharacters = Array.isArray(bundledState.characters) && bundledState.characters.length > 0;

    return {
        ...bundledState,
        ...savedState,
        characters: savedHasCharacters || !bundledHasCharacters ? (savedState.characters || []) : bundledState.characters,
        rotationPool: Array.isArray(savedState.rotationPool) ? savedState.rotationPool : bundledState.rotationPool,
        relationships: savedState.relationships || bundledState.relationships || {},
        decks: Array.isArray(savedState.decks) ? savedState.decks : bundledState.decks
    };
}

function readSavedState() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return null;

    try {
        return JSON.parse(saved);
    } catch (error) {
        console.warn('No se pudo leer el progreso local.', error);
        return null;
    }
}

async function loadBundledCharactersState() {
    try {
        const data = await fetchJsonAsset('personajes.json');
        return importCharactersPayload(data);
    } catch (error) {
        console.warn('No se pudo cargar personajes.json; se iniciará una base vacía.', error);
        return { characters: [], rotationPool: [], relationships: {}, decks: [] };
    }
}

async function fetchJsonAsset(filename) {
    const url = new URL(filename, document.baseURI);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${filename}: HTTP ${response.status}`);
    return response.json();
}

function normalizeState() {
    state.characters = Array.isArray(state.characters) ? state.characters : [];
    state.rotationPool = Array.isArray(state.rotationPool) ? state.rotationPool : [];
    state.relationships = state.relationships || {};
    state.characters = state.characters.map(normalizeCharacter);
}

function normalizeCharacter(char = {}) {
    const stats = char.stats || char.atributos || {};
    const points = char.points || { pos: char.puntos_positivos, neg: char.puntos_negativos };
    const hitos = char.hitos || {};
    const metadata = hitos.metadata || {};
    const normalized = {
        id: char.id || generateId(),
        name: char.name || char.nombre || 'Sin nombre',
        type: char.type || char.tipo || '',
        story: cleanHandwrittenStory(char.story || char.historia || ''),
        image: char.image || char.imagen || buildCharacterImagePath(char.name || char.nombre || ''),
        stats: { INT: Number(stats.INT ?? stats.inteligencia ?? 50), STR: Number(stats.STR ?? stats.fuerza ?? 50), SPD: Number(stats.SPD ?? stats.velocidad ?? 50), MAG: Number(stats.MAG ?? stats.magia ?? 50) },
        level: Number(char.level ?? char.nivel ?? 1),
        cap: Number(char.cap || metadata.cap || 100),
        breakthroughPoints: char.breakthroughPoints || metadata.breakthroughPoints || { INT: 0, STR: 0, SPD: 0, MAG: 0 },
        points: { pos: Number(points.pos ?? 0), neg: Number(points.neg ?? 0) },
        battles: Number(char.battles || char.batallas || metadata.batallas || 0),
        milestones: Array.isArray(char.milestones) ? char.milestones : (Array.isArray(hitos.tangibles) ? hitos.tangibles : []),
        equipment: Array.isArray(char.equipment) ? char.equipment : (Array.isArray(hitos.equipamiento) ? hitos.equipamiento : []),
        mental: Array.isArray(char.mental) ? char.mental : (Array.isArray(hitos.mentales) ? hitos.mentales : []),
        world: char.world || hitos.sociales || hitos.sociedades || {},
        destiny: char.destiny || hitos.misticos || {},
        pendingMilestones: Number(char.pendingMilestones || metadata.pendingMilestones || 0),
        pendingStoryChange: Boolean(char.pendingStoryChange || metadata.pendingStoryChange),
        pendingAction: char.pendingAction || null
    };
    normalized.milestones = (normalized.milestones || []).map(milestone => isAutomaticSocietyMilestone(milestone) ? { ...normalizeMilestone(milestone), auto: true } : normalizeMilestone(milestone));
    if (normalized.pendingAction === 'milestone') { normalized.pendingMilestones = Math.max(normalized.pendingMilestones, 1); normalized.pendingAction = null; }
    normalized.equipment = (normalized.equipment || []).map(normalizeEquipment);
    normalized.mental = (normalized.mental || []).map(normalizeMentalMilestone);
    normalized.world = normalizeWorldStatus(normalized.world);
    normalized.destiny = normalizeDestiny(normalized.destiny);
    enforceDestinyStats(normalized);
    return normalized;
}

function importCharactersPayload(data) {
    if (Array.isArray(data)) return { characters: data, rotationPool: [], relationships: {} };
    return { characters: data.characters || data.personajes || [], rotationPool: data.rotationPool || [], relationships: data.relationships || {} };
}

function buildCharacterImagePath(name) {
    const filename = String(name || 'personaje')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9]/g, '');
    return `personajes/${filename || 'personaje'}.jpg`;
}

function toExportCharacter(char) {
    return {
        id: char.id,
        nombre: char.name,
        tipo: char.type,
        historia: char.story,
        atributos: { inteligencia: char.stats.INT, fuerza: char.stats.STR, velocidad: char.stats.SPD, magia: char.stats.MAG },
        puntos_positivos: char.points.pos,
        puntos_negativos: char.points.neg,
        nivel: char.level,
        hitos: { tangibles: char.milestones || [], equipamiento: char.equipment || [], mentales: char.mental || [], misticos: normalizeDestiny(char.destiny), sociedades: normalizeWorldStatus(char.world), metadata: { batallas: char.battles, cap: char.cap, breakthroughPoints: char.breakthroughPoints, pendingMilestones: char.pendingMilestones, pendingStoryChange: Boolean(char.pendingStoryChange) } },
        imagen: buildCharacterImagePath(char.name)
    };
}

function downloadCharactersJson() {
    const payload = state.characters.map(toExportCharacter);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'personajes.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function legacyNormalizeCharacters() {
    state.characters.forEach(char => {
        char.pendingMilestones = char.pendingMilestones || 0;
        char.type = char.type || '';
        char.story = cleanHandwrittenStory(char.story);
        char.milestones = (char.milestones || []).map(milestone => {
            const normalized = normalizeMilestone(milestone);
            return isAutomaticSocietyMilestone(milestone) ? { ...normalized, auto: true } : normalized;
        });
        if (char.pendingAction === 'milestone') {
            char.pendingMilestones = Math.max(char.pendingMilestones, 1);
            char.pendingAction = null;
        }
        char.equipment = (char.equipment || []).map(normalizeEquipment);
        char.mental = (char.mental || []).map(normalizeMentalMilestone);
        char.world = normalizeWorldStatus(char.world);
        char.destiny = normalizeDestiny(char.destiny);
        enforceDestinyStats(char);
    });
    
}

function saveState() {
    state.characters.forEach(char => { char.image = buildCharacterImagePath(char.name); });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    renderGallery();
    updateBattleButton();
}
function switchSubTab(tab) {
    const btnChars = document.getElementById('tab-btn-characters');
    const btnDecks = document.getElementById('tab-btn-decks');
    const subtabChars = document.getElementById('subtab-characters');
    const subtabDecks = document.getElementById('subtab-decks');

    if (tab === 'characters') {
        btnChars.classList.add('border-primary', 'text-white');
        btnChars.classList.remove('border-transparent', 'text-gray-400');
        btnDecks.classList.add('border-transparent', 'text-gray-400');
        btnDecks.classList.remove('border-primary', 'text-white');
        subtabChars.classList.remove('hidden');
        subtabDecks.classList.add('hidden');
    } else {
        btnDecks.classList.add('border-primary', 'text-white');
        btnDecks.classList.remove('border-transparent', 'text-gray-400');
        btnChars.classList.add('border-transparent', 'text-gray-400');
        btnChars.classList.remove('border-primary', 'text-white');
        subtabDecks.classList.remove('hidden');
        subtabChars.classList.add('hidden');
    }
}

async function loadMazos() {
    const savedDecks = Array.isArray(state.decks) ? state.decks : [];

    try {
        const data = await fetchJsonAsset('mazos.json');
        const bundledDecks = Array.isArray(data) ? data : (data.mazos || data.decks || []);
        state.decks = savedDecks.length > 0 ? savedDecks : bundledDecks;
    } catch (error) {
        console.warn('No se pudo cargar mazos.json o no existe aún.', error);
        state.decks = savedDecks;
    }
}

function renderDecks() {
    const container = document.getElementById('decks-gallery');
    const countEl = document.getElementById('deck-count');
    if (!container) return;

    const decks = state.decks || [];
    if (countEl) countEl.innerText = decks.length;

    if (decks.length === 0) {
        container.innerHTML = '<div class="col-span-full text-gray-400 italic text-center py-8">No hay mazos registrados en mazos.json.</div>';
        return;
    }

    container.innerHTML = decks.map((deck, index) => {
        const nombre = deck.nombre || deck.name || 'Mazo sin nombre';
        const chars = deck.personajes || deck.characters || [];
        const cant = Array.isArray(chars) ? chars.length : 0;
        const descripcion = deck.descripcion || deck.description || '';

        return `
            <div class="bg-card border border-gray-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-green-500 transition cursor-pointer" onclick="viewDeck(${index})">
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-xl font-bold text-white">${escapeHtml(nombre)}</h3>
                        <span class="bg-green-900/60 text-green-300 text-xs font-bold px-2.5 py-1 rounded-full border border-green-700">${cant} cartas</span>
                    </div>
                    ${descripcion ? `<p class="text-xs text-gray-400 mb-4">${escapeHtml(descripcion)}</p>` : ''}
                </div>
                <div class="text-xs text-gray-500 border-t border-gray-800 pt-3 mt-2 flex justify-between items-center" onclick="event.stopPropagation()">
                    <span>Mazo activo</span>
                    <div class="flex items-center gap-2">
                        <button onclick="openDeckModal(${index})" class="w-9 h-9 flex items-center justify-center rounded bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm transition" title="Editar mazo">✏️</button>
                        <button onclick="deleteDeck(${index})" class="w-9 h-9 flex items-center justify-center rounded bg-red-950/80 hover:bg-red-900 border border-red-700 text-sm transition" title="Eliminar mazo">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function toggleCreateForm(forceOpen = null) {
    const panel = document.getElementById('create-char-panel');
    const button = document.getElementById('btn-toggle-create');
    const shouldOpen = forceOpen === null ? panel.classList.contains('hidden') : forceOpen;
    panel.classList.toggle('hidden', !shouldOpen);
    button.innerText = shouldOpen ? 'Ocultar formulario' : '+ Nuevo personaje';
    if (!shouldOpen) resetCharacterForm();
}

function resetCharacterForm() {
    const form = document.getElementById('create-char-form');
    form.reset();
    document.getElementById('char-edit-id').value = '';
    document.getElementById('create-char-title').innerText = 'Reclutar Nuevo Personaje';
    document.getElementById('create-char-submit').innerText = 'Crear Personaje';
    document.getElementById('create-char-cancel').classList.add('hidden');
    setCharacterEditLock(false);
}

function setCharacterEditLock(locked) {
    ['char-type', 'char-story', 'char-int', 'char-str', 'char-spd', 'char-mag'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = locked;
    });
}

function editCharacter(charId) {
    const char = state.characters.find(c => c.id === charId);
    if (!char) return;
    toggleCreateForm(true);
    document.getElementById('char-edit-id').value = char.id;
    document.getElementById('char-name').value = char.name;
    document.getElementById('char-type').value = char.type;
    document.getElementById('char-story').value = char.story;
    document.getElementById('char-int').value = char.stats.INT;
    document.getElementById('char-str').value = char.stats.STR;
    document.getElementById('char-spd').value = char.stats.SPD;
    document.getElementById('char-mag').value = char.stats.MAG;
    document.getElementById('create-char-title').innerText = `Editar Personaje: ${char.name}`;
    document.getElementById('create-char-submit').innerText = 'Guardar Cambios';
    setCharacterEditLock(true);
    document.getElementById('create-char-cancel').classList.remove('hidden');
    document.getElementById('create-char-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteCharacter(charId) {
    const char = state.characters.find(c => c.id === charId);
    if (!char || !confirm(`¿Eliminar a ${char.name}? Esta acción también limpiará sus relaciones.`)) return;
    state.characters = state.characters.filter(c => c.id !== charId);
    state.rotationPool = state.rotationPool.filter(id => id !== charId);
    Object.keys(state.relationships).forEach(key => { if (key.split('_').includes(charId)) delete state.relationships[key]; });
    state.characters.forEach(other => {
        other.world = normalizeWorldStatus(other.world);
        other.world.milestones = other.world.milestones.filter(ms => ms.companionId !== charId && !(ms.memberIds || []).includes(charId) && !(ms.targetCharacters || []).includes(charId));
        other.world = normalizeWorldStatus(other.world);
        other.destiny = normalizeDestiny(other.destiny);
        other.destiny.milestones = other.destiny.milestones.filter(ms => ms.casterId !== charId);
        other.destiny = normalizeDestiny(other.destiny);
    });
    if (currentCharId === charId) closeModal();
    resetCharacterForm();
    saveState();
}

function queueMilestone(char) {
    char.pendingMilestones = (char.pendingMilestones || 0) + 1;
}

function hasReachedLevelTwoBarrier(char) {
    return ATTRS.every(attr => Number(char.stats?.[attr.key] || 0) > LEVEL_TWO_ATTRIBUTE_BARRIER);
}

function grantLevelTwoMilestoneIfReady(char) {
    if (!char || Number(char.level || 1) >= 2 || !hasReachedLevelTwoBarrier(char)) return false;
    char.level = 2;
    char.cap = Math.max(Number(char.cap) || 100, 200);
    queueMilestone(char);
    char.pendingStoryChange = true;
    return true;
}


function getDesignatedMilestoneCount(char) {
    const manualMilestones = (char.milestones || []).filter(m => !isAutomaticSocietyMilestone(m)).length;
    const equipmentCount = (char.equipment || []).length;
    const mentalCount = (char.mental || []).length;
    const world = normalizeWorldStatus(char.world);
    const destiny = normalizeDestiny(char.destiny);
    const worldCount = (world.milestones || []).length;
    const destinyCount = (destiny.milestones || []).length;
    return Math.max(manualMilestones, equipmentCount + mentalCount + worldCount + destinyCount);
}

function getAvailableMilestoneSlots(char) {
    return Math.max(0, Number(char.pendingMilestones) || 0);
}

function canAddMilestone(char) {
    return getAvailableMilestoneSlots(char) > 0;
}

function renderMilestoneAccessButtons(char) {
    const container = document.getElementById('modal-milestone-buttons');
    if (!container) return;
    const ready = canAddMilestone(char);
    const readyClass = ready ? ' milestone-ready' : '';
    const legend = ready ? '<p class="col-span-2 text-center text-xs text-yellow-300 font-bold animate-pulse">Agregar un hito disponible por nivel 2</p>' : '';
    container.innerHTML = `
        ${legend}
        <button onclick="openInventoryModal(currentCharId)" class="w-full bg-red-950/70 hover:bg-red-900 border border-red-700 text-white font-bold py-2 rounded-lg transition${readyClass}">⚔️ Inventario</button>
        <button onclick="openMentalModal(currentCharId)" class="w-full bg-green-950/70 hover:bg-green-900 border border-green-700 text-white font-bold py-2 rounded-lg transition${readyClass}">🧠 Mente</button>
        <button onclick="openWorldModal(currentCharId)" class="w-full bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-700 text-white font-bold py-2 rounded-lg transition${readyClass}">🌎 Mundo</button>
        <button onclick="openDestinyModal(currentCharId)" class="w-full bg-sky-950/70 hover:bg-sky-900 border border-sky-700 text-white font-bold py-2 rounded-lg transition${readyClass}">🔮 Destino</button>
    `;
}

function setFormAddMode(formId, canAdd, emptyMessage) {
    const form = document.getElementById(formId);
    if (!form) return;
    let notice = document.getElementById(`${formId}-locked-notice`);
    if (!notice) {
        notice = document.createElement('div');
        notice.id = `${formId}-locked-notice`;
        notice.className = 'bg-gray-900/70 border border-gray-700 rounded-xl p-4 text-sm text-gray-400';
        form.parentNode.insertBefore(notice, form);
    }
    notice.innerHTML = emptyMessage;
    notice.classList.toggle('hidden', canAdd);
    form.classList.toggle('hidden', !canAdd);
}

function getMilestoneColor(type) {
    return MILESTONE_COLORS[type] || 'bg-gray-800 text-gray-200 border-gray-600';
}

function escapeAttr(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(value) {
    return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function getImageHtml(src, alt, classes, id = '') {
    const safeAlt = escapeAttr(alt || 'Personaje sin imagen');
    const safeSrc = escapeAttr(src || '');
    const safeClasses = escapeAttr(classes);
    const idAttr = id ? ` id="${escapeAttr(id)}"` : '';
    const fallbackAttrs = `data-fallback-alt="Silueta de ${safeAlt}" data-fallback-class="${safeClasses}"`;
    const silhouette = `<div${idAttr} role="img" aria-label="Silueta de ${safeAlt}" class="${safeClasses} silhouette flex items-end justify-center text-gray-500 text-xs pb-3">Sin imagen</div>`;
    if (!safeSrc) return silhouette;
    return `<img${idAttr} src="${safeSrc}" alt="${safeAlt}" class="${safeClasses}" ${fallbackAttrs} onerror="replaceBrokenImage(this)">`;
}

function replaceBrokenImage(img) {
    const fallback = document.createElement('div');
    if (img.id) fallback.id = img.id;
    fallback.setAttribute('role', 'img');
    fallback.setAttribute('aria-label', img.dataset.fallbackAlt || 'Silueta de personaje sin imagen');
    fallback.className = `${img.dataset.fallbackClass || ''} silhouette flex items-end justify-center text-gray-500 text-xs pb-3`;
    fallback.textContent = 'Sin imagen';
    img.replaceWith(fallback);
}

function isAutomaticSocietyMilestone(milestone) {
    const normalized = normalizeMilestone(milestone);
    const autoTypes = ['Compañero', 'Rival', 'Venganza / Traición', 'Traición', 'Venganza'];
    return Boolean(milestone && milestone.auto) || autoTypes.includes(normalized.type);
}

function cleanHandwrittenStory(story) {
    return String(story || '')
        .split('\n')
        .filter(line => !/^\s*\[?Hito Autom[aá]tico\s*[-–:]/i.test(line.trim()))
        .join('\n')
        .trim();
}

function normalizeMilestone(milestone) {
    if (typeof milestone === 'string') return { type: 'Hito', name: milestone, description: '', image: '' };
    return {
        type: milestone.type || 'Hito',
        name: milestone.name || milestone.note || 'Sin nombre',
        description: milestone.description || milestone.note || '',
        image: milestone.image || ''
    };
}

function normalizeEquipment(item = {}) {
    return {
        id: item.id || generateId(),
        type: item.type || 'Arma',
        name: item.name || 'Sin nombre',
        image: item.image || '',
        attr: item.attr || 'STR',
        power: Number(item.power || 0),
        mode: item.mode || 'add',
        target: item.target || 'self',
        superior: item.superior || '',
        inferior: item.inferior || '',
        immune: item.immune || '',
        condition: item.condition || '',
        notes: item.notes || '',
        superiorCharacters: item.superiorCharacters || [], superiorTypes: item.superiorTypes || [], superiorPercent: Number(item.superiorPercent || 0),
        inferiorCharacters: item.inferiorCharacters || [], inferiorTypes: item.inferiorTypes || [], inferiorPercent: Number(item.inferiorPercent || 0),
        immuneCharacters: item.immuneCharacters || [], immuneTypes: item.immuneTypes || [],
        affectedCharacters: item.affectedCharacters || [], affectedTypes: item.affectedTypes || []
    };
}


function normalizeMentalMilestone(item = {}) {
    return {
        id: item.id || generateId(),
        type: item.type || 'Acontecimiento',
        name: item.name || 'Sin nombre',
        value: Number(item.value || 25),
        plusAttr: item.plusAttr || 'INT',
        minusAttr: item.minusAttr || 'STR',
        trigger: item.trigger || '',
        aggravator: item.aggravator || '',
        notes: item.notes || '',
        image: item.image || '',
        triggerCharacters: item.triggerCharacters || [], triggerTypes: item.triggerTypes || [],
        aggravatorCharacters: item.aggravatorCharacters || [], aggravatorTypes: item.aggravatorTypes || [], aggravatorPercent: Number(item.aggravatorPercent || 0)
    };
}



function normalizeWorldMilestone(item = {}) {
    return {
        id: item.id || generateId(),
        type: item.type || 'Apodo',
        name: item.name || item.title || 'Sin nombre',
        narrative: item.narrative || item.notes || '',
        companionId: item.companionId || '',
        memberIds: Array.isArray(item.memberIds) ? item.memberIds : [],
        missionMode: item.missionMode || 'destroy',
        targetCharacters: item.targetCharacters || [],
        targetTypes: item.targetTypes || [],
        debtActive: item.debtActive !== false
    };
}

function normalizeWorldStatus(world = {}) {
    const migrated = [];
    if (world.title) migrated.push({ type: 'Apodo', name: world.title, narrative: '' });
    (Array.isArray(world.companions) ? world.companions : []).forEach(id => migrated.push({ type: 'Compañero', name: 'Compañero', companionId: id, narrative: '' }));
    if (world.missionOffense) migrated.push({ type: 'Misión Objetivo', name: 'Misión ofensiva', missionMode: 'destroy', targetTypes: [world.missionOffense], narrative: '' });
    if (world.missionProtect) migrated.push({ type: 'Misión Objetivo', name: 'Misión defensiva', missionMode: 'protect', targetTypes: [world.missionProtect], narrative: '' });
    if (world.debtTarget) migrated.push({ type: 'Deuda', name: 'Deuda', targetTypes: [world.debtTarget], debtActive: Boolean(world.debtActive), narrative: '' });
    const milestones = (Array.isArray(world.milestones) && world.milestones.length ? world.milestones : migrated).map(normalizeWorldMilestone);
    const companions = milestones.filter(m => m.type === 'Compañero' && m.companionId).map(m => m.companionId);
    const nickname = milestones.find(m => m.type === 'Apodo');
    const debt = milestones.find(m => m.type === 'Deuda' && m.debtActive);
    const offense = milestones.find(m => m.type === 'Misión Objetivo' && m.missionMode === 'destroy');
    const protect = milestones.find(m => m.type === 'Misión Objetivo' && m.missionMode === 'protect');
    return {
        milestones,
        title: nickname?.name || '',
        companions,
        missionOffense: compactTargets(offense?.targetCharacters || [], offense?.targetTypes || []),
        missionProtect: compactTargets(protect?.targetCharacters || [], protect?.targetTypes || []),
        debtTarget: compactTargets(debt?.targetCharacters || [], debt?.targetTypes || []),
        debtActive: Boolean(debt)
    };
}

function normalizeDestinyMilestone(item = {}) {
    return {
        id: item.id || generateId(),
        type: item.type || 'Maldición',
        name: item.name || item.oathName || 'Sin nombre',
        narrative: item.narrative || item.notes || '',
        casterId: item.casterId || '',
        attr: item.attr || item.curseAttr || item.blessingAttr || item.oathAttr || 'STR',
        oathPath: item.oathPath || 'risk'
    };
}

function normalizeDestiny(destiny = {}) {
    const migrated = [];
    if (destiny.curseAttr) migrated.push({ type: 'Maldición', name: 'Maldición', attr: destiny.curseAttr, narrative: destiny.notes || '' });
    if (destiny.blessingAttr) migrated.push({ type: 'Bendición', name: 'Bendición', attr: destiny.blessingAttr, narrative: destiny.notes || '' });
    if (destiny.oathPath || destiny.oathName) migrated.push({ type: 'Juramento', name: destiny.oathName || 'Juramento', attr: destiny.oathAttr || 'STR', oathPath: destiny.oathPath || 'risk', narrative: destiny.notes || '' });
    const milestones = (Array.isArray(destiny.milestones) && destiny.milestones.length ? destiny.milestones : migrated).map(normalizeDestinyMilestone);
    const curse = milestones.find(m => m.type === 'Maldición');
    const blessing = milestones.find(m => m.type === 'Bendición');
    const oath = milestones.find(m => m.type === 'Juramento');
    return { milestones, curseAttr: curse?.attr || '', blessingAttr: blessing?.attr || '', oathPath: oath?.oathPath || '', oathAttr: oath?.attr || 'STR', oathName: oath?.name || '', notes: oath?.narrative || curse?.narrative || blessing?.narrative || '' };
}

function getDisplayName(char) {
    const world = normalizeWorldStatus(char.world);
    return world.title ? `${char.name} (${world.title})` : char.name;
}

function getDisplayedStat(char, attrKey) {
    const destiny = normalizeDestiny(char.destiny);
    if (destiny.curseAttr === attrKey) return 0;
    if (destiny.blessingAttr === attrKey) return 100;
    return Number(char.stats[attrKey] || 0);
}

function enforceDestinyStats(char) {
    const destiny = normalizeDestiny(char.destiny);
    if (destiny.blessingAttr) char.stats[destiny.blessingAttr] = 100;
    if (destiny.curseAttr) char.stats[destiny.curseAttr] = 0;
}



function characterTypeOptionsHtml(selected = []) {
    return CHARACTER_TYPES.map(type => `<option value="${escapeAttr(type)}" ${selected.includes(type) ? 'selected' : ''}>${escapeHtml(type)}</option>`).join('');
}

function selectedOptions(id) {
    const el = document.getElementById(id);
    return el ? Array.from(el.selectedOptions).map(o => o.value) : [];
}

function compactTargets(charIds = [], typeNames = []) {
    const names = charIds.map(id => state.characters.find(c => c.id === id)?.name).filter(Boolean);
    return [...names, ...typeNames].join(', ');
}

function targetPickerHtml(prefix, label, selectedCharacters = [], selectedTypes = [], withPercent = false, percentValue = 0) {
    return `<div class="rounded-lg border border-gray-700 bg-black/20 p-3">
        <div class="flex items-center justify-between gap-2 mb-2"><label class="inventory-label mb-0">${label}</label>${withPercent ? `<input id="${prefix}-percent" type="number" value="${escapeAttr(percentValue)}" placeholder="%" class="inventory-input max-w-28">` : ''}</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div><button type="button" onclick="togglePicker('${prefix}-chars')" class="w-full bg-gray-800 hover:bg-gray-700 text-xs font-bold px-3 py-2 rounded-lg border border-gray-600">Agregar personaje</button><select id="${prefix}-chars" multiple size="5" class="inventory-input hidden mt-2">${rosterOptionsHtml(selectedCharacters, currentInventoryCharId || currentMentalCharId || '')}</select></div>
            <div><button type="button" onclick="togglePicker('${prefix}-types')" class="w-full bg-gray-800 hover:bg-gray-700 text-xs font-bold px-3 py-2 rounded-lg border border-gray-600">Agregar tipo</button><select id="${prefix}-types" multiple size="5" class="inventory-input hidden mt-2">${characterTypeOptionsHtml(selectedTypes)}</select></div>
        </div>
    </div>`;
}

function togglePicker(id) { document.getElementById(id)?.classList.toggle('hidden'); }

function attrOptions(keys) {
    return ATTRS.filter(a => keys.includes(a.key)).map(a => `<option value="${a.key}">${a.name}</option>`).join('');
}

function rosterOptionsHtml(selected = [], excludeId = '') {
    return state.characters.filter(c => c.id !== excludeId).map(c => `<option value="${escapeAttr(c.id)}" ${selected.includes(c.id) ? 'selected' : ''}>${escapeHtml(getDisplayName(c))}</option>`).join('');
}

function characterMatchesQuery(char, query) {
    const text = String(query || '').trim().toLowerCase();
    if (!text || !char) return false;
    return text.split(',').some(entry => {
        const token = entry.trim();
        return token && (`${char.name} ${normalizeWorldStatus(char.world).title} ${char.story || ''}`).toLowerCase().includes(token);
    });
}

function areCompanions(a, b) {
    if (!a || !b) return false;
    const aw = normalizeWorldStatus(a.world);
    const bw = normalizeWorldStatus(b.world);
    return aw.companions.includes(b.id) || bw.companions.includes(a.id);
}

function getTeamClanIds(team) {
    const ids = new Set();
    for (let i = 0; i < team.length; i++) for (let j = i + 1; j < team.length; j++) for (let k = j + 1; k < team.length; k++) {
        const trio = [team[i], team[j], team[k]];
        if (areCompanions(trio[0], trio[1]) && areCompanions(trio[0], trio[2]) && areCompanions(trio[1], trio[2])) trio.forEach(c => ids.add(c.id));
    }
    return ids;
}

function isMentalMilestone(type) {
    return ['Acontecimiento', 'Sabiduría / Revelación', 'Miedo / Trauma', 'Debilidad', 'Mutación', 'Mutación / Marca Física'].includes(type);
}

function isEquipmentMilestone(type) {
    return ['Arma', 'Armadura', 'Artefacto / Reliquia', 'Montura / Vehículo', 'Refugio / Territorio'].includes(type);
}

function milestoneOptionsHtml() {
    return MILESTONE_CATEGORIES.map(category => `
        <optgroup label="${category.label}">
            ${category.types.map(type => `<option value="${type.name}" title="${type.hint}">${type.name}</option>`).join('')}
        </optgroup>
    `).join('');
}

// Tab Switching
function switchTab(tab) {
    document.getElementById('section-management').classList.add('hidden');
    document.getElementById('section-battle').classList.add('hidden');
    document.getElementById('nav-management').classList.replace('bg-gray-800', 'text-gray-300');
    document.getElementById('nav-battle').classList.replace('bg-gray-800', 'text-gray-300');
    
    document.getElementById(`section-${tab}`).classList.remove('hidden');
    document.getElementById(`nav-${tab}`).classList.add('bg-gray-800');
    document.getElementById(`nav-${tab}`).classList.remove('text-gray-300');

    if (tab === 'battle') {
        populateBattleDeckSelect();
    }
}
function populateBattleDeckSelect() {
    const select = document.getElementById('battle-deck-select');
    const btn = document.getElementById('btn-start-combat');
    if (!select) return;

    select.innerHTML = '<option value="">-- Selecciona un mazo --</option>';
    (state.decks || []).forEach((deck, idx) => {
        const nombre = deck.nombre || deck.name || `Mazo ${idx + 1}`;
        const chars = deck.personajes || deck.characters || [];
        select.innerHTML += `<option value="${idx}">${escapeHtml(nombre)} (${chars.length} cartas)</option>`;
    });

    if (btn) btn.disabled = true;
}

function onBattleDeckSelect() {
    const select = document.getElementById('battle-deck-select');
    const btn = document.getElementById('btn-start-combat');
    const rewardContainer = document.getElementById('reward-selection-container');
    const rewardGrid = document.getElementById('reward-cards-grid');
    if (!select || !btn || !rewardContainer || !rewardGrid) return;
    
    if (select.value === '') {
        btn.disabled = true;
        rewardContainer.classList.add('hidden');
        return;
    }

    const selectedIndex = parseInt(select.value);
    const deck = state.decks[selectedIndex];
    const chars = deck.personajes || deck.characters || [];
    
    // Regla: Extraer únicos para el selector
    const uniqueChars = [];
    const seen = new Set();
    for (const c of chars) {
        const cId = c.id || c.name || c.nombre;
        if (!seen.has(cId)) { seen.add(cId); uniqueChars.push(c); }
    }

    rewardGrid.innerHTML = uniqueChars.map(c => `
        <label class="flex items-center gap-2 bg-gray-800 p-2 rounded cursor-pointer hover:bg-gray-700 border border-transparent hover:border-gray-500 transition">
            <input type="checkbox" name="reward_char" value="${c.id || c.nombre || c.name}" onchange="checkRewardSelection()" class="w-4 h-4 text-primary bg-gray-900 border-gray-600 rounded">
            <span class="text-xs text-white truncate" title="${escapeAttr(c.name || c.nombre)}">${escapeHtml(c.name || c.nombre)}</span>
        </label>
    `).join('');

    rewardContainer.classList.remove('hidden');
    btn.disabled = true;
}
function checkRewardSelection() {
    const checkboxes = document.querySelectorAll('input[name="reward_char"]:checked');
    const btn = document.getElementById('btn-start-combat');
    const warning = document.getElementById('reward-selection-warning');
    
    if (checkboxes.length === 3) {
        btn.disabled = false;
        warning.classList.add('hidden');
    } else {
        btn.disabled = true;
        warning.classList.remove('hidden');
    }
}
function getCardStatValue(char, statKey) {
    if (!char) return 0;
    const stats = char.stats || char.atributos || {};
    if (statKey === 'INT') return Number(stats.INT ?? stats.inteligencia ?? 50);
    if (statKey === 'STR') return Number(stats.STR ?? stats.fuerza ?? 50);
    if (statKey === 'SPD') return Number(stats.SPD ?? stats.velocidad ?? 50);
    if (statKey === 'MAG') return Number(stats.MAG ?? stats.magia ?? 50);
    return 50;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startCombat() {
    const select = document.getElementById('battle-deck-select');
    if (!select || select.value === '') return;

    const selectedIndex = parseInt(select.value);
    const playerDeckObj = state.decks[selectedIndex];
    if (!playerDeckObj) return;

    const rawPlayerChars = playerDeckObj.personajes || playerDeckObj.characters || [];
    
    // Regla: No repetir personajes en mazo ni mano (cada personaje aparece una sola vez)
    const uniquePlayerChars = [];
    const pSeen = new Set();
    for (const c of rawPlayerChars) {
        const charId = c.id || c.name || c.nombre;
        if (!pSeen.has(charId)) {
            pSeen.add(charId);
            uniquePlayerChars.push(c);
        }
    }
    const playerDeckPool = uniquePlayerChars.map(c => JSON.parse(JSON.stringify(c)));

    // Regla: Mazo rival sin personajes repetidos
    const availableChars = state.characters || [];
    let opponentDeckPool = [];
    if (availableChars.length > 0) {
        const shuffledAvailable = [...availableChars];
        shuffleArray(shuffledAvailable);
        const uniqueOpponentChars = [];
        const oSeen = new Set();
        for (const c of shuffledAvailable) {
            const charId = c.id || c.name || c.nombre;
            if (!oSeen.has(charId)) {
                oSeen.add(charId);
                uniqueOpponentChars.push(c);
            }
        }
        opponentDeckPool = uniqueOpponentChars.map(c => JSON.parse(JSON.stringify(c)));
    }

    shuffleArray(playerDeckPool);
    shuffleArray(opponentDeckPool);

    const playerHand = playerDeckPool.splice(0, 5);
    const opponentHand = opponentDeckPool.splice(0, 5);

    // Regla: Las cartas del oponente inician boca abajo
    opponentHand.forEach(c => c.revealed = false);

    const rewardCheckboxes = document.querySelectorAll('input[name="reward_char"]:checked');
    const rewardedCardIds = Array.from(rewardCheckboxes).map(cb => cb.value);
    const rewardStats = {};
    rewardedCardIds.forEach(id => {
        rewardStats[id] = { kills: 0, survived: true };
    });

    window.activeBattle = {
        playerDeckName: playerDeckObj.nombre || playerDeckObj.name || 'Tu Mazo',
        playerDeckPool: playerDeckPool,
        playerHand: playerHand,
        opponentDeckName: "Mazo Enemigo",
        opponentDeckPool: opponentDeckPool,
        opponentHand: opponentHand,
        playerSelections: { INT: null, STR: null, SPD: null, MAG: null },
        isLocked: false,
        rewardStats: rewardStats
    };

    document.getElementById('battle-deck-selection').classList.add('hidden');
    document.getElementById('battle-arena-view').classList.remove('hidden');

    renderBattleArena();
}
function closeBattleArena() {
    document.getElementById('battle-arena-view').classList.add('hidden');
    document.getElementById('battle-deck-selection').classList.remove('hidden');
}
function selectPlayerStat(cardIndex, statKey) {
    if (!window.activeBattle || window.activeBattle.isLocked) return;

    const pSel = window.activeBattle.playerSelections;

    for (const key in pSel) {
        if (pSel[key] === cardIndex && key !== statKey) {
            pSel[key] = null;
        }
    }

    if (pSel[statKey] === cardIndex) {
        pSel[statKey] = null;
    } else {
        pSel[statKey] = cardIndex;
    }
    renderBattleArena();
}

function getOpponentSelections(opponentHand, playerHand) {
    const stats = ['INT', 'STR', 'SPD', 'MAG'];
    
    function getPermutations(hand) {
        const k = Math.min(4, hand.length);
        const results = [];
        const indices = Array.from({length: hand.length}, (_, i) => i);
        
        function permute(arr, memo = []) {
            if (memo.length === k) {
                results.push(memo);
                return;
            }
            for (let i = 0; i < arr.length; i++) {
                const curr = arr.slice();
                const next = curr.splice(i, 1);
                permute(curr, memo.concat(next));
            }
        }
        permute(indices);
        
        const assignments = [];
        function getSlotCombinations(slots, items, current = {}, slotIdx = 0, itemIdx = 0) {
            if (itemIdx === items.length) {
                assignments.push({ INT: null, STR: null, SPD: null, MAG: null, ...current });
                return;
            }
            if (slotIdx === slots.length) return;
            
            current[slots[slotIdx]] = items[itemIdx];
            getSlotCombinations(slots, items, current, slotIdx + 1, itemIdx + 1);
            delete current[slots[slotIdx]];
            
            getSlotCombinations(slots, items, current, slotIdx + 1, itemIdx);
        }
        
        results.forEach(perm => {
            getSlotCombinations(stats, perm);
        });
        
        return assignments.length > 0 ? assignments : [{ INT: null, STR: null, SPD: null, MAG: null }];
    }

    const botPerms = getPermutations(opponentHand);
    const playerPerms = getPermutations(playerHand || []);

    function getUtility(bAssign, pAssign) {
        let u = 0;
        stats.forEach(statKey => {
            const bIdx = bAssign[statKey];
            const pIdx = pAssign[statKey];
            
            const bVal = bIdx !== null ? getCardStatValue(opponentHand[bIdx], statKey) : 0;
            const pVal = pIdx !== null ? getCardStatValue(playerHand[pIdx], statKey) : 0;
            
            if (bVal > pVal) {
                u += (bVal - pVal) + 50;
            } else if (bVal < pVal) {
                u -= (pVal - bVal) + 50; 
            }
        });
        return u;
    }

    let maxP0 = -Infinity;
    let P_L0 = playerPerms[0];
    playerPerms.forEach(pAssign => {
        let greedyScore = 0;
        stats.forEach(s => {
            if (pAssign[s] !== null) greedyScore += getCardStatValue(playerHand[pAssign[s]], s);
        });
        if (greedyScore > maxP0) { maxP0 = greedyScore; P_L0 = pAssign; }
    });

    let maxB1 = -Infinity;
    let B_L1 = botPerms[0];
    botPerms.forEach(bAssign => {
        const u = getUtility(bAssign, P_L0);
        if (u > maxB1) { maxB1 = u; B_L1 = bAssign; }
    });

    let maxP1 = -Infinity;
    let P_L1 = playerPerms[0];
    playerPerms.forEach(pAssign => {
        const u = -getUtility(B_L1, pAssign);
        if (u > maxP1) { maxP1 = u; P_L1 = pAssign; }
    });

    let maxBotUtility = -Infinity;
    let finalBotAssignment = botPerms[0];

    botPerms.forEach(bAssign => {
        const expectedUtility = (0.4 * getUtility(bAssign, P_L0)) + (0.6 * getUtility(bAssign, P_L1));
        if (expectedUtility > maxBotUtility) {
            maxBotUtility = expectedUtility;
            finalBotAssignment = bAssign;
        }
    });

    return finalBotAssignment;
}
function executeBattleRound() {
    if (!window.activeBattle || window.activeBattle.isLocked) return;

    const b = window.activeBattle;
    const pSel = b.playerSelections;

    const selectedCount = Object.values(pSel).filter(val => val !== null).length;
    const requiredSelections = Math.min(4, b.playerHand.length);

    if (selectedCount < requiredSelections) {
        alert(`Debes seleccionar un atributo para todas tus cartas disponibles (necesitas seleccionar ${requiredSelections}) antes de iniciar el combate.`);
        return;
    }

    b.isLocked = true;
    const oSel = getOpponentSelections(b.opponentHand, b.playerHand);

    const stats = [
        { key: 'INT', name: 'Inteligencia' },
        { key: 'STR', name: 'Fuerza' },
        { key: 'SPD', name: 'Velocidad' },
        { key: 'MAG', name: 'Magia' }
    ];

    const pEliminatedIndices = new Set();
    const oEliminatedIndices = new Set();
    const logs = [];

    stats.forEach(stat => {
        const pIdx = pSel[stat.key];
        const oIdx = oSel[stat.key];
        const hasOpponentCard = oIdx !== null && oIdx !== undefined && b.opponentHand[oIdx];
        const oCard = hasOpponentCard ? b.opponentHand[oIdx] : null;
        const oVal = hasOpponentCard ? getCardStatValue(oCard, stat.key) : 0;
        const oName = hasOpponentCard ? (oCard.name || oCard.nombre || 'Enemigo') : 'sin rival asignado';

        if (pIdx === null || pIdx === undefined) {
            if (hasOpponentCard) {
                logs.push(`🔴 <strong>${stat.name}:</strong> Sin carta asignada (0) perdió ante ${oName} (${oVal}).`);
            } else {
                logs.push(`⚪ <strong>${stat.name}:</strong> Sin cartas asignadas por ningún equipo.`);
            }
        } else {
            const pCard = b.playerHand[pIdx];
            const pVal = getCardStatValue(pCard, stat.key);
            const pName = pCard.name || pCard.nombre || 'Tu personaje';

            if (!hasOpponentCard) {
                logs.push(`🟢 <strong>${stat.name}:</strong> ${pName} (${pVal}) no encontró rival asignado y conserva la carta.`);
            } else if (pVal > oVal) {
                const remaining = pVal - oVal;
                logs.push(`🟢 <strong>${stat.name}:</strong> ${pName} (${pVal}) venció a ${oName} (${oVal}). Su atributo queda en ${remaining}.`);
                oEliminatedIndices.add(oIdx);
                if (!pCard.stats) {
                    pCard.stats = {
                        INT: getCardStatValue(pCard, 'INT'),
                        STR: getCardStatValue(pCard, 'STR'),
                        SPD: getCardStatValue(pCard, 'SPD'),
                        MAG: getCardStatValue(pCard, 'MAG')
                    };
                }
                pCard.stats[stat.key] = remaining;
                
                const pId = pCard.id || pCard.nombre || pCard.name;
                if (b.rewardStats && b.rewardStats[pId]) {
                    b.rewardStats[pId].kills += 1;
                }
            } else if (pVal < oVal) {
                const remaining = oVal - pVal;
                logs.push(`🔴 <strong>${stat.name}:</strong> ${pName} (${pVal}) perdió ante ${oName} (${oVal}). El atributo rival queda en ${remaining}.`);
                pEliminatedIndices.add(pIdx);
                if (!oCard.stats) {
                    oCard.stats = {
                        INT: getCardStatValue(oCard, 'INT'),
                        STR: getCardStatValue(oCard, 'STR'),
                        SPD: getCardStatValue(oCard, 'SPD'),
                        MAG: getCardStatValue(oCard, 'MAG')
                    };
                }
                oCard.stats[stat.key] = remaining;
                
                const pId = pCard.id || pCard.nombre || pCard.name;
                if (b.rewardStats && b.rewardStats[pId]) {
                    b.rewardStats[pId].survived = false;
                }
            } else {
                logs.push(`🟡 <strong>${stat.name}:</strong> Empate entre ${pName} (${pVal}) y ${oName} (${oVal}).`);
            }
        }
    });

    // Regla: Revelar cartas del oponente que hayan combatido y sobrevivido / empatado
    stats.forEach(stat => {
        const oIdx = oSel[stat.key];
        if (oIdx !== null && oIdx !== undefined && b.opponentHand[oIdx]) {
            if (!oEliminatedIndices.has(oIdx)) {
                b.opponentHand[oIdx].revealed = true;
            }
        }
    });

    const pLosingCards = Array.from(pEliminatedIndices).map(idx => b.playerHand[idx]);
    const oLosingCards = Array.from(oEliminatedIndices).map(idx => b.opponentHand[idx]);

    b.playerHand = b.playerHand.filter((_, idx) => !pEliminatedIndices.has(idx));
    b.opponentHand = b.opponentHand.filter((_, idx) => !oEliminatedIndices.has(idx));

    pLosingCards.forEach(card => {
        const pId = card.id || card.nombre || card.name;
        const poolIdx = b.playerDeckPool.findIndex(c => (c.id || c.nombre || c.name) === pId);
        if (poolIdx !== -1) b.playerDeckPool.splice(poolIdx, 1);
    });

    oLosingCards.forEach(card => {
        const oId = card.id || card.nombre || card.name;
        const poolIdx = b.opponentDeckPool.findIndex(c => (c.id || c.nombre || c.name) === oId);
        if (poolIdx !== -1) b.opponentDeckPool.splice(poolIdx, 1);
    });

    while (b.playerHand.length < 5 && b.playerDeckPool.length > 0) {
        b.playerHand.push(b.playerDeckPool.shift());
    }
    while (b.opponentHand.length < 5 && b.opponentDeckPool.length > 0) {
        const newCard = b.opponentDeckPool.shift();
        newCard.revealed = false; // Regla: Cartas robadas del mazo entran boca abajo
        b.opponentHand.push(newCard);
    }

    b.playerSelections = { INT: null, STR: null, SPD: null, MAG: null };
    b.isLocked = false;

    let endMessage = "";
    let matchEnded = false;
    let teamWon = false;

    if (b.playerHand.length === 0 && b.opponentHand.length === 0) {
        endMessage = "<br><strong class='text-yellow-400 text-sm'>¡El combate ha terminado en EMPATE TOTAL!</strong>";
        matchEnded = true;
    } else if (b.playerHand.length === 0) {
        endMessage = "<br><strong class='text-red-500 text-sm'>¡Has perdido todas tus cartas! DERROTA.</strong>";
        matchEnded = true;
        teamWon = false;
    } else if (b.opponentHand.length === 0) {
        endMessage = "<br><strong class='text-emerald-400 text-sm'>¡Has eliminado todas las cartas enemigas! ¡VICTORIA!</strong>";
        matchEnded = true;
        teamWon = true;
    }

    if (matchEnded && b.rewardStats && !b.rewardsApplied) {
        b.rewardsApplied = true;
        const rewards = applyBattleRewards(teamWon);
        endMessage += "<br><br><strong class='text-indigo-400 text-sm'>Recompensas calculadas. Guarda los puntos desde la ventana emergente.</strong>";
        saveState();
        setTimeout(() => showBattleRewardsModal(rewards), 450);
    }

    b.battleLog = logs.join('<br>') + endMessage;
    renderBattleArena();
}

function calculateBattleReward(stats, teamWon) {
    let posGain = teamWon ? 3 : 0;
    let negGain = teamWon ? 0 : 3;

    if (!stats.survived) {
        if (stats.kills === 0) {
            negGain += 2;
        } else if (stats.kills === 1) {
            posGain += 1;
            negGain += 1;
        } else {
            posGain += 2;
        }
    }

    return { posGain, negGain };
}

function applyBattleRewards(teamWon) {
    const b = window.activeBattle;
    if (!b?.rewardStats) return [];

    return Object.keys(b.rewardStats).map(charId => {
        const stats = b.rewardStats[charId];
        const realChar = state.characters.find(c => c.id === charId || c.nombre === charId || c.name === charId);
        if (!realChar) return null;

        const { posGain, negGain } = calculateBattleReward(stats, teamWon);
        realChar.points.pos += posGain;
        realChar.points.neg += negGain;
        realChar.battles = (realChar.battles || 0) + 1;

        return {
            id: realChar.id,
            name: realChar.name,
            image: realChar.image || realChar.imagen || buildCharacterImagePath(realChar.name),
            posGain,
            negGain
        };
    }).filter(Boolean);
}

function showBattleRewardsModal(rewards = []) {
    const modal = document.getElementById('battle-rewards-modal');
    const grid = document.getElementById('battle-rewards-cards');
    if (!modal || !grid) return;

    grid.innerHTML = rewards.map((reward, index) => `
        <article class="battle-reward-card" style="animation-delay: ${index * 140}ms">
            <div class="battle-reward-card__image">
                ${getImageHtml(reward.image, reward.name, 'w-full h-full object-cover')}
            </div>
            <h4 class="battle-reward-card__name">${escapeHtml(reward.name)}</h4>
            <div class="battle-reward-card__points">
                <span class="battle-reward-points battle-reward-points--pos" style="animation-delay: ${420 + index * 140}ms">+${reward.posGain}</span>
                <span class="battle-reward-points battle-reward-points--neg" style="animation-delay: ${560 + index * 140}ms">+${reward.negGain}</span>
            </div>
        </article>
    `).join('');

    modal.classList.remove('hidden');
}

function saveBattleRewardPoints() {
    const button = document.getElementById('btn-save-battle-rewards');
    if (button) {
        button.disabled = true;
        button.classList.add('battle-reward-save--saving');
        button.textContent = 'GUARDANDO...';
    }

    saveState();
    downloadCharactersJson();

    setTimeout(() => {
        document.getElementById('battle-rewards-modal')?.classList.add('hidden');
        closeBattleArena();
        switchTab('management');
        if (button) {
            button.disabled = false;
            button.classList.remove('battle-reward-save--saving');
            button.textContent = 'GUARDAR PUNTOS';
        }
    }, 800);
}

function renderBattleArena() {
    if (!window.activeBattle) return;

    const b = window.activeBattle;

    const pName = document.getElementById('player-deck-name');
    const pCount = document.getElementById('player-deck-count');
    if (pName) pName.innerText = b.playerDeckName;
    if (pCount) pCount.innerText = b.playerHand.length + b.playerDeckPool.length;

    const oName = document.getElementById('opponent-deck-name');
    const oCount = document.getElementById('opponent-deck-count');
    if (oName) oName.innerText = b.opponentDeckName;
    if (oCount) oCount.innerText = b.opponentHand.length + b.opponentDeckPool.length;

    renderOpponentCards(b.opponentHand);
    renderCentralBattleControl();
    renderPlayerCards(b.playerHand, b.playerSelections);
}

function renderOpponentCards(cards) {
    const container = document.getElementById('opponent-cards-container');
    if (!container) return;

    if (!cards || cards.length === 0) {
container.innerHTML = '<p class="col-span-full text-xs text-gray-500 italic text-center py-4">Sin cartas en mano.</p>';
return;
    }

    container.innerHTML = cards.map(char => {
const name = char.name || char.nombre || 'Oponente';
const image = char.image || char.imagen || buildCharacterImagePath(name);

const intVal = getCardStatValue(char, 'INT');
const strVal = getCardStatValue(char, 'STR');
const spdVal = getCardStatValue(char, 'SPD');
const magVal = getCardStatValue(char, 'MAG');

return `
    <div class="bg-dark/80 border border-red-900/40 rounded-lg p-1.5 md:p-2 flex flex-col gap-1.5 shadow-lg h-full max-h-full overflow-hidden">
        
        <!-- 1. Nombre en la parte superior -->
        <span class="text-[10px] md:text-xs font-bold text-red-400 truncate w-full text-center shrink-0">
            ${escapeHtml(name)}
        </span>
        
        <!-- 2. Imagen 100% visible: flex-1, min-h-0 y object-contain son la clave -->
        <div class="flex-1 w-full rounded flex justify-center items-center bg-black border border-gray-800 min-h-0">
            ${getImageHtml(image, name, 'w-full h-full object-contain p-0.5')}
        </div>
        
        <!-- 3. Badges en el pie -->
        <div class="grid grid-cols-2 gap-1 w-full text-[8px] md:text-[9px] font-bold shrink-0">
            <span class="bg-blue-950/80 text-blue-300 border border-blue-800/40 px-1 py-[2px] rounded text-center truncate">INT ${intVal}</span>
            <span class="bg-red-950/80 text-red-300 border border-red-800/40 px-1 py-[2px] rounded text-center truncate">FZA ${strVal}</span>
            <span class="bg-yellow-950/80 text-yellow-300 border border-yellow-800/40 px-1 py-[2px] rounded text-center truncate">VEL ${spdVal}</span>
            <span class="bg-green-950/80 text-green-300 border border-green-800/40 px-1 py-[2px] rounded text-center truncate">MAG ${magVal}</span>
        </div>

    </div>
`;
    }).join('');
}
function renderCentralBattleControl() {
    const actionContainer = document.getElementById('battle-action-center');
    const resultsContainer = document.getElementById('battle-results-center');
    if (!actionContainer) return;

    const b = window.activeBattle;
    const pSel = b.playerSelections;

    const selectedCount = Object.values(pSel).filter(val => val !== null).length;
    const requiredSelections = Math.min(4, b.playerHand.length);
    const isReadyToBattle = selectedCount === requiredSelections;

    const getSelBadge = (statKey, label, colorClass) => {
        const idx = pSel[statKey];
        if (idx === null || idx === undefined) {
            return `<span class="px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-semibold bg-gray-800 text-gray-400 border border-gray-700 whitespace-nowrap">${label}: --</span>`;
        }
        const cardName = b.playerHand[idx] ? (b.playerHand[idx].name || b.playerHand[idx].nombre) : `Carta ${idx + 1}`;
        return `<span class="px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold ${colorClass} shadow-md max-w-[110px] md:max-w-[140px] truncate inline-block text-center" title="${escapeAttr(cardName)}">${label}: ${escapeHtml(cardName)}</span>`;
    };

    actionContainer.innerHTML = `
        <div class="flex flex-col sm:flex-row gap-1 md:gap-2 items-center">
            ${getSelBadge('INT', '🧠 INT', 'bg-blue-900/80 text-blue-200 border border-blue-500')}
            ${getSelBadge('STR', '⚔️ FZA', 'bg-red-900/80 text-red-200 border border-red-500')}
        </div>
        
        <button onclick="executeBattleRound()" ${!isReadyToBattle || b.isLocked || b.playerHand.length === 0 || b.opponentHand.length === 0 ? 'disabled' : ''} 
                class="metal-btn bg-gradient-to-r from-red-600 via-green-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 disabled:border-gray-700 border border-indigo-400 text-white font-extrabold text-xs sm:text-base md:text-lg py-2 md:py-2.5 px-3 sm:px-6 md:px-8 rounded-full shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed flex items-center gap-1 md:gap-2 shrink-0">
            <span>⚔️</span> INICIAR BATALLA
        </button>

        <div class="flex flex-col sm:flex-row gap-1 md:gap-2 items-center">
            ${getSelBadge('MAG', '🔮 MAG', 'bg-green-900/80 text-green-200 border border-green-500')}
            ${getSelBadge('SPD', '⚡ VEL', 'bg-yellow-900/80 text-yellow-200 border border-yellow-500')}
        </div>
    `;

    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <h3 class="text-[10px] md:text-xs font-bold text-gray-400 mb-1 uppercase tracking-widest shrink-0">Resultados</h3>
            <div class="flex-grow min-h-0 overflow-y-auto bg-dark/90 border border-gray-700/60 rounded-lg p-1.5 md:p-2 text-[10px] md:text-xs text-gray-200 text-left shadow-inner leading-relaxed flex flex-col justify-start">
                ${b.battleLog ? b.battleLog : '<span class="text-gray-500 italic text-center w-full">Sin resultados</span>'}
            </div>
        `;
    }
}

       function renderPlayerCards(cards, selections) {
    const container = document.getElementById('player-cards-container');
    if (!container) return;

    if (!cards || cards.length === 0) {
container.innerHTML = '<p class="col-span-full text-xs text-gray-500 italic text-center py-4">Sin cartas en mano.</p>';
return;
    }

    container.innerHTML = cards.map((char, cardIdx) => {
const name = char.name || char.nombre || 'Personaje';
const image = char.image || char.imagen || buildCharacterImagePath(name);

const intVal = getCardStatValue(char, 'INT');
const strVal = getCardStatValue(char, 'STR');
const spdVal = getCardStatValue(char, 'SPD');
const magVal = getCardStatValue(char, 'MAG');

const isIntSelected = selections.INT === cardIdx;
const isStrSelected = selections.STR === cardIdx;
const isSpdSelected = selections.SPD === cardIdx;
const isMagSelected = selections.MAG === cardIdx;

const getBtnClass = (isSelected, baseBg, activeBg, activeBorder) => {
    if (isSelected) {
        return `stat-metal-button is-selected ${activeBg} text-white ${activeBorder} border-2 scale-105 shadow-lg font-black animate-pulse`;
    }
    return `stat-metal-button ${baseBg} hover:border-gray-300 text-gray-200 border border-transparent`;
};

return `
    <div class="bg-dark/80 border border-indigo-900/50 rounded-lg p-1.5 md:p-2 flex flex-col gap-1.5 shadow-lg hover:border-indigo-500 transition-all h-full max-h-full overflow-hidden">
        
        <!-- 1. Nombre en la parte superior con ajuste automático de letra y énfasis visual -->
        <div class="w-full h-6 px-1 flex items-center justify-center bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 border border-indigo-400/60 rounded shadow-md overflow-hidden shrink-0">
            <svg viewBox="0 0 250 30" preserveAspectRatio="xMidYMid meet" class="w-full h-full">
                <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="#a5f3fc" font-weight="900" font-size="16" letter-spacing="0.5" filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.8))">
                    ${escapeHtml(name.toUpperCase())}
                </text>
            </svg>
        </div>
        
        <!-- 2. Imagen 100% visible al centro -->
        <div class="flex-1 w-full rounded flex justify-center items-center bg-black border border-gray-800 min-h-0">
            ${getImageHtml(image, name, 'w-full h-full object-contain p-0.5')}
        </div>
        
        <!-- 3. Botones interactivos en formato de grilla 2x2 en el pie -->
        <div class="grid grid-cols-2 gap-1 w-full text-[8px] md:text-[9px] font-bold shrink-0">
            <button onclick="selectPlayerStat(${cardIdx}, 'INT')" 
                    class="py-1 px-1 w-full rounded text-center transition-all truncate ${getBtnClass(isIntSelected, 'bg-blue-950/80 text-blue-300 border-blue-800/40', 'bg-blue-600', 'border-blue-300')}"
                    title="Click para seleccionar Inteligencia">
                INT ${intVal} ${isIntSelected ? '✓' : ''}
            </button>
            
            <button onclick="selectPlayerStat(${cardIdx}, 'STR')" 
                    class="py-1 px-1 w-full rounded text-center transition-all truncate ${getBtnClass(isStrSelected, 'bg-red-950/80 text-red-300 border-red-800/40', 'bg-red-600', 'border-red-300')}"
                    title="Click para seleccionar Fuerza">
                FZA ${strVal} ${isStrSelected ? '✓' : ''}
            </button>
            
            <button onclick="selectPlayerStat(${cardIdx}, 'SPD')" 
                    class="py-1 px-1 w-full rounded text-center transition-all truncate ${getBtnClass(isSpdSelected, 'bg-yellow-950/80 text-yellow-300 border-yellow-800/40', 'bg-yellow-600', 'border-yellow-300')}"
                    title="Click para seleccionar Velocidad">
                VEL ${spdVal} ${isSpdSelected ? '✓' : ''}
            </button>
            
            <button onclick="selectPlayerStat(${cardIdx}, 'MAG')" 
                    class="py-1 px-1 w-full rounded text-center transition-all truncate ${getBtnClass(isMagSelected, 'bg-green-950/80 text-green-300 border-green-800/40', 'bg-green-600', 'border-green-300')}"
                    title="Click para seleccionar Magia">
                MAG ${magVal} ${isMagSelected ? '✓' : ''}
            </button>
        </div>
    </div>
`;
    }).join('');
}
addDomEvent('create-char-form', 'submit', (e) => {
    e.preventDefault();
    const editId = document.getElementById('char-edit-id').value;
    const characterData = {
        name: document.getElementById('char-name').value.trim(),
        type: document.getElementById('char-type').value,
        image: buildCharacterImagePath(document.getElementById('char-name').value),
        story: document.getElementById('char-story').value,
        stats: {
            INT: parseInt(document.getElementById('char-int').value),
            STR: parseInt(document.getElementById('char-str').value),
            SPD: parseInt(document.getElementById('char-spd').value),
            MAG: parseInt(document.getElementById('char-mag').value)
        }
    };
    if (!CHARACTER_TYPES.includes(characterData.type)) return alert('Debes elegir un tipo de personaje válido.');
    if (editId) {
        const char = state.characters.find(c => c.id === editId);
        if (!char) return alert('No se encontró el personaje a editar.');
        char.name = characterData.name;
        char.image = characterData.image;
        enforceDestinyStats(char);
        downloadCharactersJson();
    } else {
        state.characters.push({
            id: generateId(), ...characterData,
            level: 1, cap: 100, breakthroughPoints: { INT: 0, STR: 0, SPD: 0, MAG: 0 }, points: { pos: 0, neg: 0 }, battles: 0,
            milestones: [], equipment: [], mental: [], world: normalizeWorldStatus(), destiny: normalizeDestiny(), pendingMilestones: 0, pendingStoryChange: false, pendingAction: null
        });
    }
    saveState();
    resetCharacterForm();
    toggleCreateForm(false);
});

function renderGallery() {
    const container = document.getElementById('char-gallery');
    container.innerHTML = '';
    document.getElementById('char-count').innerText = state.characters.length;

    state.characters.forEach(char => {
        const totalPoints = char.points.pos + char.points.neg;
        const needsPoints = totalPoints >= ATTRIBUTE_ASSIGNMENT_THRESHOLD;
        const needsMilestone = canAddMilestone(char);
        
        // Prioritize setting pending action states visually
        if (needsPoints) char.pendingAction = 'points';
        
        let badges = '';
        if (char.pendingAction === 'points') badges += `<span class="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow animate-pulse">¡50 Puntos listos!</span>`;
        if (needsMilestone) badges += `<span class="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded shadow animate-pulse">¡Hito Disponible!</span>`;

        const card = document.createElement('div');
        card.className = 'char-card relative cursor-pointer';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Abrir ficha de ${getDisplayName(char)}`);
        card.onclick = () => openCharModal(char.id);
        card.onkeydown = (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openCharModal(char.id); } };
        card.innerHTML = `
            <div class="char-card__inner flex flex-col justify-between">
                <header class="char-card__header">
                    <h3 class="char-card__name font-black text-base">${escapeHtml(getDisplayName(char))}</h3>
                    <span class="char-card__level" aria-label="Nivel ${char.level}">${'★'.repeat(Math.min(5, Math.max(1, char.level || 1)))}</span>
                </header>
                <div class="char-card__media">
                    ${badges}
                    ${getImageHtml(char.image, char.name, 'char-card__image')}
                </div>
                <div class="char-card__lore">
                    <div class="flex flex-wrap justify-center">
                        ${(char.type || 'Sin tipo').split(',').map(t => `<span class="char-card__type">${escapeHtml(t.trim())}</span>`).join('')}
                    </div>
                </div>
                <footer class="char-card__footer">
                    <div class="char-card__stats" aria-label="Atributos principales">
                        <span class="char-card__stat text-blue-300"><strong>INT</strong><span>${getDisplayedStat(char, 'INT')}</span></span>
                        <span class="char-card__stat text-red-300"><strong>FZA</strong><span>${getDisplayedStat(char, 'STR')}</span></span>
                        <span class="char-card__stat text-yellow-300"><strong>VEL</strong><span>${getDisplayedStat(char, 'SPD')}</span></span>
                        <span class="char-card__stat text-green-300"><strong>MAG</strong><span>${getDisplayedStat(char, 'MAG')}</span></span>
                    </div>
                </footer>
            </div>
        `;
        container.appendChild(card);
    });
}
let currentCharId = null;
let currentDeck = new Array(50).fill(null);
let editingDeckIndex = null;

function renderDeckModal() {
    const availableContainer = document.getElementById('deck-available-chars');
    const slotsContainer = document.getElementById('deck-slots');
    const counterBadge = document.getElementById('deck-counter-badge');
    const btnSave = document.getElementById('btn-save-deck');
    
    const count = currentDeck.filter(Boolean).length;
    if (counterBadge) counterBadge.innerText = `${count} / 50`;
    if (btnSave) btnSave.disabled = count < 30;

    availableContainer.innerHTML = state.characters.map(char => {
        const inDeck = currentDeck.some(slot => slot && (slot.id === char.id || slot.name === char.name));
        return `
            <div onclick="addCharToDeck('${escapeAttr(char.id)}')" class="flex flex-col items-center gap-2 cursor-pointer group ${inDeck ? 'opacity-40 pointer-events-none' : ''}">
                <div class="w-full aspect-[59/86] rounded-md border border-gray-600 overflow-hidden bg-black shadow-md transition-transform transform group-hover:-translate-y-1 group-hover:border-primary group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                    ${char.image ? `<img src="${escapeAttr(char.image)}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-xs text-gray-500">Sin img</div>`}
                </div>
                <span class="text-xs text-center font-semibold text-gray-300 w-full truncate px-1">${escapeHtml(getDisplayName(char))}</span>
            </div>
        `;
    }).join('');

    let slotsHtml = '';
    for (let i = 0; i < 50; i++) {
        const char = currentDeck[i];
        if (char) {
            slotsHtml += `
                <div onclick="removeCharFromDeck(${i})" class="flex flex-col items-center gap-2 cursor-pointer group">
                    <div class="w-full aspect-[59/86] rounded-md border-2 border-primary bg-gray-900 overflow-hidden shadow-md transition-transform transform group-hover:-translate-y-1 hover:border-red-500">
                        ${char.image ? `<img src="${escapeAttr(char.image)}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-xs text-gray-500">Sin img</div>`}
                    </div>
                    <span class="text-xs text-center font-semibold text-gray-300 w-full truncate px-1">${escapeHtml(getDisplayName(char))}</span>
                </div>
            `;
        } else {
            slotsHtml += `
                <div class="flex flex-col items-center gap-2">
                    <div class="w-full aspect-[59/86] rounded-md border-2 border-dashed border-gray-700 bg-gray-900/30 flex items-center justify-center shadow-inner transition-colors hover:border-gray-500 hover:bg-gray-800/50">
                        <span class="text-gray-600 font-black text-lg opacity-30">${i + 1}</span>
                    </div>
                    <span class="text-[10px] text-center font-medium text-gray-600 w-full uppercase tracking-wider">Vacío</span>
                </div>
            `;
        }
    }
    slotsContainer.innerHTML = slotsHtml;
}

function openDeckModal(deckIndex = null) {
    editingDeckIndex = deckIndex;
    const nameInput = document.getElementById('deck-name-input');
    const modalTitle = document.querySelector('#deck-modal h3');

    if (deckIndex !== null && state.decks[deckIndex]) {
        const deck = state.decks[deckIndex];
        if (modalTitle) modalTitle.innerText = 'Editar Mazo';
        if (nameInput) nameInput.value = deck.nombre || deck.name || '';

        currentDeck = new Array(50).fill(null);
        const deckChars = deck.personajes || deck.characters || [];
        deckChars.forEach((c, idx) => {
            if (idx < 50) {
                const match = state.characters.find(sc => sc.id === c.id || sc.name === (c.nombre || c.name)) || normalizeCharacter(c);
                currentDeck[idx] = match;
            }
        });
    } else {
        if (modalTitle) modalTitle.innerText = 'Nuevo Mazo';
        if (nameInput) nameInput.value = '';
        currentDeck = new Array(50).fill(null);
    }

    renderDeckModal();
    document.getElementById('deck-modal').classList.remove('hidden');
}

function viewDeck(index) {
    const deck = state.decks[index];
    if (!deck) return;

    const titleEl = document.getElementById('view-deck-title');
    const container = document.getElementById('view-deck-chars-container');
    
    if (titleEl) titleEl.innerText = `Mazo: ${deck.nombre || deck.name || 'Sin nombre'}`;

    const chars = deck.personajes || deck.characters || [];
    if (!container) return;

    if (chars.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-400 italic">Este mazo no tiene personajes.</p>';
    } else {
        container.innerHTML = chars.map(c => {
            const name = c.nombre || c.name || 'Personaje';
            const img = c.imagen || c.image || buildCharacterImagePath(name);
            return `
                <div class="flex flex-col items-center gap-2 bg-dark/60 p-2 rounded-lg border border-gray-800">
                    <div class="w-full aspect-[59/86] rounded overflow-hidden bg-black border border-gray-700">
                        ${img ? `<img src="${escapeAttr(img)}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-xs text-gray-500">Sin img</div>`}
                    </div>
                    <span class="text-xs text-center font-bold text-gray-200 truncate w-full">${escapeHtml(name)}</span>
                </div>
            `;
        }).join('');
    }

    document.getElementById('view-deck-modal').classList.remove('hidden');
}

function deleteDeck(index) {
    if (index === null || index === undefined || index < 0 || index >= state.decks.length) return;
    const deckName = state.decks[index].nombre || state.decks[index].name || 'este mazo';
    if (confirm(`¿Estás seguro de que deseas eliminar el mazo "${deckName}"?`)) {
        state.decks.splice(index, 1);
        downloadMazosJson();
        renderDecks();
    }
}

function addCharToDeck(charId) {
    const char = state.characters.find(c => c.id === charId);
    if (!char) return;
    if (currentDeck.some(slot => slot && (slot.id === charId || slot.name === char.name))) return;

    const emptyIndex = currentDeck.findIndex(slot => slot === null);
    if (emptyIndex === -1) {
        alert('El mazo está lleno (máximo 50 personajes).');
        return;
    }

    currentDeck[emptyIndex] = char;
    renderDeckModal();
}

function removeCharFromDeck(index) {
    currentDeck[index] = null;
    renderDeckModal();
}

function saveNewDeck() {
    const activeChars = currentDeck.filter(Boolean);
    if (activeChars.length < 30) {
        alert('El mazo debe tener al menos 30 personajes.');
        return;
    }
    const nameInput = document.getElementById('deck-name-input');
    const deckName = nameInput ? nameInput.value.trim() || 'Nuevo Mazo' : 'Nuevo Mazo';

    const updatedDeck = {
        nombre: deckName,
        personajes: activeChars.map(toExportCharacter)
    };

    if (editingDeckIndex !== null && editingDeckIndex >= 0 && editingDeckIndex < state.decks.length) {
        state.decks[editingDeckIndex] = updatedDeck;
    } else {
        state.decks.push(updatedDeck);
    }

    downloadMazosJson();
    renderDecks();
    currentDeck = new Array(50).fill(null);
    editingDeckIndex = null;
    if (nameInput) nameInput.value = '';
    document.getElementById('deck-modal').classList.add('hidden');
}
function downloadMazosJson() {
    const payload = state.decks;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mazos.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
function openCharModal(id) {
    const char = state.characters.find(c => c.id === id);
    if (!char) return;
    currentCharId = id;

    document.getElementById('modal-name').innerText = getDisplayName(char);
    const modalImageFrame = document.getElementById('modal-img');
    modalImageFrame.outerHTML = getImageHtml(char.image, char.name, 'w-full h-64 object-cover rounded-lg border border-gray-700 shadow-md', 'modal-img');
    document.getElementById('modal-level').innerText = char.level;
    document.getElementById('modal-story').innerText = cleanHandwrittenStory(char.story);
    document.getElementById('modal-battles').innerText = char.battles;
    document.getElementById('modal-pos').innerText = `+${char.points.pos}`;
    document.getElementById('modal-neg').innerText = `-${char.points.neg}`;

    renderModalStats(char);
    renderProfileActions(char);
    renderMilestoneAccessButtons(char);
    renderSocieties(char);
    
    const actionArea = document.getElementById('modal-action-area');
    actionArea.innerHTML = '';
    actionArea.classList.add('hidden');

    if (char.pendingAction === 'points') {
        actionArea.classList.remove('hidden');
        actionArea.innerHTML = `
            <h4 class="text-sm font-bold text-white mb-2 flex items-center gap-2">⚠️ 50 puntos acumulados</h4>
            <p class="text-xs text-gray-300 mb-4">Asigna TODOS los puntos positivos a un atributo y TODOS los negativos a otro. Al confirmar, ambos contadores se consumen y se descargará personajes.json.</p>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs mb-1 text-success">Asignar +${char.points.pos} a:</label>
                    <select id="assign-pos" class="w-full bg-dark border border-gray-700 rounded p-1 text-white text-sm">
                        ${ATTRS.map(a => `<option value="${a.key}">${a.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-xs mb-1 text-danger">Asignar -${char.points.neg} a:</label>
                    <select id="assign-neg" class="w-full bg-dark border border-gray-700 rounded p-1 text-white text-sm">
                        ${ATTRS.map(a => `<option value="${a.key}">${a.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <button onclick="confirmPoints()" class="mt-4 w-full bg-primary hover:bg-indigo-600 text-white font-bold py-2 rounded text-sm transition">Confirmar Asignación</button>
        `;
    }

    if (char.pendingStoryChange) {
        actionArea.classList.remove('hidden');
        actionArea.innerHTML += `
            <div class="mt-4 border-t border-gray-700 pt-4">
                <h4 class="text-sm font-bold text-yellow-300 mb-2">✍️ Historia obligatoria de Nivel 2</h4>
                <p class="text-xs text-gray-300 mb-3">Antes de cerrar la evolución, modifica la historia del personaje.</p>
                <textarea id="level-story" rows="4" class="w-full bg-dark border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-primary">${escapeHtml(char.story)}</textarea>
                <button onclick="confirmStoryChange()" class="mt-3 w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-2 rounded text-sm transition">Guardar historia y descargar JSON</button>
            </div>`;
    }

    document.getElementById('char-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('char-modal').classList.add('hidden');
    currentCharId = null;
}


function renderModalStats(char) {
    const container = document.getElementById('modal-stats');
    container.innerHTML = '';
    
    ATTRS.forEach(attr => {
        const val = getDisplayedStat(char, attr.key);
        const pct = Math.min((val / char.cap) * 100, 100);
        const isCapped = val >= char.cap;
        const btText = isCapped ? `<span class="text-xs text-yellow-500 ml-2">(B-Through: ${char.breakthroughPoints[attr.key]}/5)</span>` : '';
        
        container.innerHTML += `
            <div class="bg-dark rounded-lg border border-gray-800 p-3">
                <div class="flex justify-between text-xs mb-2">
                    <span class="text-${attr.color}-400 font-bold uppercase tracking-wide">${attr.name}</span>
                    <span class="font-semibold">${val} / ${char.cap} ${btText}</span>
                </div>
                <div class="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                    <div class="bg-${attr.color}-500 h-3 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    });
}

function renderModalMilestones(char) {
    const container = document.getElementById('modal-milestone-cards');
    const milestones = (char.milestones || []).filter(m => !isAutomaticSocietyMilestone(m)).map(normalizeMilestone);
    if (milestones.length === 0) {
        container.innerHTML = '<div class="text-gray-500 italic text-xs col-span-full">Sin hitos registrados.</div>';
        return;
    }
    container.innerHTML = milestones.map(m => `
        <article class="min-h-48 rounded-xl border p-3 flex flex-col justify-between ${getMilestoneColor(m.type)}">
            ${m.image ? `<img src="${m.image}" alt="${m.name}" class="w-full aspect-square object-cover rounded-lg border border-white/10 mb-3" onerror="this.remove()">` : '<div class="w-full aspect-square rounded-lg border border-white/10 bg-black/20 mb-3 flex items-center justify-center text-3xl">✦</div>'}
            <div>
                <p class="text-[10px] uppercase tracking-[0.18em] opacity-80">${m.type}</p>
                <h5 class="font-bold text-base leading-tight mt-1">${m.name}</h5>
                <p class="text-xs font-normal leading-relaxed mt-2 opacity-90 whitespace-pre-line">${m.description}</p>
            </div>
        </article>
    `).join('');
}

function renderSocieties(char) {
    const container = document.getElementById('modal-societies');
    const socialMilestones = (char.milestones || []).filter(isAutomaticSocietyMilestone).map(normalizeMilestone);
    if (socialMilestones.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic text-xs">Sin sociedades registradas todavía.</p>';
        return;
    }
    container.innerHTML = socialMilestones.map(m => `
        <div class="rounded-lg border px-3 py-2 ${getMilestoneColor(m.type)}">
            <div class="flex justify-between gap-2 text-xs">
                <strong>${m.type}</strong>
                <span>${m.name}</span>
            </div>
            ${m.description ? `<p class="text-xs font-normal mt-1 opacity-90">${m.description}</p>` : ''}
        </div>
    `).join('');
}
function renderProfileActions(char) {
    const container = document.getElementById('modal-profile-actions');
    container.innerHTML = `
        <button title="Editar" aria-label="Editar ${escapeAttr(char.name)}" onclick="editCharacter('${char.id}'); closeModal();" class="char-card__action bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm">✏️ <span>Editar</span></button>
        <button title="Eliminar" aria-label="Eliminar ${escapeAttr(char.name)}" onclick="deleteCharacter('${char.id}'); closeModal();" class="char-card__action bg-red-950/70 hover:bg-red-900 border border-red-700 rounded-lg text-sm">🗑️ <span>Eliminar</span></button>
    `;
}
function toggleSocieties() {
    document.getElementById('modal-societies').classList.toggle('hidden');
}

function confirmPoints() {
    const char = state.characters.find(c => c.id === currentCharId);
    if (!char) return;
    const totalPoints = Number(char.points?.pos || 0) + Number(char.points?.neg || 0);
    if (totalPoints < ATTRIBUTE_ASSIGNMENT_THRESHOLD) return alert(`Necesitas acumular 50 puntos entre positivos y negativos antes de asignarlos. Actualmente tienes ${totalPoints}.`);

    const posAttr = document.getElementById('assign-pos').value;
    const negAttr = document.getElementById('assign-neg').value;

    char.stats[posAttr] = Number(char.stats[posAttr] || 0) + Number(char.points.pos || 0);
    char.stats[negAttr] = Math.max(1, Number(char.stats[negAttr] || 0) - Number(char.points.neg || 0));

    char.points.pos = 0;
    char.points.neg = 0;
    char.pendingAction = null;

    const leveledUp = grantLevelTwoMilestoneIfReady(char);
    enforceDestinyStats(char);
    saveState();
    downloadCharactersJson();
    if (leveledUp) alert(`¡${char.name} superó 100 en todos sus atributos, subió a Nivel 2 y obtuvo un hito! Ahora debes modificar su historia.`);
    openCharModal(char.id);
}

function confirmStoryChange() {
    const char = state.characters.find(c => c.id === currentCharId);
    if (!char) return;
    const nextStory = document.getElementById('level-story').value.trim();
    if (!nextStory || nextStory === char.story.trim()) return alert('La historia debe modificarse obligatoriamente.');
    char.story = nextStory;
    char.pendingStoryChange = false;
    saveState();
    downloadCharactersJson();
    openCharModal(char.id);
}

function confirmMilestone() {
    const char = state.characters.find(c => c.id === currentCharId);
    const type = document.getElementById('ms-type').value;
    const name = document.getElementById('ms-name').value.trim();
    const description = document.getElementById('ms-description').value.trim();
    const image = document.getElementById('ms-image').value.trim();
    
    if (!name || !description) {
        alert("Debes escribir el nombre y la descripción del hito.");
        return;
    }

    const milestone = { type, name, description, image };
    char.milestones.push(milestone);
    if (isEquipmentMilestone(type)) {
        char.equipment = char.equipment || [];
        char.equipment.push(normalizeEquipment({ type, name, image, notes: description, attr: type === 'Montura / Vehículo' ? 'SPD' : 'STR', mode: type === 'Refugio / Territorio' ? 'buff' : 'add' }));
    }
    if (isMentalMilestone(type)) {
        char.mental = char.mental || [];
        char.mental.push(normalizeMentalMilestone({ type: type === 'Mutación / Marca Física' ? 'Mutación' : type, name, notes: description }));
    }
    char.pendingMilestones = Math.max(0, (char.pendingMilestones || 0) - 1);
    if (char.pendingAction !== 'points') char.pendingAction = null;

    saveState();
    downloadCharactersJson();
    openCharModal(char.id); // Refresh
}

let currentInventoryCharId = null;

function openInventoryModal(charId) {
    const char = state.characters.find(c => c.id === charId);
    if (!char) return;
    currentInventoryCharId = charId;
    char.equipment = char.equipment || [];
    document.getElementById('inventory-title').innerText = `⚔️ Inventario de ${char.name}`;
    setFormAddMode('equipment-form', canAddMilestone(char), `Los hitos solo se pueden designar cuando el personaje sube a nivel 2 al superar 100 en todos sus atributos; aquí puedes ver los hitos ya asignados.`);
    resetEquipmentForm(false);
    renderEquipmentList(char);
    document.getElementById('inventory-modal').classList.remove('hidden');
}

function closeInventoryModal() {
    document.getElementById('inventory-modal').classList.add('hidden');
    currentInventoryCharId = null;
}

function resetEquipmentForm(clearId = true) {
    document.getElementById('equipment-form').reset();
    if (clearId) document.getElementById('eq-id').value = '';
    window.__editingEquipment = null;
    syncEquipmentFormByType();
}

function syncEquipmentFormByType() {
    const type = document.getElementById('eq-type').value;
    const box = document.getElementById('eq-dynamic');
    const item = window.__editingEquipment || {};
    const commonAffinities = `${targetPickerHtml('eq-superior', 'Afinidad superior: personajes o tipos acumulables', item.superiorCharacters, item.superiorTypes, true, item.superiorPercent)}${targetPickerHtml('eq-inferior', 'Afinidad inferior: personajes o tipos acumulables', item.inferiorCharacters, item.inferiorTypes, true, item.inferiorPercent)}${targetPickerHtml('eq-immune', 'Inmunidad: personajes o tipos acumulables', item.immuneCharacters, item.immuneTypes)}`;
    if (type === 'Arma') box.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="inventory-label">Atributo que modifica</label><select id="eq-attr" class="inventory-input">${attrOptions(['MAG','STR'])}</select></div><div><label class="inventory-label">Potencia (1 a 100)</label><input id="eq-power" type="number" min="1" max="100" value="${escapeAttr(item.power || 1)}" class="inventory-input"></div></div>${commonAffinities}`;
    if (type === 'Armadura') box.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="inventory-label">Atributo que modifica</label><select id="eq-attr" class="inventory-input">${attrOptions(['INT','SPD'])}</select></div><div><label class="inventory-label">Potencia (1 a 35)</label><input id="eq-power" type="number" min="1" max="35" value="${escapeAttr(item.power || 1)}" class="inventory-input"></div></div>${commonAffinities}`;
    if (type === 'Artefacto / Reliquia') box.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-4 gap-4"><div><label class="inventory-label">Atributo que modifica</label><select id="eq-attr" class="inventory-input">${attrOptions(['MAG','STR'])}</select></div><div><label class="inventory-label">Efecto</label><select id="eq-mode" class="inventory-input"><option value="buff">Aumenta</option><option value="debuff">Disminuye</option></select></div><div><label class="inventory-label">Puntos</label><input id="eq-power" type="number" min="1" value="${escapeAttr(item.power || 1)}" class="inventory-input"></div><input id="eq-target" type="hidden" value="ally"></div>${targetPickerHtml('eq-affected', 'Personaje o tipo de personaje que afecta', item.affectedCharacters, item.affectedTypes)}${targetPickerHtml('eq-immune', 'Personajes inmunes', item.immuneCharacters, item.immuneTypes)}${targetPickerHtml('eq-superior', 'Afinidad superior y porcentaje que aumenta el efecto', item.superiorCharacters, item.superiorTypes, true, item.superiorPercent)}${targetPickerHtml('eq-inferior', 'Afinidad inferior y porcentaje que reduce el efecto', item.inferiorCharacters, item.inferiorTypes, true, item.inferiorPercent)}`;
    if (type === 'Montura') box.innerHTML = `<div><label class="inventory-label">Cantidad de puntos que aumenta la velocidad propia</label><input id="eq-power" type="number" min="1" value="${escapeAttr(item.power || 1)}" class="inventory-input"></div><input id="eq-attr" type="hidden" value="SPD"><input id="eq-mode" type="hidden" value="add"><input id="eq-target" type="hidden" value="self">`;
    if (type === 'Territorio') box.innerHTML = `<div><label class="inventory-label">Porcentaje que aumenta todos los atributos propios</label><input id="eq-power" type="number" min="1" max="100" value="${escapeAttr(item.power || 1)}" class="inventory-input"></div><input id="eq-attr" type="hidden" value="ALL"><input id="eq-mode" type="hidden" value="buff"><input id="eq-target" type="hidden" value="self">`;
    if (item.attr && document.getElementById('eq-attr')) document.getElementById('eq-attr').value = item.attr;
    if (item.mode && document.getElementById('eq-mode')) document.getElementById('eq-mode').value = item.mode;
}

addDomEvent('equipment-form', 'submit', (e) => {
    e.preventDefault();
    const char = state.characters.find(c => c.id === currentInventoryCharId);
    if (!char) return;
    char.equipment = char.equipment || [];
    const type = document.getElementById('eq-type').value;
    const item = normalizeEquipment({
        id: document.getElementById('eq-id').value || generateId(), type,
        name: document.getElementById('eq-name').value.trim(), image: document.getElementById('eq-image').value.trim(),
        attr: document.getElementById('eq-attr')?.value || 'STR', power: document.getElementById('eq-power')?.value || 0,
        mode: document.getElementById('eq-mode')?.value || 'add', target: document.getElementById('eq-target')?.value || 'self',
        notes: document.getElementById('eq-notes').value.trim(),
        superiorCharacters: selectedOptions('eq-superior-chars'), superiorTypes: selectedOptions('eq-superior-types'), superiorPercent: document.getElementById('eq-superior-percent')?.value || 0,
        inferiorCharacters: selectedOptions('eq-inferior-chars'), inferiorTypes: selectedOptions('eq-inferior-types'), inferiorPercent: document.getElementById('eq-inferior-percent')?.value || 0,
        immuneCharacters: selectedOptions('eq-immune-chars'), immuneTypes: selectedOptions('eq-immune-types'),
        affectedCharacters: selectedOptions('eq-affected-chars'), affectedTypes: selectedOptions('eq-affected-types')
    });
    item.superior = compactTargets(item.superiorCharacters, item.superiorTypes); item.inferior = compactTargets(item.inferiorCharacters, item.inferiorTypes); item.immune = compactTargets(item.immuneCharacters, item.immuneTypes); item.condition = compactTargets(item.affectedCharacters, item.affectedTypes);
    if (!item.name) return alert('Debes nombrar la posesión.');
    const index = char.equipment.findIndex(eq => eq.id === item.id);
    if (index < 0 && !canAddMilestone(char)) return alert('Solo puedes designar un hito disponible al subir a nivel 2.');
    if (index >= 0) char.equipment[index] = item; else { char.equipment.push(item); char.pendingMilestones = Math.max(0, (char.pendingMilestones || 0) - 1); }
    window.__editingEquipment = null; saveState(); downloadCharactersJson(); openInventoryModal(char.id);
});

function renderEquipmentList(char) {
    const container = document.getElementById('equipment-list');
    const items = (char.equipment || []).map(normalizeEquipment);
    if (items.length === 0) {
        container.innerHTML = '<div class="lg:col-span-2 text-gray-500 italic text-sm border border-dashed border-gray-700 rounded-xl p-6 text-center">Sin equipamiento ni posesiones activas.</div>';
        return;
    }
    container.innerHTML = items.map(item => {
        const attrName = ATTRS.find(a => a.key === item.attr)?.name || item.attr;
        const modeText = item.mode === 'add' ? `+${item.power} puntos a ${attrName}` : `${item.mode === 'buff' ? '+' : '-'}${item.power}% en ${attrName}`;
        return `
            <article class="rounded-xl border p-4 ${getMilestoneColor(item.type)}">
                <div class="flex gap-3">
                    ${item.image ? `<img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.name)}" class="w-20 h-20 rounded-lg object-cover border border-white/10" onerror="this.remove()">` : '<div class="w-20 h-20 rounded-lg bg-black/20 border border-white/10 flex items-center justify-center text-3xl">⚔️</div>'}
                    <div class="min-w-0 flex-1">
                        <p class="text-[10px] uppercase tracking-[0.18em] opacity-80">${escapeHtml(item.type)}</p>
                        <h5 class="font-bold text-lg truncate">${escapeHtml(item.name)}</h5>
                        <p class="text-xs mt-1">${escapeHtml(modeText)} · objetivo: ${escapeHtml(item.target)}</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                    <p><strong>Superior:</strong> ${escapeHtml(item.superior || '—')}</p><p><strong>Inferior:</strong> ${escapeHtml(item.inferior || '—')}</p>
                    <p><strong>Inmunidad:</strong> ${escapeHtml(item.immune || '—')}</p><p><strong>Condición:</strong> ${escapeHtml(item.condition || '—')}</p>
                </div>
                ${item.notes ? `<p class="text-xs mt-3 opacity-90 whitespace-pre-line">${escapeHtml(item.notes)}</p>` : ''}
                <div class="flex gap-2 mt-4">
                    <button onclick="editEquipment('${escapeAttr(item.id)}')" class="bg-black/20 hover:bg-black/30 border border-white/10 px-3 py-1 rounded text-xs font-bold">Editar</button>
                    <button onclick="deleteEquipment('${escapeAttr(item.id)}')" class="bg-red-950/70 hover:bg-red-900 border border-red-700 px-3 py-1 rounded text-xs font-bold">Eliminar</button>
                </div>
            </article>`;
    }).join('');
}

function editEquipment(itemId) {
    const char = state.characters.find(c => c.id === currentInventoryCharId);
    const item = (char?.equipment || []).map(normalizeEquipment).find(eq => eq.id === itemId);
    if (!item) return;
    window.__editingEquipment = item;
    document.getElementById('eq-id').value = item.id;
    document.getElementById('eq-type').value = item.type;
    document.getElementById('eq-name').value = item.name;
    document.getElementById('eq-image').value = item.image;
    document.getElementById('eq-notes').value = item.notes;
    syncEquipmentFormByType();
}

function deleteEquipment(itemId) {
    const char = state.characters.find(c => c.id === currentInventoryCharId);
    if (!char || !confirm('¿Eliminar esta posesión?')) return;
    char.equipment = (char.equipment || []).filter(eq => eq.id !== itemId);
    saveState();
    openInventoryModal(char.id);
}


let currentMentalCharId = null;

function openMentalModal(charId) {
    const char = state.characters.find(c => c.id === charId);
    if (!char) return;
    currentMentalCharId = charId;
    char.mental = char.mental || [];
    document.getElementById('mental-title').innerText = `🧠 Desarrollo de ${char.name}`;
    setFormAddMode('mental-form', canAddMilestone(char), `Los hitos solo se pueden designar cuando el personaje sube a nivel 2 al superar 100 en todos sus atributos; aquí puedes ver los hitos ya asignados.`);
    hydrateMentalAttrOptions();
    resetMentalForm(false);
    renderMentalList(char);
    document.getElementById('mental-modal').classList.remove('hidden');
}

function closeMentalModal() {
    document.getElementById('mental-modal').classList.add('hidden');
    currentMentalCharId = null;
}

function hydrateMentalAttrOptions() {}

function resetMentalForm(clearId = true) {
    document.getElementById('mental-form').reset();
    if (clearId) document.getElementById('mental-id').value = '';
    window.__editingMental = null;
    syncMentalFormByType();
}

function syncMentalFormByType() {
    const type = document.getElementById('mental-type').value;
    const box = document.getElementById('mental-dynamic');
    const item = window.__editingMental || {};
    if (type === 'Acontecimiento') box.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div><label class="inventory-label">Atributo al que se le agregan puntos</label><select id="mental-plus" class="mental-input">${attrOptions(['INT','STR','SPD','MAG'])}</select></div><div><label class="inventory-label">Atributo al que se le restan puntos</label><select id="mental-minus" class="mental-input">${attrOptions(['INT','STR','SPD','MAG'])}</select></div><div><label class="inventory-label">Cantidad de puntos</label><input id="mental-value" type="number" min="1" value="${escapeAttr(item.value || 25)}" class="mental-input"></div></div>`;
    if (type === 'Sabiduría') box.innerHTML = `<div><label class="inventory-label">Cantidad de puntos que se suma a inteligencia</label><input id="mental-value" type="number" min="1" value="${escapeAttr(item.value || 25)}" class="mental-input"></div><input id="mental-plus" type="hidden" value="INT"><input id="mental-minus" type="hidden" value="STR">`;
    if (type === 'Miedo') box.innerHTML = `${targetPickerHtml('mental-trigger', 'Tipo de personaje o personaje con el que se activa (acumulable)', item.triggerCharacters, item.triggerTypes)}<input id="mental-value" type="hidden" value="50"><input id="mental-plus" type="hidden" value="INT"><input id="mental-minus" type="hidden" value="STR"><p class="text-xs text-green-200">Al activarse reduce el 50% de todos los atributos.</p>`;
    if (type === 'Debilidad') box.innerHTML = `<div><label class="inventory-label">Atributo al que se le disminuye -25</label><select id="mental-minus" class="mental-input">${attrOptions(['INT','STR','SPD','MAG'])}</select></div>${targetPickerHtml('mental-aggravator', 'Personaje o tipo que aumenta la disminución y porcentaje que aumenta', item.aggravatorCharacters, item.aggravatorTypes, true, item.aggravatorPercent)}<input id="mental-value" type="hidden" value="25"><input id="mental-plus" type="hidden" value="INT">`;
    if (type === 'Mutación') box.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="inventory-label">Atributo al que se le agregan puntos</label><select id="mental-plus" class="mental-input">${attrOptions(['INT','STR','SPD','MAG'])}</select></div><div><label class="inventory-label">Cantidad de puntos que se suma</label><input id="mental-value" type="number" min="1" value="${escapeAttr(item.value || 25)}" class="mental-input"></div></div><input id="mental-minus" type="hidden" value="ALL"><p class="text-xs text-lime-200">La misma cantidad se resta a los demás atributos.</p>`;
    if (item.plusAttr && document.getElementById('mental-plus')) document.getElementById('mental-plus').value = item.plusAttr;
    if (item.minusAttr && document.getElementById('mental-minus')) document.getElementById('mental-minus').value = item.minusAttr;
}

addDomEvent('mental-form', 'submit', (e) => {
    e.preventDefault();
    const char = state.characters.find(c => c.id === currentMentalCharId);
    if (!char) return;
    char.mental = char.mental || [];
    const type = document.getElementById('mental-type').value;
    const item = normalizeMentalMilestone({
        id: document.getElementById('mental-id').value || generateId(), type,
        name: document.getElementById('mental-name').value.trim(), image: document.getElementById('mental-image').value.trim(),
        value: document.getElementById('mental-value')?.value || 25,
        plusAttr: document.getElementById('mental-plus')?.value || 'INT', minusAttr: document.getElementById('mental-minus')?.value || 'STR',
        notes: document.getElementById('mental-notes').value.trim(),
        triggerCharacters: selectedOptions('mental-trigger-chars'), triggerTypes: selectedOptions('mental-trigger-types'),
        aggravatorCharacters: selectedOptions('mental-aggravator-chars'), aggravatorTypes: selectedOptions('mental-aggravator-types'), aggravatorPercent: document.getElementById('mental-aggravator-percent')?.value || 0
    });
    item.trigger = compactTargets(item.triggerCharacters, item.triggerTypes); item.aggravator = compactTargets(item.aggravatorCharacters, item.aggravatorTypes);
    if (!item.name) return alert('Debes nombrar el hito mental.');
    const index = char.mental.findIndex(ms => ms.id === item.id);
    if (index < 0 && !canAddMilestone(char)) return alert('Solo puedes designar un hito disponible al subir a nivel 2.');
    if (index >= 0) char.mental[index] = item; else { char.mental.push(item); char.pendingMilestones = Math.max(0, (char.pendingMilestones || 0) - 1); }
    window.__editingMental = null; saveState(); downloadCharactersJson(); openMentalModal(char.id);
});

function renderMentalList(char) {
    const container = document.getElementById('mental-list');
    const items = (char.mental || []).map(normalizeMentalMilestone);
    if (items.length === 0) { container.innerHTML = '<div class="lg:col-span-2 text-gray-500 italic text-sm border border-dashed border-gray-700 rounded-xl p-6 text-center">Sin hitos mentales activos.</div>'; return; }
    container.innerHTML = items.map(item => {
        const plusName = ATTRS.find(a => a.key === item.plusAttr)?.name || item.plusAttr;
        const minusName = ATTRS.find(a => a.key === item.minusAttr)?.name || item.minusAttr;
        return `<article class="rounded-xl border p-4 ${getMilestoneColor(item.type)}"><p class="text-[10px] uppercase tracking-[0.18em] opacity-80">${escapeHtml(item.type)}</p><h5 class="font-bold text-lg">${escapeHtml(item.name)}</h5><p class="text-xs mt-2">${describeMentalEffect(item, plusName, minusName)}</p><p class="text-xs mt-2"><strong>Miedo:</strong> ${escapeHtml(item.trigger || '—')} · <strong>Agravante:</strong> ${escapeHtml(item.aggravator || '—')}</p>${item.notes ? `<p class="text-xs mt-3 opacity-90 whitespace-pre-line">${escapeHtml(item.notes)}</p>` : ''}<div class="flex gap-2 mt-4"><button onclick="editMental('${escapeAttr(item.id)}')" class="bg-black/20 hover:bg-black/30 border border-white/10 px-3 py-1 rounded text-xs font-bold">Editar</button><button onclick="deleteMental('${escapeAttr(item.id)}')" class="bg-red-950/70 hover:bg-red-900 border border-red-700 px-3 py-1 rounded text-xs font-bold">Eliminar</button></div></article>`;
    }).join('');
}

function describeMentalEffect(item, plusName, minusName) {
    if (item.type === 'Sabiduría / Revelación' || item.type === 'Sabiduría') return `+${item.value} permanente en Inteligencia.`;
    if (item.type === 'Miedo / Trauma' || item.type === 'Miedo') return 'Reduce todos los atributos un 50% si aparece el detonante.';
    if (item.type === 'Debilidad') return `-25 en ${minusName}; el agravante puede aumentar la reducción porcentualmente.`;
    if (item.type === 'Mutación') return `+${item.value} en ${plusName} y -${item.value} en los demás atributos.`;
    return `+${item.value} en ${plusName} y -${item.value} en ${minusName}.`;
}

function editMental(itemId) {
    const char = state.characters.find(c => c.id === currentMentalCharId);
    const item = (char?.mental || []).map(normalizeMentalMilestone).find(ms => ms.id === itemId);
    if (!item) return;
    window.__editingMental = item;
    document.getElementById('mental-id').value = item.id;
    document.getElementById('mental-type').value = item.type;
    document.getElementById('mental-name').value = item.name;
    document.getElementById('mental-image').value = item.image || '';
    document.getElementById('mental-notes').value = item.notes;
    syncMentalFormByType();
}

function deleteMental(itemId) {
    const char = state.characters.find(c => c.id === currentMentalCharId);
    if (!char || !confirm('¿Eliminar este hito mental?')) return;
    char.mental = (char.mental || []).filter(ms => ms.id !== itemId);
    saveState(); openMentalModal(char.id);
}



let currentWorldCharId = null;
let currentDestinyCharId = null;

function getSharedTeamBattles(charA, charB) {
    const rel = state.relationships[getRelKey(charA.id, charB.id)] || {};
    return Number(rel.totalAllies ?? rel.allies ?? 0);
}

function eligibleCompanionOptionsHtml(char, selected = '') {
    return state.characters.filter(candidate => candidate.id !== char.id && getSharedTeamBattles(char, candidate) >= 15)
        .map(candidate => `<option value="${escapeAttr(candidate.id)}" ${candidate.id === selected ? 'selected' : ''}>${escapeHtml(getDisplayName(candidate))} · ${getSharedTeamBattles(char, candidate)} batallas juntos</option>`).join('');
}

function worldMemberOptionsHtml(char, selected = []) {
    return state.characters.filter(candidate => candidate.id !== char.id)
        .map(candidate => `<option value="${escapeAttr(candidate.id)}" ${selected.includes(candidate.id) ? 'selected' : ''}>${escapeHtml(getDisplayName(candidate))}</option>`).join('');
}

function hasCompanionLink(charAId, charBId) {
    const a = state.characters.find(c => c.id === charAId);
    const b = state.characters.find(c => c.id === charBId);
    if (!a || !b) return false;
    return normalizeWorldStatus(a.world).companions.includes(charBId) || normalizeWorldStatus(b.world).companions.includes(charAId);
}

function isValidClanFor(char, memberIds) {
    const ids = [char.id, ...memberIds].filter(Boolean);
    if (ids.length < 3) return false;
    for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
            if (!hasCompanionLink(ids[i], ids[j])) return false;
        }
    }
    return true;
}

function openWorldModal(charId) {
    const char = state.characters.find(c => c.id === charId);
    if (!char) return;
    currentWorldCharId = charId;
    char.world = normalizeWorldStatus(char.world);
    document.getElementById('world-title').innerText = `🌎 Mundo de ${getDisplayName(char)}`;
    setFormAddMode('world-form', canAddMilestone(char), `Los hitos solo se pueden designar cuando el personaje sube a nivel 2 al superar 100 en todos sus atributos; aquí puedes ver sus hitos de mundo ya asignados.`);
    resetWorldForm(false);
    renderWorldSummary(char);
    document.getElementById('world-modal').classList.remove('hidden');
}

function closeWorldModal() {
    document.getElementById('world-modal').classList.add('hidden');
    currentWorldCharId = null;
}

function resetWorldForm(clearId = true) {
    document.getElementById('world-form').reset();
    if (clearId) document.getElementById('world-id').value = '';
    window.__editingWorld = null;
    syncWorldFormByType();
}

function syncWorldFormByType() {
    const char = state.characters.find(c => c.id === currentWorldCharId);
    const type = document.getElementById('world-type').value;
    const item = window.__editingWorld || {};
    const box = document.getElementById('world-dynamic');
    if (!char || !box) return;
    if (type === 'Compañero') box.innerHTML = `<div><label class="inventory-label">Compañero (+15 batallas juntos en el mismo equipo)</label><select id="world-companion" required class="world-input"><option value="">Selecciona...</option>${eligibleCompanionOptionsHtml(char, item.companionId)}</select><p class="text-xs text-gray-500 mt-1">Solo aparecen personajes con al menos 15 batallas compartidas como aliados.</p></div>`;
    if (type === 'Clan') box.innerHTML = `<div><label class="inventory-label">Personajes que lo conforman</label><select id="world-members" multiple size="6" required class="world-input">${worldMemberOptionsHtml(char, item.memberIds || [])}</select><p class="text-xs text-gray-500 mt-1">Debe existir un triángulo de compañerismo: todos los miembros del clan deben ser compañeros entre sí. Un nuevo miembro también debe ser compañero de todos.</p></div>`;
    if (type === 'Apodo') box.innerHTML = `<p class="text-xs text-yellow-200">El nombre del hito será el apodo visible del personaje.</p>`;
    if (type === 'Misión Objetivo') box.innerHTML = `<div><label class="inventory-label">Selector</label><select id="world-mission-mode" class="world-input"><option value="destroy">Destruir</option><option value="protect">Proteger</option></select></div>${targetPickerHtml('world-target', 'Personaje o tipo de personaje selector acumulable', item.targetCharacters, item.targetTypes)}`;
    if (type === 'Deuda') box.innerHTML = `${targetPickerHtml('world-target', 'Personaje a vencer o tipo de personaje a vencer selector acumulable', item.targetCharacters, item.targetTypes)}<input id="world-debt-active" type="hidden" value="true">`;
    if (item.missionMode && document.getElementById('world-mission-mode')) document.getElementById('world-mission-mode').value = item.missionMode;
}

function renderWorldSummary(char) {
    const world = normalizeWorldStatus(char.world);
    if (!world.milestones.length) { document.getElementById('world-summary').innerHTML = '<div class="lg:col-span-2 text-gray-500 italic text-sm border border-dashed border-gray-700 rounded-xl p-6 text-center">Sin hitos de mundo activos.</div>'; return; }
    document.getElementById('world-summary').innerHTML = world.milestones.map(item => {
        const companion = state.characters.find(c => c.id === item.companionId);
        const members = item.memberIds.map(id => state.characters.find(c => c.id === id)).filter(Boolean).map(getDisplayName).join(', ');
        const targets = compactTargets(item.targetCharacters, item.targetTypes);
        return `<article class="rounded-xl border p-4 ${getMilestoneColor(item.type === 'Apodo' ? 'Título / Apodo' : item.type)}"><p class="text-[10px] uppercase tracking-[0.18em] opacity-80">${escapeHtml(item.type)}</p><h5 class="font-bold text-lg">${escapeHtml(item.name)}</h5><p class="text-xs mt-2"><strong>Compañero:</strong> ${escapeHtml(companion ? getDisplayName(companion) : '—')} · <strong>Clan:</strong> ${escapeHtml(members || '—')} · <strong>Objetivos:</strong> ${escapeHtml(targets || '—')}</p><p class="text-xs mt-2"><strong>Modo:</strong> ${item.missionMode === 'protect' ? 'Proteger' : 'Destruir'} ${item.type === 'Deuda' ? `· ${item.debtActive ? 'Activa' : 'Saldada'}` : ''}</p>${item.narrative ? `<p class="text-xs mt-3 opacity-90 whitespace-pre-line">${escapeHtml(item.narrative)}</p>` : ''}<div class="flex gap-2 mt-4"><button onclick="editWorld('${escapeAttr(item.id)}')" class="bg-black/20 hover:bg-black/30 border border-white/10 px-3 py-1 rounded text-xs font-bold">Editar</button><button onclick="deleteWorld('${escapeAttr(item.id)}')" class="bg-red-950/70 hover:bg-red-900 border border-red-700 px-3 py-1 rounded text-xs font-bold">Eliminar</button></div></article>`;
    }).join('');
}

addDomEvent('world-form', 'submit', (e) => {
    e.preventDefault();
    const char = state.characters.find(c => c.id === currentWorldCharId);
    if (!char) return;
    char.world = normalizeWorldStatus(char.world);
    const type = document.getElementById('world-type').value;
    const item = normalizeWorldMilestone({
        id: document.getElementById('world-id').value || generateId(), type,
        name: document.getElementById('world-name').value.trim(), narrative: document.getElementById('world-narrative').value.trim(),
        companionId: document.getElementById('world-companion')?.value || '', memberIds: selectedOptions('world-members'),
        missionMode: document.getElementById('world-mission-mode')?.value || 'destroy', targetCharacters: selectedOptions('world-target-chars'), targetTypes: selectedOptions('world-target-types'), debtActive: true
    });
    if (!item.name || !item.narrative) return alert('Debes completar nombre y narrativa.');
    if (type === 'Compañero' && !item.companionId) return alert('Selecciona un compañero válido con +15 batallas en el mismo equipo.');
    if (type === 'Clan' && !isValidClanFor(char, item.memberIds)) return alert('El clan requiere un triángulo donde todos sus miembros sean compañeros entre sí.');
    if ((type === 'Misión Objetivo' || type === 'Deuda') && !item.targetCharacters.length && !item.targetTypes.length) return alert('Selecciona al menos un personaje o tipo de personaje.');
    const index = char.world.milestones.findIndex(ms => ms.id === item.id);
    if (index < 0 && !canAddMilestone(char)) return alert('Solo puedes designar un hito disponible al subir a nivel 2.');
    if (index >= 0) char.world.milestones[index] = item; else { char.world.milestones.push(item); char.pendingMilestones = Math.max(0, (char.pendingMilestones || 0) - 1); }
    char.world = normalizeWorldStatus(char.world);
    saveState(); downloadCharactersJson(); openWorldModal(char.id);
});

function editWorld(itemId) {
    const char = state.characters.find(c => c.id === currentWorldCharId);
    const item = normalizeWorldStatus(char?.world).milestones.find(ms => ms.id === itemId);
    if (!item) return;
    window.__editingWorld = item;
    document.getElementById('world-id').value = item.id;
    document.getElementById('world-type').value = item.type;
    document.getElementById('world-name').value = item.name;
    document.getElementById('world-narrative').value = item.narrative;
    syncWorldFormByType();
}

function deleteWorld(itemId) {
    const char = state.characters.find(c => c.id === currentWorldCharId);
    if (!char || !confirm('¿Eliminar este hito de mundo?')) return;
    char.world = normalizeWorldStatus(char.world);
    char.world.milestones = char.world.milestones.filter(ms => ms.id !== itemId);
    char.world = normalizeWorldStatus(char.world);
    saveState(); openWorldModal(char.id);
}

function hydrateDestinyAttrOptions() {
    const html = ATTRS.map(a => `<option value="${a.key}">${a.name}</option>`).join('');
    const attr = document.getElementById('destiny-attr');
    if (attr) attr.innerHTML = html;
}

function openDestinyModal(charId) {
    const char = state.characters.find(c => c.id === charId);
    if (!char) return;
    currentDestinyCharId = charId;
    char.destiny = normalizeDestiny(char.destiny);
    document.getElementById('destiny-title').innerText = `🔮 Destino de ${getDisplayName(char)}`;
    setFormAddMode('destiny-form', canAddMilestone(char), `Los hitos solo se pueden designar cuando el personaje sube a nivel 2 al superar 100 en todos sus atributos.`);
    resetDestinyForm(false);
    renderDestinyList(char);
    document.getElementById('destiny-modal').classList.remove('hidden');
}

function closeDestinyModal() {
    document.getElementById('destiny-modal').classList.add('hidden');
    currentDestinyCharId = null;
}

function resetDestinyForm(clearId = true) {
    document.getElementById('destiny-form').reset();
    if (clearId) document.getElementById('destiny-id').value = '';
    window.__editingDestiny = null;
    syncDestinyFormByType();
}

function syncDestinyFormByType() {
    const type = document.getElementById('destiny-type').value;
    const item = window.__editingDestiny || {};
    const casterLabel = type === 'Bendición' ? 'Quién puso la bendición' : 'Quién puso la maldición';
    let html = '';
    if (type === 'Maldición' || type === 'Bendición') html = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="inventory-label">${casterLabel}</label><select id="destiny-caster" class="destiny-input"><option value="">Entidad externa / desconocida</option>${rosterOptionsHtml([item.casterId].filter(Boolean), currentDestinyCharId)}</select></div><div><label class="inventory-label">Atributo ${type === 'Maldición' ? 'maldito (0 pts)' : 'bendito (100 pts)'}</label><select id="destiny-attr" class="destiny-input"></select></div></div>`;
    if (type === 'Juramento') html = `<div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="inventory-label">Riesgo o superación</label><select id="destiny-oath-path" class="destiny-input"><option value="risk">Riesgo (+40; tributo si pierde)</option><option value="overcome">Superación (-40; recompensa si gana)</option></select></div><div><label class="inventory-label">Tributo al que se sumará o descontará 40 pts</label><select id="destiny-attr" class="destiny-input"></select></div></div>`;
    document.getElementById('destiny-dynamic').innerHTML = html;
    hydrateDestinyAttrOptions();
    if (item.attr && document.getElementById('destiny-attr')) document.getElementById('destiny-attr').value = item.attr;
    if (item.oathPath && document.getElementById('destiny-oath-path')) document.getElementById('destiny-oath-path').value = item.oathPath;
}

addDomEvent('destiny-form', 'submit', (e) => {
    e.preventDefault();
    const char = state.characters.find(c => c.id === currentDestinyCharId);
    if (!char) return;
    char.destiny = normalizeDestiny(char.destiny);
    const item = normalizeDestinyMilestone({
        id: document.getElementById('destiny-id').value || generateId(), type: document.getElementById('destiny-type').value,
        name: document.getElementById('destiny-name').value.trim(), narrative: document.getElementById('destiny-notes').value.trim(),
        casterId: document.getElementById('destiny-caster')?.value || '', attr: document.getElementById('destiny-attr')?.value || 'STR', oathPath: document.getElementById('destiny-oath-path')?.value || 'risk'
    });
    if (!item.name || !item.narrative) return alert('Debes completar nombre y narrativa.');
    const index = char.destiny.milestones.findIndex(ms => ms.id === item.id);
    if (index < 0 && !canAddMilestone(char)) return alert('Solo puedes designar un hito disponible al subir a nivel 2.');
    if (index >= 0) char.destiny.milestones[index] = item; else { char.destiny.milestones.push(item); char.pendingMilestones = Math.max(0, (char.pendingMilestones || 0) - 1); }
    char.destiny = normalizeDestiny(char.destiny);
    enforceDestinyStats(char);
    saveState(); downloadCharactersJson(); openDestinyModal(char.id);
});

function renderDestinyList(char) {
    const destiny = normalizeDestiny(char.destiny);
    const box = document.getElementById('destiny-list');
    if (!destiny.milestones.length) { box.innerHTML = '<div class="text-gray-500 italic text-sm border border-dashed border-gray-700 rounded-xl p-6 text-center">Sin hitos de destino activos.</div>'; return; }
    box.innerHTML = destiny.milestones.map(item => {
        const caster = state.characters.find(c => c.id === item.casterId);
        const attrName = ATTRS.find(a => a.key === item.attr)?.name || item.attr;
        return `<article class="rounded-xl border p-4 ${getMilestoneColor(item.type === 'Bendición' ? 'Bendición / Don' : item.type === 'Juramento' ? 'Pacto / Juramento' : item.type)}"><p class="text-[10px] uppercase tracking-[0.18em] opacity-80">${escapeHtml(item.type)}</p><h5 class="font-bold text-lg">${escapeHtml(item.name)}</h5><p class="text-xs mt-2"><strong>Atributo:</strong> ${escapeHtml(attrName)} · <strong>Origen:</strong> ${escapeHtml(caster ? getDisplayName(caster) : 'Entidad externa / desconocida')} ${item.type === 'Juramento' ? `· <strong>Camino:</strong> ${item.oathPath === 'risk' ? 'Riesgo' : 'Superación'}` : ''}</p><p class="text-xs mt-3 opacity-90 whitespace-pre-line">${escapeHtml(item.narrative)}</p><div class="flex gap-2 mt-4"><button onclick="editDestiny('${escapeAttr(item.id)}')" class="bg-black/20 hover:bg-black/30 border border-white/10 px-3 py-1 rounded text-xs font-bold">Editar</button><button onclick="deleteDestiny('${escapeAttr(item.id)}')" class="bg-red-950/70 hover:bg-red-900 border border-red-700 px-3 py-1 rounded text-xs font-bold">Eliminar</button></div></article>`;
    }).join('');
}

function editDestiny(itemId) {
    const char = state.characters.find(c => c.id === currentDestinyCharId);
    const item = normalizeDestiny(char?.destiny).milestones.find(ms => ms.id === itemId);
    if (!item) return;
    window.__editingDestiny = item;
    document.getElementById('destiny-id').value = item.id;
    document.getElementById('destiny-type').value = item.type;
    document.getElementById('destiny-name').value = item.name;
    document.getElementById('destiny-notes').value = item.narrative;
    syncDestinyFormByType();
}

function deleteDestiny(itemId) {
    const char = state.characters.find(c => c.id === currentDestinyCharId);
    if (!char || !confirm('¿Eliminar este hito de destino?')) return;
    char.destiny = normalizeDestiny(char.destiny);
    char.destiny.milestones = char.destiny.milestones.filter(ms => ms.id !== itemId);
    char.destiny = normalizeDestiny(char.destiny);
    enforceDestinyStats(char);
    saveState(); openDestinyModal(char.id);
}

let currentBattle = null;

function startBattle() {
    document.getElementById('btn-start-battle').classList.add('hidden');
    document.getElementById('battle-arena').classList.remove('hidden');
    document.getElementById('battle-actions').classList.add('hidden');
    document.getElementById('battle-log').innerHTML = '';
    
    // 1. Matchmaking with Rotation
    let fightersIds = [];
    let tempPool = [...state.rotationPool];
    
    while (fightersIds.length < 8) {
        if (tempPool.length === 0) {
            // Refill pool with characters NOT already chosen in this selection
            tempPool = state.characters.map(c => c.id).filter(id => !fightersIds.includes(id));
        }
        const randIdx = Math.floor(Math.random() * tempPool.length);
        fightersIds.push(tempPool.splice(randIdx, 1)[0]);
    }
    
    // Update the real pool
    state.rotationPool = tempPool;

    // 2. Assign Teams
    const redTeam = fightersIds.slice(0, 4).map(id => state.characters.find(c => c.id === id));
    const blueTeam = fightersIds.slice(4, 8).map(id => state.characters.find(c => c.id === id));

    // Setup current battle state
    currentBattle = { redTeam, blueTeam, redWins: 0, blueWins: 0, duelsFought: 0, duelResults: [] };
    
    renderTeam('red-corner', redTeam);
    renderTeam('blue-corner', blueTeam);
    
    // Start combat sequence
    setTimeout(executeCombat, 1000);
}

function renderTeam(containerId, team) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    team.forEach((char, idx) => {
        container.innerHTML += `
            <div class="card-container perspective-1000" id="${containerId}-card-${idx}">
                <div class="card-flipper transform-style-3d transition-transform-duration">
                    <!-- Card Front (Stats) - Rotated by default -->
                    <div class="card-front backface-hidden bg-card border border-gray-700 flex flex-col">
                        ${getImageHtml(char.image, char.name, 'w-full h-24 object-cover rounded-t-lg')}
                        <div class="p-2 text-center flex-1 flex flex-col justify-between">
                            <h4 class="text-xs font-bold truncate text-white">${getDisplayName(char)}</h4>
                            <div class="grid grid-cols-2 gap-1 text-[10px] mt-1">
                                <div class="bg-gray-800 rounded text-blue-400">IN ${getDisplayedStat(char, 'INT')}</div>
                                <div class="bg-gray-800 rounded text-red-400">FZ ${getDisplayedStat(char, 'STR')}</div>
                                <div class="bg-gray-800 rounded text-yellow-400">VL ${getDisplayedStat(char, 'SPD')}</div>
                                <div class="bg-gray-800 rounded text-green-400">MG ${getDisplayedStat(char, 'MAG')}</div>
                            </div>
                        </div>
                    </div>
                    <!-- Card Back (Logo) -->
                    <div class="card-back backface-hidden">
                        ⚔️
                    </div>
                </div>
            </div>
        `;
    });
}

function entryMatches(text, targetChar) {
    const haystack = String(text || '').toLowerCase();
    if (!haystack || !targetChar) return false;
    return haystack.split(',').some(raw => {
        const entry = raw.replace(/[+-]?\d+%?/g, '').trim();
        return entry && `${targetChar.name} ${targetChar.type || ''}`.toLowerCase().includes(entry);
    });
}

function firstPercent(text, fallback = 0) {
    const match = String(text || '').match(/([+-]?\d+(?:\.\d+)?)\s*%?/);
    return match ? Number(match[1]) : fallback;
}

function getEffectiveStat(char, attrKey, opponent, allies = [], enemies = []) {
    let base = Number(char.stats[attrKey] || 0);
    const world = normalizeWorldStatus(char.world);
    const destiny = normalizeDestiny(char.destiny);
    const clanIds = getTeamClanIds(allies);
    if (destiny.blessingAttr === attrKey) base = 100;
    if (destiny.curseAttr === attrKey) return 0;
    let additive = 0;
    let percentBuff = 0;
    let percentReduction = 0;
    let protectedSpeedBuff = 0;
    const hasRefuge = (char.equipment || []).some(eq => ['Refugio / Territorio','Territorio'].includes(normalizeEquipment(eq).type));

    if (clanIds.has(char.id)) additive += 25;
    else additive += allies.filter(ally => ally.id !== char.id && areCompanions(char, ally)).length * 10;
    if (world.missionOffense && characterMatchesQuery(opponent, world.missionOffense)) additive += 15;
    if (world.missionProtect && enemies.some(enemy => characterMatchesQuery(enemy, world.missionProtect))) additive -= 20;
    if (world.debtActive) additive -= 5;
    if (destiny.oathAttr === attrKey && destiny.oathPath === 'risk') additive += 40;
    if (destiny.oathAttr === attrKey && destiny.oathPath === 'overcome') additive -= 40;

    (char.mental || []).map(normalizeMentalMilestone).forEach(item => {
        const isTriggered = entryMatches(item.trigger, opponent);
        const isAggravated = entryMatches(item.aggravator, opponent);
        if (item.type === 'Acontecimiento' || item.type === 'Mutación') {
            if (item.plusAttr === attrKey) additive += item.value;
            if (item.minusAttr === attrKey || (item.type === 'Mutación' && item.plusAttr !== attrKey)) additive -= item.value;
        }
        if ((item.type === 'Sabiduría / Revelación' || item.type === 'Sabiduría') && attrKey === 'INT') additive += item.value;
        if ((item.type === 'Miedo / Trauma' || item.type === 'Miedo') && isTriggered) percentReduction += 50;
        if (item.type === 'Debilidad' && item.minusAttr === attrKey) {
            if (isAggravated) percentReduction += Math.max(item.aggravatorPercent || item.value, 0);
            else additive -= 25;
        }
    });

    (char.equipment || []).map(normalizeEquipment).forEach(item => {
        if (item.attr !== attrKey && !['Refugio / Territorio','Territorio'].includes(item.type)) return;
        if (entryMatches(item.immune, opponent)) return;
        let multiplier = 1;
        if (entryMatches(item.superior, opponent)) multiplier += firstPercent(item.superior) / 100;
        if (entryMatches(item.inferior, opponent)) multiplier -= firstPercent(item.inferior) / 100;
        if (item.mode === 'add') additive += item.power * multiplier;
        if (item.mode === 'buff') {
            if (['Montura / Vehículo','Montura'].includes(item.type)) additive += item.power;
            else percentBuff += item.power * multiplier;
        }
        if (item.mode === 'debuff') percentReduction += item.power * multiplier;
    });

    const applyArtifact = (item, affectedChar) => {
        if (item.attr !== attrKey || entryMatches(item.immune, affectedChar)) return;
        if (item.condition && !entryMatches(item.condition, affectedChar)) return;
        let multiplier = 1;
        if (entryMatches(item.superior, affectedChar)) multiplier += firstPercent(item.superior) / 100;
        if (entryMatches(item.inferior, affectedChar)) multiplier -= firstPercent(item.inferior) / 100;
        if (item.mode === 'buff') percentBuff += item.power * multiplier;
        if (item.mode === 'debuff') percentReduction += item.power * multiplier;
        if (item.mode === 'add') additive += item.power * multiplier;
    };

    allies.flatMap(c => c.equipment || []).map(normalizeEquipment).filter(eq => eq.type === 'Artefacto / Reliquia' && eq.target === 'ally').forEach(eq => applyArtifact(eq, char));
    enemies.flatMap(c => c.equipment || []).map(normalizeEquipment).filter(eq => eq.type === 'Artefacto / Reliquia' && eq.target === 'enemy').forEach(eq => applyArtifact(eq, char));

    if (hasRefuge) percentReduction = Math.min(percentReduction, 15);
    const result = (base + additive) * (1 + percentBuff / 100) * (1 - percentReduction / 100) * (1 + protectedSpeedBuff / 100);
    return Math.max(1, Math.round(result));
}

function logBattle(msg, isHighlight = false) {
    const logBox = document.getElementById('battle-log');
    const color = isHighlight ? 'text-white font-bold' : 'text-gray-300';
    logBox.innerHTML += `<div class="${color}">${msg}</div>`;
    logBox.scrollTop = logBox.scrollHeight;
}

async function executeCombat() {
    const { redTeam, blueTeam } = currentBattle;
    let attrsToUse = [...ATTRS].sort(() => Math.random() - 0.5); // Shuffle
    
    for (let i = 0; i < 4; i++) {
        // Check Premature Victory
        if (currentBattle.redWins === 3 || currentBattle.blueWins === 3) {
            logBattle(`¡VICTORIA PREMATURA! Un equipo alcanzó 3 victorias. El cuarto duelo se cancela.`, true);
            break; 
        }

        const attr = attrsToUse[i];
        currentBattle.duelsFought++;
        const redChar = redTeam[i];
        const blueChar = blueTeam[i];
        let redVal = getEffectiveStat(redChar, attr.key, blueChar, redTeam, blueTeam);
        let blueVal = getEffectiveStat(blueChar, attr.key, redChar, blueTeam, redTeam);
        if (normalizeWorldStatus(redChar.world).title && redChar.level > blueChar.level) blueVal = Math.max(0, blueVal - 10);
        if (normalizeWorldStatus(blueChar.world).title && blueChar.level > redChar.level) redVal = Math.max(0, redVal - 10);

        logBattle(`Duelo ${i+1}: Evaluando ${attr.name}...`);
        await sleep(1000);

        // Reveal Cards
        document.getElementById(`red-corner-card-${i}`).classList.add('flipped');
        document.getElementById(`blue-corner-card-${i}`).classList.add('flipped');
        await sleep(800);

        if (redVal > blueVal) {
            currentBattle.redWins++;
            currentBattle.duelResults.push({ attr: attr.key, winnerId: redChar.id, loserId: blueChar.id });
            logBattle(`🥊 ${getDisplayName(redChar)} (${redVal}) vence a ${getDisplayName(blueChar)} (${blueVal}). Punto ROJO.`);
        } else if (blueVal > redVal) {
            currentBattle.blueWins++;
            currentBattle.duelResults.push({ attr: attr.key, winnerId: blueChar.id, loserId: redChar.id });
            logBattle(`🥊 ${getDisplayName(blueChar)} (${blueVal}) vence a ${getDisplayName(redChar)} (${redVal}). Punto AZUL.`);
        } else {
            // Tie in duel goes to random
            const redWon = Math.random() > 0.5;
            if(redWon) currentBattle.redWins++; else currentBattle.blueWins++;
            currentBattle.duelResults.push({ attr: attr.key, winnerId: redWon ? redChar.id : blueChar.id, loserId: redWon ? blueChar.id : redChar.id });
            logBattle(`🥊 Empate en ${attr.name} (${redVal}). Moneda decide: Punto ${redWon ? 'ROJO' : 'AZUL'}.`);
        }
        
        logBattle(`Marcador: ROJO ${currentBattle.redWins} - AZUL ${currentBattle.blueWins}`);
        await sleep(1000);
    }

    // Evaluate Match End
    if (currentBattle.redWins === currentBattle.blueWins) {
        logBattle(`¡EMPATE GLOBAL! Resolviendo por Sumatoria Total...`, true);
        await sleep(1500);
        
        let redSum = 0; let blueSum = 0;
        for(let i=0; i<4; i++) {
            redSum += redTeam[i].stats.INT + redTeam[i].stats.STR + redTeam[i].stats.SPD + redTeam[i].stats.MAG;
            blueSum += blueTeam[i].stats.INT + blueTeam[i].stats.STR + blueTeam[i].stats.SPD + blueTeam[i].stats.MAG;
        }
        
        logBattle(`Sumatoria ROJA: ${redSum} | Sumatoria AZUL: ${blueSum}`);
        if (redSum >= blueSum) {
            currentBattle.redWins++;
            logBattle(`¡La Esquina ROJA gana el desempate!`, true);
        } else {
            currentBattle.blueWins++;
            logBattle(`¡La Esquina AZUL gana el desempate!`, true);
        }
    }

    const winner = currentBattle.redWins > currentBattle.blueWins ? 'ROJA' : 'AZUL';
    logBattle(`🏆 BATALLA FINALIZADA. Gana la Esquina ${winner}.`, true);
    
    document.getElementById('battle-actions').classList.remove('hidden');
}

function finishBattle() {
    const redWon = currentBattle.redWins > currentBattle.blueWins;
    const participantsCount = currentBattle.duelsFought; // usually 4, unless early victory (3)
    
    const winningTeam = redWon ? currentBattle.redTeam : currentBattle.blueTeam;
    const losingTeam = redWon ? currentBattle.blueTeam : currentBattle.redTeam;

    // Process only those who fought (up to participantsCount)
    for (let i = 0; i < participantsCount; i++) {
        // Winners
        let wChar = winningTeam[i];
        wChar.battles++;
        wChar.points.pos++;
        grantLevelTwoMilestoneIfReady(wChar);
        
        // Losers
        let lChar = losingTeam[i];
        lChar.battles++;
        lChar.points.neg++;
        grantLevelTwoMilestoneIfReady(lChar);
    }

    // Process supernatural oath consequences and debt resolutions by individual duel.
    (currentBattle.duelResults || []).forEach(result => {
        const winner = state.characters.find(c => c.id === result.winnerId);
        const loser = state.characters.find(c => c.id === result.loserId);
        [winner, loser].filter(Boolean).forEach(char => {
            const destiny = normalizeDestiny(char.destiny);
            if (destiny.oathAttr === result.attr && destiny.oathPath === 'risk' && char.id === result.loserId) char.points.neg += 5;
            if (destiny.oathAttr === result.attr && destiny.oathPath === 'overcome' && char.id === result.winnerId) char.points.pos += 5;
        });
        if (winner) {
            const world = normalizeWorldStatus(winner.world);
            if (world.debtActive && loser && characterMatchesQuery(loser, world.debtTarget)) winner.world = { ...world, debtActive: false };
        }
    });

    // Process Relationships (Allies and Rivals) only for those who fought
    const actualRed = currentBattle.redTeam.slice(0, participantsCount);
    const actualBlue = currentBattle.blueTeam.slice(0, participantsCount);
    
    processRelationships(actualRed, actualBlue, winningTeam.includes(actualRed[0]) ? 'red' : 'blue');

    saveState();
    
    // Reset Arena UI
    document.getElementById('battle-arena').classList.add('hidden');
    document.getElementById('btn-start-battle').classList.remove('hidden');
    currentBattle = null;
    
    // Switch back to management to see updates
    switchTab('management');
}

function getRelKey(id1, id2) {
    return [id1, id2].sort().join('_');
}

function processRelationships(redTeam, blueTeam, winnerTeamStr) {
    const updateRel = (c1, c2, type, winnerStr = null, loserStr = null) => {
        if(c1.id === c2.id) return;
        const key = getRelKey(c1.id, c2.id);
        if (!state.relationships[key]) {
            state.relationships[key] = { allies: 0, totalAllies: 0, rivals: 0, hasCompanero: false, hasRival: false };
        }
        let rel = state.relationships[key];

        if (type === 'ally') {
            rel.allies++;
            rel.totalAllies = (rel.totalAllies || 0) + 1;
            if (rel.hasRival && rel.allies === 5) {
                // Remove Rival
                rel.hasRival = false;
                rel.allies = 0;
                removeMilestone(c1, "Rival", c2.name);
                removeMilestone(c2, "Rival", c1.name);
            } else if (!rel.hasCompanero && !rel.hasRival && rel.allies === 5) {
                rel.hasCompanero = true;
                rel.allies = 0;
                addAutoMilestone(c1, "Compañero", c2.name);
                addAutoMilestone(c2, "Compañero", c1.name);
            }
        } else if (type === 'rival') {
            rel.rivals++;
            if (rel.hasCompanero && rel.rivals === 5) {
                // Betrayal / Revenge
                rel.hasCompanero = false;
                rel.rivals = 0;
                // Determine who won this specific match
                let winnerChar = winnerStr === 'red' ? (redTeam.includes(c1) ? c1 : c2) : (blueTeam.includes(c1) ? c1 : c2);
                let loserChar = winnerChar.id === c1.id ? c2 : c1;
                
                addAutoMilestone(winnerChar, "Venganza / Traición", `Traicionó a ${loserChar.name}`);
                addAutoMilestone(loserChar, "Venganza / Traición", `Venganza contra ${winnerChar.name}`);
            } else if (!rel.hasCompanero && !rel.hasRival && rel.rivals === 5) {
                rel.hasRival = true;
                rel.rivals = 0;
                addAutoMilestone(c1, "Rival", c2.name);
                addAutoMilestone(c2, "Rival", c1.name);
            }
        }
    };

    // Allies: Pairs within Red
    for(let i=0; i<redTeam.length; i++) {
        for(let j=i+1; j<redTeam.length; j++) {
            updateRel(redTeam[i], redTeam[j], 'ally');
        }
    }
    // Allies: Pairs within Blue
    for(let i=0; i<blueTeam.length; i++) {
        for(let j=i+1; j<blueTeam.length; j++) {
            updateRel(blueTeam[i], blueTeam[j], 'ally');
        }
    }
    // Rivals: Red vs Blue
    for(let i=0; i<redTeam.length; i++) {
        for(let j=0; j<blueTeam.length; j++) {
            updateRel(redTeam[i], blueTeam[j], 'rival', winnerTeamStr);
        }
    }
}

function addAutoMilestone(char, type, note) {
    char.milestones.push({ type, name: note, description: note, image: '', auto: true });
}

function removeMilestone(char, type, relatedName) {
    // Find and remove the specific rival milestone without exposing history in the handwritten lore.
    char.milestones = char.milestones.filter(m => {
        const normalized = normalizeMilestone(m);
        return !(normalized.type === type && `${normalized.name} ${normalized.description}`.includes(relatedName));
    });
}

// Utility: sleep for animations
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Start app
document.addEventListener('DOMContentLoaded', init);
