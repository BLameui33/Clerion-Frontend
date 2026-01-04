/**
 * workspace.js
 * Frontend-Logik für den persönlichen Workspace (B2C) und das B2B-Cockpit.
 */

const API_BASE_URL = 'https://api.clerion.de'; // Pfad ggf. anpassen
const token = localStorage.getItem('behoerdenhilfe_token');
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

// =================================================================
// 1. STATISCHE INHALTE (Wissensdatenbank & Tipps)
// =================================================================

// Sanfte Hinweise für den B2C-Bereich
const gentleHints = [
    "Sie müssen nicht alles auf einmal erledigen.",
    "Viele Menschen brauchen mehrere Anläufe für Anträge. Das ist normal.",
    "Atmen Sie durch. Behördenfristen betragen oft 2 bis 4 Wochen.",
    "Ein Schritt nach dem anderen reicht völlig aus.",
    "Es ist in Ordnung, sich Hilfe zu holen, wenn es zu viel wird."
];

// Die Wissensbasis: Texte basierend auf der Lebenslage (B2C) oder Arbeitsweise (B2B)
const knowledgeBase = {
    // --- B2C LEBENSLAGEN ---
    'pflege': {
        title: "Pflege & Gesundheit",
        content: `
            <strong>Typische Behörden:</strong> Kranken-/Pflegekasse, Medizinischer Dienst (MD), Sozialamt (Hilfe zur Pflege), Versorgungsamt (Schwerbehindertenausweis).<br><br>
            <strong>Häufige Anträge:</strong> Antrag auf Pflegegrad, Verschlimmerungsantrag, Antrag auf Hilfsmittel, Verhinderungspflege.<br><br>
            <strong>Wichtige Frist:</strong> Widerspruch gegen Pflegebescheid: <strong>1 Monat</strong> nach Erhalt.<br><br>
            <strong>Stolperfalle:</strong> Beim MD-Besuch werden oft Dinge beschönigt. Seien Sie ehrlich, was <em>nicht</em> geht. Führen Sie vorher ein Pflegetagebuch.
        `
    },
    'krankheit': {
        title: "Krankheit & Behinderung",
        content: `
            <strong>Typische Behörden:</strong> Versorgungsamt, Krankenkasse, Rentenversicherung.<br><br>
            <strong>Häufige Anträge:</strong> Feststellung GdB (Grad der Behinderung), Erwerbsminderungsrente, Krankengeld.<br><br>
            <strong>Tipp:</strong> Sammeln Sie alle Arztberichte der letzten 2 Jahre, bevor Sie Anträge stellen.
        `
    },
    'finanzen': {
        title: "Finanzen & Schulden",
        content: `
            <strong>Typische Behörden:</strong> Jobcenter (Bürgergeld), Sozialamt (Grundsicherung), Wohngeldstelle.<br><br>
            <strong>Wichtige Frist:</strong> Anträge wirken auf den 1. des Monats zurück. Stellen Sie Anträge immer so früh wie möglich (auch formlos).<br><br>
            <strong>Stolperfalle:</strong> "Mitwirkungspflicht". Wenn Unterlagen fehlen, kann das Geld gestoppt werden. Reichen Sie alles nachweisbar ein.
        `
    },
    'rente': {
        title: "Rente & Sozialleistungen",
        content: `
            <strong>Typische Behörden:</strong> Deutsche Rentenversicherung, Sozialamt.<br><br>
            <strong>Häufige Anträge:</strong> Altersrente, Witwenrente, Grundsicherung im Alter.<br><br>
            <strong>Hinweis:</strong> Rentenbescheide sind komplex. Prüfen Sie die Versicherungszeiten ("Kontenklärung") frühzeitig.
        `
    },
    'wohnen': {
        title: "Wohnen & Miete",
        content: `
            <strong>Typische Behörden:</strong> Wohngeldstelle, Amtsgericht (bei Räumungsklage), Wohnungsamt.<br><br>
            <strong>Häufige Anträge:</strong> Wohngeld, Wohnberechtigungsschein (WBS).<br><br>
            <strong>Wichtig:</strong> Wohngeld schließt Bürgergeld aus (und umgekehrt). Rechnen Sie durch, was günstiger ist.
        `
    },

    // --- B2B ARBEITSTHEMEN ---
    'briefe': {
        title: "Briefe & Kommunikation",
        content: `
            <strong>Workflow:</strong> 1. Eingangsstempel -> 2. Frist notieren -> 3. Klient informieren.<br>
            <strong>Typische Dokumente:</strong> Anhörung (§ 24 SGB X), Aufforderung zur Mitwirkung, Bescheid.<br>
            <strong>Risiko:</strong> Behördendeutsch führt oft zu Missverständnissen bei Klienten. Nutzen Sie Clerion zur Übersetzung in einfache Sprache.
        `
    },
    'antraege_b2b': {
        title: "Antragsmanagement",
        content: `
            <strong>Übersicht Vorgänge:</strong> Erstantrag, Weiterbewilligungsantrag (WBA), Überprüfungsantrag (§ 44 SGB X).<br>
            <strong>Checkliste:</strong> Vollmacht beigefügt? Bankverbindung aktuell? Nachweise vollständig?<br>
            <strong>Tipp:</strong> Nutzen Sie den integrierten Antragshelfer für komplexe Formulare.
        `
    },
    'widerspruch': {
        title: "Widerspruch & Rechtsbehelfe",
        content: `
            <strong>Wann sinnvoll?</strong> Bei offensichtlichen Berechnungsfehlern, fehlender Ermessensausübung oder nicht berücksichtigten Unterlagen.<br>
            <strong>Frist:</strong> 1 Monat nach Bekanntgabe. (3 Monate bei fehlender Rechtsbehelfsbelehrung).<br>
            <strong>Wann extern abgeben?</strong> Wenn es ins Klageverfahren geht oder komplexe Rechtsfragen (z.B. Erbrecht bei SGB II) berührt werden.
        `
    },
    'orga': {
        title: "Zuständigkeiten & Orga",
        content: `
            <strong>Wer ist zuständig?</strong><br>
            - Erwerbsfähig + Hilfebedürftig -> Jobcenter (SGB II)<br>
            - Nicht erwerbsfähig / Altersrente -> Sozialamt (SGB XII)<br>
            - Akute Pflege -> Pflegekasse + Sozialamt (Hilfe zur Pflege)<br><br>
            <strong>Tipp:</strong> Nutzen Sie die Status-Logik in Clerion (Offen / Warten auf Rückmeldung / Erledigt).
        `
    }
};

