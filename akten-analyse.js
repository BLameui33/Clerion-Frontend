document.addEventListener('DOMContentLoaded', () => {

    // =======================================================================
    // NEU: Interaktive Tour für die Dokumenten-Analyse
    // =======================================================================

    const analyseTourSteps = [
    {
        id: 'welcome_analyse',
        attachTo: { element: '.app-header h1', on: 'bottom' },
        title: 'Willkommen bei der Dokumenten-Analyse!',
        text: 'Diese Tour erklärt Ihnen, wie Sie komplexe Dokumente wie Verträge, Bescheide oder Gutachten von unserer KI analysieren lassen können.'
    },
    {
        id: 'b2b_client_select_analyse',
        attachTo: { element: '#b2b-dashboard', on: 'right' },
        title: 'Wichtig für B2B-Nutzer',
        text: 'Bevor Sie ein Dokument hochladen, wählen Sie hier den passenden Klienten aus. So wird die Analyse direkt der richtigen Akte zugeordnet.'
    },
    {
        id: 'upload',
        attachTo: { element: '#upload-section', on: 'bottom' },
        title: '1. Dokument hochladen',
        text: 'Ziehen Sie Ihre PDF-Datei (bis zu 100 Seiten) in dieses Feld oder klicken Sie darauf, um sie auszuwählen.'
    },
    {
        id: 'payment',
        attachTo: { element: '#upload-section', on: 'bottom' },
        title: '2. Analyse-Paket auswählen',
        text: 'Nach dem Upload erscheint an dieser Stelle eine Preisübersicht. Der Preis richtet sich nach der Seitenzahl des Dokuments. Die Analyse startet erst nach dem Kauf.'
    },
    {
        id: 'history_analyse',
        attachTo: { element: '#file-history-container', on: 'right' },
        title: '3. Analyse im Verlauf finden',
        text: 'Jede abgeschlossene Analyse wird hier im Dokumenten-Verlauf gespeichert. Klicken Sie auf einen Eintrag, um das Ergebnis erneut anzusehen.'
    },
    {
        id: 'result_details',
        attachTo: { element: '.app-main-content', on: 'left' },
        title: '4. Ergebnis & weitere Aktionen',
        text: 'Nachdem Sie einen Fall aus dem Verlauf ausgewählt haben, erscheint in diesem Hauptbereich die detaillierte KI-Analyse. Aber das ist noch nicht alles...'
    },
    {
        id: 'chat_analyse',
        attachTo: { element: '.app-main-content', on: 'left' },
        title: '5. Rückfragen stellen (Chat)',
        text: 'Innerhalb der Ergebnisansicht finden Sie auch ein Chat-Fenster. Nutzen Sie dieses, um gezielte Rückfragen zum analysierten Dokument zu stellen, z.B. nach Kündigungsfristen oder unklaren Formulierungen.'
    },
    {
        id: 'finish_analyse',
        title: 'Tour beendet!',
        text: 'Sie wissen nun, wie Sie Dokumente tiefgehend analysieren und die Ergebnisse weiter nutzen können. Viel Erfolg!',
        buttons: [{ text: 'Verstanden', action: function() { return this.complete(); } }]
    }
];

    function startAnalyseTour() {
        // Die Tour startet nur, wenn noch kein Fall im Verlauf ausgewählt wurde (also im Startzustand)
        if (localStorage.getItem('clerion_analyse_tour_completed') || document.querySelector('#file-history-list li.selected')) {
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

        // Filtert B2B-Schritte für B2C-Nutzer heraus
        analyseTourSteps.forEach(step => {
            if (step.id === 'b2b_client_select_analyse' && currentUser.type !== 'b2b') {
                return; // Überspringe diesen Schritt für B2C-Nutzer
            }
            tour.addStep(step);
        });

        tour.on('complete', () => localStorage.setItem('clerion_analyse_tour_completed', 'true'));
        tour.on('cancel', () => localStorage.setItem('clerion_analyse_tour_completed', 'true'));

        tour.start();
    }

    // =======================================================================
    // NEU: Interaktive Tour für die Dokumenten-Analyse ENDE
    // =======================================================================


    const API_BASE_URL = 'https://api.clerion.de';
    let authToken = localStorage.getItem('behoerdenhilfe_token');
    let currentUser = null;
    let selectedClientId = null;
    let clients = [];
    let uploadedFile = null;
    let currentCaseId = null; 
    let activeClientId = null;

    // === DOM-ELEMENTE ===
    const logoutButton = document.getElementById('logout-button');
    const b2bDashboard = document.getElementById('b2b-dashboard');
    const addClientForm = document.getElementById('add-client-form');
    const clientNameInput = document.getElementById('client-name-input');
    const clientList = document.getElementById('client-list');
    const fileHistoryList = document.getElementById('file-history-list');
    const showAllFileCasesButton = document.getElementById('show-all-file-cases-button');
    const pdfDropzone = document.getElementById('pdf-dropzone');
    const pdfFileInput = document.getElementById('pdf-file-input');
    const fileInfo = document.getElementById('file-info');
    const paymentSection = document.getElementById('payment-section');
    const pricingOptions = document.getElementById('pricing-options');
    const resultSection = document.getElementById('result-section');
    const analysisResultContent = document.getElementById('analysis-result-content');
    const backToNewAnalysisButton = document.getElementById('back-to-new-analysis-button');
    const sendChatButton = document.getElementById('send-chat-button');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');
    const chatLoadingSpinner = document.getElementById('chat-loading-spinner');
    const clientDetailModalOverlay = document.getElementById('client-detail-modal-overlay');
    const closeClientDetailModalButton = document.getElementById('close-client-detail-modal-button');
    const saveClientDetailsButton = document.getElementById('save-client-details-button');
    const deadlineList = document.getElementById('deadline-list');
    const addDeadlineForm = document.getElementById('add-deadline-form');
    const deadlineClientSelectorGroup = document.getElementById('deadline-client-selector-group');
    const deadlineClientSelector = document.getElementById('deadline-client-selector');
    const deadlineReminderModalOverlay = document.getElementById('deadline-reminder-modal-overlay');
    const closeDeadlineReminderModalButton = document.getElementById('close-deadline-reminder-modal-button');
    const caseNotesTextarea = document.getElementById('case-notes-textarea');
    const saveNotesButton = document.getElementById('save-notes-button');

    // =======================================================================
    // FUNKTIONEN
    // =======================================================================

    function checkAndShowTodaysDeadlines(deadlines) {
        const today = new Date().toISOString().split('T')[0];
        const todaysDeadlines = deadlines.filter(d => d.deadlineDate === today);

        if (todaysDeadlines.length > 0) {
            const listElement = document.getElementById('todays-deadlines-list');
            let html = '<ul class="deadline-reminder-list">';
            todaysDeadlines.forEach(deadline => {
                html += `<li><strong>${deadline.title}</strong> ${deadline.clientName ? ` (Klient: ${deadline.clientName})` : ''}</li>`;
            });
            html += '</ul>';
            listElement.innerHTML = html;
            deadlineReminderModalOverlay.classList.remove('hidden');
        }
    }


    async function fetchAndRenderDeadlines() {
        if (!deadlineList) return;
        deadlineList.innerHTML = '<li>Lade Termine...</li>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/deadlines`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Termine konnten nicht geladen werden.');
            const deadlines = await response.json();

            // Der Code zum Befüllen der Seitenleisten-Liste (bleibt gleich)
            deadlineList.innerHTML = '';
            if (deadlines.length === 0) {
                deadlineList.innerHTML = '<li>Keine anstehenden Termine.</li>';
            } else {
                deadlines.forEach(deadline => {
                    const li = document.createElement('li');
                    li.className = 'deadline-item';
                    li.innerHTML = `
                        <input type="checkbox" class="deadline-checkbox" data-deadline-id="${deadline.id}">
                        <div class="deadline-details">
                            <strong>${deadline.title}</strong>
                            <small>${new Date(deadline.deadlineDate).toLocaleDateString('de-DE')} ${deadline.clientName ? `(${deadline.clientName})` : ''}</small>
                        </div>
                    `;
                    deadlineList.appendChild(li);
                });
            }
            checkAndShowTodaysDeadlines(deadlines);

        } catch (error) {
            deadlineList.innerHTML = `<li>Fehler: ${error.message}</li>`;
        }
    }


    function populateDeadlineClientSelector() {
        if (!deadlineClientSelector || !deadlineClientSelectorGroup) return;
        // Zeige das Dropdown nur für B2B-Nutzer
        if (currentUser && currentUser.type === 'b2b') {
            deadlineClientSelector.innerHTML = '<option value="">-- Klient zuordnen (optional) --</option>';
            // Nutzt die `clients`-Variable, die bereits geladen wurde
            clients.forEach(client => {
                deadlineClientSelector.innerHTML += `<option value="${client.id}">${client.name}</option>`;
            });
            deadlineClientSelectorGroup.style.display = 'block';
        } else {
            deadlineClientSelectorGroup.style.display = 'none';
        }
    }


    function openClientDetails(client) {
        activeClientId = client.id;
        document.getElementById('client-modal-title').textContent = `Details für: ${client.name}`;
        document.getElementById('client-name-edit').value = client.name;
        document.getElementById('client-address-edit').value = client.address || '';
        document.getElementById('client-status-edit').value = client.statusInfo || '';
        document.getElementById('client-notes-edit').value = client.notes || '';
        clientDetailModalOverlay.classList.remove('hidden');
    }

    function closeClientDetails() {
        clientDetailModalOverlay.classList.add('hidden');
        activeClientId = null;
    }


    async function checkForPersistedLogin() {
        if (authToken) {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/me`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (!response.ok) throw new Error("Ungültige Sitzung.");
                currentUser = await response.json();
            } catch (error) {
                localStorage.removeItem('behoerdenhilfe_token');
                authToken = null;
                currentUser = null;
                window.location.href = 'dashboard.html';
            }
        } else {
            window.location.href = 'dashboard.html';
        }
    }

    function updateUI() {
        if (!currentUser) return;
        if (currentUser.type === 'b2c') {
            b2bDashboard.classList.add('hidden');
        } else {
            b2bDashboard.classList.remove('hidden');
            fetchClients();
            populateDeadlineClientSelector();
        }
    }

    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        container.appendChild(notification);
        setTimeout(() => { notification.remove(); }, 5000);
    }

    async function fetchClients() {
        if (!clientList) return;
        clientList.innerHTML = '<li>Lade Klienten...</li>';
        try {
            const response = await fetch(`${API_BASE_URL}/api/clients?type=file`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('Klienten konnten nicht geladen werden.');
            clients = await response.json();
            renderClients();
            populateDeadlineClientSelector();
        } catch (error) {
            clientList.innerHTML = `<li>Fehler: ${error.message}</li>`;
        }
    }

    function renderClients() {
        if (!clientList) return;
        clientList.innerHTML = '';
        clients.forEach(client => {
            const li = document.createElement('li');
            li.dataset.clientId = client.id;

            const mainContent = document.createElement('div');
            mainContent.style.display = 'flex';
            mainContent.style.alignItems = 'center';
            mainContent.style.gap = '0.5rem';
            mainContent.style.flexGrow = '1';
            mainContent.style.cursor = 'pointer';

            const textNode = document.createElement('span');
            textNode.textContent = client.name;
            
            const editButton = document.createElement('button');
            editButton.innerHTML = '&#9998;'; // Stift-Symbol
            editButton.className = 'edit-client-button';
            editButton.title = 'Klientendaten bearbeiten';

            mainContent.appendChild(textNode);
            mainContent.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '×';
            deleteButton.className = 'delete-button';
            
            let confirmText = '';
            if (currentUser.role === 'owner') {
                deleteButton.title = 'Diesen Klienten und alle seine Fälle für die gesamte Organisation endgültig löschen';
                confirmText = `ACHTUNG: Sind Sie sicher, dass Sie den Klienten "${client.name}" endgültig löschen möchten? Dadurch werden ALLE seine Fälle gelöscht, auch die, die anderen Mitarbeitern zugewiesen sind.`;
            } else {
                deleteButton.title = 'Diesen Klienten aus Ihrer persönlichen Ansicht entfernen';
                confirmText = `Sind Sie sicher, dass Sie den Klienten "${client.name}" aus Ihrer Ansicht entfernen möchten? Ihre zugewiesenen Fälle für diesen Klienten werden als "nicht zugewiesen" markiert und sind für den Admin weiterhin sichtbar. Der Klient selbst wird nicht gelöscht.`;
            }

            li.appendChild(mainContent);
            li.appendChild(deleteButton);

            mainContent.addEventListener('click', (e) => {
                if(e.target === editButton || editButton.contains(e.target)) return;
                selectedClientId = client.id;
                document.querySelectorAll('#client-list li').forEach(item => item.classList.remove('selected'));
                li.classList.add('selected');
                fetchFileHistory(client.id); // Filtert jetzt auch den Verlauf
            });

            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                openClientDetails(client);
            });

            deleteButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Sind Sie sicher, dass Sie den Klienten "${client.name}" löschen möchten?`)) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/clients/${client.id}`, { 
                            method: 'DELETE', 
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.message);
                        showNotification(data.message, 'success');
                        selectedClientId = null;
                        fetchClients();
                        fetchFileHistory();
                    } catch (error) {
                        showNotification(error.message, 'error');
                    }
                }
            });
            clientList.appendChild(li);
        });
    }


    function dataURLtoFile(dataurl, filename) {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        return new File([u8arr], filename, { type: mime });
    }

    function displayPricing(pageCount) {
    let priceId, priceText;

   
    if (pageCount <= 10) {
        priceId = 'price_1SRdPc2KOTi9fZsRNMOJOrZC'; 
        priceText = '3,99 €';
    } 
    
    
    else if (pageCount <= 25) {
        priceId = 'price_1SQtIF2KOTi9fZsRkjx22LfI'; 
        priceText = '7,99 €';
    } else if (pageCount <= 50) {
        priceId = 'price_1SQtIg2KOTi9fZsRrFSUmnRW'; 
        priceText = '13,99 €';
    } else if (pageCount <= 100) {
        priceId = 'price_1SQtJD2KOTi9fZsRVQ79PW5e'; 
        priceText = '24,99 €';
    } else {
        pricingOptions.innerHTML = `<p class="error-message">Ihr Dokument ist mit ${pageCount} Seiten zu groß (max. 100 Seiten).</p>`;
        paymentSection.classList.remove('hidden');
        return;
    }

    const pricingHTML = `
        <div class="pricing-summary">
            <p class="page-count-info">Ihr Dokument hat <strong>${pageCount} Seiten</strong>.</p>
            <p class="price-info">Der Preis für die Analyse beträgt:</p>
            <div class="price-tag">${priceText}</div>
            <button id="checkout-button" class="btn btn-primary btn-header" data-price-id="${priceId}">Jetzt sicher bezahlen & analysieren</button>
        </div>
    `;
    pricingOptions.innerHTML = pricingHTML;

    paymentSection.classList.remove('hidden');
    document.getElementById('checkout-button').addEventListener('click', startCheckout);
}

    
    async function startCheckout(e) {
        if (!window.uploadedFile) return showNotification('Fehler: Datei nicht gefunden. Bitte erneut hochladen.', 'error');
        const reader = new FileReader();
        reader.readAsDataURL(window.uploadedFile);
        reader.onloadend = async () => {
            sessionStorage.setItem('pendingAnalysisFile', JSON.stringify({
                dataUrl: reader.result,
                name: window.uploadedFile.name,
                clientId: selectedClientId
            }));
            const finalPriceId = e.target.dataset.priceId;
            try {
                const response = await fetch(`${API_BASE_URL}/api/stripe/create-onetime-checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ priceId: finalPriceId })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                window.location.href = data.url;
            } catch (error) { showNotification(error.message, 'error'); }
        };
    }

    function displayAnalysisResult(analysisData, caseDetails) {
        let resultHTML = `
        <div class="analysis-summary card">
            <h4>Zusammenfassung</h4>
            <p>${analysisData.zusammenfassung || 'Keine Zusammenfassung verfügbar.'}</p>
        </div>
    `;
        resultHTML += `<h4>Kernthema: ${analysisData.kernthema || 'N/A'}</h4>`;
        if (analysisData.beteiligte_parteien && analysisData.beteiligte_parteien.length > 0) {
            resultHTML += `<h4>Beteiligte Parteien</h4><ul>${analysisData.beteiligte_parteien.map(p => `<li><strong>${p.name}</strong> (${p.rolle || 'Unbekannt'})</li>`).join('')}</ul>`;
        }
        if (analysisData.wichtige_klauseln && analysisData.wichtige_klauseln.length > 0) {
            resultHTML += `<h4>Wichtige Klauseln</h4><ul>${analysisData.wichtige_klauseln.map(k => `<li><strong>${k.klausel}:</strong> ${k.erklaerung}</li>`).join('')}</ul>`;
        }
        if (analysisData.risiken_und_chancen && analysisData.risiken_und_chancen.length > 0) {
            resultHTML += `<h4>Bewertung: Risiken & Chancen</h4><ul>`;
            analysisData.risiken_und_chancen.forEach(item => {
                const icon = item.typ === 'Risiko' ? '⚠️' : '✅';
                resultHTML += `<li><strong>${icon} ${item.typ}:</strong> ${item.beschreibung}</li>`;
            });
            resultHTML += `</ul>`;
        }
        if (analysisData.chronologie && analysisData.chronologie.length > 0) {
            resultHTML += `<h4>Wichtige Termine</h4><ul>${analysisData.chronologie.map(c => `<li><strong>${c.datum}:</strong> ${c.ereignis}</li>`).join('')}</ul>`;
        }

        resultHTML += `
        <div class="disclaimer-box">
            <p><strong>Wichtiger Hinweis:</strong> Die von der KI generierte Analyse dient nur zu Informationszwecken und stellt keine Rechtsberatung dar. Sie ersetzt keine Prüfung durch einen qualifizierten Fachexperten.</p>
        </div>
    `;
    
        analysisResultContent.innerHTML = resultHTML;
        if (caseDetails && caseNotesTextarea && saveNotesButton) {
        caseNotesTextarea.value = caseDetails.notes || '';
        saveNotesButton.dataset.caseId = caseDetails.id;
    }
        resultSection.classList.remove('hidden');
        paymentSection.classList.add('hidden');
        document.getElementById('upload-section').classList.add('hidden');
    }
    
    // =======================================================================
    // HIER IST DIE FEHLENDE FUNKTION
    // =======================================================================
 

   
    async function runDeepAnalysis(file, clientId) {
    const formData = new FormData();
    formData.append('document', file);
    if (clientId) formData.append('clientId', clientId);

    try {
        selectedClientId = clientId;

        // 1. Analyse an Backend senden.
        // Dieser Call wartet, bis die KI-Analyse & Speicherung im Backend fertig ist.
        const response = await fetch(`${API_BASE_URL}/api/cases/analyze-large-document`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        const data = await response.json(); // Enthält { analysis, caseId }
        if (!response.ok) throw new Error(data.message);

        currentCaseId = data.caseId;

        // 2. Fall ist garantiert gespeichert.
        // Wir holen jetzt EINMAL die vollen Details (inkl. Notizen etc.),
        // statt 10 Sekunden lang zu pollen.
        const caseDetailsResponse = await fetch(`${API_BASE_URL}/api/cases/${data.caseId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        let fullCase;
        let parsedAnalysis = data.analysis; // Fallback

        if (caseDetailsResponse.ok) {
            fullCase = await caseDetailsResponse.json();
            // Nimm die (potenziell) frischere aiExplanation aus dem vollen Fall-Objekt
            parsedAnalysis =
                typeof fullCase.aiExplanation === 'string'
                    ? JSON.parse(fullCase.aiExplanation)
                    : fullCase.aiExplanation;
        } else {
            // Notfall-Fallback: Wenn das Holen der Details fehlschlägt,
            // zeigen wir zumindest das Analyse-Ergebnis an.
            console.warn("Konnte volle Falldetails nicht nachladen, zeige pures Analyse-Ergebnis.");
            fullCase = { id: data.caseId, notes: '' }; // Simuliere ein Objekt für die Notizen
            parsedAnalysis = data.analysis;
        }

        // 3. Zeige das finale Ergebnis an
        displayAnalysisResult(parsedAnalysis, fullCase);

        // 4. Aktualisiere den Verlauf
        // (Wir warten kurz, damit der Nutzer das Ergebnis sieht, bevor die Liste neu lädt)
        await new Promise(resolve => setTimeout(resolve, 1500));

        await fetchFileHistory(selectedClientId);

        // Stelle sicher, dass der neue Fall in der Liste markiert ist
        document.querySelectorAll('#file-history-list li').forEach(item => {
             item.classList.toggle('selected', item.dataset.caseId == currentCaseId);
        });
        // Und auch der Klient (falls einer ausgewählt war)
        document.querySelectorAll('#client-list li').forEach(item => {
            item.classList.toggle('selected', item.dataset.clientId == selectedClientId);
        });

    } catch (error) {
        console.error("Fehler bei der Aktenanalyse:", error);
        analysisResultContent.innerHTML = `<p style="color: var(--danger-color);">${error.message}</p>`;
        // Wichtig: Fehler weiterwerfen, damit initializeApp den Ladebalken ausblendet
        throw error;
    }
}

    
    async function fetchFileHistory(clientId = null, caseIdToLoad = null) {
        if (!fileHistoryList) return;
        fileHistoryList.innerHTML = '<li>Lade Akten-Verlauf...</li>';
        let url;
        if (clientId) {
            url = `${API_BASE_URL}/api/clients/${clientId}/cases?type=file`;
        } else {
            url = `${API_BASE_URL}/api/cases/file-cases`;
        }

        try {
            // Schritt 1: Lade die Übersichtsliste für die Seitenleiste
            const response = await fetch(url, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('Verlauf konnte nicht geladen werden.');
            const cases = await response.json();
            renderFileHistory(cases);

            // Schritt 2: WENN eine ID aus der URL kommt, hole die VOLLSTÄNDIGEN Details
            if (caseIdToLoad) {
                try {
                    const caseDetailsResponse = await fetch(`${API_BASE_URL}/api/cases/${caseIdToLoad}`, {
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (!caseDetailsResponse.ok) throw new Error('Falldetails konnten nicht geladen werden.');
                    
                    const fullCaseDetails = await caseDetailsResponse.json();

                    let analysisData;
                    // Prüfen, ob die Daten ein Text oder schon ein Objekt sind
                    if (typeof fullCaseDetails.aiExplanation === 'string') {
                        analysisData = JSON.parse(fullCaseDetails.aiExplanation);
                    } else {
                        analysisData = fullCaseDetails.aiExplanation;
                    }

                    // Schritt 3: Zeige nun die vollständigen Daten an
                    document.querySelector(`li[data-case-id='${caseIdToLoad}']`)?.classList.add('selected');
                    currentCaseId = fullCaseDetails.id;
                    displayAnalysisResult(analysisData, fullCaseDetails);
                    
                    // Diese Funktion erhält jetzt garantiert das Objekt mit den Notizen
                    displayAnalysisResult(analysisData, fullCaseDetails);

                } catch (detailsError) {
                    showNotification(detailsError.message, 'error');
                }
            }
        } catch (listError) {
            fileHistoryList.innerHTML = `<li>Fehler: ${listError.message}</li>`;
        }
    }

    function renderFileHistory(cases) {
    if (!fileHistoryList) return;
    fileHistoryList.innerHTML = '';
    if (cases.length === 0) {
        fileHistoryList.innerHTML = '<li>Keine Einträge vorhanden.</li>';
        return;
    }
    cases.forEach(caseItem => {
        const li = document.createElement('li');
        li.dataset.caseId = caseItem.id;

        // NEU: Priorisiert den benutzerdefinierten Titel
        const clientNameInfo = caseItem.clientName ? ` (${caseItem.clientName})` : ' (Ohne Klient)';
        const titleText = caseItem.customTitle || `Dokument vom ${new Date(caseItem.createdAt).toLocaleDateString('de-DE')}${clientNameInfo}`;
        const displayTitle = titleText.length > 40 ? titleText.substring(0, 40) + '...' : titleText;

        // NEU: HTML-Struktur mit Edit-Button
        li.innerHTML = `
            <div class="case-title-wrapper">
                <span class="case-title">${displayTitle}</span>
                <span class="case-date">${new Date(caseItem.createdAt).toLocaleDateString('de-DE')}</span>
            </div>
            <div class="case-actions">
                <button class="edit-title-button" title="Titel bearbeiten">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button class="delete-button" title="Fall löschen/entfernen">&times;</button>
            </div>
        `;


        
        // Klick-Listener für die ganze Zeile
        li.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;

            sessionStorage.setItem('activeAktenAnalyseCase', JSON.stringify(caseItem));

            document.querySelectorAll('#file-history-list li').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            try {
    
                let analysisData;
                // Prüfen, ob die Daten ein Text oder schon ein Objekt sind
                if (typeof caseItem.aiExplanation === 'string') {
                    analysisData = JSON.parse(caseItem.aiExplanation);
                } else {
                    analysisData = caseItem.aiExplanation;
                }
                
                
                currentCaseId = caseItem.id;
                displayAnalysisResult(analysisData, caseItem);
            } catch (err) {
                showNotification('Fehler: Die Analyse-Daten für diesen Fall sind beschädigt.', 'error');
            }
        });

        // NEU: Klick-Listener für den Bearbeiten-Button
        const editButton = li.querySelector('.edit-title-button');
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const newTitle = prompt('Geben Sie den neuen Titel für das Dokument ein:', titleText);
            if (newTitle && newTitle.trim() !== '') {
                renameCase(caseItem.id, newTitle.trim(), li.querySelector('.case-title'));
            }
        });

        // Dein bestehender Klick-Listener für den Löschen-Button
        const deleteButton = li.querySelector('.delete-button');
        deleteButton.addEventListener('click', async (e) => {
             e.stopPropagation();
            if (confirm('Sind Sie sicher, dass Sie diesen Fall unwiderruflich löschen möchten?')) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/cases/${caseItem.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (!response.ok) throw new Error((await response.json()).message);
                    showNotification('Fall erfolgreich gelöscht.', 'success');
                    resetAnalysisView();
                    fetchFileHistory(selectedClientId);
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            }
        });

        fileHistoryList.appendChild(li);
    });
}
    
    function resetAnalysisView() {
        document.getElementById('upload-section').classList.remove('hidden');
        paymentSection.classList.add('hidden');
        resultSection.classList.add('hidden');
        fileInfo.textContent = '';
        pdfFileInput.value = '';
        window.uploadedFile = null;
        currentCaseId = null;
        document.querySelectorAll('#file-history-list li.selected').forEach(item => item.classList.remove('selected'));
    }

    async function renameCase(caseId, newTitle, titleElement) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/rename`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ newTitle })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message);
        }

        // Aktualisiere den Titel direkt im UI für sofortiges Feedback
        titleElement.textContent = newTitle.length > 40 ? newTitle.substring(0, 40) + '...' : newTitle;
        showNotification('Erfolgreich umbenannt!', 'success');

    } catch (error) {
        showNotification(`Fehler: ${error.message}`, 'error');
    }
}

    // =======================================================================
    // EVENT-LISTENERS
    // =======================================================================

    if (saveNotesButton) {
        saveNotesButton.addEventListener('click', async () => {
            const caseId = saveNotesButton.dataset.caseId;
            const notes = caseNotesTextarea.value;
            if (!caseId) return showNotification('Fehler: Kein aktiver Fall ausgewählt.', 'error');

            try {
                const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/notes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ notes: notes })
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.message);
                showNotification(result.message, 'success');
            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            }
        });
    }

    if(closeDeadlineReminderModalButton) {
        closeDeadlineReminderModalButton.addEventListener('click', () => {
            deadlineReminderModalOverlay.classList.add('hidden');
        });
    }
    if(deadlineReminderModalOverlay) {
        deadlineReminderModalOverlay.addEventListener('click', (e) => {
            if (e.target === deadlineReminderModalOverlay) {
                deadlineReminderModalOverlay.classList.add('hidden');
            }
        });
    }

    

    if (addDeadlineForm) {
        addDeadlineForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const title = document.getElementById('deadline-title-input').value;
            const deadlineDate = document.getElementById('deadline-date-input').value;
            const clientId = deadlineClientSelector.value;

            try {
                const response = await fetch(`${API_BASE_URL}/api/deadlines`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ title, deadlineDate, clientId })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                
                showNotification('Termin hinzugefügt!', 'success');
                addDeadlineForm.reset();
                fetchAndRenderDeadlines();
            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            }
        });
    }

    if (deadlineList) {
        deadlineList.addEventListener('change', async (e) => {
            if (e.target.classList.contains('deadline-checkbox')) {
                const deadlineId = e.target.dataset.deadlineId;
                const isDone = e.target.checked ? 1 : 0;
                
                try {
                     const response = await fetch(`${API_BASE_URL}/api/deadlines/${deadlineId}/toggle`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                        body: JSON.stringify({ isDone })
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    
                    showNotification(data.message, 'success');
                    fetchAndRenderDeadlines(); // Liste aktualisieren
                } catch (error) {
                    showNotification(`Fehler: ${error.message}`, 'error');
                }
            }
        });
    }
    

    if(saveClientDetailsButton) {
        saveClientDetailsButton.addEventListener('click', async () => {
            if (!activeClientId) return;
            
            const updatedClient = {
                name: document.getElementById('client-name-edit').value,
                address: document.getElementById('client-address-edit').value,
                statusInfo: document.getElementById('client-status-edit').value,
                notes: document.getElementById('client-notes-edit').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/api/clients/${activeClientId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify(updatedClient)
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                
                showNotification('Klientendaten gespeichert!', 'success');
                closeClientDetails();
                fetchClients(); // Lädt die Klientenliste neu, um die Änderungen anzuzeigen
            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            }
        });
    }
    
    if(closeClientDetailModalButton) closeClientDetailModalButton.addEventListener('click', closeClientDetails);
    
    if(clientDetailModalOverlay) clientDetailModalOverlay.addEventListener('click', (e) => {
        if (e.target === clientDetailModalOverlay) {
            closeClientDetails();
        }
    });


    if (backToNewAnalysisButton) backToNewAnalysisButton.addEventListener('click', resetAnalysisView);

    if (showAllFileCasesButton) {
        showAllFileCasesButton.addEventListener('click', () => {
            selectedClientId = null;
            document.querySelectorAll('#client-list li.selected').forEach(item => item.classList.remove('selected'));
            fetchFileHistory();
        });
    }

    if (addClientForm) {
        addClientForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = clientNameInput.value.trim();
            if (!name) return;
            try {
                const response = await fetch(`${API_BASE_URL}/api/clients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ name, type: 'file' })
                });
                if (response.ok) {
                    clientNameInput.value = '';
                    fetchClients();
                } else { showNotification('Klient konnte nicht erstellt werden.', 'error'); }
            } catch (error) { showNotification('Klient konnte nicht erstellt werden.', 'error'); }
        });
    }

    if (pdfDropzone) {
        pdfDropzone.addEventListener('click', () => pdfFileInput.click());
        pdfDropzone.addEventListener('dragover', e => e.preventDefault());
        pdfDropzone.addEventListener('drop', e => {
            e.preventDefault();
            if (e.dataTransfer.files.length > 0) {
                pdfFileInput.files = e.dataTransfer.files;
                pdfFileInput.dispatchEvent(new Event('change'));
            }
        });
    }

    if (pdfFileInput) {
        pdfFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file || file.type !== 'application/pdf') return;
            window.uploadedFile = file;
            fileInfo.textContent = `Ausgewählt: ${file.name}`;
            paymentSection.classList.add('hidden');
            resultSection.classList.add('hidden');
            const formData = new FormData();
            formData.append('document', file);
            try {
                const response = await fetch(`${API_BASE_URL}/api/cases/get-pdf-page-count`, {
                    method: 'POST', headers: { 'Authorization': `Bearer ${authToken}` }, body: formData
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                displayPricing(data.pageCount);
            } catch (error) { showNotification(error.message, 'error'); }
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('behoerdenhilfe_token');
            window.location.href = 'index.html';
        });
    }

    if (sendChatButton) {
        sendChatButton.addEventListener('click', async () => {
            const question = chatInput.value.trim();
            if (!question) return;
            if (!currentCaseId) {
                showNotification('Fehler: Kein aktiver Fall für Rückfragen gefunden.', 'error');
                return;
            }
            chatInput.value = '';
            chatLoadingSpinner.classList.remove('hidden');
            sendChatButton.disabled = true;
            try {
                const response = await fetch(`${API_BASE_URL}/api/cases/${currentCaseId}/ask`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ question })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                const messagePair = document.createElement('div');
                messagePair.style.borderBottom = '1px solid #eee';
                messagePair.style.marginBottom = '1rem';
                messagePair.style.paddingBottom = '1rem';
                messagePair.innerHTML = `
                    <p style="margin: 0 0 0.5rem 0;"><strong>Ihre Frage:</strong> ${question}</p>
                    <p style="margin: 0; background-color: #e9f5ff; padding: 0.5rem; border-radius: 4px;"><strong>Antwort:</strong> ${data.answer}</p>
                `;
                chatHistory.appendChild(messagePair);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                chatLoadingSpinner.classList.add('hidden');
                sendChatButton.disabled = false;
            }
        });
    }

    // =======================================================================
    // INITIALER AUFRUF
    // =======================================================================
     async function initializeApp() {
        await checkForPersistedLogin();
        if (!currentUser) return;

        // Referenzen zu den Haupt-Containern holen
        const uploadSection = document.getElementById('upload-section');
        const analysisLoadingSection = document.getElementById('analysis-loading-section');
        const urlParams = new URLSearchParams(window.location.search);
        const caseIdFromUrl = urlParams.get('case_id');

        updateUI();
        fetchAndRenderDeadlines();
        fetchFileHistory(null, caseIdFromUrl);
        
        if (urlParams.get('payment') === 'success') {
            // 1. Ladebildschirm anzeigen und Upload-Maske verstecken
            uploadSection.classList.add('hidden');
            analysisLoadingSection.classList.remove('hidden');
            
            showNotification('Bezahlung erfolgreich! Analyse wird jetzt gestartet.', 'success');
            
            const storedFileJSON = sessionStorage.getItem('pendingAnalysisFile');
            if (storedFileJSON) {
                const storedFile = JSON.parse(storedFileJSON);
                const restoredFile = dataURLtoFile(storedFile.dataUrl, storedFile.name);
                
                // 2. WARTEN, bis die Analyse fertig ist
                await runDeepAnalysis(restoredFile, storedFile.clientId);
                selectedClientId = storedFile.clientId;
document.querySelectorAll('#client-list li').forEach(item => {
    item.classList.toggle('selected', item.dataset.clientId == selectedClientId);
});
                
                // 3. Ladebildschirm ausblenden (das Ergebnis wird von runDeepAnalysis selbst angezeigt)
                analysisLoadingSection.classList.add('hidden');

                sessionStorage.removeItem('pendingAnalysisFile');
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                showNotification('Fehler: Die zu analysierende Datei wurde nicht gefunden. Bitte laden Sie sie erneut hoch.', 'error');
                analysisLoadingSection.classList.add('hidden');
                uploadSection.classList.remove('hidden');
            }
        }
        setTimeout(startAnalyseTour, 500);
    }
    
    initializeApp();
});