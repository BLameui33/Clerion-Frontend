document.addEventListener('DOMContentLoaded', () => {

     // =======================================================================
    // NEU: Interaktive Tour für den Antragshelfer
    // =======================================================================
    const antragshelferTourSteps = [
    {
        id: 'welcome_antrag',
        attachTo: { element: '#main-view .card:first-of-type', on: 'bottom' },
        title: 'Willkommen im Antragshelfer!',
        text: 'Diese Tour erklärt Ihnen die finale Bearbeitungsansicht. Hier unterschreiben und finalisieren Sie Ihren Antrag, nachdem Sie ihn im Editor ausgefüllt haben.'
    },
    {
        id: 'edit_button',
        attachTo: { element: '#open-editor-button', on: 'bottom' },
        title: '1. Antrag ausfüllen & bearbeiten',
        text: 'Klicken Sie hier, um das Bearbeitungs-Overlay zu öffnen. Dort können Sie das PDF-Formular interaktiv ausfüllen, unterstützt von unserem KI-Co-Piloten.'
    },
    {
        id: 'signature_button',
        attachTo: { element: '#signature-mode-button', on: 'bottom' },
        title: '2. Unterschrift platzieren',
        text: 'Ihre im Haupt-Dashboard hinterlegte Unterschrift wird hier automatisch verwendet. Klicken Sie auf diesen Button, um sie auf dem Dokument zu platzieren. Sie können die Position und Größe danach anpassen.'
    },
    {
        id: 'download_button',
        attachTo: { element: '#download-final-pdf-button', on: 'bottom' },
        title: '3. Finales PDF herunterladen',
        text: 'Der letzte Schritt! Hiermit wird das ausgefüllte und unterschriebene Dokument als finale PDF-Datei erstellt, die Sie herunterladen und einreichen können.'
    },
    {
        id: 'b2b_clients_antrag',
        attachTo: { element: '#b2b-dashboard', on: 'right' },
        title: 'Klientenverwaltung (B2B)',
        text: 'Ihre Klientenliste wird hier angezeigt. Klicken Sie auf das Stift-Symbol (✎), um die Stammdaten eines Klienten zu bearbeiten. Ein für einen Klienten gestarteter Antrag wird automatisch korrekt zugeordnet.'
    },
    {
        id: 'history_antrag',
        attachTo: { element: '#application-history-container', on: 'right' },
        title: 'Antrags-Verlauf',
        text: 'Hier sehen Sie nur Ihre Anträge (keine Brief- oder Akten-Analysen). Klicken Sie auf einen Eintrag, um die Bearbeitung fortzusetzen.'
    },
    {
        id: 'notes_antrag',
        attachTo: { element: '#notes-container', on: 'right' },
        title: 'Interne Notizen',
        text: 'Hier können Sie persönliche Notizen zu dem ausgewählten Antrag speichern. Die Notizen, die Sie hier eintragen, sind auch für den Admin im Admin-Dashboard sichtbar (bei Geschäftskunden). So können Sie Informationen zu einem Fall austauschen.'
    },
    {
        id: 'documents_antrag',
        attachTo: { element: '#documents-container', on: 'right' },
        title: 'Zugehörige Dokumente',
        text: 'Laden Sie hier zusätzliche Unterlagen hoch, die für diesen Antrag relevant sind, z.B. ärztliche Gutachten, Nachweise oder vorherige Bescheide. So bleibt alles an einem Ort.'
    },
    {
        id: 'finish_antrag',
        title: 'Tour beendet!',
        text: 'Sie kennen nun alle Werkzeuge, um Ihre Anträge erfolgreich abzuschließen. Viel Erfolg!',
        buttons: [{ text: 'Verstanden', action: function() { return this.complete(); } }]
    }
];

    function startAntragshelferTour() {
        if (localStorage.getItem('clerion_antragshelfer_tour_completed')) {
            return;
        }

        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                classes: 'shepherd-theme-arrows',
                scrollTo: { behavior: 'smooth', block: 'center' },
                cancelIcon: { enabled: true },
                buttons: [
                    { action() { return this.back(); }, secondary: true, text: 'Zurück' },
                    { action() { return this.next(); }, text: 'Weiter' }
                ]
            }
        });

        antragshelferTourSteps.forEach(step => {
            if (step.attachTo && step.attachTo.element) {
                const element = document.querySelector(step.attachTo.element);
                if (element && element.offsetParent !== null) {
                    tour.addStep(step);
                }
            } else {
                tour.addStep(step);
            }
        });

        tour.on('complete', () => localStorage.setItem('clerion_antragshelfer_tour_completed', 'true'));
        tour.on('cancel', () => localStorage.setItem('clerion_antragshelfer_tour_completed', 'true'));

        tour.start();
    }
   
    // =======================================================================
    // ENDE INTERAKTIVE TOUR
    // =======================================================================
   
    // =======================================================================
    // BLOCK 1: DOM-ELEMENTE & STATE-VARIABLEN
    // =======================================================================
    const API_BASE_URL = 'https://api.clerion.de';
let authToken = localStorage.getItem('behoerdenhilfe_token');
let selectedClientId = sessionStorage.getItem('behoerdenhilfe_selectedClient') || null;

// State-Variablen
let state = { applicationId: null, contextSummary: '', userSignatureUrl: null };
let currentUser = null;
let loadedPdfDocument = null;
let currentPageNum = 1;
let allFormFields = [];
let currentFieldIndex = 0; // NEU: Ersetzt 'currentStep'
let signatures = [];
let allClients = [];
let lastExplainedText = "";