// =================================================================
// 2. INITIALISIERUNG & SETUP
// =================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Check
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

  

    // 2. UI Anpassung je nach User-Typ (B2B / B2C)
    setupUserInterface();

    // 3. Einstellungen laden (Onboarding prüfen)
    const settings = await fetchSettings();
    if (!settings) {
        // Kein Onboarding gefunden -> Modal öffnen
        showOnboarding();
    } else {
        // Einstellungen vorhanden -> Inhalte rendern
        renderWorkspaceContent(settings);
    }

    // 4. Daten laden (Notizen, Checklisten, Docs)
    loadNotes();
    loadChecklist();
    loadDocuments();
    initDiary()

    // 5. Event Listener registrieren
    setupEventListeners();
});

function setupUserInterface() {
    if (currentUser.type === 'b2b') {
        document.body.classList.add('b2b-mode');
        document.getElementById('ws-greeting').textContent = 'Ihr Cockpit';
        document.getElementById('ws-subtext').textContent = 'Effizienz & Struktur für Ihre Klientenarbeit.';
        document.getElementById('docs-title').textContent = '📂 Vorlagen & Dokumente';
        document.getElementById('checklist-title').textContent = '📌 Aufgaben & Workflows';
        // B2B braucht keinen "Sanften Hinweis"
        document.getElementById('gentle-hint-container').classList.add('hidden');
    } else {
        // B2C Logik
        document.getElementById('ws-greeting').textContent = `Hallo ${currentUser.username.split('@')[0] || ''}.`;
        
        // Zufälligen sanften Hinweis anzeigen
        const hintElement = document.getElementById('gentle-hint-container');
        const randomHint = gentleHints[Math.floor(Math.random() * gentleHints.length)];
        hintElement.textContent = `„${randomHint}“`;
        hintElement.classList.remove('hidden');
    }
}

