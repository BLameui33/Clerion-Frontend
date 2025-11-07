// admin.js (NEUE DATEI FÜR DAS ADMIN-DASHBOARD)

document.addEventListener('DOMContentLoaded', () => {

        // =======================================================================
    // NEU: Interaktive Tour für das Admin-Dashboard
    // =======================================================================

    const adminTourSteps = [
        {
            id: 'welcome_admin',
            attachTo: { element: '#welcome-message', on: 'bottom' },
            title: 'Willkommen im Admin-Dashboard!',
            text: 'Diese Tour führt Sie durch die wichtigsten Verwaltungsfunktionen, um Ihr Team und Ihr Konto optimal einzurichten.'
        },
        {
            id: 'branding',
            attachTo: { element: '#branding-dashboard', on: 'right' },
            title: '1. Branding & Vorlagen',
            text: 'Hier hinterlegen Sie Ihr Firmenlogo und einen Standard-Fußzeilentext. Diese Elemente erscheinen automatisch auf allen PDF-Dokumenten, die Sie für Klienten erstellen, und sorgen für ein professionelles Erscheinungsbild.'
        },
        {
            id: 'team',
            attachTo: { element: '#team-dashboard', on: 'right' },
            title: '2. Team-Verwaltung',
            text: 'Laden Sie neue Mitarbeiter per E-Mail in Ihre Organisation ein. In der Mitgliederliste sehen Sie, wer bereits beigetreten ist und können Mitglieder auch wieder entfernen.'
        },
        {
            id: 'subscription',
            attachTo: { element: '#subscription-dashboard', on: 'right' },
            title: '3. Abos & Lizenzen',
            text: 'Hier verwalten Sie Ihr Abonnement. Sie können die Anzahl der Mitarbeiterlizenzen (Sitze) anpassen oder Ihr Abo bei Stripe verwalten.'
        },
        {
            id: 'case_overview',
            attachTo: { element: '.app-main-content .card', on: 'bottom' },
            title: '4. Fall-Übersicht',
            text: 'Dies ist die zentrale Übersicht aller Fälle in Ihrer Organisation. Standardmäßig sehen Sie die Fälle aller Mitarbeiter. Nutzen Sie die Filter, um die Ansicht anzupassen.'
        },
        {
            id: 'member_filter',
            attachTo: { element: '#member-list', on: 'right' },
            title: '5. Filtern nach Mitarbeiter',
            text: 'Klicken Sie auf einen Mitarbeiter in der Liste, um in der Fall-Übersicht nur die Fälle anzuzeigen, die dieser Person zugewiesen sind. So behalten Sie gezielt den Überblick.'
        },
        {
            id: 'assign_case',
            attachTo: { element: '#all-cases-container', on: 'left' },
            title: '6. Fälle zuweisen & einsehen',
            text: 'In jeder Fall-Kachel finden Sie ein Dropdown-Menü, um den Fall einem Mitarbeiter zuzuweisen. Mit einem Klick auf "Details anzeigen" können Sie die vollständige KI-Analyse einsehen und interne Notizen für Ihr Team hinterlegen.'
        },
        {
            id: 'back_to_work',
            attachTo: { element: 'a[href="dashboard.html"]', on: 'bottom' },
            title: 'Zurück zur Fallbearbeitung',
            text: 'Wenn Sie selbst Fälle bearbeiten möchten, gelangen Sie über diesen Button jederzeit zurück zu Ihrem persönlichen Dashboard.'
        },
        {
        id: 'help_link_admin',
        attachTo: { element: 'a[href="b2b-hilfe.html"]', on: 'top' },
        title: 'Hilfe für Geschäftskunden',
        text: 'Spezielle Anleitungen und FAQs für die Verwaltung von Teams und Lizenzen finden Sie hier. Auch diese Tour können Sie jederzeit neu starten.'
    },
        {
            id: 'finish_admin',
            title: 'Einrichtung abgeschlossen!',
            text: 'Das waren die wichtigsten Verwaltungsfunktionen. Ganz unten auf der Seite finden Sie "Hilfe & FAQ für Geschäftskunden" für weitere Informationen. Viel Erfolg!',
            buttons: [{ text: 'Tour beenden', action: function() { return this.complete(); } }]
        }
    ];

    function startAdminTour() {
        if (localStorage.getItem('clerion_admin_tour_completed')) {
            return;
        }

        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            useShadowRoot: false,
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

        adminTourSteps.forEach(step => {
            if (step.attachTo && step.attachTo.element) {
                const element = document.querySelector(step.attachTo.element);
                if (element && element.offsetParent !== null) {
                    tour.addStep(step);
                }
            } else {
                tour.addStep(step);
            }
        });

        tour.on('complete', () => localStorage.setItem('clerion_admin_tour_completed', 'true'));
        tour.on('cancel', () => localStorage.setItem('clerion_admin_tour_completed', 'true'));

        tour.start();
    }

    // =======================================================================
    // ENDE INTERAKTIVE TOUR
    // =======================================================================
    // =======================================================================
    // INITIALES SETUP
    // =======================================================================
    const API_BASE_URL = 'https://api.clerion.de';
    const authToken = localStorage.getItem('behoerdenhilfe_token');
    let currentUser = null;
    let currentOrg = null;
    let allOrgCases = [];
    let allOrgMembers = [];
    let allOrgApplications = [];

    // --- PDF Viewer State ---
    let pdfViewerDoc = null;
    let pdfViewerPageNum = 1;

    // === DOM-ELEMENTE SAMMELN ===
    const welcomeMessage = document.getElementById('welcome-message');
    const adminDateSearchButton = document.getElementById('date-search-button');
    const logoutButton = document.getElementById('logout-button');
    const inviteMemberForm = document.getElementById('invite-member-form');
    const memberEmailInput = document.getElementById('member-email-input');
    const memberList = document.getElementById('member-list');
    const allCasesContainer = document.getElementById('all-cases-container');
    const orgStatusBadge = document.getElementById('org-status-badge');
    const seatCountInfo = document.getElementById('seat-count-info');
    const seatQuantityInput = document.getElementById('seat-quantity-input');
    const buySeatsForm = document.getElementById('buy-seats-form');
    const brandingForm = document.getElementById('branding-form');
    const footerTextInput = document.getElementById('footer-text-input');
    const logoPreviewContainer = document.getElementById('logo-preview-container');
    const logoFileInput = document.getElementById('logo-file-input');
    const senderInfoBlockInput = document.getElementById('sender-info-block-input');
    const modalCaseTitle = document.getElementById('modal-case-title');

    const buySubscriptionContainer = document.getElementById('buy-subscription-container');
    const manageSubscriptionContainer = document.getElementById('manage-subscription-container');
    const buyPremiumButton = document.getElementById('buy-premium-button');
    const buyPremiumPlusButton = document.getElementById('buy-premium-plus-button');
    const manageSubscriptionButton = document.getElementById('manage-subscription-button');
    const seatQuantityInputBuy = document.getElementById('seat-quantity-input-buy');
    const seatQuantityInputManage = document.getElementById('seat-quantity-input-manage');

    
    const modalCaseDetails = document.getElementById('modal-case-details');

    const pdfViewerModalOverlay = document.getElementById('pdf-viewer-modal-overlay');
    const pdfViewerTitle = document.getElementById('pdf-viewer-title');
    const pdfViewerCanvas = document.getElementById('pdf-viewer-canvas');
    const pdfViewerPageNumEl = document.getElementById('pdf-viewer-page-num');
    const pdfViewerPageCountEl = document.getElementById('pdf-viewer-page-count');
    const pdfViewerPrevButton = document.getElementById('pdf-viewer-prev');
    const pdfViewerNextButton = document.getElementById('pdf-viewer-next');
    const closePdfViewerButton = document.getElementById('close-pdf-viewer-modal-button');
    const adminAppNoteTextarea = document.getElementById('admin-app-note-textarea');
    const saveAdminAppNoteButton = document.getElementById('save-admin-app-note-button');
  

    // =======================================================================
    // SICHERHEITS-CHECK & DATEN LADEN
    // =======================================================================

    function handleSessionExpired() {
        localStorage.removeItem('behoerdenhilfe_token');
        alert("Ihre Sitzung ist abgelaufen. Bitte loggen Sie sich erneut ein.");
        window.location.href = 'dashboard.html';
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
    
    async function initializeAdminView() {
    if (!authToken) { window.location.href = 'index.html'; return; }
    try {
        const payload = JSON.parse(atob(authToken.split('.')[1]));
        if (payload.role !== 'owner') { window.location.href = 'dashboard.html'; return; }
        
        currentUser = payload;
        welcomeMessage.textContent = `Admin-Dashboard für ${currentUser.username.split('@')[0]}`;
        
        // 1. Alle Daten parallel laden und auf das Ende WARTEN
        await Promise.all([
            fetchOrgSubscription(),
            fetchOrgMembers(),
            fetchOrgCases(),
            fetchOrgApplications(),
            fetchBrandingData()
        ]);

        // 2. ERST JETZT, wo alle Daten garantiert da sind, die UI zeichnen
        renderMembers(allOrgMembers);
        renderOrgCases(allOrgCases, allOrgApplications);

        setTimeout(startAdminTour, 500);

        startPollingForUpdates();

    } catch (error) {
        // Fehlerbehandlung bleibt gleich
        handleSessionExpired();
    }
}

    async function fetchOrgSubscription() {
        if (!orgStatusBadge) return;

        // UI zurücksetzen
        buySubscriptionContainer.classList.add('hidden');
        manageSubscriptionContainer.classList.add('hidden');
        seatCountInfo.classList.add('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/api/organizations/subscription`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('Abo-Daten konnten nicht geladen werden.');
            
            const subData = await response.json();
            const status = subData.subscriptionStatus || 'free';

            if (status === 'free' || status === 'canceled') {
                // ZUSTAND 1: Nutzer hat kein Abo
                orgStatusBadge.textContent = 'Kein aktives Abo';
                orgStatusBadge.className = 'badge free';
                buySubscriptionContainer.classList.remove('hidden');

            } else {
                // ZUSTAND 2: Nutzer hat ein aktives Abo (Premium oder Premium Plus)
                let statusText = 'Premium';
                if (status === 'premium_plus') {
                    statusText = 'Premium Plus';
                }
                orgStatusBadge.textContent = statusText;
                orgStatusBadge.className = `badge active`; // Einheitliche Farbe für aktive Abos
                
                seatCountInfo.textContent = `${subData.currentSeats} / ${subData.maxSeats}`;
                seatQuantityInputManage.value = subData.maxSeats;
                
                seatCountInfo.classList.remove('hidden');
                manageSubscriptionContainer.classList.remove('hidden');
            }
        } catch (error) {
            console.error("Fehler beim Abrufen des Abo-Status:", error);
            orgStatusBadge.textContent = 'Fehler';
        }
    }





    // =======================================================================
    // FUNKTIONEN
    // =======================================================================

    async function openPdfViewerModal(appId) {
        const appData = allOrgApplications.find(a => a.id == appId);
        if (!appData) {
            alert('Antragsdaten nicht gefunden.');
            return;
        }

        pdfViewerTitle.textContent = `Vorschau: ${appData.customTitle || `Antrag #${appData.id}`}`;
        adminAppNoteTextarea.value = appData.notes || '';
        saveAdminAppNoteButton.dataset.appId = appId;

        // URL zum PDF bestimmen (entweder das finale oder das dynamisch befüllte)
        const pdfUrl = (appData.status === 'completed' && appData.finalPdfPath)
            ? `${API_BASE_URL}/${appData.finalPdfPath.replace(/\\/g, '/')}`
            : `${API_BASE_URL}/api/applications/${appId}/filled-pdf`;

        pdfViewerModalOverlay.classList.remove('hidden');
        
        // KORREKTUR: Canvas leeren und Lade-Spinner anzeigen
        const ctx = pdfViewerCanvas.getContext('2d');
        ctx.clearRect(0, 0, pdfViewerCanvas.width, pdfViewerCanvas.height);
        document.getElementById('pdf-loading-spinner')?.remove(); // Alten Spinner entfernen
        pdfViewerCanvas.parentElement.insertAdjacentHTML('beforeend', '<div class="inline-spinner" id="pdf-loading-spinner" style="position: absolute; top: 40%; left: 50%;"></div>');

        try {
            // KORREKTUR: Worker-Pfad explizit setzen (entscheidend!)
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
            
            const loadingTask = pdfjsLib.getDocument({
                url: pdfUrl,
                httpHeaders: { 'Authorization': `Bearer ${authToken}` } // Auth-Header ist wichtig
            });

            pdfViewerDoc = await loadingTask.promise;
            document.getElementById('pdf-loading-spinner')?.remove(); // Spinner entfernen
            pdfViewerPageCountEl.textContent = pdfViewerDoc.numPages;
            pdfViewerPageNum = 1;
            await renderPdfViewerPage(pdfViewerPageNum);

        } catch (error) {
            document.getElementById('pdf-loading-spinner')?.remove();
            console.error('PDF konnte nicht geladen werden:', error);
            alert("Das PDF für diesen Antrag konnte nicht geladen werden. Prüfen Sie die Browser-Konsole für Details.");
        }
    }

     async function renderPdfViewerPage(num) {
        if (!pdfViewerDoc || num < 1 || num > pdfViewerDoc.numPages) return;
        pdfViewerPageNum = num;
        pdfViewerPageNumEl.textContent = num;

        const page = await pdfViewerDoc.getPage(num);
        // Skalierung an die Breite des Containers anpassen für bessere Darstellung
        const containerWidth = pdfViewerCanvas.parentElement.clientWidth;
        const viewport = page.getViewport({ scale: 1.0 });
        const scale = containerWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale: scale });

        pdfViewerCanvas.height = scaledViewport.height;
        pdfViewerCanvas.width = scaledViewport.width;
        
        await page.render({ canvasContext: pdfViewerCanvas.getContext('2d'), viewport: scaledViewport }).promise;

        pdfViewerPrevButton.disabled = num <= 1;
        pdfViewerNextButton.disabled = num >= pdfViewerDoc.numPages;
    }

    async function saveAdminApplicationNote() {
        const appId = saveAdminAppNoteButton.dataset.appId;
        const notes = adminAppNoteTextarea.value;
        if (!appId) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/applications/${appId}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ notes })
            });
            if (!response.ok) throw new Error('Notizen konnten nicht gespeichert werden.');
            
            const appToUpdate = allOrgApplications.find(a => a.id == appId);
            if (appToUpdate) appToUpdate.notes = notes;
            
            showNotification('Notizen erfolgreich gespeichert!', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }


    async function fetchOrgApplications(startDate = null, endDate = null) {
    const url = new URL(`${API_BASE_URL}/api/organizations/applications`);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);
    
    try {
        const response = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (!response.ok) throw new Error('Anträge konnten nicht geladen werden.');
        allOrgApplications = await response.json();
        } catch (error) {
            console.error(error);
            showNotification(error.message, 'error');
            allOrgApplications = [];
        }
    }

    function renderOrgApplications(applications, members) {
        const caseListContainer = document.getElementById('case-list-container');
        if (!caseListContainer) return;
        if (!applications || applications.length === 0) {
            caseListContainer.innerHTML = '<p>Keine Anträge für diese Auswahl gefunden.</p>';
            return;
        }
        const appListHTML = applications.map(app => {
            const date = new Date(app.createdAt).toLocaleDateString('de-DE');
            const title = app.customTitle || `Antrag #${app.id}`;
            let selectHTML = `<select class="assign-user-select-app" data-app-id="${app.id}">`;
            selectHTML += '<option value="">Nicht zugewiesen</option>';
            members.forEach(member => {
                const isSelected = app.assignedUserId == member.id ? 'selected' : '';
                selectHTML += `<option value="${member.id}" ${isSelected}>${member.username}</option>`;
            });
            selectHTML += '</select>';
            return `<div class="admin-case-item">
                        <div class="case-header"><strong>${title}</strong> | Klient: ${app.clientName || 'N/A'}</div>
                        <div class="case-body"><p><strong>Bearbeiter:</strong> ${selectHTML}</p></div>
                        <div class="case-footer"><span>Erstellt am: ${date}</span><button class="button-secondary show-app-details-button" data-app-id="${app.id}">Antrag ansehen & Notizen</button></div>
                    </div>`;
        }).join('');
        caseListContainer.innerHTML = appListHTML;
    }


    // NEUE FUNKTION: Zeigt die geladenen Branding-Daten an
    function displayBrandingData(data) {
        if (data.footerText) {
            footerTextInput.value = data.footerText;
        }
        // NEU:
        if (data.senderInfoBlock) {
            senderInfoBlockInput.value = data.senderInfoBlock;
        }
        if (data.logoPath) {
            logoPreviewContainer.innerHTML = `
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Aktuelles Logo:</p>
                <img src="${API_BASE_URL}/${data.logoPath.replace(/\\/g, '/')}" alt="Firmenlogo" style="max-width: 200px; border-radius: var(--radius-sm); border: 1px solid var(--gray-200);">
            `;
        } else {
            logoPreviewContainer.innerHTML = '';
        }
    }

    // NEUE FUNKTION: Holt die Branding-Daten vom Server
    async function fetchBrandingData() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/organizations/branding`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (response.status === 403) throw new Error('SESSION_EXPIRED');
            if (!response.ok) throw new Error('Branding-Daten konnten nicht geladen werden.');
            const data = await response.json();
            displayBrandingData(data);
        } catch (error) {
            if (error.message === 'SESSION_EXPIRED') {
                handleSessionExpired();
            } else {
                console.error(error);
                showNotification(error.message, 'error');
            }
        }
    }
    
    // Holt die Mitgliederliste vom Server
    async function fetchOrgMembers() {
    if (!memberList) return;
    memberList.innerHTML = '<li>Lade Mitglieder... <div class="inline-spinner"></div></li>';
    try {
        const response = await fetch(`${API_BASE_URL}/api/organizations/members`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (response.status === 403) throw new Error('SESSION_EXPIRED');
        if (!response.ok) throw new Error('Mitglieder konnten nicht geladen werden.');
        allOrgMembers = await response.json();
        
    } catch (error) {
            if (error.message === 'SESSION_EXPIRED') {
                handleSessionExpired();
            } else {
                memberList.innerHTML = `<li style="color: red;">${error.message}</li>`;
            }
        }
    }

    

    // Holt alle Fälle der Organisation vom Server
    async function fetchOrgCases(startDate = null, endDate = null) {
    if (!allCasesContainer) return;
    allCasesContainer.innerHTML = '<p>Lade Fälle... <div class="inline-spinner"></div></p>';
    
    const url = new URL(`${API_BASE_URL}/api/organizations/cases`);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);

    try {
        const response = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (!response.ok) throw new Error('Fälle der Organisation konnten nicht geladen werden.');
        allOrgCases = await response.json();
        
        // KORREKTUR: Übergibt jetzt beide Listen an die Render-Funktion
        renderOrgCases(allOrgCases, allOrgApplications); //
        

    } catch (error) {
        if (error.message === 'SESSION_EXPIRED') {
            handleSessionExpired();
        } else {
            allCasesContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
        allOrgCases = [];
    }
}


    // Zeichnet die klickbare Mitgliederliste
    function renderMembers(members) {
    if (!memberList) return;
    memberList.innerHTML = '';

    // Button für "Alle Mitarbeiter"
    const allLi = document.createElement('li');
    allLi.textContent = 'Alle Mitarbeiter';
    allLi.classList.add('selected');
    allLi.addEventListener('click', () => {
        document.querySelectorAll('#member-list li').forEach(item => item.classList.remove('selected'));
        allLi.classList.add('selected');
        // KORREKT: Zeigt alle Fälle UND alle Anträge an
        renderOrgCases(allOrgCases, allOrgApplications);
    });
    memberList.appendChild(allLi);

    // Buttons für jeden einzelnen Mitarbeiter
    members.forEach(member => {
        const li = document.createElement('li');
        li.dataset.memberId = member.id;
    
        const textNode = document.createElement('span');
        textNode.textContent = member.username + (member.role === 'owner' ? ' (Admin)' : '');
        textNode.style.flexGrow = '1';
        
        li.appendChild(textNode);

        // Löschen-Button für Mitglieder (nicht für den Owner selbst)
        if (member.role !== 'owner') {
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '×';
            deleteButton.className = 'delete-button';
            deleteButton.title = 'Diesen Mitarbeiter entfernen';

            deleteButton.addEventListener('click', async (e) => {
                e.stopPropagation(); // Verhindert, dass der Klick auch das li-Element auslöst
                if (confirm(`Sind Sie sicher, dass Sie den Mitarbeiter "${member.username}" entfernen möchten?`)) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/organizations/members/${member.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.message);
                        showNotification(data.message, 'success');
                        initializeAdminView(); // Lade die ganze Ansicht neu
                    } catch (error) {
                        showNotification(`Fehler: ${error.message}`, 'error');
                    }
                }
            });
            li.appendChild(deleteButton);
        }

        // Klick-Listener für das Filtern nach Mitarbeiter
        li.addEventListener('click', () => {
            document.querySelectorAll('#member-list li').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            // KORREKT: Filtert sowohl die Fälle als auch die Anträge für diesen Mitarbeiter
            const filteredCases = allOrgCases.filter(c => c.assignedUserId === member.id);
            const filteredApps = allOrgApplications.filter(a => a.assignedUserId === member.id);
            renderOrgCases(filteredCases, filteredApps); // Übergibt die gefilterten Listen
        });
        memberList.appendChild(li);
    });
}

    // Zeichnet die Fall-Liste (gefiltert oder ungefiltert)
    function renderOrgCases(cases, applications) {
        if (!allCasesContainer) return;
        allCasesContainer.innerHTML = '';

        const filterHTML = `
            <div class="filter-container" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                <div class="filter-group">
                    <label for="case-type-filter">1. Typ wählen:</label>
                    <select id="case-type-filter">
                        <option value="all">Alle Fall-Typen</option>
                        <option value="letter">Brief-Analysen</option>
                        <option value="file">Dokumenten-Analysen</option>
                        <option value="application">Anträge</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label for="client-filter">2. Klient filtern:</label>
                    <select id="client-filter" disabled><option value="all">Alle Klienten</option></select>
                </div>
            </div>
            <div id="case-list-container"></div>
        `;
        allCasesContainer.innerHTML = filterHTML;

        const caseTypeFilter = document.getElementById('case-type-filter');
    const clientFilter = document.getElementById('client-filter');
    const caseListContainer = document.getElementById('case-list-container');

        function updateClientFilter() {
            const selectedType = caseTypeFilter.value;
            let sourceData = [];
            if (selectedType === 'application') sourceData = applications;
            else if (selectedType === 'all') sourceData = [...cases, ...applications];
            else sourceData = cases.filter(c => c.type === selectedType);
            
            const clientMap = new Map();
            sourceData.forEach(item => { if (item.clientId) clientMap.set(item.clientId, item.clientName); });

            clientFilter.innerHTML = '<option value="all">Alle Klienten</option>';
            if (clientMap.size > 0) {
                clientMap.forEach((name, id) => { clientFilter.innerHTML += `<option value="${id}">${name}</option>`; });
                clientFilter.disabled = false;
            } else {
                clientFilter.disabled = true;
            }
        }

        async function applyFilters() {
        const selectedType = caseTypeFilter.value;
        const selectedClient = clientFilter.value;
        const safeCases = cases || [];
        const safeApplications = applications || [];

        if (selectedType === 'all') {
            let allItems = [...safeCases, ...safeApplications];
            if (selectedClient !== 'all') {
                allItems = allItems.filter(item => item.clientId == selectedClient);
            }
            allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            if (allItems.length === 0) {
                caseListContainer.innerHTML = '<p>Keine Einträge für diese Auswahl gefunden.</p>';
                return;
            }

            const listHTML = allItems.map(item => {
                const date = new Date(item.createdAt).toLocaleDateString('de-DE');
                let selectHTML = '';
                if (item.type === 'letter' || item.type === 'file') {
                    selectHTML = `<select class="assign-user-select" data-case-id="${item.id}">`;
                } else {
                    selectHTML = `<select class="assign-user-select-app" data-app-id="${item.id}">`;
                }
                selectHTML += '<option value="">Nicht zugewiesen</option>';
                allOrgMembers.forEach(member => {
                    const isSelected = item.assignedUserId == member.id ? 'selected' : '';
                    selectHTML += `<option value="${member.id}" ${isSelected}>${member.username}</option>`;
                });
                selectHTML += '</select>';

                if (item.type === 'letter' || item.type === 'file') {
                    let displayExplanation = 'Keine Zusammenfassung vorhanden.';
                    try { const parsed = JSON.parse(item.aiExplanation); displayExplanation = parsed.kernthema || parsed.zusammenfassung || 'Zusammenfassung konnte nicht gelesen werden.'; } catch (e) {}
                    return `
                        <div class="admin-case-item">
                            <div class="case-header"><strong>${item.customTitle || `Fall #${item.id}`}</strong> | Klient: ${item.clientName || 'N/A'}</div>
                            <div class="case-body"><p><strong>Bearbeiter:</strong> ${selectHTML}</p><div class="case-explanation"><strong>KI-Zusammenfassung:</strong><p>${displayExplanation}</p></div></div>
                            <div class="case-footer"><span>Erstellt am: ${date}</span><button class="button-secondary show-details-button" data-case-id="${item.id}">Vollständige Analyse anzeigen</button></div>
                        </div>`;
                } else {
                    return `
                        <div class="admin-case-item">
            <div class="case-header">
                <strong>${item.customTitle || `Antrag #${item.id}`}</strong> | Klient: ${item.clientName || 'N/A'}
                <button class="delete-button admin-delete-app" data-app-id="${item.id}" title="Diesen Antrag löschen">×</button>
            </div>
            <div class="case-body"><p><strong>Bearbeiter:</strong> ${selectHTML}</p></div>
            <div class="case-footer"><span>Erstellt am: ${date}</span><button class="button-secondary show-app-details-button" data-app-id="${item.id}">Antrag ansehen & Notizen</button></div>
        </div>`;
                }
            }).join('');
            caseListContainer.innerHTML = listHTML;


    } else if (selectedType === 'application') {
        let filteredApps = applications;
        if (selectedClient !== 'all') {
            filteredApps = filteredApps.filter(a => a.clientId == selectedClient);
        }
        renderOrgApplications(filteredApps, allOrgMembers);
    } else {
        let filteredCases = cases;
        if (selectedType !== 'all') {
            filteredCases = filteredCases.filter(c => c.type === selectedType);
        }
        if (selectedClient !== 'all') {
            filteredCases = filteredCases.filter(c => c.clientId == selectedClient);
        }
        renderCaseItems(filteredCases, allOrgMembers);
    }
}
        caseTypeFilter.addEventListener('change', () => {
            updateClientFilter();
            applyFilters();
        });
        clientFilter.addEventListener('change', applyFilters);

        updateClientFilter();
        applyFilters();
    }



// NEUE, KLEINERE HELFER-FUNKTION: Zeichnet nur die Liste der Fälle
function renderCaseItems(casesToRender, members) {
    const caseListContainer = document.getElementById('case-list-container');
    if (!caseListContainer) return;

    if (casesToRender.length === 0) {
        caseListContainer.innerHTML = '<p>Für diese Auswahl wurden keine Fälle gefunden.</p>';
        return;
    }
    
    const caseListHTML = casesToRender.map(caseItem => {
        const date = new Date(caseItem.createdAt).toLocaleDateString('de-DE');
        
        let displayExplanation = 'Keine Zusammenfassung vorhanden.';
        let summaryLabel = 'KI-Analyse';
        
        if (caseItem.aiExplanation) {
            try {
                const parsed = JSON.parse(caseItem.aiExplanation);
                displayExplanation = parsed.kernthema || parsed.zusammenfassung || 'Zusammenfassung konnte nicht gelesen werden.';
                summaryLabel = (caseItem.type === 'file') ? 'KI-Kernthema (Akte)' : 'KI-Zusammenfassung (Brief)';
            } catch (e) {
                displayExplanation = caseItem.aiExplanation;
            }
        }
        
        let selectHTML = '<select class="assign-user-select" data-case-id="' + caseItem.id + '">';
        selectHTML += '<option value="">Nicht zugewiesen</option>';
        members.forEach(member => {
            const isSelected = caseItem.assignedUserId == member.id ? 'selected' : '';
            selectHTML += `<option value="${member.id}" ${isSelected}>${member.username}</option>`;
        });
        selectHTML += '</select>';

        return `
            <div class="admin-case-item">
                <div class="case-header">
                    <strong>Fall #${caseItem.id}</strong> | Klient: ${caseItem.clientName || 'N/A'}
                    <button class="delete-button admin-delete-case" data-case-id="${caseItem.id}" title="Diesen Fall löschen">×</button>
                </div>
                <div class="case-body">
                    <p><strong>Bearbeiter:</strong> ${selectHTML}</p>
                    <div class="case-explanation">
                        <strong>${summaryLabel}:</strong>
                        <p>${displayExplanation}</p>
                    </div>
                    <p class="case-notes"><strong>Notiz:</strong> ${caseItem.notes || 'Keine Notiz vorhanden.'}</p>
                </div>
                <div class="case-footer">
                    <span>Erstellt am: ${date}</span>
                    <button class="button-secondary show-details-button" data-case-id="${caseItem.id}">Vollständige Analyse anzeigen</button>
                </div>
            </div>
        `;
    }).join('');

    caseListContainer.innerHTML = caseListHTML;
        
        // Event-Listener für Zuweisungs-Dropdowns und Löschen-Buttons
        // (Dieser Teil bleibt unverändert)
        document.querySelectorAll('.assign-user-select').forEach(selectElement => {
            selectElement.addEventListener('change', async (e) => {
                const caseId = e.target.dataset.caseId;
                const newAssignedUserId = e.target.value;
                try {
                    const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/assign`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                        body: JSON.stringify({ newAssignedUserId: newAssignedUserId || null })
                    });
                    if (!response.ok) throw new Error("Zuweisung fehlgeschlagen");
                    e.target.style.borderColor = 'green';
                    setTimeout(() => { e.target.style.borderColor = '' }, 1500);
                    // Wichtig: Lade die Fälle neu, damit die Zuweisung auch in der Filterlogik korrekt ist
                    await fetchOrgCases();
                } catch (error) {
                    showNotification(`Fehler: ${error.message}`, 'error');
                    e.target.style.borderColor = 'red';
                }
            });
        });

        document.querySelectorAll('.admin-delete-case').forEach(button => {
            button.addEventListener('click', async (e) => {
                const caseId = e.target.dataset.caseId;
                if (!caseId) return;

                if (confirm(`Sind Sie sicher, dass Sie den Fall #${caseId} unwiderruflich als gelöscht markieren möchten?`)) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        if (!response.ok) throw new Error('Fall konnte nicht gelöscht werden.');
                        await fetchOrgCases();
                    } catch (error) {
                        showNotification(`Fehler: ${error.message}`, 'error');
                    }
                }
            });
        });

    document.querySelectorAll('.show-details-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const caseId = e.target.dataset.caseId;
            const caseData = allOrgCases.find(c => c.id == caseId);
            if (!caseData) return;

            const modalOverlay = document.getElementById('case-detail-modal-overlay');
            const modalTitle = document.getElementById('modal-case-title');
            const modalDetails = document.getElementById('modal-case-details');
            
           modalTitle.textContent = caseData.customTitle || `Fall #${caseData.id}`;

            
            try {
                const analysis = JSON.parse(caseData.aiExplanation);
                let detailsHTML = '<div class="analysis-content-wrapper">'; // Wrapper für Scroll-Inhalt

                if (caseData.type === 'file') {
                    detailsHTML += `<h4>Zusammenfassung</h4><p>${analysis.zusammenfassung || 'N/A'}</p>`;
                    detailsHTML += `<h4>Kernthema</h4><p>${analysis.kernthema || 'N/A'}</p>`;
                    detailsHTML += `<h4>Beteiligte Parteien</h4><ul>${analysis.beteiligte_parteien.map(p => `<li><strong>${p.name}</strong> (${p.rolle})</li>`).join('')}</ul>`;
                    detailsHTML += `<h4>Wichtige Klauseln</h4><ul>${analysis.wichtige_klauseln.map(k => `<li><strong>${k.klausel}:</strong> ${k.erklaerung}</li>`).join('')}</ul>`;
                    detailsHTML += `<h4>Bewertung: Risiken & Chancen</h4><ul>${analysis.risiken_und_chancen.map(i => `<li><strong>${i.typ}:</strong> ${i.beschreibung}</li>`).join('')}</ul>`;
                    detailsHTML += `<h4>Wichtige Termine</h4><ul>${analysis.chronologie.map(c => `<li><strong>${c.datum}:</strong> ${c.ereignis}</li>`).join('')}</ul>`;
                } else { 
                    detailsHTML += `<h4>Zusammenfassung</h4><p>${analysis.zusammenfassung || 'N/A'}</p>`;
                    detailsHTML += `<h4>Nächste Schritte</h4><ul>${analysis.aktionen.map(a => `<li>${a.beschreibung}</li>`).join('')}</ul>`;
                    detailsHTML += `<h4>Wichtige Fristen</h4><ul>${analysis.fristen.map(f => `<li><strong>${new Date(f.datum).toLocaleDateString('de-DE')}:</strong> ${f.beschreibung}</li>`).join('')}</ul>`;
                    detailsHTML += `<p><strong>Aktenzeichen:</strong> ${analysis.aktenzeichen || 'N/A'}</p>`;
                }
                detailsHTML += '</div>'; // Ende des Scroll-Wrappers

                // HINZUFÜGEN DES NOTIZBEREICHS
                detailsHTML += `
                    <div class="modal-notes-section">
                        <h4>Interne Notiz (sichtbar für alle Mitarbeiter)</h4>
                        <textarea id="admin-note-textarea">${caseData.notes || ''}</textarea>
                        <button id="save-admin-note-button" class="button-primary" data-case-id="${caseData.id}">Notiz speichern</button>
                    </div>
                `;

                modalDetails.innerHTML = detailsHTML;

                // Event-Listener für den NEUEN Speicher-Button hinzufügen
                document.getElementById('save-admin-note-button').addEventListener('click', saveAdminNote);

            } catch (error) {
                modalDetails.innerHTML = '<p style="color: red;">Die Analysedaten konnten nicht geladen oder verarbeitet werden.</p>';
            }

            modalOverlay.classList.remove('hidden');
        });
    });
}