let debounceTimer;
function debounce(func, delay) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(func, delay);
}

    const uploadSection = document.getElementById('upload-section');
    const mainView = document.getElementById('main-view');
    const pdfUploadInput = document.getElementById('pdf-upload-input');
    let finalizeButton = document.getElementById('finalize-button');
    const logoutButton = document.getElementById('logout-button');
    const b2bDashboard = document.getElementById('b2b-dashboard');
    const applicationHistoryList = document.getElementById('application-history-list');
    const clientList = document.getElementById('client-list');
    const showAllApplicationsButton = document.getElementById('show-all-applications-button');
    const addClientForm = document.getElementById('add-client-form');
    const clientNameInput = document.getElementById('client-name-input');
    const clientDetailModalOverlay = document.getElementById('client-detail-modal-overlay');
    const closeClientDetailModalButton = document.getElementById('close-client-detail-modal-button');
    const saveClientDetailsButton = document.getElementById('save-client-details-button');
    const userInputText = document.getElementById('user-input-text');
    const getAiHelpButton = document.getElementById('get-ai-help-button');
    const aiOutput = document.getElementById('ai-output');
    const aiExplanation = document.getElementById('ai-explanation');
    const aiSuggestion = document.getElementById('ai-suggestion');
    const copySuggestionButton = document.getElementById('copy-suggestion-button');
    let signatureModeButton = document.getElementById('signature-mode-button');
    const notesInput = document.getElementById('notes-input');
    const saveNotesButton = document.getElementById('save-notes-button');
    const documentList = document.getElementById('document-list');
    const documentUploadInput = document.getElementById('document-upload-input');
    const uploadDocumentsButton = document.getElementById('upload-documents-button');




    // =======================================================================
    // BLOCK 2: HILFSFUNKTIONEN (werden vor der Initialisierung definiert)
    // =======================================================================

    async function cacheAllClients() {
    // Lädt die Klienten nur, wenn die Liste leer ist
    if (allClients.length > 0) return; 
    try {
        const response = await fetch(`${API_BASE_URL}/api/clients?type=application`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (!response.ok) throw new Error('Klienten konnten nicht geladen werden.');
        allClients = await response.json();
    } catch (error) {
        console.error("Fehler beim Cachen der Klienten:", error);
    }
}

    // --- KLIENTENVERWALTUNG (B2B) ---
    async function fetchAndRenderClients() {
    const clientList = document.getElementById('client-list');
    try {
        const response = await fetch(`${API_BASE_URL}/api/clients?type=application`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (!response.ok) throw new Error('Klienten konnten nicht geladen werden.');
        const clients = await response.json();
        clientList.innerHTML = clients.map(client => `<li data-client-id="${client.id}"><div class="client-list-item-main"><span>${client.name}</span><button class="edit-client-button" title="Bearbeiten">&#9998;</button></div></li>`).join('');
        
        clientList.querySelectorAll('li').forEach(li => {
            li.querySelector('.client-list-item-main').addEventListener('click', (e) => {
                // Verhindert, dass der Klick auf den Edit-Button den Klienten auswählt
                if (e.target.closest('.edit-client-button')) return;

                selectedClientId = li.dataset.clientId;
                // Speichert die ID des ausgewählten Klienten im Session Storage
                sessionStorage.setItem('behoerdenhilfe_selectedClient', selectedClientId); 

                // Visuelles Feedback für die Auswahl
                document.querySelectorAll('#client-list li.selected').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                
                // Lädt die Anträge für den ausgewählten Klienten
                fetchAndRenderApplicationHistory(li.dataset.clientId);
            });

            li.querySelector('.edit-client-button').addEventListener('click', (e) => {
                e.stopPropagation();
                const clientData = clients.find(c => c.id == li.dataset.clientId);
                openClientDetails(clientData);
            });
        });
    } catch (error) {
        clientList.innerHTML = `<li>${error.message}</li>`;
    }
}

    async function addNewClient(e) {
        e.preventDefault();
        const name = clientNameInput.value.trim();
        if (!name) return;
        try {
            await fetch(`${API_BASE_URL}/api/clients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ name, type: 'application' })
            });
            clientNameInput.value = '';
            await fetchAndRenderClients();
        } catch (error) {
            alert('Klient konnte nicht erstellt werden.');
        }
    }

    function openClientDetails(client) {
        state.activeClientId = client.id;
        document.getElementById('client-modal-title').textContent = `Details für: ${client.name}`;
        document.getElementById('client-name-edit').value = client.name;
        document.getElementById('client-address-edit').value = client.address || '';
        document.getElementById('client-status-edit').value = client.statusInfo || '';
        document.getElementById('client-notes-edit').value = client.notes || '';
        clientDetailModalOverlay.classList.remove('hidden');
    }

    function closeClientDetails() {
        clientDetailModalOverlay.classList.add('hidden');
        state.activeClientId = null;
    }

    async function saveClientDetails() {
        if (!state.activeClientId) return;
        const updatedClient = {
            name: document.getElementById('client-name-edit').value,
            address: document.getElementById('client-address-edit').value,
            statusInfo: document.getElementById('client-status-edit').value,
            notes: document.getElementById('client-notes-edit').value
        };
        try {
            const response = await fetch(`${API_BASE_URL}/api/clients/${state.activeClientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify(updatedClient)
            });
            if (!response.ok) throw new Error('Speichern fehlgeschlagen.');
            closeClientDetails();
            await fetchAndRenderClients();
        } catch (error) { alert(error.message); }
    }


    // =======================================================================
    // BLOCK 3: INITIALISIERUNG & SETUP
    // =======================================================================

    async function initialize() {
        
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }


    await fetchCurrentUser();
    setupGlobalEventListeners();

    if (currentUser.type === 'b2b') {
        b2bDashboard.classList.remove('hidden');
        await fetchAndRenderClients();
    }

    await fetchAndRenderApplicationHistory();
    await fetchUserSignature();

    const urlParams = new URLSearchParams(window.location.search);
    const applicationIdFromUrl = urlParams.get('id');
    const templateFromUrl = urlParams.get('vorlage'); // Holt den Vorlagen-Namen


    if (applicationIdFromUrl) {
        // Szenario 1: Einen bestehenden Antrag aus dem Verlauf laden
        await loadExistingApplication(applicationIdFromUrl);

    } else if (templateFromUrl) {
        // Szenario 2 (NEU): Einen neuen Antrag aus einer Vorlage starten
        try {
            // Lädt die PDF-Vorlage vom Server
            const response = await fetch(`${API_BASE_URL}/vorlagen/${templateFromUrl}`);
            const blob = await response.blob();
            const file = new File([blob], templateFromUrl, { type: 'application/pdf' });

            // Startet den Antrag mit der geladenen Datei
            await processApplicationFile(file);
        } catch (error) {
            alert('Die ausgewählte Vorlage konnte nicht geladen werden.');
            window.location.href = 'antragshelfer.html';
        }
    }
    // Szenario 3: Nichts tun und auf den Upload des Nutzers warten
window.addEventListener("beforeunload", (event) => {
        const overlay = document.getElementById("pdf-editor-overlay");
        if (overlay && !overlay.classList.contains("hidden")) {
            event.preventDefault();
            event.returnValue = ""; // Zeigt den Standard-Warntext des Browsers
        }
    });
}


   function setupGlobalEventListeners() {
    // --- Allgemeine Listener ---
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('behoerdenhilfe_token');
        window.location.href = 'index.html';
    });
    pdfUploadInput.addEventListener('change', startNewApplication);

    // --- Notizen & Dokumente (jetzt an der richtigen Stelle) ---
    const saveNotesButton = document.getElementById('save-notes-button');
    const uploadDocumentsButton = document.getElementById('upload-documents-button');
    const documentUploadInput = document.getElementById('document-upload-input');

    if (saveNotesButton) saveNotesButton.addEventListener('click', saveNotes);
    if (uploadDocumentsButton) uploadDocumentsButton.addEventListener('click', uploadDocument);

    // Visuelles Feedback für ausgewählte Datei
    if (documentUploadInput) {
        documentUploadInput.addEventListener('change', () => {
            const label = document.querySelector('label[for="document-upload-input"]');
            if (documentUploadInput.files.length > 0) {
                label.textContent = documentUploadInput.files[0].name;
            } else {
                label.textContent = 'Dokument auswählen...';
            }
        });
    }

    const startNewButton = document.getElementById('start-new-application-button');