function setupEventListeners() {
    // Auto-Save für Notizen (Debounce: speichert erst 1 Sekunde nach letztem Tippen)
    let timeoutId;
    const notesArea = document.getElementById('personal-notes');
    if (notesArea) {
        notesArea.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => saveNotes(e.target.value), 1000);
        });
    }

    // Datei Upload
    const triggerBtn = document.getElementById('trigger-upload-btn');
    const fileInput = document.getElementById('doc-upload-input');

    if (triggerBtn && fileInput) {
        // 1. Wenn man auf den schönen Button klickt -> Klick an das versteckte Feld weiterleiten
        triggerBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // 2. Wenn eine Datei ausgewählt wurde -> Hochladen starten
        fileInput.addEventListener('change', uploadDocument);
    }

    // Onboarding Auswahl-Buttons (Visuelles Feedback)
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
}

// =================================================================
// 3. ONBOARDING LOGIK
// =================================================================

let onboardingRole = 'self'; // Standard

function showOnboarding() {
    document.getElementById('ws-onboarding').classList.remove('hidden');
    
    // Wenn B2B, überspringen wir Schritt 1 (Rolle) und zeigen direkt Themen
    if (currentUser.type === 'b2b') {
        document.getElementById('ob-step-1').classList.add('hidden');
        document.getElementById('ob-step-2-b2b').classList.remove('hidden');
    } else {
        document.getElementById('ob-step-1').classList.remove('hidden');
        document.getElementById('ob-step-2-b2c').classList.add('hidden');
    }
}

// Wird vom HTML aufgerufen: onclick="setOnboardingRole('self')"
window.setOnboardingRole = function(role) {
    onboardingRole = role;
    document.getElementById('ob-step-1').classList.add('hidden');
    document.getElementById('ob-step-2-b2c').classList.remove('hidden');
}

// B2C Abschluss
window.finishOnboardingB2C = async function() {
    const selectedTopics = Array.from(document.querySelectorAll('#b2c-topics .selected')).map(b => b.dataset.val);
    
    // Mindestens ein Thema sollte gewählt sein, sonst Fallback
    if(selectedTopics.length === 0) selectedTopics.push('finanzen'); // Default

    await saveSettings({
        targetPerson: onboardingRole,
        lifeSituations: selectedTopics
    });
    
    document.getElementById('ws-onboarding').classList.add('hidden');
    window.location.reload(); // Seite neu laden um Inhalte anzuzeigen
}

// B2B Abschluss
window.finishOnboardingB2B = async function() {
    const selectedWasters = Array.from(document.querySelectorAll('#b2b-topics .selected')).map(b => b.dataset.val);
    
    if(selectedWasters.length === 0) selectedWasters.push('orga'); // Default

    await saveSettings({
        jobRole: 'pro',
        timeWasters: selectedWasters // Wir speichern B2B-Themen im "timeWasters" Feld der DB
    });

    document.getElementById('ws-onboarding').classList.add('hidden');
    window.location.reload();
}

async function saveSettings(data) {
    try {
        await fetch(`${API_BASE_URL}/api/workspace/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    } catch (e) {
        console.error("Fehler beim Speichern der Settings", e);
    }
}

// =================================================================
// 4. INHALTE RENDERN (Wissen & Orientierung)
// =================================================================

async function fetchSettings() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/settings`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!res.ok) return null;
        return await res.json();
    } catch(e) { return null; }
}