async function saveAdminNote(e) {
    const caseId = e.target.dataset.caseId;
    const noteText = document.getElementById('admin-note-textarea').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ notes: noteText })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message);
        
        showNotification(result.message, 'success');

        // Notiz im lokalen Daten-Array aktualisieren
        const caseToUpdate = allOrgCases.find(c => c.id == caseId);
        if (caseToUpdate) {
            caseToUpdate.notes = noteText;
        }

        // Notiz-Vorschau in der Hauptansicht live aktualisieren
        const notePreviewEl = document.querySelector(`#admin-case-item-${caseId} .note-preview`);
        if (notePreviewEl) {
            notePreviewEl.textContent = noteText || 'Keine Notiz vorhanden.';
        }

    } catch (error) {
        showNotification(`Fehler: ${error.message}`, 'error');
    }
}

async function refreshCaseData() {
        console.log('Suche nach Aktualisierungen...'); // Hilfreich für Tests, kann später entfernt werden
        saveFilterState();

        // Liest die aktuellen Datumseinstellungen aus, um den Filter beizubehalten
        const startDate = document.getElementById('start-date-input').value || null;
        const endDate = document.getElementById('end-date-input').value || null;

        // 1. Aktualisiere leise die Antrags-Daten im Hintergrund
        await fetchOrgApplications(startDate, endDate);

        // 2. Aktualisiere die Fall-Daten. Diese Funktion löst automatisch die
        //    Neuanzeige der Liste aus und verwendet dabei die frischen Antrags-Daten von oben.
        await fetchOrgCases(startDate, endDate);
        restoreFilterState();
    }

    function saveFilterState() {
    const caseType = document.getElementById('case-type-filter')?.value || 'all';
    const client = document.getElementById('client-filter')?.value || 'all';
    localStorage.setItem('adminFilterState', JSON.stringify({ caseType, client }));
}

