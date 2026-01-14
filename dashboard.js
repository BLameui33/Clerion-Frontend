document.addEventListener('DOMContentLoaded', () => {

    const b2bSteps = [
        { id: 'welcome_b2b', attachTo: { element: '#welcome-message', on: 'bottom' }, title: 'Willkommen im B2B-Dashboard!', text: 'Diese Tour erklärt Ihnen die speziellen Funktionen für Geschäftskunden. Los geht\'s!' },
        { id: 'clients', attachTo: { element: '#b2b-dashboard', on: 'right' }, title: '1. Klienten anlegen', text: 'Legen Sie hier neue Klienten an, um deren Fälle und Dokumente getrennt zu verwalten. Die angelegten Klienten werden automatisch in die Klientenliste des Antragshelfers und der Dokumentenanalyse übertragen.' },
        { id: 'client_edit', attachTo: { element: '#client-list', on: 'right' }, title: '2. Klienten-Stammdaten pflegen', text: 'Klicken Sie auf das Stift-Symbol (✎) neben einem Klienten, um dessen Stammdaten wie Adresse, Status oder allgemeine Notizen zu bearbeiten.' },
        { id: 'analysis', attachTo: { element: '#analyze-container', on: 'top' }, title: '3. Analyse im Klientenkontext', text: 'Wenn Sie links einen Klienten ausgewählt haben, wird jede neue Analyse, die Sie hier starten, automatisch diesem Klienten zugeordnet.' },
        { id: 'history_b2b', attachTo: { element: '#history-container', on: 'right' }, title: '4. Der Fall-Verlauf', text: 'Hier sehen Sie die Fälle – entweder alle oder nur die des ausgewählten Klienten. Klicken Sie auf einen Eintrag, um die Falldetails zu öffnen.' },
        { id: 'case_details', attachTo: { element: '#app-main-content', on: 'left' }, title: '5. Falldetails, Notizen & Dokumente', text: 'Nach dem Klick auf einen Fall öffnet sich die Detailansicht. Dort können Sie fallspezifische Notizen für Ihr Team hinterlegen und wichtige Dokumente (z.B. Gutachten) direkt zum Fall hochladen.' },
        { id: 'sender_info_b2b', attachTo: { element: '#sender-info-container', on: 'right' }, title: '6. Ihre Kanzlei-/Firmendaten', text: 'Pflegen Sie hier Ihre Firmendaten. Den Namen und die Adresse können Sie so später per Knopfdruck in Ihre Briefe einfügen. Weitere Angaben wie Telefon oder E-Mail werden automatisch als Kontaktblock ergänzt.' },
        { id: 'signature_b2b', attachTo: { element: '#signature-container', on: 'right' }, title: '7. Ihre digitale Unterschrift', text: 'Laden Sie Ihre Unterschrift hoch, damit diese automatisch auf den für Sie oder Ihre Klienten erstellten Dokumenten erscheint.' },
        { id: 'admin', attachTo: { element: '#admin-dashboard-link', on: 'bottom' }, title: '8. Verwaltung (Für Inhaber)', text: 'Als Inhaber können Sie hier Ihr Team verwalten, Lizenzen buchen und das Branding (Logo, Fußzeile) für Ihre PDF-Dokumente anpassen.' },
        { id: 'help_link_b2b', attachTo: { element: 'a[href="anleitung.html"]', on: 'top' },title: 'Hilfe & Anleitungen',text: 'Wenn Sie einmal nicht weiterwissen, finden Sie hier detaillierte Anleitungen und Antworten auf häufige Fragen. Sie können die Tour über den linken Link jederzeit neu starten.' },
        { id: 'finish_b2b', title: 'Tour beendet!', text: 'Das waren die wichtigsten B2B-Funktionen. Bei Fragen finden Sie weitere Details in der Hilfe. Viel Erfolg!', buttons: [{ text: 'Verstanden', action: function() { this.complete(); } }] }
    ];

    // --- Tour 2: Für brandneue FREE-Nutzer ---
    const b2cFreeSteps = [
        { id: 'welcome_free', attachTo: { element: '#welcome-message', on: 'bottom' }, title: 'Willkommen bei Clerion!', text: 'Diese kurze Tour zeigt Ihnen die wichtigsten Grundfunktionen. Klicken Sie auf "Weiter", um zu beginnen.' },
        { id: 'start_analysis_free', attachTo: { element: '#analyze-container', on: 'bottom' }, title: 'Der Startpunkt', text: 'Hier geben Sie den Text aus einem Behördenbrief ein. Unsere KI erklärt Ihnen dann einfach und verständlich, was es bedeutet. Sie haben 3 kostenlose Analysen.' },
        { id: 'history_free', attachTo: { element: '#history-container', on: 'right' }, title: 'Ihr Fall-Verlauf', text: 'Alle Ihre Analysen werden hier gespeichert, sodass Sie jederzeit darauf zurückgreifen können.' },
        { id: 'sender_info_free', attachTo: { element: '#sender-info-container', on: 'right' }, title: 'Ihre Absender-Daten', text: 'Speichern Sie hier Ihre Kontaktdaten. Ihren Namen und Ihre Adresse können Sie dann später per Knopfdruck einfügen. Weitere Angaben wie Telefon oder E-Mail werden automatisch auf dem finalen PDF unter Ihrer Adresse ergänzt.' },
        { id: 'upgrade_info', attachTo: { element: '#subscribe-container', on: 'bottom' }, title: 'Mehr Funktionen', text: 'Um Fristen zu verwalten, Dokumente zu unterschreiben, den Antragshelfer zu nutzen oder den Privaten Workspace zu entdecken, können Sie hier jederzeit auf Premium oder Premium Plus upgraden.' },
        { id: 'help_link_free', attachTo: { element: 'a[href="anleitung.html"]', on: 'top' }, title: 'Hilfe & Anleitungen', text: 'Sollten Sie Fragen haben, finden Sie hier detaillierte Anleitungen. Sie können diese Tour auch jederzeit über den Link links daneben neu starten.' },

        { id: 'finish_free', title: 'Tour beendet!', text: 'Das waren die Grundlagen. Viel Erfolg!', buttons: [{ text: 'Verstanden', action: function() { this.complete(); } }] }
    ];

    // --- Tour 3: Für Nutzer, die gerade ein UPGRADE gemacht haben ---
    const b2cUpgradeFeatures = [
        { id: 'deadlines_upgrade', attachTo: { element: '#deadlines-container', on: 'right' }, title: 'Neue Funktion: Fristen & Termine', text: 'Ab sofort können Sie hier wichtige Fristen und Termine eintragen und werden an fällige Einträge erinnert.' },
        { id: 'signature_upgrade', attachTo: { element: '#signature-container', on: 'right' }, title: 'Neue Funktion: Digitale Unterschrift', text: 'Laden Sie Ihre Unterschrift hoch, um Dokumente direkt digital zu signieren.' },
        { id: 'upload_upgrade', attachTo: { element: '#file-tab-button', on: 'bottom' }, title: 'Neue Funktion: Bild- & PDF-Upload', text: 'Sie können jetzt auch Fotos oder PDFs Ihrer Dokumente für die Analyse hochladen.' },
        { id: 'antragshelfer_upgrade', attachTo: { element: '#antragshelfer-link', on: 'right' }, isPlusFeature: true, title: 'Exklusiv (Plus): Der Antragshelfer', text: 'Als Premium Plus Mitglied haben Sie zusätzlich Zugriff auf unser leistungsstärkstes Werkzeug: Den Antragshelfer.' },
    ];

    // --- Finale, getrennte Funktionen für jede Tour ---

    function runTour(steps, flag) {
        if (localStorage.getItem(flag)) return;

        const tour = new Shepherd.Tour({
            useModalOverlay: true,
            useShadowRoot: false,
            defaultStepOptions: {
                classes: 'shepherd-theme-arrows',
                scrollTo: true,
                cancelIcon: { enabled: true },
                buttons: [
                    { action() { return this.back(); }, secondary: true, text: 'Zurück' },
                    { action() { return this.next(); }, text: 'Weiter' }
                ]
            }
        });

        steps.forEach(step => {
            if (step.attachTo && step.attachTo.element) {
                const element = document.querySelector(step.attachTo.element);
                if (element && element.offsetParent !== null) {
                    tour.addStep(step);
                }
            } else {
                tour.addStep(step);
            }
        });

        const onTourEnd = () => localStorage.setItem(flag, 'true');
        tour.on('complete', onTourEnd);
        tour.on('cancel', onTourEnd);

        if (tour.steps.length > 0) {
            tour.start();
        }
    }

    function startFreeUserTour() {
        runTour(b2cFreeSteps, 'clerion_free_tour_completed');
    }
    
    function startB2BUserTour() {
        runTour(b2bSteps, 'clerion_b2b_tour_completed');
    }

    function startUpgradeTour() {
        if (!currentUser) return;

        const steps = [
            { id: 'welcome_upgrade', title: 'Upgrade erfolgreich!', text: 'Willkommen bei den Premium-Funktionen! Lassen Sie uns kurz ansehen, was Sie jetzt alles nutzen können.' }
        ];

        b2cUpgradeFeatures.forEach(step => {
            if (step.isPlusFeature && currentUser.subscriptionStatus !== 'premium_plus') {
                return;
            }
            steps.push(step);
        });

        steps.push({
            id: 'finish_upgrade',
            title: 'Das war\'s!',
            text: 'Alle neuen Funktionen sind nun für Sie verfügbar. Viel Erfolg!',
            buttons: [{ text: 'Verstanden', action: function() { this.complete(); } }]
        });
        
        runTour(steps, 'clerion_upgrade_tour_completed');
    }



     const allForms = document.querySelectorAll('form');
    
    // Wir gehen jedes einzelne Formular durch...
    allForms.forEach(form => {
        // ...und hängen einen Wächter an seine "submit"-Aktion.
        form.addEventListener('submit', (e) => {
            // Dieser Befehl verhindert das Neuladen der Seite.
            e.preventDefault();
            console.log(`Standard-Senden für Formular #${form.id} wurde erfolgreich blockiert.`);
        });
    });
 
    // =======================================================================
    // BLOCK 2: DOM-ELEMENTE SAMMELN
    // =======================================================================
    const documentListContainer = document.getElementById('document-list');
    const uploadDocumentForm = document.getElementById('upload-document-form');
    const reviewModalOverlay = document.getElementById('review-modal-overlay');
const closeReviewModalButton = document.getElementById('close-review-modal-button');
const reviewTextarea = document.getElementById('review-textarea');
const finalPdfButton = document.getElementById('final-pdf-button');
    const personaSelector = document.getElementById('persona-selector');
    const deleteSignatureButton = document.getElementById('delete-signature-button');
    const showAllCasesButton = document.getElementById('show-all-cases-button');
    const linkClientContainer = document.getElementById('link-client-container');
const linkClientSelect = document.getElementById('link-client-select');
const linkClientButton = document.getElementById('link-client-button');
    const dropzone = document.querySelector('.dropzone');
    const fileInput = document.getElementById('letter-file-input');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authMessage = document.getElementById('auth-message');
    const logoutButton = document.getElementById('logout-button');
    const welcomeMessage = document.getElementById('welcome-message');
    const analyzeContainer = document.getElementById('analyze-container');
    const pdfCounterSpan = document.getElementById('pdf-counter');
    const subscribeButton = document.getElementById('subscribe-button');
    const textTabButton = document.getElementById('text-tab-button');
    const fileTabButton = document.getElementById('file-tab-button');
    const textInputContainer = document.getElementById('text-input-container');
    const fileInputContainer = document.getElementById('file-input-container');
    const analyzeButton = document.getElementById('analyze-button');
    const startBlankLetterButton = document.getElementById('start-blank-letter-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const resultContainer = document.getElementById('result-container');
    const intentContainer = document.getElementById('intent-container');
    const freitextContainer = document.getElementById('freitext-container');
    const freitextInput = document.getElementById('freitext-input');
    const intentButtons = document.querySelectorAll('.intent-button');
    const downloadPdfButton = document.getElementById('download-pdf-button');
    const b2bDashboard = document.getElementById('b2b-dashboard');
    const addClientForm = document.getElementById('add-client-form');
    const clientNameInput = document.getElementById('client-name-input');
    const clientList = document.getElementById('client-list');
    const historyContainer = document.getElementById('history-container');
    const historyList = document.getElementById('history-list');
    const historyDetailContainer = document.getElementById('history-detail-container');
    const detailExplanation = document.getElementById('detail-explanation');
    const detailNotes = document.getElementById('detail-notes');
    const saveNotesButton = document.getElementById('save-notes-button');
    const backToAnalyzeButton = document.getElementById('back-to-analyze-button');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const defaultAuthView = document.getElementById('default-auth-view');
    const dateSearchButton = document.getElementById('date-search-button');
const signatureFileInput = document.getElementById('signature-file-input');
const signaturePreviewContainer = document.getElementById('signature-preview-container');
const resetPasswordContainer = document.getElementById('reset-password-container');
const requestResetForm = document.getElementById('request-reset-form');
const doResetForm = document.getElementById('do-reset-form');
const backToLoginLink = document.getElementById('back-to-login-link');
//const manageSubscriptionButton = document.getElementById('manage-subscription-button');
const adminDashboardLink = document.getElementById('admin-dashboard-link');
const clientDetailModalOverlay = document.getElementById('client-detail-modal-overlay');
    const closeClientDetailModalButton = document.getElementById('close-client-detail-modal-button');
    const saveClientDetailsButton = document.getElementById('save-client-details-button');
    const clientInfoSelector = document.getElementById('client-info-selector');
    const clientInfoSelectorGroup = document.getElementById('client-info-selector-group');
    const deadlineList = document.getElementById('deadline-list');
    const addDeadlineForm = document.getElementById('add-deadline-form');
    const deadlineClientSelectorGroup = document.getElementById('deadline-client-selector-group');
    const deadlineClientSelector = document.getElementById('deadline-client-selector');
    const deadlineReminderModalOverlay = document.getElementById('deadline-reminder-modal-overlay');
    const closeDeadlineReminderModalButton = document.getElementById('close-deadline-reminder-modal-button');
    const senderInfoInput = document.getElementById('sender-info-input');
    const senderInfoPhoneInput = document.getElementById('sender-info-phone');
    const senderInfoEmailInput = document.getElementById('sender-info-email');
    const senderInfoExtraInput = document.getElementById('sender-info-extra');
    const senderInfoExtra2Input = document.getElementById('sender-info-extra2');
    const detailCaseTitle = document.getElementById('detail-case-title');
    const subscribeContainer = document.getElementById('subscribe-container');
const subscribePlusButton = document.getElementById('subscribe-plus-button');


    // =======================================================================
// BLOCK 2: ANWENDUNGS-STATUS
// =======================================================================
const API_BASE_URL = 'https://api.clerion.de';
let authToken = localStorage.getItem('behoerdenhilfe_token');
let currentUser = null;
let clients = [];
let selectedClientId = null; // <<< Wahrscheinlich fehlend
let activeTab = 'text';      // <<< Wahrscheinlich fehlend
let lastAnalysisResult = '';
let selectedIntent = null;
let currentCaseId = null;
let inviteToken = null;
let resetToken = null; // Neue Status-Variable
let activeClientId = null;
let currentUserDetails = null;


    // =======================================================================
    // BLOCK 3: FUNKTIONEN
    // =======================================================================


    async function handleEmailVerification() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('verify_email_token');

    if (token) {
        try {
            // Die API_BASE_URL Variable existiert bereits in Ihrer Datei
            const response = await fetch(`${API_BASE_URL}/api/user/confirm-email-change`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }
            
            // Zeigt eine Erfolgsmeldung an (Ihre bestehende Funktion wird genutzt)
            showNotification(data.message, 'success');
            
            // Loggt den Nutzer aus und leitet zur Login-Seite weiter
            localStorage.removeItem('behoerdenhilfe_token');
            setTimeout(() => {
                window.location.href = 'index.html'; // Oder dashboard.html, was zur Login-Seite wird
            }, 4000);

        } catch (error) {
            // Zeigt eine Fehlermeldung an
            showNotification(`Fehler bei der Bestätigung: ${error.message}`, 'error');
        } finally {
            // Entfernt den Token aus der URL, um sie zu säubern
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        }
    }
}


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


    function populateClientInfoSelector() {
        if (!clientInfoSelector || !clientInfoSelectorGroup) return;

        // Zeige das Dropdown nur für B2B-Nutzer an, die Klienten haben
        if (currentUser && currentUser.type === 'b2b' && clients.length > 0) {
            clientInfoSelector.innerHTML = '<option value="">-- Klientendetails anzeigen --</option>'; // Reset
            clients.forEach(client => {
                clientInfoSelector.innerHTML += `<option value="${client.id}">${client.name}</option>`;
            });
            clientInfoSelectorGroup.style.display = 'block';
        } else {
            clientInfoSelectorGroup.style.display = 'none';
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

    function resetFileUploadView() {
        const dropzone = document.querySelector('.dropzone');
        const preview = dropzone.querySelector('.preview');
        if (preview) {
            preview.remove();
        }
        uploadedImageFile = null;
        fileInput.value = ''; // Input-Feld sicherheitshalber leeren
    }

    
  function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`; // z.B. 'notification success'
    notification.textContent = message;

    container.appendChild(notification);

    // Entferne die Benachrichtigung nach 5 Sekunden aus dem DOM
    setTimeout(() => {
        notification.remove();
    }, 10000);
}
  
    function checkForInviteToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('invite_token');
        if (token) {
            inviteToken = token;
            // Passe die UI an, um zu zeigen, dass es eine Einladung ist
            if(authContainer) {
                authContainer.querySelector('h2').textContent = 'Team-Einladung annehmen & Registrieren';
                // Verstecke die B2B/B2C-Auswahl, da die Rolle durch die Einladung festgelegt ist
                const accountTypeSelector = authContainer.querySelector('.account-type-selector');
                if(accountTypeSelector) accountTypeSelector.classList.add('hidden');
            }
        }
    }
   
    function resetMainContentView() {
        if (analyzeContainer) analyzeContainer.classList.remove('hidden');
        if (resultContainer) resultContainer.classList.add('hidden');
        if (historyDetailContainer) historyDetailContainer.classList.add('hidden');
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
        }
    }
}


function updateUI() {
    // DOM-Elemente holen
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const b2bDashboard = document.getElementById('b2b-dashboard');
    const pdfCounterInfo = document.querySelector('.counter-info');
    const pdfCounterSpan = document.getElementById('pdf-counter');
    const subscribeButton = document.getElementById('subscribe-button');
    const manageSubscriptionButton = document.getElementById('manage-subscription-button');
    const adminDashboardLink = document.getElementById('admin-dashboard-link');
    const deleteAccountSection = document.getElementById('delete-account-section');
    const personaSelector = document.getElementById('persona-selector');
    const deadlinesContainer = document.getElementById('deadlines-container');
    const subscribeContainer = document.getElementById('subscribe-container');
    
    // Links zu den Features holen
    const signatureContainer = document.getElementById('signature-container');
    const fileTabButton = document.getElementById('file-tab-button');
    const emailAssistantLink = document.querySelector('a[href="email-assistent.html"]');
    const docAnalysisLink = document.querySelector('a[href="akten-analyse.html"]');
    const antragshelferLink = document.querySelector('a[href="antragshelfer.html"]');
    const vertragAssistantLink = document.querySelector('a[href="vertrag-assistent.html"]');

    if (authToken && currentUser) {
        // App-Ansicht anzeigen
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
        resetMainContentView();
        loadGlobalTodos();
        
        let displayName = currentUser.username.includes('@') ? currentUser.username.split('@')[0] : currentUser.username;
        welcomeMessage.textContent = `Willkommen, ${displayName}!`;

        const isB2B = currentUser.type === 'b2b';
        const isPremium = currentUser.subscriptionStatus === 'active';
        const isPremiumPlus = currentUser.subscriptionStatus === 'premium_plus';
        const hasActiveSubscription = isPremium || isPremiumPlus;
        
        // --- KORRIGIERTE LOGIK ---
        
        // 1. Standard-Buttons immer anzeigen, da sie für alle eingeloggten Nutzer da sind.
        // Wir entfernen die `.hidden` Klasse, falls sie im HTML existiert.
        if(docAnalysisLink) docAnalysisLink.classList.remove('hidden');
        if(emailAssistantLink) emailAssistantLink.classList.remove('hidden');

        // 2. Nur den Antragshelfer-Button basierend auf dem Abo-Status ein- oder ausblenden.
        // Das gilt für B2C und B2B gleichermaßen.
        if (antragshelferLink) {
            antragshelferLink.classList.remove('hidden');
        }
        if (vertragAssistantLink) {
            vertragAssistantLink.classList.remove('hidden');
        }

        // 3. Spezifische UI-Elemente für B2B vs. B2C steuern
        if (isB2B) {
            b2bDashboard.classList.remove('hidden');
            adminDashboardLink.classList.toggle('hidden', currentUser.role !== 'owner');
            if (deleteAccountSection) deleteAccountSection.classList.add('hidden');
            if (pdfCounterInfo) pdfCounterInfo.classList.add('hidden');
            if (subscribeButton) subscribeButton.classList.add('hidden');
            if (manageSubscriptionButton) manageSubscriptionButton.classList.add('hidden');
            if (personaSelector) personaSelector.classList.remove('hidden');
            if (startBlankLetterButton) startBlankLetterButton.classList.toggle('hidden', !hasActiveSubscription);
            
            if (signatureContainer) signatureContainer.classList.toggle('hidden', !hasActiveSubscription);
            if (fileTabButton) fileTabButton.classList.toggle('hidden', !hasActiveSubscription);
            if (deadlinesContainer) deadlinesContainer.classList.toggle('hidden', !hasActiveSubscription);
            if (emailAssistantLink) emailAssistantLink.classList.toggle('hidden', !hasActiveSubscription);

            fetchClients();
            populateDeadlineClientSelector();

        } else { // B2C-Nutzer
    b2bDashboard.classList.add('hidden');
    if (adminDashboardLink) adminDashboardLink.classList.add('hidden');
    if (personaSelector) personaSelector.classList.add('hidden');
    if (deleteAccountSection) deleteAccountSection.classList.remove('hidden');

    // Diese Variablen prüfen den genauen Status
    const isPremium = currentUser.subscriptionStatus === 'active';
    const isPremiumPlus = currentUser.subscriptionStatus === 'premium_plus';
    // Diese Variable ist wahr, wenn EINES der beiden Abos aktiv ist
    if (startBlankLetterButton) {
        startBlankLetterButton.classList.toggle('hidden', !hasActiveSubscription);
    }

    if (subscribeContainer) subscribeContainer.classList.toggle('hidden', hasActiveSubscription);
    //if (manageSubscriptionButton) manageSubscriptionButton.classList.toggle('hidden', !hasActiveSubscription);
    if (pdfCounterInfo) pdfCounterInfo.classList.toggle('hidden', hasActiveSubscription);

    // --- KORRIGIERTE FEATURE-FREISCHALTUNG ---

    // Premium-Features: Sichtbar für "Premium" ODER "Premium Plus"
    if (signatureContainer) signatureContainer.classList.toggle('hidden', !hasActiveSubscription);
    if (deadlinesContainer) deadlinesContainer.classList.toggle('hidden', !hasActiveSubscription);
    if (emailAssistantLink) emailAssistantLink.classList.toggle('hidden', !hasActiveSubscription);
    
    
    // KORREKTUR HIER: Der Datei-Upload-Button wird jetzt ebenfalls für beide Abo-Stufen angezeigt
    if (fileTabButton) fileTabButton.classList.toggle('hidden', !hasActiveSubscription);

    // Premium Plus-Feature: Sichtbar NUR für "Premium Plus"
    if (antragshelferLink) antragshelferLink.classList.remove('hidden');
            if (vertragAssistantLink) vertragAssistantLink.classList.remove('hidden');

    // Logik für Nutzer OHNE Abo (Zähler und Button-Deaktivierung)
    if (!hasActiveSubscription && currentUser.pdfCount !== undefined) {
        pdfCounterSpan.textContent = currentUser.pdfCount;
        const hasAnalysesLeft = currentUser.pdfCount > 0;
        analyzeButton.disabled = !hasAnalysesLeft;
        startBlankLetterButton.disabled = !hasAnalysesLeft;
        if (!hasAnalysesLeft) {
            analyzeButton.title = 'Limit erreicht';
            startBlankLetterButton.title = 'Limit erreicht';
        }
    }
}
        fetchHistory();
    } else {
        // Auth-Ansicht anzeigen
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }
}


    async function fetchHistory(startDate = null, endDate = null) {
        if (!authToken || !historyList) return;
        historyContainer.classList.remove('hidden');
        if (historyDetailContainer) historyDetailContainer.classList.add('hidden');
        
        historyList.innerHTML = '<li>Lade Verlauf... <div class="inline-spinner"></div></li>';
        
        let url;
        if (selectedClientId) { // Wenn ein Klient ausgewählt ist
            // KORREKTUR: Fügt ?type=letter zur URL hinzu
            url = new URL(`${API_BASE_URL}/api/clients/${selectedClientId}/cases?type=letter`);
        } else { // Wenn kein Klient ausgewählt ist
            url = new URL(`${API_BASE_URL}/api/cases/user`);
        }

        if (startDate) url.searchParams.append('startDate', startDate);
        if (endDate) url.searchParams.append('endDate', endDate);

        try {
            const response = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!response.ok) throw new Error('Verlauf konnte nicht geladen werden.');
            const cases = await response.json();
            renderHistory(cases);
        } catch (error) {
            historyList.innerHTML = `<li>Fehler: ${error.message}</li>`;
        }
    }


    function renderHistory(cases) {
    if (!historyList) return;
    historyList.innerHTML = '';
    if (cases.length === 0) {
        historyList.innerHTML = '<li>Keine Einträge vorhanden.</li>';
        return;
    }
    cases.forEach(caseItem => {
        const li = document.createElement('li');
        li.dataset.caseId = caseItem.id;
        
        const titleText = caseItem.customTitle || (caseItem.originalText ? caseItem.originalText : 'Leerer Fall');
        const displayTitle = titleText.length > 40 ? titleText.substring(0, 40) + '...' : titleText;

        // Status aus DB oder Standard 'Neu'
        const currentStatus = caseItem.processingStatus || 'Neu';
        
        // CSS Klasse für Farbe berechnen (z.B. status-neu, status-erledigt)
        const statusClass = `status-${currentStatus.toLowerCase().replace(/\s/g, '-')}`;

        li.innerHTML = `
    <div class="case-item-inner" style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong class="case-title" style="font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px;">
                ${caseItem.customTitle || caseItem.originalText || 'Unbenannter Fall'}
            </strong>
            <span class="case-date" style="font-size: 0.75rem; color: #666;">
                ${new Date(caseItem.createdAt).toLocaleDateString('de-DE')}
            </span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
            <select class="status-select ${statusClass}" style="flex: 1; padding: 2px; font-size: 0.75rem; height: 24px; cursor: pointer;">
                <option value="Neu" ${currentStatus === 'Neu' ? 'selected' : ''}>Neu</option>
                <option value="Beantwortet" ${currentStatus === 'Beantwortet' ? 'selected' : ''}>Beantwortet</option>
                <option value="Erledigt" ${currentStatus === 'Erledigt' ? 'selected' : ''}>Erledigt</option>
                <option value="Warten" ${currentStatus === 'Warten' ? 'selected' : ''}>Warten</option>
            </select>
            
            <div class="case-actions" style="display: flex; gap: 5px;">
                <button class="edit-title-button" style="background:none; border:none; padding: 0 4px; cursor:pointer;">✎</button>
                <button class="delete-button" style="background:none; border:none; padding: 0 4px; cursor:pointer; color: #e74c3c;">&times;</button>
            </div>
        </div>
    </div>
`;

        
        // Event Listener für Status-Änderung
        const statusSelect = li.querySelector('.status-select');
        statusSelect.addEventListener('change', async (e) => {
             e.stopPropagation(); // Verhindert, dass sich die Details öffnen
             const newStatus = e.target.value;
             
             try {
                 const res = await fetch(`${API_BASE_URL}/api/cases/${caseItem.id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ status: newStatus })
                 });
                 if(res.ok) {
                     // Farbe sofort aktualisieren
                     statusSelect.className = 'status-select';
                     statusSelect.classList.add(`status-${newStatus.toLowerCase().replace(/\s/g, '-')}`);
                 }
             } catch(err) { showNotification('Status konnte nicht gespeichert werden', 'error'); }
        });

        // Klick auf die Zeile öffnet Details (Ignoriert Klicks auf Select/Button)
        li.addEventListener('click', (e) => {
            if (e.target.tagName === 'SELECT' || e.target.closest('button')) return; 
            document.querySelectorAll('#history-list li').forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            showCaseDetails(caseItem.id);
        });

        // Edit Button (unverändert)
        const editButton = li.querySelector('.edit-title-button');
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const newTitle = prompt('Neuer Titel:', titleText);
            if (newTitle && newTitle.trim() !== '') {
                renameCase(caseItem.id, newTitle.trim(), li.querySelector('.case-title'));
            }
        });

        // Delete Button (unverändert)
        const deleteButton = li.querySelector('.delete-button');
        deleteButton.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Fall unwiderruflich löschen?')) {
                try {
                    const response = await fetch(`${API_BASE_URL}/api/cases/${caseItem.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (response.ok) {
                        fetchHistory();
                        resetMainContentView();
                    }
                } catch (error) { showNotification(error.message, 'error'); }
            }
        });

        historyList.appendChild(li);
    });
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

    async function showCaseDetails(caseId) {
    if (analyzeContainer) analyzeContainer.classList.add('hidden');
    if (resultContainer) resultContainer.classList.add('hidden');
    historyDetailContainer.classList.add('hidden');
    linkClientContainer.classList.add('hidden'); // Zuweisungs-UI erstmal verstecken

    const caseDocumentsContainer = document.getElementById('case-documents-container');

    try {
        const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        const caseDetails = await response.json();
        if (!response.ok) throw new Error(caseDetails.message);

        if (detailCaseTitle) {
            detailCaseTitle.textContent = caseDetails.customTitle || caseDetails.originalText;
        }

        let summary = 'Keine Zusammenfassung gefunden.';
        if (caseDetails.aiExplanation && typeof caseDetails.aiExplanation === 'object') {
            summary = caseDetails.aiExplanation.zusammenfassung || 'Keine Zusammenfassung im Objekt gefunden.';
        } else if (caseDetails.aiExplanation) {
            summary = caseDetails.aiExplanation;
        }

        detailExplanation.textContent = summary;
        detailNotes.value = caseDetails.notes || '';
        saveNotesButton.dataset.caseId = caseId;

        loadCaseChecklist(caseId);

   
        // Zeige die Zuweisungs-UI nur an, wenn der Nutzer ein B2B-Nutzer ist
        // UND der Fall noch keinen Klienten hat.
        if (currentUser.type === 'b2b' && !caseDetails.clientId) {
            linkClientSelect.innerHTML = '<option value="">-- Klient auswählen --</option>'; // Reset
            clients.forEach(client => {
                linkClientSelect.innerHTML += `<option value="${client.id}">${client.name}</option>`;
            });
            linkClientButton.dataset.caseId = caseId;
            linkClientContainer.classList.remove('hidden');
        }
       

        historyDetailContainer.classList.remove('hidden');
        
        const isPremium = currentUser.subscriptionStatus === 'active';
        if (currentUser.type === 'b2b' || isPremium) {
            // Nutzer ist B2B oder PREMIUM B2C -> Zeige das Feature und lade die Dokumente
            caseDocumentsContainer.classList.remove('hidden');
            await fetchAndRenderDocuments(caseId);
        } else {
            // Nutzer ist FREE B2C -> Verstecke das Feature
            caseDocumentsContainer.classList.add('hidden');
        }

    } catch (error) {
        showNotification('Details konnten nicht geladen werden.', 'error');
        resetMainContentView();
    }
}

async function fetchAndRenderDocuments(caseId) {
        const documentList = document.getElementById('document-list');
        const uploadForm = document.getElementById('upload-document-form');
        uploadForm.dataset.caseId = caseId; // Speichere die caseId am Formular
        documentList.innerHTML = '<li>Lade Dokumente...</li>';

        try {
            const response = await fetch(`${API_BASE_URL}/api/documents/case/${caseId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Dokumente konnten nicht geladen werden.');
            const documents = await response.json();

            documentList.innerHTML = '';
            if (documents.length === 0) {
                documentList.innerHTML = '<li>Keine Dokumente abgelegt.</li>';
            } else {
                documents.forEach(doc => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <a href="${API_BASE_URL}/${doc.filePath.replace(/\\/g, '/')}" target="_blank">${doc.fileName}</a>
                        <span>(${new Date(doc.createdAt).toLocaleDateString('de-DE')})</span>
                        <button class="delete-document-button" data-doc-id="${doc.id}">×</button>
                    `;
                    documentList.appendChild(li);
                });
            }
        } catch (error) {
            documentList.innerHTML = `<li>Fehler: ${error.message}</li>`;
        }
    }



    async function fetchClients() {
    if (!clientList) return;

    // Setze den Ladezustand
    clientList.innerHTML = '<li>Lade Klienten... <div class="inline-spinner"></div></li>';

    try {
        const response = await fetch(`${API_BASE_URL}/api/clients?type=letter`, { headers: { 'Authorization': `Bearer ${authToken}` } });
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
                 resetMainContentView();
                 fetchHistory();
            });

            editButton.addEventListener('click', (e) => {
                e.stopPropagation();
                openClientDetails(client);
            });
            
            deleteButton.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm(`Sind Sie sicher, dass Sie den Klienten "${client.name}" und ALLE seine Fälle unwiderruflich löschen möchten?`)) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/clients/${client.id}`, { 
                            method: 'DELETE', 
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        if (!response.ok) throw new Error('Klient konnte nicht gelöscht werden.');
                        resetMainContentView();
                        fetchClients();
                        historyList.innerHTML = '<li>Klient gelöscht. Bitte neuen Klienten auswählen.</li>';
                    } catch (error) {
                        showNotification(error.message, 'error');
                    }
                }
            });
            
            clientList.appendChild(li);
        });
    }