function renderWorkspaceContent(settings) {
    const container = document.getElementById('knowledge-container');
    container.innerHTML = ''; // Leeren

    let topicsToRender = [];

    // Unterscheidung: Welche Themenfelder aus der DB nutzen wir?
    if (currentUser.type === 'b2b') {
        // B2B nutzt das Feld 'timeWasters' für die Themenauswahl
        if (settings.timeWasters && Array.isArray(settings.timeWasters)) {
            topicsToRender = settings.timeWasters;
        }
    } else {
        // B2C nutzt 'lifeSituations'
        if (settings.lifeSituations && Array.isArray(settings.lifeSituations)) {
            topicsToRender = settings.lifeSituations;
        }
    }

    // Rendern der Accordions
    if (topicsToRender.length > 0) {
        topicsToRender.forEach(topicKey => {
            const kbEntry = knowledgeBase[topicKey];
            if (kbEntry) {
                appendAccordion(container, kbEntry.title, kbEntry.content);
            }
        });
    } else {
        container.innerHTML = '<p style="padding:10px; color:#888;">Keine Themen ausgewählt. Bitte Einstellungen prüfen.</p>';
    }
}

function appendAccordion(parent, title, content) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'knowledge-item';
    
    // HTML Struktur für das Accordion
    itemDiv.innerHTML = `
        <div class="knowledge-title">
            <span>${title}</span>
            <span class="acc-icon">▼</span>
        </div>
        <div class="knowledge-content">
            ${content}
        </div>
    `;

    // Klick-Event direkt anhängen
    const titleDiv = itemDiv.querySelector('.knowledge-title');
    const contentDiv = itemDiv.querySelector('.knowledge-content');
    const iconSpan = itemDiv.querySelector('.acc-icon');

    titleDiv.addEventListener('click', () => {
        const isOpen = contentDiv.classList.contains('open');
        // Toggle Klasse
        contentDiv.classList.toggle('open');
        // Icon drehen (optional per CSS, hier simpel Texttausch)
        iconSpan.textContent = isOpen ? '▼' : '▲';
    });

    parent.appendChild(itemDiv);
}

// =================================================================
// 5. FUNKTIONEN: NOTIZEN
// =================================================================

async function loadNotes() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/notes`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const notesArea = document.getElementById('personal-notes');
        if(notesArea) notesArea.value = data.content || '';
    } catch (e) { console.error(e); }
}

async function saveNotes(content) {
    try {
        await fetch(`${API_BASE_URL}/api/workspace/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content })
        });
        
        // Visuelles Feedback "Gespeichert"
        const status = document.getElementById('note-save-status');
        if(status) {
            status.style.opacity = 1;
            setTimeout(() => status.style.opacity = 0, 2000);
        }
    } catch (e) { console.error(e); }
}

// =================================================================
// 6. FUNKTIONEN: CHECKLISTEN
// =================================================================

async function loadChecklist() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/checklist`, { headers: { 'Authorization': `Bearer ${token}` } });
        const items = await res.json();
        const list = document.getElementById('checklist-list');
        list.innerHTML = '';

        items.forEach(item => {
            const li = document.createElement('li');
            li.style.display = 'flex'; 
            li.style.alignItems = 'center';
            li.style.gap = '10px'; 
            li.style.marginBottom = '8px';
            li.style.padding = '5px';
            li.style.borderBottom = '1px dashed #eee';

            li.innerHTML = `
                <input type="checkbox" ${item.isDone ? 'checked' : ''} class="cl-checkbox">
                <span style="flex:1; ${item.isDone ? 'text-decoration:line-through; color:#aaa' : ''}">${item.text}</span>
                <button class="cl-delete" style="border:none; background:none; color:#e74c3c; cursor:pointer; font-weight:bold;">&times;</button>
            `;

            // Event Listeners für die Elemente in der Liste
            const checkbox = li.querySelector('.cl-checkbox');
            checkbox.addEventListener('change', () => toggleChecklist(item.id, checkbox.checked));

            const delBtn = li.querySelector('.cl-delete');
            delBtn.addEventListener('click', () => deleteChecklist(item.id));

            list.appendChild(li);
        });
    } catch(e) { console.error(e); }
}

// Wird via HTML button onclick="addChecklistItem()" aufgerufen
window.addChecklistItem = async function() {
    const input = document.getElementById('checklist-input');
    if (!input.value.trim()) return;

    try {
        await fetch(`${API_BASE_URL}/api/workspace/checklist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ text: input.value })
        });
        input.value = ''; // Input leeren
        loadChecklist(); // Liste neu laden
    } catch(e) { console.error(e); }
}