function restoreFilterState() {
    const saved = localStorage.getItem('adminFilterState');
    if (!saved) return;
    const { caseType, client } = JSON.parse(saved);

    const caseTypeEl = document.getElementById('case-type-filter');
    const clientEl = document.getElementById('client-filter');
    if (caseTypeEl) caseTypeEl.value = caseType;
    if (clientEl) clientEl.value = client;

    // Eventuell direkt Filter anwenden:
    caseTypeEl?.dispatchEvent(new Event('change'));
    clientEl?.dispatchEvent(new Event('change'));
}

    function startPollingForUpdates() {
        // Startet den Timer, der alle 30.000 Millisekunden (30 Sekunden) die refreshCaseData-Funktion aufruft.
        setInterval(refreshCaseData, 300000);
    }


    // =======================================================================
    // EVENT-LISTENER
    // =======================================================================

    if(adminDateSearchButton) {
    adminDateSearchButton.addEventListener('click', async () => {
        const startDate = document.getElementById('start-date-input').value || null;
        const endDate = document.getElementById('end-date-input').value || null;

        console.log('Sende Daten an Backend:', { startDate, endDate });
        
        allCasesContainer.innerHTML = '<p>Filtere Daten... <div class="inline-spinner"></div></p>';

        // Lade BEIDE Datenquellen mit dem Datumsfilter neu
        await Promise.all([
            fetchOrgCases(startDate, endDate),
            fetchOrgApplications(startDate, endDate)
        ]);
        
        // Zeichne die UI erst dann mit den frisch gefilterten Daten neu
        renderOrgCases(allOrgCases, allOrgApplications);
    });
}



    if (allCasesContainer) {
    allCasesContainer.addEventListener('click',async (e) => {
        
        // =======================================================
        // LOGIK FÜR ANTRÄGE (war bereits vorhanden)
        // =======================================================
        if (e.target.matches('.show-app-details-button')) {
            const appId = e.target.dataset.appId;
            openPdfViewerModal(appId); // Ruft das PDF-Overlay auf
        }

        // =======================================================
        // NEU: HIER DIE LOGIK FÜR DEN ANTRAG-LÖSCHEN-BUTTON EINFÜGEN
        // =======================================================
        if (e.target.matches('.admin-delete-app')) {
            const appId = e.target.dataset.appId;
            if (!appId) return;

            if (confirm(`Sind Sie sicher, dass Sie den Antrag #${appId} und alle zugehörigen Dokumente endgültig löschen möchten?`)) {
                try {
                    // Die neue Backend-Route aufrufen, die wir erstellt haben
                    const response = await fetch(`${API_BASE_URL}/api/organizations/applications/${appId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    
                    showNotification(data.message, 'success');
                    
                    // Die Ansicht neu laden, damit der gelöschte Antrag verschwindet
                    refreshCaseData(); 
                } catch (error) {
                    showNotification(`Fehler: ${error.message}`, 'error');
                }
            }
        }

        // =======================================================
        // HIER IST DIE FEHLENDE LOGIK FÜR FÄLLE (wiederhergestellt)
        // =======================================================
        if (e.target.matches('.show-details-button')) {
            const caseId = e.target.dataset.caseId;
            const caseData = allOrgCases.find(c => c.id == caseId);
            if (!caseData) return;

            const modalOverlay = document.getElementById('case-detail-modal-overlay');
            const modalTitle = document.getElementById('modal-case-title');
            const modalDetails = document.getElementById('modal-case-details');
            
            modalTitle.textContent = caseData.customTitle || `Fall #${caseData.id}`;

            try {
                const analysis = JSON.parse(caseData.aiExplanation);
                let detailsHTML = '<div class="analysis-content-wrapper">';

                // Unterscheidung zwischen Akten-Analyse (file) und Brief-Analyse (letter)
                if (caseData.type === 'file') {
                    detailsHTML += `<h4>Zusammenfassung</h4><p>${analysis.zusammenfassung || 'N/A'}</p>`;
                    detailsHTML += `<h4>Kernthema</h4><p>${analysis.kernthema || 'N/A'}</p>`;
                    detailsHTML += `<h4>Beteiligte Parteien</h4><ul>${(analysis.beteiligte_parteien || []).map(p => `<li><strong>${p.name}</strong> (${p.rolle})</li>`).join('')}</ul>`;
                    detailsHTML += `<h4>Wichtige Klauseln</h4><ul>${(analysis.wichtige_klauseln || []).map(k => `<li><strong>${k.klausel}:</strong> ${k.erklaerung}</li>`).join('')}</ul>`;
                    detailsHTML += `<h4>Bewertung: Risiken & Chancen</h4><ul>${(analysis.risiken_und_chancen || []).map(i => `<li><strong>${i.typ}:</strong> ${i.beschreibung}</li>`).join('')}</ul>`;
                    detailsHTML += `<h4>Wichtige Termine</h4><ul>${(analysis.chronologie || []).map(c => `<li><strong>${c.datum}:</strong> ${c.ereignis}</li>`).join('')}</ul>`;
                } else { 
                    detailsHTML += `<h4>Zusammenfassung</h4><p>${analysis.zusammenfassung || 'N/A'}</p>`;
                    detailsHTML += `<h4>Nächste Schritte</h4><ul>${(analysis.aktionen || []).map(a => `<li>${a.beschreibung}</li>`).join('')}</ul>`;
                    detailsHTML += `<h4>Wichtige Fristen</h4><ul>${(analysis.fristen || []).map(f => `<li><strong>${new Date(f.datum).toLocaleDateString('de-DE')}:</strong> ${f.beschreibung}</li>`).join('')}</ul>`;
                    detailsHTML += `<p><strong>Aktenzeichen:</strong> ${analysis.aktenzeichen || 'N/A'}</p>`;
                }
                detailsHTML += '</div>';

                // Notizbereich hinzufügen
                detailsHTML += `
                    <div class="modal-notes-section">
                        <h4>Interne Notiz (sichtbar für alle Mitarbeiter)</h4>
                        <textarea id="admin-note-textarea">${caseData.notes || ''}</textarea>
                        <button id="save-admin-note-button" class="button-primary" data-case-id="${caseData.id}">Notiz speichern</button>
                    </div>
                `;

                modalDetails.innerHTML = detailsHTML;
                document.getElementById('save-admin-note-button').addEventListener('click', saveAdminNote);

            } catch (error) {
                console.error("Fehler beim Anzeigen der Falldetails:", error);
                modalDetails.innerHTML = '<p style="color: red;">Die Analysedaten konnten nicht geladen oder verarbeitet werden.</p>';
            }

            modalOverlay.classList.remove('hidden');
        }
    });

    // Ein Listener für alle 'change'-Ereignisse (Zuweisungs-Dropdowns)
    allCasesContainer.addEventListener('change', async (e) => {
        
        // Änderung im Dropdown für Anträge
        if (e.target.matches('.assign-user-select-app')) {
            const appId = e.target.dataset.appId;
            const newAssignedUserId = e.target.value || null;
            try {
                const response = await fetch(`${API_BASE_URL}/api/applications/${appId}/assign`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ newAssignedUserId })
                });
                if (!response.ok) throw new Error("Zuweisung des Antrags fehlgeschlagen");
                showNotification('Antrag neu zugewiesen.', 'success');
                // Lade die Ansicht neu, um die Änderung zu sehen
                await fetchOrgCases();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }

        // HIER IST DIE FEHLENDE LOGIK für das Zuweisen von Fällen (Brief/Analyse)
        if (e.target.matches('.assign-user-select')) {
            const caseId = e.target.dataset.caseId;
            const newAssignedUserId = e.target.value || null;
            try {
                const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/assign`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ newAssignedUserId })
                });
                if (!response.ok) throw new Error("Zuweisung des Falls fehlgeschlagen");
                showNotification('Fall neu zugewiesen.', 'success');
                
                // Lade die Ansicht neu, um die Änderung zu sehen
                await fetchOrgCases();
                
            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            }
        }
    });
}

if (pdfViewerModalOverlay) {
    // Schließt das Modal beim Klick auf das X
    closePdfViewerButton.addEventListener('click', () => pdfViewerModalOverlay.classList.add('hidden'));
    
    // Steuert die "Zurück"-Seite im PDF
    pdfViewerPrevButton.addEventListener('click', () => renderPdfViewerPage(pdfViewerPageNum - 1));
    
    // Steuert die "Weiter"-Seite im PDF
    pdfViewerNextButton.addEventListener('click', () => renderPdfViewerPage(pdfViewerPageNum + 1));
    
    // Speichert die Admin-Notiz aus dem Overlay
    saveAdminAppNoteButton.addEventListener('click', saveAdminApplicationNote);
}

   
    

    if (brandingForm) {
        brandingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const logoFile = logoFileInput.files[0];
            const footerText = footerTextInput.value;
            const senderInfoBlock = senderInfoBlockInput.value;

            const formData = new FormData();
            formData.append('footerText', footerText);
            formData.append('senderInfoBlock', senderInfoBlock);
            if (logoFile) {
                formData.append('logoFile', logoFile);
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/organizations/branding`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    body: formData
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                showNotification('Branding erfolgreich gespeichert!', 'success');
                
                // Nach dem Speichern die Daten neu laden, um die Vorschau zu aktualisieren
                fetchBrandingData();
                logoFileInput.value = ''; // File-Input zurücksetzen
            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            }
        });
    }
    

    const caseDetailModalOverlay = document.getElementById('case-detail-modal-overlay');
const closeCaseDetailModalButton = document.getElementById('close-case-detail-modal-button');

if (caseDetailModalOverlay && closeCaseDetailModalButton) {
    closeCaseDetailModalButton.addEventListener('click', () => {
        caseDetailModalOverlay.classList.add('hidden');
    });
    caseDetailModalOverlay.addEventListener('click', (e) => {
        if (e.target === caseDetailModalOverlay) {
            caseDetailModalOverlay.classList.add('hidden');
        }
    });
}


const openDeleteOrgModalButton = document.getElementById('open-delete-org-modal-button');
const deleteModalOverlay = document.getElementById('delete-modal-overlay');
const closeModalButton = document.getElementById('close-modal-button');
const finalDeleteButton = document.getElementById('final-delete-button');

if (openDeleteOrgModalButton) {
    openDeleteOrgModalButton.addEventListener('click', () => {
        // Modal-Inhalt für B2B füllen
        document.getElementById('delete-modal-title').textContent = 'Organisation wirklich löschen?';
        document.getElementById('delete-modal-text').textContent = 'Achtung: Diese Aktion löscht die gesamte Organisation inklusive aller Mitarbeiterkonten, Klienten und Fälle unwiderruflich.';
        document.getElementById('delete-modal-warning').textContent = 'Ein aktives Abonnement bei Stripe wird hierdurch NICHT gekündigt.';

        // Finalen Löschen-Button mit der richtigen Aktion verbinden
        finalDeleteButton.onclick = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/organizations/account`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                showNotification('Ihre Organisation wurde gelöscht. Sie werden abgemeldet.', 'success');
                localStorage.removeItem('behoerdenhilfe_token');
                setTimeout(() => { window.location.href = 'index.html'; }, 2000);
            } catch (error) {
                showNotification(error.message, 'error');
            }
        };

        // Modal anzeigen
        deleteModalOverlay.classList.remove('hidden');
    });
}

// Event Listener zum Schließen des Modals (kann identisch sein)
if (closeModalButton) closeModalButton.addEventListener('click', () => deleteModalOverlay.classList.add('hidden'));
if (deleteModalOverlay) deleteModalOverlay.addEventListener('click', (e) => {
    if (e.target === deleteModalOverlay) {
        deleteModalOverlay.classList.add('hidden');
    }
});





    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('behoerdenhilfe_token');
            window.location.href = 'index.html';
        });
    }

    if (inviteMemberForm) {
        inviteMemberForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = memberEmailInput.value.trim();
            if (!email) return;

            try {
                const response = await fetch(`${API_BASE_URL}/api/organizations/invite`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ email })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                
                showNotification(data.message, 'success');
                memberEmailInput.value = '';
            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            }
        });
    }

    if (buySeatsForm) {
    buySeatsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentStatus = orgStatusBadge.textContent;

        try {
            let response;
            
            // Wenn der Nutzer noch kein aktives Abo hat -> ZUM KAUF
            if (currentStatus !== 'active') {
                const quantity = seatQuantityInput.value;
                response = await fetch(`${API_BASE_URL}/api/stripe/create-b2b-checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ organizationId: currentOrg.id, quantity })
                });
            // Wenn der Nutzer bereits ein Abo hat -> ZUM VERWALTEN
            } else {
                // =============================================
                // KORREKTUR HIER: Rufe die neue, spezifische B2B-Route auf
                // =============================================
                response = await fetch(`${API_BASE_URL}/api/stripe/create-portal-session-b2b`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
            }

            const data = await response.json();
            if (response.ok) {
                window.open(data.url, '_blank');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            showNotification(error.message || 'Ein Fehler ist aufgetreten.', 'error');
        }
    });
}



    if (buyPremiumButton) {
        buyPremiumButton.addEventListener('click', async () => {
            const quantity = parseInt(seatQuantityInputBuy.value, 10) || 1;
            try {
                const response = await fetch(`${API_BASE_URL}/api/stripe/create-b2b-checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ quantity })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                window.open(data.url, '_blank');
            } catch (error) {
                alert(`Fehler: ${error.message}`);
            }
        });
    }

    // Klick-Handler für "Premium Plus kaufen"
    if (buyPremiumPlusButton) {
        buyPremiumPlusButton.addEventListener('click', async () => {
            const quantity = parseInt(seatQuantityInputBuy.value, 10) || 1;
            try {
                const response = await fetch(`${API_BASE_URL}/api/stripe/create-b2b-plus-checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ quantity })
                });
                const data = await response.json();

                // 🔹 Hier der neue Teil:
            if (data.skipStripe) {
                alert("Superadmin erkannt – Premium Plus wurde automatisch aktiviert!");
                // Optional: Seite neu laden oder Status aktualisieren
                location.reload();
                return;
            }
            
                if (!response.ok) throw new Error(data.message);
                window.open(data.url, '_blank');
            } catch (error) {
                alert(`Fehler: ${error.message}`);
            }
        });
    }

    // Submit-Handler für "Abo verwalten / Sitze anpassen"
    if (manageSubscriptionContainer) {
        manageSubscriptionContainer.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(`${API_BASE_URL}/api/stripe/create-portal-session-b2b`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                window.open(data.url, '_blank');
            } catch (error) {
                alert(`Fehler: ${error.message}`);
            }
        });
    }


    // =======================================================================
    // INITIALER AUFRUF
    // =======================================================================
    initializeAdminView();
});