if (startNewButton) {
    startNewButton.addEventListener('click', () => {
        // ZUERST die Auswahl zurücksetzen
        selectedClientId = null;
        sessionStorage.removeItem('behoerdenhilfe_selectedClient');
        
        // DANN fragen und weiterleiten
        if (confirm('Möchten Sie die aktuelle Bearbeitung wirklich abbrechen und einen neuen Antrag starten?')) {
            window.location.href = 'antragshelfer.html';
        }
    });
}



    // --- B2B-spezifische Listener ---
    const addClientForm = document.getElementById('add-client-form');
    const showAllApplicationsButton = document.getElementById('show-all-applications-button');
    const closeClientDetailModalButton = document.getElementById('close-client-detail-modal-button');
    const clientDetailModalOverlay = document.getElementById('client-detail-modal-overlay');
    const saveClientDetailsButton = document.getElementById('save-client-details-button');
    
    if(closeClientDetailModalButton) closeClientDetailModalButton.addEventListener('click', closeClientDetails);
    if(clientDetailModalOverlay) clientDetailModalOverlay.addEventListener('click', (e) => { if (e.target === clientDetailModalOverlay) closeClientDetails(); });
    if(saveClientDetailsButton) saveClientDetailsButton.addEventListener('click', saveClientDetails);
    
    if (currentUser && currentUser.type === 'b2b') {
        if (addClientForm) addClientForm.addEventListener('submit', addNewClient);
        if (showAllApplicationsButton) {
            showAllApplicationsButton.addEventListener('click', () => {
                selectedClientId = null;
                document.querySelectorAll('#client-list li.selected').forEach(li => li.classList.remove('selected'));
                fetchAndRenderApplicationHistory();
                
                // Setzt die Ansicht zurück, wenn kein Antrag mehr aktiv ist
                state.applicationId = null; 
                document.getElementById('notes-container').classList.add('hidden');
                document.getElementById('documents-container').classList.add('hidden');
                document.getElementById('notes-input').value = '';
                document.getElementById('document-list').innerHTML = '';
            });
        }
    }
    document.body.addEventListener('click', (e) => {
        // Prüft, ob der Klick nicht auf einer Unterschrift war
        if (!e.target.closest('.signature-wrapper')) {
            // Entfernt die .selected-Klasse von allen Unterschriften
            document.querySelectorAll('.signature-wrapper.selected').forEach(el => {
                el.classList.remove('selected');
            });
        }
    });
}

    
    // =======================================================================
    // BLOCK 4: KERNFUNKTIONEN (Antrag, PDF, Formular-Assistent)
    // =======================================================================





    /**
 * Kernfunktion, die eine PDF-Datei entgegennimmt, ans Backend sendet
 * und den Editor öffnet.
 * @param {File} file - Die PDF-Datei.
 */