function showDefaultAuthView() {
    if (defaultAuthView) defaultAuthView.classList.remove('hidden');
    if (resetPasswordContainer) resetPasswordContainer.classList.add('hidden');
}

function showRequestResetView() {
    console.log("DEBUG: showRequestResetView wird aufgerufen.");
    if (defaultAuthView) defaultAuthView.classList.add('hidden');
    if (resetPasswordContainer) resetPasswordContainer.classList.remove('hidden');

    // Formular 1 SICHTBAR machen (Klasse entfernen UND Style setzen)
    if (requestResetForm) {
        requestResetForm.classList.remove('hidden');
        requestResetForm.style.display = 'block';
    }
    // Formular 2 UNSICHTBAR machen (Klasse hinzufügen UND Style setzen)
    if (doResetForm) {
        doResetForm.classList.add('hidden');
        doResetForm.style.display = 'none';
    }
}

// Neue, kombinierte Version für das Öffnen des Links
function showResetPasswordView() {
    console.log("DEBUG: showResetPasswordView wird aufgerufen.");
    if (defaultAuthView) defaultAuthView.classList.add('hidden');
    if (resetPasswordContainer) resetPasswordContainer.classList.remove('hidden');

    // Formular 1 UNSICHTBAR machen (Klasse hinzufügen UND Style setzen)
    if (requestResetForm) {
        requestResetForm.classList.add('hidden');
        requestResetForm.style.display = 'none';
    }
    // Formular 2 SICHTBAR machen (Klasse entfernen UND Style setzen)
    if (doResetForm) {
        doResetForm.classList.remove('hidden');
        doResetForm.style.display = 'block';
    }
}

    function setupScrollAnimation() {
        const elementsToFadeIn = document.querySelectorAll('.fade-in-element');
        if (elementsToFadeIn.length === 0) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        elementsToFadeIn.forEach(element => { observer.observe(element); });
    }

    function displaySignature(path) {
    const previewContainer = document.getElementById('signature-preview-container');
    const deleteButton = document.getElementById('delete-signature-button');

    // Leere zuerst immer die Vorschau
    previewContainer.innerHTML = '';

    if (path) {
        // WENN ein Pfad zur Unterschrift existiert:
        // 1. Erstelle ein neues Bild-Element
        const img = document.createElement('img');
        img.src = `${API_BASE_URL}/${path.replace(/\\/g, '/')}`;
        img.alt = 'Ihre gespeicherte Unterschrift';
        img.style.maxWidth = '200px';
        img.style.border = '1px solid #eee';
        
        // 2. Füge das Bild zur Vorschau hinzu
        previewContainer.appendChild(img);

        // 3. Zeige den Löschen-Button an
        deleteButton.classList.remove('hidden');
    } else {
        // WENN kein Pfad existiert:
        // 1. Verstecke den Löschen-Button
        deleteButton.classList.add('hidden');
    }
}