async function toggleChecklist(id, isDone) {
    await fetch(`${API_BASE_URL}/api/workspace/checklist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isDone })
    });
    loadChecklist(); // Reload um Styling (Durchstreichen) sauber anzuwenden
}

async function deleteChecklist(id) {
    await fetch(`${API_BASE_URL}/api/workspace/checklist/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
    });
    loadChecklist();
}

// =================================================================
// 7. FUNKTIONEN: DOKUMENTE (Notfall-Koffer / Vorlagen)
// =================================================================

let currentDocFilter = 'all';

// Wird via HTML Buttons aufgerufen: onclick="filterDocs('finanzen')"
window.filterDocs = function(category) {
    currentDocFilter = category;
    
    // Visuelles Feedback für die Filter-Buttons
    document.querySelectorAll('#docs-filter-container button').forEach(btn => {
        if(btn.dataset.filter === category) btn.classList.add('active-filter'); // CSS Klasse müsste man definieren
        else btn.classList.remove('active-filter');
    });

    loadDocuments(); // Neu laden mit Filter-Logik
}

async function loadDocuments() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/documents`, { headers: { 'Authorization': `Bearer ${token}` } });
        const allDocs = await res.json();
        
        // Filtern im Frontend
        const filteredDocs = currentDocFilter === 'all' 
            ? allDocs 
            : allDocs.filter(d => d.category === currentDocFilter);

        renderDocs(filteredDocs);
    } catch(e) { console.error(e); }
}

function renderDocs(docs) {
    const list = document.getElementById('documents-list');
    list.innerHTML = '';
    
    if (docs.length === 0) {
        list.innerHTML = '<p style="color:#999; font-size:0.9rem; font-style:italic; padding:10px;">Der Koffer ist leer.</p>';
        return;
    }
    
    docs.forEach(doc => {
        const div = document.createElement('div');
        div.className = 'doc-item';
        // Icon je nach Dateityp raten
        const icon = doc.fileName.endsWith('.pdf') ? '📄' : '🖼️';
        
        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:8px; overflow:hidden;">
                <span>${icon}</span>
                <a href="${API_BASE_URL}/${doc.filePath.replace(/\\/g, '/')}" target="_blank" style="text-decoration:none; color:#333; text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">
                    ${doc.fileName}
                </a>
            </div>
            <div style="display:flex; align-items:center; gap:5px;">
                <span style="font-size:0.7rem; color:#aaa; background:#eee; padding:2px 5px; border-radius:4px;">${doc.category || 'Allgemein'}</span>
                <button class="doc-delete" style="border:none; background:none; color:#999; cursor:pointer;">🗑</button>
            </div>
        `;
        
        // Delete Event
        div.querySelector('.doc-delete').addEventListener('click', () => deleteDoc(doc.id));
        
        list.appendChild(div);
    });
}