async function processApplicationFile(file) {
    if (!file) return;

    uploadSection.innerHTML = '<div class="loading-indicator"><h3>Antrag wird vorbereitet...</h3><div id="loading-spinner"></div></div>';

    const formData = new FormData();
    formData.append('pdfFile', file);
    if (currentUser && currentUser.type === 'b2b' && selectedClientId) {
        formData.append('clientId', selectedClientId);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/applications/start`, { 
            method: 'POST', 
            headers: { 'Authorization': `Bearer ${authToken}` }, 
            body: formData 
        });

        const data = await response.json();

        if (!response.ok) {
            // Spezialfall: XFA- / falsches Formularformat
            if (data.code === 'UNSUPPORTED_XFA_PDF') {
                showXfaNotice(
                    'Das hochgeladene PDF verwendet ein spezielles Behörden-Formularformat ' +
                    '(XFA), das in Browsern und im Clerion-Antragshelfer nicht interaktiv ' +
                    'bearbeitet werden kann.\n\n' +
                    'Bitte laden Sie das Formular in Adobe Acrobat Reader, ' +
                    'speichern Sie es dort als „Standard-PDF“ (Datei → Speichern als...), ' +
                    'und laden Sie die neue Version anschließend hier erneut hoch.'
                );

                // Hier optional Upload-Bereich zurücksetzen, statt Seite neu zu laden
                // z.B.: uploadSection.innerHTML = ursprünglichesHTML;
                return;
            }

            throw new Error(data.message || 'Der Antrag konnte nicht erstellt werden.');
        }

        // Alles ok → Editor öffnen
        await openPdfEditor(data.applicationId);

    } catch (error) {
        alert(`Fehler: ${error.message}`);
        window.location.reload();
    }
}


function showXfaNotice(message) {
  const modal = document.getElementById('xfaNoticeModal');
  const text = document.getElementById('xfaNoticeText');
  const closeBtn = document.getElementById('xfaNoticeClose');

  text.textContent = message;
  modal.classList.remove('hidden');

  closeBtn.onclick = () => {
    modal.classList.add('hidden');
  };
}



    async function startNewApplication(e) {
    const file = e.target.files[0];
    await processApplicationFile(file);
}

    async function loadExistingApplication(applicationId) {
    state.applicationId = applicationId;

    document.querySelectorAll('#application-history-list li.active-application').forEach(li => {
        li.classList.remove('active-application');
    });
    // 2. Den neuen aktiven Antrag finden und markieren
    const activeListItem = document.querySelector(`#application-history-list li[data-app-id="${applicationId}"]`);
    if (activeListItem) {
        activeListItem.classList.add('active-application');
    }
    
    uploadSection.classList.add('hidden');
    mainView.classList.remove('hidden');

    document.getElementById('notes-container').classList.remove('hidden');
    document.getElementById('documents-container').classList.remove('hidden');

    try {
        const appResponse = await fetch(`${API_BASE_URL}/api/applications/${applicationId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (!appResponse.ok) throw new Error('Antragsdaten konnten nicht geladen werden.');
        const appData = await appResponse.json();

        document.getElementById('notes-input').value = appData.notes || '';
        await fetchAndRenderApplicationDocuments();
        
        const pdfUrl = `${API_BASE_URL}/api/applications/${applicationId}/filled-pdf`;
        await setupPdfViewer(pdfUrl);

        // Der Aufruf bleibt hier, aber wir stellen sicher, dass die Funktion existiert
        setupMainViewEventListeners();

        setTimeout(startAntragshelferTour, 500);

    } catch (error) {
        console.error('Fehler beim Laden des Antrags:', error);
        const mainContent = document.querySelector('.app-main-content');
        if (mainContent) {
            mainContent.innerHTML = `<div class="card error"><h3>Fehler</h3><p>Der ausgewählte Antrag konnte nicht geladen werden. Bitte versuchen Sie es später erneut oder wählen Sie einen anderen Antrag aus der Liste.</p><p><i>Detail: ${error.message}</i></p></div>`;
        }
    }
}

    

    async function finalizeApplication() {
    if (!state.applicationId) return;

    const currentInput = fieldInputContainer.querySelector('input, textarea');
    if (currentInput) {
        allFormFields[currentFieldIndex].value = currentInput.value;
    }
    
    finalizeButton.disabled = true;
    finalizeButton.textContent = 'Verarbeite...';
    
    const formInputs = allFormFields.reduce((acc, field) => {
        acc[field.name] = field.value || '';
        return acc;
    }, {});

    const canvas = document.getElementById('pdf-canvas');
    const scale = 1.5; 
    
    // Wir holen uns die Original-Seitengröße für die Umrechnung
    const page = await loadedPdfDocument.getPage(1); // Page-Nummer ist für die Maße egal
    const viewport = page.getViewport({ scale: 1 }); // Unskaliertes Viewport

    const finalSignatures = signatures.map(sig => {
        // Skalierungsfaktor zwischen Canvas-Anzeige und Original-PDF-Größe
        const scaleFactorX = viewport.width / (canvas.width / scale);
        const scaleFactorY = viewport.height / (canvas.height / scale);

        // Pixelwerte der Unterschrift auf dem skalierten Canvas
        const sigX_on_canvas = sig.x;
        const sigY_on_canvas = sig.y;
        const sigWidth_on_canvas = sig.width;
        const sigHeight_on_canvas = sig.height;
        
        // Umrechnung in unskalierte PDF-Punkte
        const pdfX = sigX_on_canvas * scaleFactorX;
        const pdfWidth = sigWidth_on_canvas * scaleFactorX;
        const pdfHeight = sigHeight_on_canvas * scaleFactorY;

        // Y-Koordinate umrechnen UND den Ankerpunkt von oben-links auf unten-links korrigieren
        const y_from_top_in_points = sigY_on_canvas * scaleFactorY;
        
        // =================================================================================
        // HIER IST DIE ENTSCHEIDENDE KORREKTUR: Wir ziehen die Höhe der Signatur ab
        // =================================================================================
        const pdfY = viewport.height - y_from_top_in_points - pdfHeight;
        
        return {
            page: sig.page,
            x: pdfX,
            y: pdfY,
            width: pdfWidth,
            height: pdfHeight
        };
    });

    try {
        const response = await fetch(`${API_BASE_URL}/api/applications/${state.applicationId}/finalize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ formData: formInputs, signatures: finalSignatures })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        mainView.innerHTML = `<div class="card" style="text-align: center;"><h2>Antrag erfolgreich erstellt!</h2><p>Ihr Dokument steht zum Download bereit.</p><a href="${API_BASE_URL}${data.downloadUrl}" target="_blank" class="btn btn-primary">Jetzt herunterladen</a><a href="antragshelfer.html" class="button-secondary" style="margin-top: 1rem;">Neuen Antrag starten</a></div>`;
    } catch (error) {
        alert(`Fehler: ${error.message}`);
    } finally {
        if(finalizeButton) finalizeButton.disabled = false;
        if(finalizeButton) finalizeButton.textContent = 'Antrag fertigstellen & PDF herunterladen';
    }
}

    async function navigateFields(direction) {
    // 1. Speichert den Fortschritt, bevor zum nächsten Feld gewechselt wird
    await saveProgress();

    // 2. Wechselt zum neuen Feld
    const newIndex = currentFieldIndex + direction;
    if (newIndex >= 0 && newIndex < allFormFields.length) {
        currentFieldIndex = newIndex;
        await renderFocusField(currentFieldIndex);
    }
}






   
    // =======================================================================
    // BLOCK 5: PDF & SIGNATUR FUNKTIONEN
    // =======================================================================

    async function setupPdfViewer(pdfUrl) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        try {
            const loadingTask = pdfjsLib.getDocument({
            url: pdfUrl,
            httpHeaders: { 'Authorization': `Bearer ${authToken}` }
        });
            loadedPdfDocument = await loadingTask.promise;
            document.getElementById('pdf-page-count').textContent = loadedPdfDocument.numPages;

            const pageSelector = document.getElementById('pdf-page-selector');
        pageSelector.innerHTML = ''; // Vorherige Optionen sicherheitshalber löschen
        for (let i = 1; i <= loadedPdfDocument.numPages; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Seite ${i}`; // Text angepasst für die Anzeige
            pageSelector.appendChild(option);
        }

        // Event-Listener für das Dropdown hinzufügen, um den Seitenwechsel auszulösen
        pageSelector.addEventListener('change', (e) => {
            const newPageNum = parseInt(e.target.value, 10);
            renderPage(newPageNum); // Ruft die Funktion zum Rendern der Seite auf
        });

            document.getElementById('pdf-prev-page').addEventListener('click', () => {
                if (currentPageNum > 1) renderPage(currentPageNum - 1);
            });
            document.getElementById('pdf-next-page').addEventListener('click', () => {
                if (currentPageNum < loadedPdfDocument.numPages) renderPage(currentPageNum + 1);
            });

            await renderPage(1);
        } catch (error) {
            console.error('Fehler beim Laden des PDF:', error);
            alert("Das PDF-Dokument konnte nicht geladen werden.");
        }
    }

    async function renderPage(pageNum) {
    if (!loadedPdfDocument || pageNum < 1 || pageNum > loadedPdfDocument.numPages) return;
    currentPageNum = pageNum;

    const page = await loadedPdfDocument.getPage(pageNum);
    const canvas = document.getElementById('pdf-canvas');
    const ctx = canvas.getContext('2d');
    const scale = 1.5; // Der Skalierungsfaktor für die Anzeige
    const viewport = page.getViewport({ scale: scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 1. PDF-Seiteninhalt auf die leere Leinwand zeichnen
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    // 2. Prüfen, ob das aktuell ausgewählte Feld auf dieser Seite liegt
    const currentField = allFormFields[currentFieldIndex];
    if (currentField && currentField.page === pageNum) {
        
        // 3. Markierung direkt auf die Leinwand über das PDF zeichnen
        const rect = currentField.rect;
        
        // Semitransparente Füllung
        ctx.fillStyle = 'rgba(255, 204, 0, 0.25)'; 
        ctx.fillRect(
            rect.x * scale,
            rect.y * scale,
            rect.width * scale,
            rect.height * scale
        );

        // Fester Rand
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 2;
        ctx.strokeRect(
            rect.x * scale,
            rect.y * scale,
            rect.width * scale,
            rect.height * scale
        );
    }

    // UI-Navigation aktualisieren
    document.getElementById('pdf-page-num').textContent = pageNum;
    document.getElementById('pdf-page-selector').value = pageNum;
    document.getElementById('pdf-prev-page').disabled = pageNum <= 1;
    document.getElementById('pdf-next-page').disabled = pageNum >= loadedPdfDocument.numPages;
}

    function placeSignature() {
    if (!state.userSignatureUrl) {
        alert('Bitte speichern Sie zuerst eine Unterschrift in Ihrem Dashboard.');
        return;
    }
    const newSignatureData = { page: currentPageNum, x: 100, y: 100, width: 150, height: 50 };
    signatures.push(newSignatureData);
    createSignatureElement(newSignatureData);
}

function createSignatureElement(sigData) {
    const pageWrapper = document.getElementById('pdf-page-wrapper');
    const wrapper = document.createElement('div');
    wrapper.className = 'signature-wrapper draggable-signature';
    wrapper.style.left = `${sigData.x}px`;
    wrapper.style.top = `${sigData.y}px`;
    wrapper.style.width = `${sigData.width}px`;
    wrapper.innerHTML = `<img src="${state.userSignatureUrl}" alt="Unterschrift" draggable="false"><div class="resize-handle"></div><div class="delete-handle">&times;</div>`;

    wrapper.querySelector('img').addEventListener('dragstart', (e) => e.preventDefault());

    wrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.signature-wrapper.selected').forEach(el => {
            el.classList.remove('selected');
        });
        wrapper.classList.add('selected');
    });

    pageWrapper.appendChild(wrapper);
    makeInteractive(wrapper, sigData);
}

function redrawSignaturesForCurrentPage() {
    document.querySelectorAll('.signature-wrapper').forEach(sw => sw.remove());
    signatures.filter(sig => sig.page === currentPageNum).forEach(createSignatureElement);
}

function makeInteractive(element, sigDataRef) {
    const handle = element.querySelector('.resize-handle');
    const deleteBtn = element.querySelector('.delete-handle');
    let original_w, original_h, original_mouse_x, original_mouse_y, original_ratio;

    // ----- HILFSFUNKTIONEN -----
    const updateSignatureData = () => {
        sigDataRef.x = element.offsetLeft;
        sigDataRef.y = element.offsetTop;
        sigDataRef.width = element.offsetWidth;
        sigDataRef.height = element.offsetHeight;
    };

    // Holt die x/y Koordinaten, egal ob von Maus oder Touch
    const getCoords = (e) => {
        return e.touches ? e.touches[0] : e;
    };

    // ----- LÖSCHEN -----
    const onDelete = (e) => {
        e.stopPropagation();
        e.preventDefault();
        signatures = signatures.filter(s => s !== sigDataRef);
        element.remove();
    };
    deleteBtn.addEventListener('click', onDelete);
    deleteBtn.addEventListener('touchstart', onDelete); // NEU: Löschen per Touch

    // ----- STARTPUNKT (DRAG ODER RESIZE) -----
    const onStart = (e) => {
        const target = getCoords(e);

        if (e.target === handle) {
            e.stopPropagation();
            startResize(target);
        } else if (e.target !== deleteBtn) {
            startDrag(target);
        }
    };
    element.addEventListener('mousedown', onStart);
    element.addEventListener('touchstart', onStart, { passive: false });

    // ----- GRÖSSE ÄNDERN (RESIZE) -----
    function startResize(target) {
        original_w = element.offsetWidth;
        original_h = element.offsetHeight;
        original_mouse_x = target.clientX;
        original_mouse_y = target.clientY;
        original_ratio = original_h / original_w;

        document.addEventListener('mousemove', onResize);
        document.addEventListener('touchmove', onResize, { passive: false });
        document.addEventListener('mouseup', endInteraction);
        document.addEventListener('touchend', endInteraction);
    }

    function onResize(e) {
        if (e.cancelable) e.preventDefault();
        const target = getCoords(e);
        const dx = target.clientX - original_mouse_x;
        const dy = target.clientY - original_mouse_y;

        let newWidth = original_w + dx;
        let newHeight = original_h + dy;
        if (Math.abs(dx) > Math.abs(dy)) {
            newHeight = newWidth * original_ratio;
        } else {
            newWidth = newHeight / original_ratio;
        }
        if (newWidth > 40) {
            element.style.width = newWidth + 'px';
            element.style.height = newHeight + 'px';
        }
    }

    // ----- VERSCHIEBEN (DRAG) -----
    function startDrag(target) {
        const initialX = target.clientX - element.offsetLeft;
        const initialY = target.clientY - element.offsetTop;

        const onDrag = (e) => {
            if (e.cancelable) e.preventDefault();
            const moveTarget = getCoords(e);
            element.style.left = (moveTarget.clientX - initialX) + 'px';
            element.style.top = (moveTarget.clientY - initialY) + 'px';
        };

        const endDrag = () => {
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('touchmove', onDrag);
            document.removeEventListener('mouseup', endDrag);
            document.removeEventListener('touchend', endDrag);
            updateSignatureData();
        };
        
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('touchmove', onDrag, { passive: false });
        document.addEventListener('mouseup', endDrag);
        document.addEventListener('touchend', endDrag);
    }

    // ----- ENDPUNKT (FÜR ALLES) -----
    function endInteraction() {
        document.removeEventListener('mousemove', onResize);
        document.removeEventListener('touchmove', onResize);
        document.removeEventListener('mouseup', endInteraction);
        document.removeEventListener('touchend', endInteraction);
        updateSignatureData();
    }
}


    // =======================================================================
    // BLOCK 6: DATENLADEN & ANZEIGEN (AUTH, VERLAUF, DOKUMENTE etc.)
    // =======================================================================

    async function fetchCurrentUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error("Sitzung ungültig.");
            currentUser = await response.json();
        } catch (e) {
            localStorage.removeItem('behoerdenhilfe_token');
            window.location.href = 'index.html';
        }
    }

    async function fetchAndRenderApplicationHistory(clientId = null) {
    // Stellt sicher, dass die Klientenliste für die Dropdowns verfügbar ist
    if (currentUser.type === 'b2b') {
        await cacheAllClients();
    }

    applicationHistoryList.innerHTML = '<li>Lade Verlauf...</li>';
    const url = clientId 
        ? `${API_BASE_URL}/api/clients/${clientId}/applications` 
        : `${API_BASE_URL}/api/applications/user`;

    try {
        const response = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (!response.ok) throw new Error('Verlauf konnte nicht geladen werden.');
        const applications = await response.json();
    
        if (applications.length === 0) {
            applicationHistoryList.innerHTML = '<li>Keine Anträge vorhanden.</li>';
            return;
        }

        // Schritt 1: Das HTML für die Liste generieren
        applicationHistoryList.innerHTML = applications.map(app => {
            const title = app.customTitle || `Antrag vom ${new Date(app.createdAt).toLocaleDateString('de-DE')}`;
            let clientInfoHtml = '';

            if (currentUser.type === 'b2b') {
                if (app.clientName) {
                    clientInfoHtml = `<span class="case-client-name">${app.clientName}</span>`;
                } else {
                    const options = allClients.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
                    clientInfoHtml = `<select class="client-assign-dropdown" data-app-id="${app.id}">
                                        <option value="" disabled selected>Klient zuweisen...</option>
                                        ${options}
                                    </select>`;
                }
            }

            return `<li data-app-id="${app.id}">
                <div class="case-title-wrapper">
                    <span class="case-title">${title}</span>
                    ${clientInfoHtml}
                    <span class="case-date">${new Date(app.createdAt).toLocaleDateString('de-DE')}</span>
                </div>
                <div class="case-actions">
                    <button class="btn-icon edit-app-btn" title="Bearbeiten"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
                    <button class="delete-button delete-app-btn" title="Löschen">&times;</button>
                </div>
            </li>`;
        }).join('');

        // Schritt 2: Gezielte Event-Listener für jedes Listenelement hinzufügen
        applicationHistoryList.querySelectorAll('li[data-app-id]').forEach(li => {
            const appId = li.dataset.appId;

            // AKTION 1: Antrag öffnen (Klick auf den Titel-Bereich ODER den Stift-Button)
            const openTrigger = li.querySelector('.case-title-wrapper');
            const editButton = li.querySelector('.edit-app-btn');
            const openApplication = () => { window.location.href = `antragshelfer.html?id=${appId}`; };
            
            openTrigger.addEventListener('click', openApplication);
            editButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Verhindert Klick auf das LI
                openApplication();
            });

            // AKTION 2: Antrag löschen
            li.querySelector('.delete-app-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Diesen Antrag wirklich löschen?')) {
                    await fetch(`${API_BASE_URL}/api/applications/${appId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` } });
                    li.remove();
                }
            });

            // AKTION 3: Titel anklicken zum Umbenennen
            li.querySelector('.case-title').addEventListener('click', (e) => {
                e.stopPropagation(); // Verhindert, dass der Antrag gleichzeitig geöffnet wird
                const titleSpan = e.target;
                const currentTitle = titleSpan.textContent;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentTitle;
                input.onclick = (ev) => ev.stopPropagation(); // Verhindert Klick-Events während der Eingabe
                
                titleSpan.replaceWith(input);
                input.focus();

                const saveRename = async () => {
                    const newTitle = input.value.trim();
                    const newSpan = document.createElement('span');
                    newSpan.className = 'case-title';
                    newSpan.textContent = (newTitle && newTitle !== currentTitle) ? newTitle : currentTitle;
                    input.replaceWith(newSpan);

                    if (newTitle && newTitle !== currentTitle) {
                        try {
                            await fetch(`${API_BASE_URL}/api/applications/${appId}/rename`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                                body: JSON.stringify({ newTitle })
                            });
                        } catch (err) {
                            alert('Fehler beim Speichern des neuen Titels.');
                            newSpan.textContent = currentTitle;
                        }
                    }
                };
                
                input.addEventListener('blur', saveRename);
                input.addEventListener('keydown', (ev) => {
                    if (ev.key === 'Enter') input.blur();
                    if (ev.key === 'Escape') {
                        input.value = currentTitle;
                        input.blur();
                    }
                });
            });

            // AKTION 4: Klient aus Dropdown zuweisen
            const dropdown = li.querySelector('.client-assign-dropdown');
            if (dropdown) {
                // Verhindert, dass ein Klick zum Öffnen des Dropdowns den Antrag öffnet
                dropdown.addEventListener('click', (e) => e.stopPropagation());

                dropdown.addEventListener('change', async (e) => {
                    e.stopPropagation();
                    const selectedClientId = e.target.value;
                    if (!selectedClientId) return;
                    try {
                        await fetch(`${API_BASE_URL}/api/applications/${appId}/assign-client`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                            body: JSON.stringify({ clientId: selectedClientId })
                        });
                        // Lade die gesamte Liste neu, um die Änderung korrekt darzustellen
                        await fetchAndRenderApplicationHistory();
                    } catch (error) {
                        alert('Zuweisung des Klienten fehlgeschlagen.');
                    }
                });
            }
        });

    } catch (error) {
        applicationHistoryList.innerHTML = `<li>Fehler: ${error.message}</li>`;
    }
}

    async function getAiHelp() {
        const text = userInputText.value.trim();
        if (!text) return;
        getAiHelpButton.disabled = true;
        getAiHelpButton.textContent = "Analysiere...";
        aiOutput.classList.remove('hidden');
        aiExplanation.textContent = "Die KI denkt nach...";
        aiSuggestion.textContent = "";
        try {
            const response = await fetch(`${API_BASE_URL}/api/applications/assist-paragraph`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ pastedText: text })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            aiExplanation.textContent = data.explanation;
            aiSuggestion.textContent = data.suggestedAnswer;
        } catch (error) {
            aiExplanation.textContent = `Fehler: ${error.message}`;
        } finally {
            getAiHelpButton.disabled = false;
            getAiHelpButton.textContent = "Hilfe anfordern";
        }
    }

    function copySuggestion() {
        const textToCopy = aiSuggestion.textContent;
        if (textToCopy) navigator.clipboard.writeText(textToCopy).then(() => alert('Text kopiert!'));
    }

    async function fetchUserSignature() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/user/me/details`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            const data = await response.json();
            if (data.signaturePath) state.userSignatureUrl = `${API_BASE_URL}/${data.signaturePath.replace(/\\/g, '/')}`;
        } catch (error) {
            console.error('Unterschrift konnte nicht geladen werden:', error);
        }
    }

    async function saveNotes() {
        if (!state.applicationId) return;
        try {
            await fetch(`${API_BASE_URL}/api/applications/${state.applicationId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ notes: notesInput.value })
            });
            alert('Notizen gespeichert!');
        } catch (e) { alert('Fehler beim Speichern der Notizen.'); }
    }

    async function uploadDocument() {
    const documentUploadInput = document.getElementById('document-upload-input');
    if (!state.applicationId || documentUploadInput.files.length === 0) return;
    
    const formData = new FormData();
    formData.append('documentFile', documentUploadInput.files[0]);
    
    try {
        
        const response = await fetch(`${API_BASE_URL}/api/applications/${state.applicationId}/documents`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Fehler beim Hochladen der Datei.');
        }

        await fetchAndRenderApplicationDocuments();

        const label = document.querySelector('label[for="document-upload-input"]');
        if (label) {
            label.textContent = 'Dokument auswählen...';
            
            label.classList.add('btn-secondary');
            label.classList.remove('btn-success');
        }
        documentUploadInput.value = ''; 
        

    } catch (e) { 
        alert(e.message || 'Dokument konnte nicht hochgeladen werden.'); 
    }
}

    async function fetchAndRenderApplicationDocuments() {
    if (!state.applicationId) return;
    try {
        const response = await fetch(`${API_BASE_URL}/api/applications/${state.applicationId}/documents`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        const docs = await response.json();
        
        const documentList = document.getElementById('document-list');
        documentList.innerHTML = docs.length === 0 
            ? '<li>Keine Dokumente vorhanden.</li>' 
            : docs.map(doc => `
                <li data-doc-li-id="${doc.id}">
                    <a href="${API_BASE_URL}/${doc.filePath.replace(/\\/g, '/')}" target="_blank">${doc.fileName}</a>
                    <button class="delete-button delete-doc-btn" data-doc-id="${doc.id}" title="Dokument löschen">&times;</button>
                </li>`).join('');

        // ==========================================================
        // NEU: Fügt die Lösch-Funktion zu den Buttons hinzu
        // ==========================================================
        documentList.querySelectorAll('.delete-doc-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation(); // Verhindert andere Klick-Events
                const docId = e.target.dataset.docId;
                if (confirm('Möchten Sie dieses Dokument wirklich endgültig löschen?')) {
                    try {
                        const deleteResponse = await fetch(`${API_BASE_URL}/api/applications/documents/${docId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        if (!deleteResponse.ok) {
                            throw new Error('Dokument konnte nicht gelöscht werden.');
                        }
                        // Entfernt das Dokument aus der Ansicht
                        document.querySelector(`li[data-doc-li-id="${docId}"]`).remove();
                    } catch (error) {
                        alert(error.message);
                    }
                }
            });
        });
        // ==========================================================

    } catch (e) { 
        document.getElementById('document-list').innerHTML = '<li>Dokumente konnten nicht geladen werden.</li>'; 
    }
}