async function loadGlobalTodos() {
    const list = document.getElementById('global-todo-list');
    if(!list) return;
    list.innerHTML = '';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/user/todos`, { headers: { 'Authorization': `Bearer ${authToken}` }});
        const todos = await res.json();
        
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.isDone ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" ${todo.isDone ? 'checked' : ''}>
                <span>${todo.text}</span>
                <button class="todo-delete-btn">&times;</button>
            `;
            
            // Toggle Event
            li.querySelector('input').addEventListener('change', async (e) => {
                await fetch(`${API_BASE_URL}/api/user/todos/${todo.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ isDone: e.target.checked ? 1 : 0 })
                });
                li.classList.toggle('completed');
            });

            // Delete Event
            li.querySelector('button').addEventListener('click', async () => {
                await fetch(`${API_BASE_URL}/api/user/todos/${todo.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` }});
                li.remove();
            });
            
            list.appendChild(li);
        });
    } catch(e) { console.error(e); }
}

// Event Listener für Hinzufügen Button
document.getElementById('add-global-todo-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('global-todo-input');
    if(!input.value) return;
    await fetch(`${API_BASE_URL}/api/user/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ text: input.value })
    });
    input.value = '';
    loadGlobalTodos();
});

async function loadCaseChecklist(caseId) {
    const list = document.getElementById('case-checklist-list');
    const addBtn = document.getElementById('add-checklist-item-btn');
    if(!list) return;
    list.innerHTML = 'Lade...';
    
    // Speichere CaseID im Button für den Click-Handler
    addBtn.dataset.currentCaseId = caseId;

    try {
        const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/checklist`, { headers: { 'Authorization': `Bearer ${authToken}` }});
        const items = await res.json();
        list.innerHTML = '';

        items.forEach(item => {
            const li = document.createElement('li');
            li.className = `todo-item ${item.isDone ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" ${item.isDone ? 'checked' : ''}>
                <span>${item.text}</span>
                <button class="todo-delete-btn no-print">&times;</button>
            `;
            
            li.querySelector('input').addEventListener('change', async (e) => {
                await fetch(`${API_BASE_URL}/api/cases/checklist/${item.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ isDone: e.target.checked ? 1 : 0 })
                });
                li.classList.toggle('completed');
            });

            li.querySelector('button').addEventListener('click', async () => {
                await fetch(`${API_BASE_URL}/api/cases/checklist/${item.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${authToken}` }});
                li.remove();
            });
            list.appendChild(li);
        });
    } catch(e) { console.error(e); }
}