async function uploadDocument() {
    const input = document.getElementById('doc-upload-input');
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    // Einfache Logik: Wenn ein Filter aktiv ist (z.B. "finanzen"), wird das Dokument direkt da rein gespeichert.
    // Sonst default "allgemein".
    const categoryToSave = (currentDocFilter !== 'all') ? currentDocFilter : 'allgemein';
    formData.append('category', categoryToSave);

    // Optional für B2B: Immer als "vorlage" speichern
    if (currentUser.type === 'b2b') {
        formData.set('category', 'vorlage');
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/documents`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        if (res.ok) {
            input.value = ''; // Reset
            loadDocuments();
        } else {
            alert("Fehler beim Hochladen.");
        }
    } catch(e) { console.error(e); }
}

async function deleteDoc(id) {
    if(!confirm('Möchten Sie dieses Dokument wirklich aus dem Speicher löschen?')) return;
    try {
        await fetch(`${API_BASE_URL}/api/workspace/documents/${id}`, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        loadDocuments();
    } catch(e) { console.error(e); }
}

// =================================================================
// 8. FUNKTIONEN: TAGEBUCH (JOURNAL)
// =================================================================

// Wird beim Laden der Seite aufgerufen (in DOMContentLoaded einfügen!)
function initDiary() {
    // 1. Datum setzen (Deutsch formatiert: "Sonntag, 4. Januar 2026")
    const dateEl = document.getElementById('diary-display-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('de-DE', options);
    }

    // 2. Platzhalter anpassen je nach B2B / B2C
    const inputEl = document.getElementById('diary-input');
    if (inputEl) {
        if (currentUser.type === 'b2b') {
            inputEl.placeholder = "Notizen zum Arbeitstag: Offene Vorgänge, Ideen oder wichtige Erinnerungen...";
        } else {
            inputEl.placeholder = "Liebes Tagebuch, heute habe ich...";
        }
    }

    // 3. Verlauf laden (aber noch zugeklappt lassen)
    loadDiaryHistory();
    
    // 4. History Button Listener
    const historyBtn = document.getElementById('toggle-history-btn');
    const historyContainer = document.getElementById('diary-history-container');
    if (historyBtn && historyContainer) {
        historyBtn.addEventListener('click', () => {
            historyContainer.classList.toggle('open');
            historyBtn.textContent = historyContainer.classList.contains('open') ? '🔼 Zuklappen' : '📜 Alte Einträge';
        });
    }
}

async function saveDiaryEntry() {
    const input = document.getElementById('diary-input');
    const text = input.value.trim();
    if (!text) return;

    // Button Feedback
    const btn = document.querySelector('.diary-footer .btn-primary');
    const originalText = btn.textContent;
    btn.textContent = "Speichere...";
    btn.disabled = true;

    try {
        await fetch(`${API_BASE_URL}/api/workspace/journal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                text: text, 
                mood: 'neutral' // Könnte man später noch auswählbar machen
            })
        });

        // Erfolg
        input.value = ''; // Feld leeren für den nächsten Tag (oder Text lassen? Geschmackssache. Leeren wirkt wie "abgeschlossen")
        loadDiaryHistory(); // Liste aktualisieren
        
        // Button zurücksetzen
        btn.textContent = "Gespeichert! ✅";
        setTimeout(() => { 
            btn.textContent = originalText; 
            btn.disabled = false; 
        }, 2000);

    } catch (e) {
        console.error(e);
        btn.textContent = "Fehler ❌";
    }
}

async function loadDiaryHistory() {
    const container = document.getElementById('diary-history-container');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/journal`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const entries = await res.json();

        container.innerHTML = '';
        
        if (entries.length === 0) {
            container.innerHTML = '<p style="padding:15px; text-align:center; color:#aaa; font-style:italic;">Noch keine Einträge. Schreiben Sie den ersten!</p>';
            return;
        }

        entries.forEach(entry => {
            const dateStr = new Date(entry.createdAt).toLocaleDateString('de-DE', { 
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' 
            });
            
            const div = document.createElement('div');
            div.className = 'diary-entry-item';
            div.innerHTML = `
                <span class="diary-entry-date">${dateStr} Uhr</span>
                <div style="white-space: pre-wrap;">${entry.text}</div>
            `;
            container.appendChild(div);
        });

    } catch (e) { console.error(e); }
}