// =======================================================
// NEUER CODEBLOCK A: STEUERUNG DES PDF-EDITORS
// =======================================================

let editorFormFields = []; // Eigener State für die Felder im Editor

/**
 * Öffnet das Editor-Overlay und lädt das interaktive PDF.
 * @param {string} applicationId - Die ID des zu ladenden Antrags.
 */
async function openPdfEditor(applicationId) {
    state.applicationId = applicationId;
    const overlay = document.getElementById('pdf-editor-overlay');
    const pdfContainer = document.getElementById('editor-pdf-container');
    
    pdfContainer.innerHTML = '<div class="loading-indicator"><h3>Analysiere Antrag & lade Editor...</h3><div id="loading-spinner"></div></div>';
    overlay.classList.remove('hidden');

    // Gib dem Browser kurz Zeit, das Lade-Overlay anzuzeigen
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
  
        const analyzeResponse = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/analyze`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!analyzeResponse.ok) {
            console.warn('Die automatische Analyse des Antrags ist fehlgeschlagen, fahre aber fort.');
        }

        // Lade die Feld-Infos für den KI-Co-Pilot (bleibt gleich)
        const fieldsResponse = await fetch(`${API_BASE_URL}/api/applications/${applicationId}/form-fields`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (!fieldsResponse.ok) throw new Error('Formularfelder konnten nicht extrahiert werden.');
        editorFormFields = await fieldsResponse.json();

        // Lade das interaktive PDF (bleibt gleich)
        const pdfUrl = `${API_BASE_URL}/api/applications/${applicationId}/filled-pdf`;
        await renderInteractivePdf(pdfUrl, pdfContainer);
        
        setupEditorEventListeners();

        setupTextSelectionAI();

    } catch (error) {
        alert(`Fehler beim Öffnen des Editors: ${error.message}`);
        closePdfEditor();
    }
}


function closePdfEditor() {
    const overlay = document.getElementById('pdf-editor-overlay');
    overlay.classList.add('hidden');
    state.applicationId = null;
    editorFormFields = [];
    // Wichtig, um die Seite für den nächsten Antrag vorzubereiten
    window.location.href = 'antragshelfer.html';
}

function hideEditorOverlay() {
    const overlay = document.getElementById('pdf-editor-overlay');
    overlay.classList.add('hidden');
}

// =======================================================
// NEUER CODEBLOCK B: INTERAKTIVER PDF-RENDERER
// =======================================================

/**
 * Rendert ein PDF mit klickbaren Formularfeldern in einem Container.
 * @param {string} pdfUrl - Die URL zum PDF.
 * @param {HTMLElement} container - Das <div>, in das gerendert wird.
 */
async function renderInteractivePdf(pdfUrl, container) {
    container.innerHTML = '';
    const viewerDiv = document.createElement('div');
    viewerDiv.className = 'pdfViewer';
    container.appendChild(viewerDiv);

    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

    try {
        const eventBus = new pdfjsViewer.EventBus();
        const linkService = new pdfjsViewer.PDFLinkService({ eventBus });

        const pdfViewer = new pdfjsViewer.PDFViewer({
            container: container,
            viewer: viewerDiv,
            eventBus: eventBus,
            linkService: linkService,
        });

        linkService.setViewer(pdfViewer);

        // HINWEIS: Die alte 'eventBus.on(...)' Logik wurde komplett entfernt.
        // Die Klick-Erkennung wird jetzt an zentraler Stelle erledigt.

        const loadingTask = pdfjsLib.getDocument({
    url: pdfUrl,
    httpHeaders: { 'Authorization': `Bearer ${authToken}` }
});
        const pdfDocument = await loadingTask.promise;
        pdfViewer.setDocument(pdfDocument);

    } catch (error) {
        console.error('Fehler beim Rendern des interaktiven PDF:', error);
        container.innerHTML = `<p class="error">Das interaktive PDF konnte nicht geladen werden. (${error.message})</p>`;
    }
}


// =======================================================
// NEUER CODEBLOCK C: KI-CO-PILOT FÜR DEN EDITOR
// =======================================================

/**
 * Aktiviert das KI-Hilfefenster für ein bestimmtes Feld.
 * @param {string} fieldName - Der Name des Feldes, das angeklickt wurde.
 */
async function activateAiHelper(fieldName) {
    document.getElementById('ai-helper-instruction').classList.add('hidden');
    const helperContent = document.getElementById('ai-helper-content');
    const explanationDiv = document.getElementById('ai-helper-explanation');
    helperContent.classList.remove('hidden');
    explanationDiv.innerHTML = `
  <div class="loading-spinner small">
      <div class="spinner"></div>
      <p>KI lädt Erklärung...</p>
  </div>
`;
    
    const field = editorFormFields.find(f => f.name === fieldName);
    if (!field) {
        explanationDiv.innerHTML = '<p class="error">Feld-Informationen nicht gefunden.</p>';
        return;
    }

    try {
        const contextWindow = editorFormFields.slice(0, editorFormFields.length).map(f => f.name);
        const response = await fetch(`${API_BASE_URL}/api/applications/${state.applicationId}/field-help`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({
                fieldName: field.name,
                fieldType: field.type,
                fieldContext: contextWindow
            })
        });
        if (!response.ok) throw new Error('Hilfe konnte nicht geladen werden.');
        const helpData = await response.json();
        explanationDiv.innerHTML = `<p><strong>${field.name}:</strong> ${helpData.explanation}</p>`;
        lastExplainedText = `${field.name}: ${helpData.explanation}`;
    } catch (error) {
        explanationDiv.innerHTML = `<p class="error">${error.message}</p>`;
    }
}


/**
 * Stellt eine spezifische Frage an die KI im Editor-Chat.
 */
async function askAiHelperChat() {
    const chatInput = document.getElementById('ai-helper-chat-input');
    const chatContainer = document.getElementById('ai-helper-chat-container');
    const userQuestion = chatInput.value.trim();
    if (!userQuestion) return;
    
    // Logik ist sehr ähnlich zur alten askAiChat-Funktion
    chatInput.value = '';
    chatContainer.innerHTML += `<div class="chat-message user-message"><p>${userQuestion}</p></div>`;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    chatContainer.innerHTML += `
        <div id="chat-loading" class="chat-message ai-message loading">
            <div class="spinner"></div>
            <p>KI schreibt...</p>
        </div>
    `;
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const response = await fetch(`${API_BASE_URL}/api/applications/${state.applicationId}/ask`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
             body: JSON.stringify({
    fieldName: 'Allgemein',
    userQuestion,
    context: lastExplainedText || ""
})
  });
        if (!response.ok) throw new Error('Antwort konnte nicht geladen werden');
        const data = await response.json();
        document.getElementById('chat-loading')?.remove();
        if (data.answer) {
             chatContainer.innerHTML += `<div class="chat-message ai-message"><p>${data.answer}</p></div>`;
        }
    } catch(error) {
        document.getElementById('chat-loading')?.remove();
        chatContainer.innerHTML += `<div class="chat-message ai-message"><p class="error">${error.message}</p></div>`;
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// =======================================================
// NEUER CODEBLOCK D: FINALISIEREN & EVENT-LISTENER
// =======================================================

/**
 * Liest alle Daten aus dem interaktiven Formular, schickt sie zum Finalisieren
 * an das Backend und schließt danach den Editor.
 */
async function saveAndCloseEditor() {
    const editorContent = document.getElementById('pdf-editor-content');
    const formElements = editorContent.querySelectorAll('input, textarea, select');
    const formData = {};

    formElements.forEach(el => {
        if (el.type === 'checkbox') {
            formData[el.name] = el.checked ? '/Yes' : '/Off';
        } else if (el.type === 'radio') {
            if (el.checked) {
                formData[el.name] = el.exportValue;
            }
        } else {
            formData[el.name] = el.value;
        }
    });

    try {
        // Schritt 1: Sende die Daten zum Speichern an das Backend
        const response = await fetch(`${API_BASE_URL}/api/applications/${state.applicationId}/form-data`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ formData })
        });

        if (!response.ok) {
            throw new Error('Fortschritt konnte nicht gespeichert werden.');
        }
        
        // Schritt 2: Schließe das Editor-Fenster
        hideEditorOverlay();
        
        // Schritt 3: Lade die Hauptansicht mit dem PDF-Vorschaufenster neu.
        // Diese Funktion rendert die Ansicht korrekt mit den frisch gespeicherten Daten.
        window.location.href = `antragshelfer.html?id=${state.applicationId}`;

    } catch (error) {
        alert(error.message);
    }
}

// Stelle sicher, dass du auch diese kleine Helfer-Funktion in der Datei hast:
function hideEditorOverlay() {
    const overlay = document.getElementById('pdf-editor-overlay');
    overlay.classList.add('hidden');
}

/**
 * Zeigt das fertig ausgefüllte PDF in der Hauptansicht für die Unterschrift an.
 * @param {string} finalPdfUrl - Die URL zum finalen PDF.
 */
async function displayFinalPdf(downloadUrl) {
    uploadSection.classList.add('hidden');
    mainView.classList.remove('hidden');
    await setupPdfViewer(`${API_BASE_URL}${downloadUrl}`);
    // Ändert den Download-Button, damit er auf die richtige Datei verweist
    const downloadButton = document.getElementById('download-final-pdf-button');
    downloadButton.onclick = () => {
        window.open(`${API_BASE_URL}${downloadUrl}`, '_blank');
    };
    setupMainViewEventListeners();
}

async function finalizeApplicationWithSignatures() {
    if (!state.applicationId) return null;


    try {
        const canvas = document.getElementById('pdf-canvas');
        const finalSignatures = await Promise.all(signatures.map(async (sig) => {
            const page = await loadedPdfDocument.getPage(sig.page);
            const unscaledViewport = page.getViewport({ scale: 1 });
            const scaleFactorX = unscaledViewport.width / canvas.clientWidth;
            const scaleFactorY = unscaledViewport.height / canvas.clientHeight;
            const sigX = sig.x * scaleFactorX;
            const sigY_from_top = sig.y * scaleFactorY;
            const sigWidth = sig.width * scaleFactorX;
            const sigHeight = sig.height * scaleFactorY;
            const sigY_from_bottom = unscaledViewport.height - sigY_from_top - sigHeight;
            return { page: sig.page, x: sigX, y: sigY_from_bottom, width: sigWidth, height: sigHeight };
        }));

        const response = await fetch(`${API_BASE_URL}/api/applications/${state.applicationId}/add-signatures`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ signatures: finalSignatures })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Fehler beim Hinzufügen der Unterschriften.');
        }
        
        const data = await response.json();
        return data.downloadUrl;

    } catch (error) {
        alert(error.message);
        return null;
    }
}

/**
 * Initialisiert alle Event-Listener für die Elemente IM Editor-Overlay.
 */
function setupEditorEventListeners() {
    document.getElementById('close-editor-button').onclick = closePdfEditor;
    document.getElementById('save-and-close-editor-button').onclick = saveAndCloseEditor;
    document.getElementById('ai-helper-chat-send').onclick = askAiHelperChat;
    document.getElementById('ai-helper-chat-input').onkeydown = (e) => {
        if (e.key === 'Enter') askAiHelperChat();
    };
}

const pdfContainer = document.getElementById('editor-pdf-container');
    if (pdfContainer) {
        // Wir lauschen auf das 'focus'-Event in der "Capturing"-Phase.
        // Das bedeutet, der Lauscher reagiert, bevor das eigentliche Feld den Fokus erhält.
        pdfContainer.addEventListener('focus', (e) => {
            // Prüfen, ob das fokussierte Element ein Formularfeld ist
            if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                const fieldName = e.target.name;
                console.log('%c--- ERFOLG: Feld fokussiert! Name:', 'color: green; font-weight: bold;', fieldName);
                if (fieldName) {
                    activateAiHelper(fieldName);
                }
            }
        }, true); // Das 'true' am Ende ist entscheidend, es aktiviert die Capturing-Phase.
    }

    function setupMainViewEventListeners() {
    const openEditorButton = document.getElementById('open-editor-button');
    const signatureButton = document.getElementById('signature-mode-button');
    const downloadButton = document.getElementById('download-final-pdf-button');

    if (openEditorButton) {
        openEditorButton.onclick = () => {
            openPdfEditor(state.applicationId);
        };
    }
    
    if (signatureButton) {
        signatureButton.onclick = placeSignature;
    }

    if (downloadButton) {
        downloadButton.onclick = async () => {
            // Zeigt einen Lade-Zustand an
            downloadButton.textContent = 'PDF wird erstellt...';
            downloadButton.disabled = true;

            const downloadUrl = await finalizeApplicationWithSignatures();
            if (downloadUrl) {
                // Öffnet das fertige, unterschriebene PDF in einem neuen Tab
                window.open(`${API_BASE_URL}${downloadUrl}`, '_blank');
            }
            
            // Setzt den Button-Zustand zurück
            downloadButton.textContent = 'Fertiges PDF herunterladen';
            downloadButton.disabled = false;
        };
    }
}

// ======================================================
// KI-Erklärung für markierten Text im PDF-Editor
// ======================================================
function setupTextSelectionAI() {
    const editorContainer = document.getElementById("editor-pdf-container");
    if (!editorContainer) return;

    editorContainer.addEventListener("mouseup", async () => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length < 10) return; // Zu kurz, vermutlich keine sinnvolle Auswahl

        // Verhindert versehentliches Auslösen
        if (!confirm("Möchten Sie eine KI-Erklärung für den markierten Abschnitt erhalten?")) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/applications/assist-paragraph`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ pastedText: selectedText })
            });

            if (!response.ok) throw new Error("Analyse fehlgeschlagen.");
            const data = await response.json();
            lastExplainedText = selectedText;

            // KI-CoPilot Panel aktualisieren
            const aiContent = document.getElementById("ai-helper-content");
            const aiExplanation = document.getElementById("ai-helper-explanation");
            const aiInstruction = document.getElementById("ai-helper-instruction");

            aiInstruction.classList.add("hidden");
            aiContent.classList.remove("hidden");

            aiExplanation.innerHTML = `
  <div class="loading-spinner small">
      <div class="spinner"></div>
      <p>KI lädt Erklärung...</p>
  </div>
`;


            aiExplanation.innerHTML = `
    <h5>Erklärung des markierten Abschnitts:</h5>
    <p>${data.explanation}</p>
`;
        } catch (err) {
            console.error("Fehler bei der KI-Analyse:", err);
            alert("Die KI-Erklärung konnte nicht geladen werden.");
        }
    });
}


/**
 * Rendert eine einzelne Seite des finalen (nicht-interaktiven) PDFs.
 */
async function renderFinalPage(pageNum) {
    if (!loadedPdfDocument) return;
    currentPageNum = pageNum;

    const page = await loadedPdfDocument.getPage(pageNum);
    const canvas = document.getElementById('pdf-canvas');
    const wrapper = document.getElementById('pdf-page-wrapper');
    const ctx = canvas.getContext('2d');


    const availableWidth = wrapper.clientWidth;
    
    const unscaledViewport = page.getViewport({ scale: 1 });

    const scale = availableWidth / unscaledViewport.width;
    
    const viewport = page.getViewport({ scale });

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: ctx, viewport }).promise;

    redrawSignaturesForCurrentPage();

    document.getElementById('pdf-page-num').textContent = pageNum;
    document.getElementById('pdf-prev-page').disabled = pageNum <= 1;
    document.getElementById('pdf-next-page').disabled = pageNum >= loadedPdfDocument.numPages;
}


    // =======================================================================
    // ANWENDUNG STARTEN
    // =======================================================================
    initialize();
});