// Event Listener für Checkliste Hinzufügen (Nur einmal global registrieren!)
document.getElementById('add-checklist-item-btn')?.addEventListener('click', async (e) => {
    const caseId = e.target.dataset.currentCaseId;
    const input = document.getElementById('case-checklist-input');
    if(!input.value || !caseId) return;

    await fetch(`${API_BASE_URL}/api/cases/${caseId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ text: input.value })
    });
    input.value = '';
    loadCaseChecklist(caseId);
});

    // =======================================================================
    // BLOCK 4: EVENT-LISTENER
    // =======================================================================

   const restartTourLink = document.getElementById('restart-tour-link');
if (restartTourLink) {
    restartTourLink.addEventListener('click', (e) => {
        e.preventDefault();

        // 1. Alle möglichen "Tour gesehen"-Vermerke löschen, um einen Neustart zu erzwingen
        localStorage.removeItem('clerion_free_tour_completed');
        localStorage.removeItem('clerion_b2b_tour_completed');
        localStorage.removeItem('clerion_upgrade_tour_completed');

        // 2. Prüfen, welcher Nutzer aktiv ist und die passende Tour starten
        if (currentUser) {
            if (currentUser.type === 'b2b') {
                startB2BUserTour();
            } else { // B2C Nutzer
                const hasActiveSubscription = currentUser.subscriptionStatus === 'active' || currentUser.subscriptionStatus === 'premium_plus';
                
                // Wenn der Nutzer ein Abo hat, zeigen wir ihm die Upgrade-Tour,
                // da diese die Premium-Funktionen erklärt.
                if (hasActiveSubscription) {
                    startUpgradeTour();
                } else {
                    // Ansonsten die normale Tour für Free-Nutzer.
                    startFreeUserTour();
                }
            }
        }
    });
}

    if (subscribePlusButton) {
    subscribePlusButton.addEventListener('click', async () => {
        try {
            // Ruft die neue Backend-Route für den B2C-Plus-Checkout auf
            const response = await fetch(`${API_BASE_URL}/api/stripe/create-b2c-plus-checkout`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (response.ok) {
                window.open(data.url, '_blank');
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            showNotification(error.message, 'error');
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
    

    const documentFileInput = document.getElementById('document-file-input');
    const documentFileNameDisplay = document.getElementById('document-file-name');

    if(documentFileInput && documentFileNameDisplay) {
        documentFileInput.addEventListener('change', () => {
            if (documentFileInput.files.length > 0) {
                documentFileNameDisplay.textContent = documentFileInput.files[0].name;
            } else {
                documentFileNameDisplay.textContent = 'Keine Datei ausgewählt';
            }
        });
    }

    if (uploadDocumentForm) {
        uploadDocumentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const caseId = e.target.dataset.caseId;
            const fileInput = document.getElementById('document-file-input');
            const file = fileInput.files[0];

            if (!file) return showNotification('Bitte eine Datei auswählen.', 'error');

            const formData = new FormData();
            formData.append('documentFile', file);

            try {
                const response = await fetch(`${API_BASE_URL}/api/documents/case/${caseId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    body: formData
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                showNotification('Dokument erfolgreich hochgeladen!', 'success');
                fileInput.value = ''; // Input zurücksetzen
                fetchAndRenderDocuments(caseId); // Liste aktualisieren
            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            }
        });
    }

    if (documentListContainer) {
        documentListContainer.addEventListener('click', async (e) => {
            if (e.target && e.target.classList.contains('delete-document-button')) {
                const docId = e.target.dataset.docId;
                const caseId = document.getElementById('upload-document-form').dataset.caseId;

                if (confirm('Sind Sie sicher, dass Sie dieses Dokument endgültig löschen möchten?')) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/api/documents/${docId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${authToken}` }
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.message);

                        showNotification('Dokument erfolgreich gelöscht.', 'success');
                        fetchAndRenderDocuments(caseId); // Liste aktualisieren
                    } catch (error) {
                        showNotification(`Fehler: ${error.message}`, 'error');
                    }
                }
            }
        });
    }



    if (clientInfoSelector) {
        clientInfoSelector.addEventListener('change', (e) => {
            const selectedId = e.target.value;
            if (!selectedId) return;

            const selectedClient = clients.find(client => client.id == selectedId);
            if (selectedClient) {
                // Ruft die bereits existierende Funktion zum Öffnen des Detail-Popups auf
                openClientDetails(selectedClient);
            }

            // Setzt das Dropdown nach der Auswahl direkt wieder zurück
            e.target.value = '';
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


    if(dateSearchButton) {
        dateSearchButton.addEventListener('click', () => {
            const startDate = document.getElementById('start-date-input').value;
            const endDate = document.getElementById('end-date-input').value;
            fetchHistory(startDate || null, endDate || null);
        });
    }
    
// --- Logik für die Anzeige des Dateinamens ---

const fileNameDisplay = document.getElementById('file-name-display');

if (signatureFileInput && fileNameDisplay && signaturePreviewContainer) {
    signatureFileInput.addEventListener('change', () => {
        // Leere die Vorschau und verstecke den Löschen-Button, wenn eine neue Datei gewählt wird
        signaturePreviewContainer.innerHTML = '';
        document.getElementById('delete-signature-button').classList.add('hidden');

        if (signatureFileInput.files.length > 0) {
            const file = signatureFileInput.files[0];
            fileNameDisplay.textContent = file.name;

            // NEU: Erstelle eine lokale Vorschau des Bildes, BEVOR es hochgeladen wird
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = 'Vorschau der hochzuladenden Unterschrift';
                img.style.maxWidth = '200px';
                img.style.border = '1px solid #eee';
                img.style.marginTop = '1rem';
                img.style.display = 'block';
                img.style.margin = '1rem auto 0';
                signaturePreviewContainer.appendChild(img);
            }
            reader.readAsDataURL(file); // Liest die Bild-Datei für die Vorschau ein

        } else {
            fileNameDisplay.textContent = '';
        }
    });
}

// --- KOMPLETTE LOGIK FÜR SIGNATUR-PAD & UPLOAD ---

// Zuerst holen wir uns alle neuen HTML-Elemente
const openSignaturePadButton = document.getElementById('open-signature-pad-button');
const openUploadButton = document.getElementById('open-upload-button');
const signatureUploadForm = document.getElementById('signature-upload-form');

const signatureModalOverlay = document.getElementById('signature-modal-overlay');
const closeSignatureModalButton = document.getElementById('close-signature-modal-button');
const canvas = document.getElementById('signature-canvas');
const signatureSaveButton = document.getElementById('signature-save-button');
const signatureClearButton = document.getElementById('signature-clear-button');

// Prüfe, ob das Canvas-Element existiert, bevor die Logik ausgeführt wird
if (canvas) {
    const signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255, 0)'
    });

    function resizeCanvas() {
        if (!canvas.parentElement) return;
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.parentElement.offsetWidth * ratio;
        canvas.height = canvas.parentElement.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }

    // Canvas bei Größenänderung des Fensters anpassen
    window.addEventListener("resize", resizeCanvas);

    // Event-Listener zum Öffnen des Modals
    if (openSignaturePadButton) {
        openSignaturePadButton.addEventListener('click', () => {
            signatureModalOverlay.classList.remove('hidden');
            setTimeout(resizeCanvas, 0); 
        });
    }

    // Event-Listener zum Anzeigen des Upload-Formulars
    if (openUploadButton) {
        openUploadButton.addEventListener('click', () => {
            signatureUploadForm.classList.toggle('hidden');
        });
    }

    // Event-Listeners zum Schließen des Modals
    if (closeSignatureModalButton) {
        closeSignatureModalButton.addEventListener('click', () => signatureModalOverlay.classList.add('hidden'));
    }
    if (signatureModalOverlay) {
        signatureModalOverlay.addEventListener('click', (e) => {
            if (e.target === signatureModalOverlay) signatureModalOverlay.classList.add('hidden');
        });
    }

    // Event-Listener für "Leeren"-Button im Modal
    if(signatureClearButton) {
        signatureClearButton.addEventListener('click', () => {
            signaturePad.clear();
        });
    }

    // Event-Listener für "Zeichnung speichern"-Button im Modal
    if(signatureSaveButton) {
        signatureSaveButton.addEventListener('click', async () => {
            if (signaturePad.isEmpty()) {
                showNotification('Bitte unterschreiben Sie zuerst im Feld.', 'error');
                return;
            }
            const dataURL = signaturePad.toDataURL("image/png");
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/signature-from-data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ signatureDataUrl: dataURL })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                showNotification(data.message, 'success');
                displaySignature(data.path);
                signatureModalOverlay.classList.add('hidden');
            } catch (error) {
                showNotification('Fehler: ' + error.message, 'error');
            }
        });
    }
}

    const openDeleteModalButton = document.getElementById('open-delete-modal-button');
const deleteModalOverlay = document.getElementById('delete-modal-overlay');
const closeModalButton = document.getElementById('close-modal-button');
const finalDeleteButton = document.getElementById('final-delete-button');

if (openDeleteModalButton) {
    openDeleteModalButton.addEventListener('click', () => {
        // Modal-Inhalt für B2C füllen
        document.getElementById('delete-modal-title').textContent = 'Konto wirklich löschen?';
        document.getElementById('delete-modal-text').textContent = 'Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre persönlichen Daten und Fallverläufe werden unwiderruflich gelöscht.';
        document.getElementById('delete-modal-warning').textContent = 'Ein aktives Abonnement bei Stripe wird hierdurch NICHT gekündigt. Bitte kündigen Sie dieses vorher.';
        
        // Finalen Löschen-Button mit der richtigen Aktion verbinden
        finalDeleteButton.onclick = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/user/account`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                
                showNotification('Ihr Konto wurde gelöscht. Sie werden abgemeldet.', 'success');
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

// Event Listener zum Schließen des Modals
if (closeModalButton) closeModalButton.addEventListener('click', () => deleteModalOverlay.classList.add('hidden'));
if (deleteModalOverlay) deleteModalOverlay.addEventListener('click', (e) => {
    if (e.target === deleteModalOverlay) {
        deleteModalOverlay.classList.add('hidden');
    }
});

 

    if (deleteSignatureButton) {
    deleteSignatureButton.addEventListener('click', async () => {
        if (!confirm('Sind Sie sicher, dass Sie Ihre gespeicherte Unterschrift löschen möchten?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/signature`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
showNotification('Unterschrift erfolgreich gelöscht.', 'success');
// Rufe die Hilfsfunktion mit 'null' auf, um die Anzeige zu leeren und den Button zu verstecken
displaySignature(null);

        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
    }

    // LISTENER für den "Alle Fälle anzeigen"-Button
if (showAllCasesButton) {
    showAllCasesButton.addEventListener('click', () => {
        // Schritt 1: Setze die Klienten-Auswahl zurück
        selectedClientId = null;

        // Schritt 2: Entferne die blaue Markierung von allen Klienten-Listeneinträgen
        document.querySelectorAll('#client-list li').forEach(item => {
            item.classList.remove('selected');
        });

        // =======================================================
        // NEUE ZEILE: Entfernt die Markierung auch von der Fall-Liste
        // =======================================================
        document.querySelectorAll('#history-list li').forEach(item => {
            item.classList.remove('selected');
        });
        // =======================================================

        // Schritt 4: Setze die Detailansicht zurück und lade den allgemeinen Verlauf
        resetMainContentView();
        fetchHistory();
    });
}

    // NEUER LISTENER für den Zuweisungs-Button
if (linkClientButton) {
    linkClientButton.addEventListener('click', async () => {
        const caseId = linkClientButton.dataset.caseId;
        const newClientId = linkClientSelect.value;

        if (!newClientId) {
            showNotification('Bitte einen Klienten aus der Liste auswählen.', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/link-client`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ newClientId: newClientId })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message);

            showNotification(result.message, 'success');
            resetMainContentView(); // Zurück zur Hauptansicht
            fetchHistory(); // Verlauf neu laden, um die Änderung zu sehen

        } catch (error) {
            showNotification('Fehler: ' + error.message, 'error');
        }
    });
}

    // Listener für Button Aboverwaltung
/*if (manageSubscriptionButton) {
    manageSubscriptionButton.addEventListener('click', async () => {
        try {
            // Diese Route ist für B2C nicht vorhanden, wir müssen sie in stripe.js erstellen
            // Fürs Erste leiten wir einfach zum Stripe-Kundenportal
            // HINWEIS: Hierfür muss der Nutzer eine stripeCustomerId haben.
             const response = await fetch(`${API_BASE_URL}/api/stripe/create-portal-session-b2c`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await response.json();
            if(response.ok) window.open(data.url, '_blank');
            else throw new Error(data.message);
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}*/

    // Listener für Premium Button
if (subscribeButton) {
    subscribeButton.addEventListener('click', async () => {
        try {
            // Rufe die neue Backend-Route auf, um die Bezahlseite zu erstellen
            const response = await fetch(`${API_BASE_URL}/api/stripe/create-b2c-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Leite den Nutzer zur von Stripe generierten Bezahlseite weiter
                window.open(data.url, '_blank');
            } else {
                throw new Error(data.message || 'Fehler beim Starten des Bezahlvorgangs.');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

// Dieser Code-Block macht das Upload-Formular funktionsfähig
if (signatureUploadForm) {
    signatureUploadForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Verhindert, dass die Seite neu lädt
        const file = signatureFileInput.files[0];
        if (!file) {
            showNotification('Bitte wählen Sie eine Datei aus.', 'error');
            return;
        }

        const formData = new FormData(); // Wie ein digitaler Briefumschlag für unsere Datei
        formData.append('signatureFile', file);

        try {
            // Sende die Datei an unsere neue Backend-Route
            const response = await fetch(`${API_BASE_URL}/api/user/signature`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
showNotification('Ihre Unterschrift wurde erfolgreich gespeichert!', 'success');
// Rufe auch hier einfach unsere Hilfsfunktion auf
displaySignature(data.path);

        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}
    

  // Listener für das Antwortdropdown
    const templateSelect = document.getElementById('template-select');
const freitextInputForTemplate = document.getElementById('freitext-input');

if (templateSelect && freitextInputForTemplate) {
    templateSelect.addEventListener('change', (e) => {
        const selectedValue = e.target.value;
        let templateText = '';
        switch (selectedValue) {
            case 'widerspruch':
                templateText = "Ich lege hiermit Widerspruch gegen Ihren Bescheid ein. Bitte setzen Sie die Vollstreckung aus, bis die Angelegenheit geprüft wurde.";
                break;
            case 'ratenzahlung':
                templateText = "Aufgrund meiner aktuellen finanziellen Situation kann ich die Forderung nicht auf einmal begleichen. Ich bitte um die Möglichkeit einer Ratenzahlung und schlage eine monatliche Rate von [BETRAG] Euro vor.";
                break;
            case 'fristverlaengerung':
                templateText = "Ich bitte um eine Fristverlängerung von 14 Tagen, um alle notwendigen Unterlagen zusammenzustellen und die Situation sorgfältig zu prüfen.";
                break;
            case 'unterlagen_nachgereicht':
                templateText = "Bezugnehmend auf Ihre Aufforderung möchte ich Sie darauf hinweisen, dass die geforderten Unterlagen bereits am [DATUM] von mir eingereicht wurden. Bitte prüfen Sie Ihre internen Vorgänge.";
                break;
            default:
                templateText = '';
        }
        freitextInputForTemplate.value = templateText;
    });
}


  if (dropzone && fileInput) {
    // Klick-Event, um den Dateidialog zu öffnen
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag & Drop Events für das visuelle Feedback
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('active');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('active');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('active');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            // Löst das 'change'-Event manuell aus, damit unser Listener unten darauf reagiert
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });

    // Der EINE, zentrale Listener, der auf jede Datei-Änderung reagiert
    fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
    
            resetFileUploadView(); // Setzt eine eventuell vorhandene alte Auswahl zurück
    
            if (file.type.match('image.*')) {
                showNotification('Bild ausgewählt. Klicken Sie auf "Jetzt erklären lassen".', 'success');
                uploadedImageFile = file; // Das Bild in unserer Variable "merken"
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imgPreview = document.createElement('img');
                    imgPreview.classList.add('preview');
                    imgPreview.src = event.target.result;
                    imgPreview.style.maxWidth = '100%';
                    imgPreview.style.maxHeight = '200px';
                    dropzone.appendChild(imgPreview);
                };
                reader.readAsDataURL(file);
            }
            else if (file.type === 'application/pdf') {
                loadingSpinner.classList.remove('hidden');
                analyzeButton.disabled = true;
                showNotification('PDF wird gelesen...', 'success');
                
                const pdfFormData = new FormData();
                pdfFormData.append('document', file);
                
                try {
                    const response = await fetch(`${API_BASE_URL}/api/cases/extract-text-from-pdf`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${authToken}` },
                        body: pdfFormData
                    });
                    
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message);
                    
                    document.getElementById('letter-text').value = data.text;
                    textTabButton.click(); 
                    showNotification('Text wurde erfolgreich aus dem PDF extrahiert.', 'success');
                } catch (error) {
                    showNotification('Fehler: ' + error.message, 'error');
                } finally {
                    loadingSpinner.classList.add('hidden');
                    analyzeButton.disabled = false;
                }
            }
            else {
                showNotification('Bitte laden Sie nur Bilder oder PDF-Dateien hoch.', 'error');
            }
            
            e.target.value = ''; // Diese Zeile kann bleiben, da wir das Bild in `uploadedImageFile` haben
        });
    }

   
   
    // Listener für das Login-Formular
// Listener für das Login-Formular
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const submitBtn = loginForm.querySelector('button[type="submit"]');

        try {
            // Button deaktivieren, um Doppelklicks zu vermeiden
            if(submitBtn) submitBtn.disabled = true;
            if(submitBtn) submitBtn.textContent = 'Prüfe...';

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                // 1. Token speichern
                localStorage.setItem('behoerdenhilfe_token', data.token);
                localStorage.setItem('currentUser', JSON.stringify(data.user));

                // 2. ANIMATION STARTEN
                const overlay = document.getElementById('login-animation-overlay');
                if (overlay) {
                    overlay.classList.remove('hidden'); // hidden entfernen falls vorhanden
                    // Kleiner Timeout damit der Browser das Entfernen von hidden registriert
                    setTimeout(() => {
                        overlay.classList.add('active'); // Startet die CSS Animation
                    }, 10);

                    // 3. Nach der Animation (z.B. 2000ms) weiterleiten
                    setTimeout(() => {
                        if (data.user.role === 'owner') {
                            window.location.href = 'admin.html';
                        } else {
                            // Dashboard neu laden um eingeloggt zu sein
                            window.location.reload(); 
                        }
                    }, 2000); 
                } else {
                    // Fallback falls Overlay fehlt: Sofort weiter
                    window.location.reload();
                }

            } else {
                showNotification(data.message || 'Falscher Benutzername oder Passwort.', 'error');
                if(submitBtn) submitBtn.disabled = false;
                if(submitBtn) submitBtn.textContent = 'Login';
            }
        } catch (error) {
            showNotification('Verbindung zum Server fehlgeschlagen.', 'error');
            if(submitBtn) submitBtn.disabled = false;
            if(submitBtn) submitBtn.textContent = 'Login';
        }
    });
}

// Listener für das Registrierungs-Formular
if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
    if (password !== confirmPassword) {
        showNotification('Die Passwörter stimmen nicht überein.', 'error');
        return;
    }
            
            const requestBody = {
                username,
                password,
                // Wenn ein Einladungs-Token da ist, ist der Typ egal. Sonst nehmen wir den vom Radio-Button.
                type: inviteToken ? 'b2b_member' : document.querySelector('input[name="accountType"]:checked').value,
                inviteToken: inviteToken // Sende den Token mit (kann null sein)
            };
            

            try {
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestBody)
                });
                const data = await response.json();
                authMessage.textContent = data.message;
                if (response.ok) {
                    registerForm.reset();
                    
                    showNotification('Registrierung erfolgreich! Bitte loggen Sie sich jetzt ein.', 'success');
                    // Nach erfolgreicher Einladungs-Registrierung zur normalen Login-Seite "zurückkehren"
                    if(inviteToken) window.location.href = 'dashboard.html?registration=success';
                }
            } catch (error) {
                authMessage.textContent = 'Verbindung zum Server fehlgeschlagen.';
            }
        });
    }


// Listener für den Logout-Button
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('behoerdenhilfe_token');
        window.location.href = 'index.html'; // Zurück zur Startseite
    });
}

// Listener für den "Zurück zur Analyse"-Button
if (backToAnalyzeButton) {
    backToAnalyzeButton.addEventListener('click', () => {
        resetMainContentView();
    });
}

// Listener für die Tabs (Text/Datei)
if (textTabButton) {
    textTabButton.addEventListener('click', () => {
        activeTab = 'text';
        textTabButton.classList.add('active');
        fileTabButton.classList.remove('active');
        textInputContainer.classList.remove('hidden');
        fileInputContainer.classList.add('hidden');
    });
}
if (fileTabButton) {
    fileTabButton.addEventListener('click', () => {
        activeTab = 'file';
        fileTabButton.classList.add('active');
        textTabButton.classList.remove('active');
        fileInputContainer.classList.remove('hidden');
        textInputContainer.classList.add('hidden');
    });
}

// Listener für das Hinzufügen von B2B-Klienten
if (addClientForm) {
    addClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = clientNameInput.value.trim();
        if (!name) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/clients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({ name, type: 'letter' })
            });
            if (response.ok) {
                clientNameInput.value = '';
                fetchClients();
            }
        } catch (error) {
            console.error(error);
        }
    });
}

// Listener für die Intent-Buttons (Widerspruch etc.)
if (intentButtons && intentButtons.length > 0) {
    intentButtons.forEach(button => {
        button.addEventListener('click', () => {
            intentButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            const intentValue = button.dataset.intent;
            if (intentValue === 'freitext') {
                freitextContainer.classList.remove('hidden');
                selectedIntent = { type: 'freitext', freitext: freitextInput.value };
                downloadPdfButton.classList.toggle('hidden', freitextInput.value.trim() === '');
            } else {
                freitextContainer.classList.add('hidden');
                selectedIntent = { type: 'predefined', value: intentValue };
                downloadPdfButton.classList.remove('hidden');
            }
        });
    });
}

// Listener für die Freitext-Eingabe
if (freitextInput) {
    freitextInput.addEventListener('input', (e) => {
        if (selectedIntent && selectedIntent.type === 'freitext') {
            selectedIntent.freitext = e.target.value;
            downloadPdfButton.classList.toggle('hidden', e.target.value.trim() === '');
        }
    });
}

// Listener für den Blanko-Analyse-Button

    if (startBlankLetterButton) {
        startBlankLetterButton.addEventListener('click', async () => {
            loadingSpinner.classList.remove('hidden');
            startBlankLetterButton.disabled = true;
            analyzeButton.disabled = true;

            try {
                const response = await fetch(`${API_BASE_URL}/api/cases/create-blank`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ clientId: selectedClientId })
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                currentCaseId = data.caseId;
                lastAnalysisResult = data.explanation;

                // NEUE LOGIK: Aktualisiert den Zählerstand im Frontend
                if (currentUser.type === 'b2c' && data.newPdfCount !== undefined) {
                    currentUser.pdfCount = data.newPdfCount;
                    pdfCounterSpan.textContent = data.newPdfCount;
                    // Rufe updateUI erneut auf, um die Buttons bei Bedarf zu sperren
                    updateUI();
                }

                analyzeContainer.classList.add('hidden');
                resultContainer.classList.remove('hidden');
                intentContainer.classList.remove('hidden');
                populateClientInfoSelector();

                document.getElementById('explanation-text').innerHTML = '<p><em>Sie erstellen ein neues Dokument ohne vorherige Analyse.</em></p>';
                document.getElementById('case-reference').value = '';

                // fetchHistory() wird hier nicht mehr benötigt, da es in updateUI aufgerufen wird

            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                loadingSpinner.classList.add('hidden');
                // Die Reaktivierung der Buttons wird jetzt von updateUI() gesteuert
            }
        });
    }

// Listener für den Haupt-Analyse-Button
if (analyzeButton) {
        analyzeButton.addEventListener('click', async (e) => {
            historyDetailContainer.classList.add('hidden');
            const formData = new FormData();
            let isValid = false;
    
            if (activeTab === 'text') {
                const text = document.getElementById('letter-text').value.trim();
                if (text) {
                    formData.append('letterText', text);
                    isValid = true;
                } else {
                    showNotification("Bitte gib einen Text ein.", 'error');
                    return;
                }
            } else { // Fall für den Datei-Tab
                const file = uploadedImageFile; // Wir verwenden unsere "gemerkte" Datei
                if (file) {
                    formData.append('letterImages', file);
                    isValid = true;
                } else {
                    showNotification("Bitte wähle eine Bilddatei aus.", 'error');
                    return;
                }
            }
    
            if (!isValid) return;
    
            if (currentUser.type === 'b2b' && selectedClientId) {
                formData.append('clientId', selectedClientId);
            }
    
            loadingSpinner.classList.remove('hidden');
            analyzeButton.disabled = true;
            resultContainer.classList.add('hidden');
            currentCaseId = null;
    
            try {
                const response = await fetch(`${API_BASE_URL}/api/cases`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    body: formData
                });
    
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
    
                lastAnalysisResult = data.explanation;
    
                const explanationElement = document.getElementById('explanation-text');
                let detailsHtml = `<p>${lastAnalysisResult.zusammenfassung || 'Keine Zusammenfassung verfügbar.'}</p>`;
                if (lastAnalysisResult.aktionen && lastAnalysisResult.aktionen.length > 0) {
                    detailsHtml += `<h4>Nächste Schritte:</h4><ul>`;
                    lastAnalysisResult.aktionen.forEach(aktion => {
                        detailsHtml += `<li>${aktion.beschreibung}</li>`;
                    });
                    detailsHtml += `</ul>`;
                }
                if (lastAnalysisResult.fristen && lastAnalysisResult.fristen.length > 0) {
                    detailsHtml += `<h4 style="color: var(--primary-color);">Wichtige Fristen:</h4><ul>`;
                    lastAnalysisResult.fristen.forEach(frist => {
                        const d = new Date(frist.datum);
                        if (!isNaN(d)) {
                            detailsHtml += `<li><strong>${d.toLocaleDateString('de-DE')}:</strong> ${frist.beschreibung}</li>`;
                        }
                    });
                    detailsHtml += `</ul>`;
                }
                explanationElement.innerHTML = detailsHtml;
                document.getElementById('case-reference').value = lastAnalysisResult.aktenzeichen || '';
    
                currentCaseId = data.caseId;
                resultContainer.classList.remove('hidden');
                intentContainer.classList.remove('hidden');
                populateClientInfoSelector();

                if (activeTab === 'file') {
                    resetFileUploadView(); // KORREKTUR 3: Vorschau nach Analysestart zurücksetzen
                }

                if (currentUser.type === 'b2c') {
                    currentUser.pdfCount = data.newPdfCount;
                    pdfCounterSpan.textContent = data.newPdfCount;
                }
                fetchHistory();
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                loadingSpinner.classList.add('hidden');
                analyzeButton.disabled = false;
            }
        });
    }

// Listener für den PDF-Download-Button
if (downloadPdfButton) {
    downloadPdfButton.addEventListener('click', async () => {
        const freitextContent = document.getElementById('freitext-input').value.trim();
        const senderName = document.getElementById('sender-name').value;
        const senderAddress = document.getElementById('sender-address').value;
        const recipientName = document.getElementById('recipient-name').value;
        const recipientAddress = document.getElementById('recipient-address').value;
        const caseReference = document.getElementById('case-reference').value;

        if (!freitextContent) return showNotification("Bitte geben Sie Ihr Anliegen an.", 'error');
        if (!currentCaseId) return showNotification("Fehler: Kein aktiver Fall. Bitte neu analysieren.", 'error');

        let persona = 'me';
        if (currentUser.type === 'b2b') {
            const selectedPersonaEl = document.querySelector('input[name="persona"]:checked');
            if (selectedPersonaEl) persona = selectedPersonaEl.value;
        }

        showNotification('KI formuliert den Brieftext...', 'success');

        try {
            const response = await fetch(`${API_BASE_URL}/api/cases/generate-letter-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({
                    caseId: currentCaseId,
                    intent: { freitext: freitextContent },
                    sender: { name: senderName, address: senderAddress },
                    recipient: { name: recipientName, address: recipientAddress },
                    reference: caseReference,
                    persona: persona
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            reviewTextarea.value = data.letterText;
            finalPdfButton.dataset.subject = data.subject; // Betreff für später speichern
            reviewModalOverlay.classList.remove('hidden');

        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

// Listener für den "Finales PDF jetzt erstellen"-Button (im Korrektur-Fenster)
if (finalPdfButton) {
    finalPdfButton.addEventListener('click', async () => {
        const correctedText = reviewTextarea.value;
        const senderName = document.getElementById('sender-name').value;
        const senderAddress = document.getElementById('sender-address').value;
        const recipientName = document.getElementById('recipient-name').value;
        const recipientAddress = document.getElementById('recipient-address').value;
        const caseReference = document.getElementById('case-reference').value;
        const subjectLine = finalPdfButton.dataset.subject || "Antwort auf Ihre Nachricht";

        try {
            const response = await fetch(`${API_BASE_URL}/api/cases/generate-pdf-from-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify({
                    sender: { name: senderName, address: senderAddress },
                    recipient: { name: recipientName, address: recipientAddress },
                    reference: caseReference,
                    subject: subjectLine,
                    bodyText: correctedText
                })
            });

            if (!response.ok) throw new Error('PDF konnte nicht erstellt werden.');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'antwortschreiben.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            
            reviewModalOverlay.classList.add('hidden');

        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
}

if (closeReviewModalButton) {
    closeReviewModalButton.addEventListener('click', () => reviewModalOverlay.classList.add('hidden'));
}
if (reviewModalOverlay) {
    reviewModalOverlay.addEventListener('click', (e) => {
        if (e.target === reviewModalOverlay) reviewModalOverlay.classList.add('hidden');
    });
}

// Listener für das Speichern von Notizen
if (saveNotesButton) {
    saveNotesButton.addEventListener('click', async () => {
        const caseId = saveNotesButton.dataset.caseId;
        if (!caseId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` }, body: JSON.stringify({ notes: detailNotes.value }) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            showNotification(result.message, 'success');
        } catch (error) {
          showNotification('Fehler: Notizen konnten nicht gespeichert werden.', 'error');
            showNotification('Fehler: Notizen konnten nicht gespeichert werden.', 'error');
        }
    });
}

if(forgotPasswordLink) forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showRequestResetView(); });
if(backToLoginLink) backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); showDefaultAuthView(); });

if(requestResetForm) {
    requestResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reset-email').value;
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
        const data = await response.json();
        showNotification(data.message, 'success'); // Zeige die Erfolgs/Fehlermeldung
    });
}

if(doResetForm) {
    doResetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        if (newPassword !== confirmPassword) {
            
            showNotification('Die Passwörter stimmen nicht überein.', 'error');
return;
        }
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: resetToken, newPassword: newPassword })
        });
        const data = await response.json();
        showNotification(data.message, 'success');
        if(response.ok) {
    // Leite zur sauberen Login-Seite um, um den Token aus der URL zu entfernen
    window.location.href = 'dashboard.html';
}
    });
}

const senderInfoForm = document.getElementById('sender-info-form');
if (senderInfoForm) {
    senderInfoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Daten für das Backend (bleibt unverändert)
        const senderDataForBackend = {
            contactPhone: document.getElementById('sender-info-phone').value,
            contactEmail: document.getElementById('sender-info-email').value,
            contactExtra: document.getElementById('sender-info-extra').value,
            contactExtra2: document.getElementById('sender-info-extra2').value
        };

        // 2. NEU: Angepasste Daten für den Browser-Speicher
        const fullname = document.getElementById('sender-info-fullname').value;
        const fulladdress = document.getElementById('sender-info-fulladdress').value;
        localStorage.setItem('user_saved_fullname', fullname);
        localStorage.setItem('user_saved_fulladdress', fulladdress);

        try {
            const response = await fetch(`${API_BASE_URL}/api/user/me/details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                body: JSON.stringify(senderDataForBackend)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            showNotification('Daten erfolgreich gespeichert!', 'success');
        } catch (error) {
            showNotification(`Fehler: ${error.message}`, 'error');
        }
    });
}

    const insertMyAddressButton = document.getElementById('insert-my-address-button');
if (insertMyAddressButton) {
    insertMyAddressButton.addEventListener('click', (e) => {
        e.preventDefault();

        // Lese die angepassten Daten aus dem Browser-Speicher
        const fullname = localStorage.getItem('user_saved_fullname') || '';
        const fulladdress = localStorage.getItem('user_saved_fulladdress') || '';

        // Prüfen, ob Daten gespeichert sind
        if (!fullname || !fulladdress) {
            showNotification('Sie haben noch keinen Namen und keine Adresse im Abschnitt "Ihre Absender-Daten" gespeichert.', 'error');
            return;
        }

        const senderNameInput = document.getElementById('sender-name');
        const senderAddressInput = document.getElementById('sender-address');

        // Felder 1:1 befüllen
        senderNameInput.value = fullname;
        senderAddressInput.value = fulladdress;

        showNotification('Ihre Absenderdaten wurden eingefügt.', 'success');
    });
}

const passwordToggles = document.querySelectorAll('.password-toggle');

    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Finde das zugehörige Input-Feld (es ist das Element direkt davor)
            const passwordInput = toggle.previousElementSibling;
            
            if (passwordInput.type === 'password') {
                // Passwort sichtbar machen
                passwordInput.type = 'text';
                toggle.textContent = '🔒'; // Icon zu einem "geschlossenen" Auge/Schloss ändern
            } else {
                // Passwort wieder verbergen
                passwordInput.type = 'password';
                toggle.textContent = '👁️'; // Icon zurück zum "offenen" Auge ändern
            }
        });
    });


    document.getElementById('show-login').onclick = () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    showLogin.classList.add('active');
    showRegister.classList.remove('active');
};

document.getElementById('show-register').onclick = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    showRegister.classList.add('active');
    showLogin.classList.remove('active');
};


const showLogin = document.getElementById('show-login');
const showRegister = document.getElementById('show-register');

    // =======================================================================
// BLOCK 5: INITIALER AUFRUF (NEUE, ASYNCHRONE VERSION)
// =======================================================================
// Wir erstellen eine kleine Start-Funktion, um await nutzen zu können
 async function initializeApp() {
    console.log("DEBUG: initializeApp startet.");
    await handleEmailVerification();
    const urlParams = new URLSearchParams(window.location.search);
    const resetTokenFromUrl = urlParams.get('reset_token');
    const inviteTokenFromUrl = urlParams.get('invite_token');

    // PRIORITÄT 1: Prüfen, ob ein Reset-Token in der URL ist.
    // Das hat Vorrang vor allem anderen.
    if (resetTokenFromUrl) {
        resetToken = resetTokenFromUrl;
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        showResetPasswordView();
        return; // Stoppt die Funktion hier, alles andere ist egal.
    }

    // PRIORITÄT 2: Prüfen, ob ein Einladungs-Token da ist.
    if (inviteTokenFromUrl) {
        inviteToken = inviteTokenFromUrl;
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
        
        // UI für die Einladung anpassen
        const registerFormTitle = document.querySelector('#register-form h2');
        if(registerFormTitle) registerFormTitle.textContent = 'Team-Einladung annehmen';
        if(loginForm) loginForm.classList.add('hidden');
        const accountTypeSelector = document.querySelector('.account-type-selector');
        if(accountTypeSelector) accountTypeSelector.classList.add('hidden');
        
        showDefaultAuthView();
        return; // Stoppt die Funktion auch hier.
    }
    
    // PRIORITÄT 3: Normaler Login-Check für wiederkehrende Besucher.
    // Das wird nur ausgeführt, wenn keine speziellen Tokens in der URL waren.
    await checkForPersistedLogin();

    // JETZT, NACHDEM WIR WISSEN, DASS DER NUTZER EINGELOGGT IST (`authToken` ist gesetzt),
    // laden wir die Signatur-Vorschau.
    
    if (authToken) {
      try {
    const response = await fetch(`${API_BASE_URL}/api/user/me/details`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (response.ok) {
        currentUserDetails = await response.json(); // Daten in unserer neuen Variable speichern
displaySignature(currentUserDetails.signaturePath); // Variable hier direkt weiterverwenden
if (senderInfoPhoneInput) senderInfoPhoneInput.value = currentUserDetails.contactPhone || '';
                if (senderInfoEmailInput) senderInfoEmailInput.value = currentUserDetails.contactEmail || '';
                if (senderInfoExtraInput) senderInfoExtraInput.value = currentUserDetails.contactExtra || '';
                if (senderInfoExtra2Input) senderInfoExtra2Input.value = currentUserDetails.contactExtra2 || '';
            }
            document.getElementById('sender-info-fullname').value = localStorage.getItem('user_saved_fullname') || '';
document.getElementById('sender-info-fulladdress').value = localStorage.getItem('user_saved_fulladdress') || '';
    
} catch (e) { console.error("Fehler beim Laden der Signatur-Vorschau", e); }
    }
      

    // Zum Schluss wird die UI aktualisiert, um entweder das Dashboard oder das Login-Formular anzuzeigen.
    updateUI();
    fetchAndRenderDeadlines();

    if (authToken && currentUser) {
        
        // Prüfen, ob der Nutzer gerade von einem erfolgreichen Upgrade kommt.
        const justUpgraded = urlParams.has('upgrade_success');

        if (currentUser.type === 'b2b') {
            // Starte die Tour für Geschäftskunden
            startB2BUserTour();
        } else { // Logik für B2C-Nutzer
    // Prüft, ob der Nutzer ein aktives Abo hat
    const hasActiveSubscription = currentUser.subscriptionStatus === 'active' || currentUser.subscriptionStatus === 'premium_plus';

    if (justUpgraded) {
        // Fall 1: Der Nutzer kommt DIREKT vom Kauf. Höchste Priorität.
        // Starte die Upgrade-Tour, um die neuen Features zu zeigen.
        startUpgradeTour();
        // Bereinige die URL für zukünftige Besuche.
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

    } else if (hasActiveSubscription) {
        // Fall 2: Der Nutzer hat ein aktives Abo, kommt aber nicht direkt vom Kauf.
        // Starte ebenfalls die Upgrade-Tour. Die Funktion selbst verhindert einen Neustart,
        // falls sie schon abgeschlossen wurde (via localStorage).
        startUpgradeTour();

    } else {
        // Fall 3: Der Nutzer ist B2C und hat KEIN aktives Abo.
        // Starte die normale Tour für Free-Nutzer.
        startFreeUserTour();
    }
}
    }

    

    

}

   initializeApp(); 

});