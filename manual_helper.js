document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://api.clerion.de'; // Ggf. anpassen für localhost
    const authToken = localStorage.getItem('behoerdenhilfe_token');

    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }

    // --- State ---
    let currentAppId = null;
    let appData = null; // Enthält structureJson
    let currentStepIndex = 0;
    
    // PDF State
    let pdfDoc = null;
    let pdfPageNum = 1;
    let pdfScale = 1.2;
    let pdfCanvas = document.getElementById('pdf-canvas');
    let ctx = pdfCanvas.getContext('2d');

    // --- DOM Elements ---
    const viewDashboard = document.getElementById('view-dashboard');
    const viewWorkspace = document.getElementById('view-workspace');
    const appList = document.getElementById('manual-app-list');
    const uploadModal = document.getElementById('upload-modal');
    const loadingOverlay = document.getElementById('loading-overlay');

    // --- Init ---
    // Worker Source für PDF.js setzen (WICHTIG)
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    fetchAppList();

    // --- Event Listeners ---
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.removeItem('behoerdenhilfe_token');
        window.location.href = 'index.html';
    });

    document.getElementById('back-to-dashboard-btn').addEventListener('click', () => {
        if(viewWorkspace.classList.contains('hidden')) {
            window.location.href = 'dashboard.html';
        } else {
            showDashboard();
        }
    });

    document.getElementById('open-upload-modal-btn').addEventListener('click', () => {
        uploadModal.classList.remove('hidden');
    });

    document.getElementById('close-upload-modal').addEventListener('click', () => {
        uploadModal.classList.add('hidden');
    });

    document.getElementById('upload-form').addEventListener('submit', handleUpload);

    // Navigation im Workspace
    document.getElementById('btn-next-step').addEventListener('click', () => changeStep(1));
    document.getElementById('btn-prev-step').addEventListener('click', () => changeStep(-1));

    // PDF Controls
    document.getElementById('pdf-zoom-in').addEventListener('click', () => { pdfScale += 0.2; renderPage(pdfPageNum); });
    document.getElementById('pdf-zoom-out').addEventListener('click', () => { if(pdfScale > 0.5) pdfScale -= 0.2; renderPage(pdfPageNum); });

    // Chat
    document.getElementById('chat-send-btn').addEventListener('click', sendChatMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => { if(e.key === 'Enter') sendChatMessage(); });


    // --- Functions ---

    function showDashboard() {
        viewWorkspace.classList.add('hidden');
        viewDashboard.classList.remove('hidden');
        fetchAppList();
        currentAppId = null;
    }

    async function fetchAppList() {
        appList.innerHTML = '<li>Lade...</li>';
        try {
            const res = await fetch(`${API_BASE_URL}/api/manual-applications/list`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const data = await res.json();
            
            if (data.length === 0) {
                appList.innerHTML = '<li style="padding:1rem; text-align:center; color:#666;">Noch keine Anträge vorhanden. Starten Sie einen neuen!</li>';
                return;
            }

            appList.innerHTML = data.map(app => `
                <li style="display:flex; justify-content:space-between; align-items:center; padding: 1rem; border-bottom:1px solid #eee;">
                    <div>
                        <strong>${app.title || 'Unbenannter Antrag'}</strong><br>
                        <small class="text-muted">Erstellt am: ${new Date(app.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div>
                        <span class="badge" style="background:${app.status === 'completed' ? '#28a745' : '#007bff'}; color:white; margin-right:1rem;">
                            ${app.status === 'analyzing' ? 'Wird analysiert...' : 'In Bearbeitung'}
                        </span>
                        <button class="btn btn-sm btn-primary open-app-btn" data-id="${app.id}">Öffnen</button>
                    </div>
                </li>
            `).join('');

            document.querySelectorAll('.open-app-btn').forEach(btn => {
                btn.addEventListener('click', (e) => loadApplication(e.target.dataset.id));
            });

        } catch (error) {
            appList.innerHTML = '<li style="color:red;">Fehler beim Laden der Liste.</li>';
        }
    }

    async function handleUpload(e) {
        e.preventDefault();
        const fileInput = document.getElementById('upload-file');
        const titleInput = document.getElementById('upload-title');

        if(fileInput.files.length === 0) return;

        const formData = new FormData();
        formData.append('documentFile', fileInput.files[0]);
        if(titleInput.value) formData.append('title', titleInput.value);

        // UI Updates
        uploadModal.classList.add('hidden');
        loadingOverlay.classList.remove('hidden');

        try {
            const res = await fetch(`${API_BASE_URL}/api/manual-applications/start`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${authToken}` },
                body: formData
            });

            if(!res.ok) throw new Error('Upload fehlgeschlagen');

            const data = await res.json();
            // Direkt in den Workspace wechseln
            loadApplication(data.applicationId);

        } catch (error) {
            alert('Fehler: ' + error.message);
            loadingOverlay.classList.add('hidden');
        }
    }

    async function loadApplication(id) {
        loadingOverlay.classList.remove('hidden');
        currentAppId = id;

        try {
            const res = await fetch(`${API_BASE_URL}/api/manual-applications/${id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if(!res.ok) throw new Error('Konnte Antrag nicht laden');
            
            appData = await res.json();
            currentStepIndex = appData.currentStepIndex || 0;

            // Views umschalten
            viewDashboard.classList.add('hidden');
            viewWorkspace.classList.remove('hidden');

            // 1. PDF laden
            // WICHTIG: API liefert relativen Pfad. Base URL davor setzen.
            const pdfUrl = `${API_BASE_URL}${appData.originalFileUrl}`;
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            pdfDoc = await loadingTask.promise;
            
            document.getElementById('pdf-page-count').textContent = pdfDoc.numPages;

            // 2. Ersten Schritt rendern
            renderCurrentStep();

        } catch (error) {
            console.error(error);
            alert('Fehler beim Öffnen des Antrags.');
            showDashboard();
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }

    function renderCurrentStep() {
        if (!appData || !appData.structure || !appData.structure.steps) return;
        
        const steps = appData.structure.steps;
        const step = steps[currentStepIndex];

        // UI Texte
        document.getElementById('step-counter').textContent = `${currentStepIndex + 1} / ${steps.length}`;
        document.getElementById('step-title').textContent = step.title;
        document.getElementById('step-explanation').textContent = step.explanation;
        document.getElementById('step-mistakes').textContent = step.commonMistakes || 'Keine besonderen Hinweise.';

        // Checkliste bauen
        const checklistContainer = document.getElementById('step-checklist');
        checklistContainer.innerHTML = '';
        if (step.checklist && step.checklist.length > 0) {
            step.checklist.forEach(itemText => {
                const div = document.createElement('div');
                div.className = 'checklist-item';
                div.innerHTML = `<input type="checkbox"> <span>${itemText}</span>`;
                checklistContainer.appendChild(div);
            });
        } else {
            checklistContainer.innerHTML = '<p style="color:#888;">Keine Checkliste für diesen Schritt.</p>';
        }

        // Buttons State
        document.getElementById('btn-prev-step').disabled = currentStepIndex === 0;
        const nextBtn = document.getElementById('btn-next-step');
        if (currentStepIndex === steps.length - 1) {
            nextBtn.textContent = 'Antrag abschließen';
        } else {
            nextBtn.textContent = 'Abschnitt erledigt & Weiter';
        }

        // PDF zur richtigen Seite blättern
        if (step.pageNumber && step.pageNumber <= pdfDoc.numPages) {
            renderPage(step.pageNumber);
        } else {
            renderPage(1);
        }
    }

    async function renderPage(num) {
        pdfPageNum = num;
        document.getElementById('pdf-page-num').textContent = num;

        const page = await pdfDoc.getPage(num);
        const viewport = page.getViewport({ scale: pdfScale });

        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        await page.render(renderContext).promise;
    }

    async function changeStep(delta) {
        const steps = appData.structure.steps;
        const newIndex = currentStepIndex + delta;

        if (newIndex >= 0 && newIndex < steps.length) {
            currentStepIndex = newIndex;
            renderCurrentStep();
            
            // Fortschritt im Backend speichern (im Hintergrund)
            fetch(`${API_BASE_URL}/api/manual-applications/${currentAppId}/step`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}` 
                },
                body: JSON.stringify({ stepIndex: currentStepIndex })
            });
        } else if (newIndex >= steps.length) {
            alert('Herzlichen Glückwunsch! Sie haben alle Schritte durchgearbeitet.');
            showDashboard();
        }
    }

    async function sendChatMessage() {
        const input = document.getElementById('chat-input');
        const question = input.value.trim();
        if (!question) return;

        const chatBox = document.getElementById('chat-messages');
        
        // User Message
        const userMsg = document.createElement('div');
        userMsg.className = 'message msg-user';
        userMsg.textContent = question;
        chatBox.appendChild(userMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
        
        input.value = '';

        // Aktuellen Kontext holen
        const currentStep = appData.structure.steps[currentStepIndex];

        // AI Loading
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'message msg-ai';
        loadingMsg.innerHTML = '<i>Tippt...</i>';
        loadingMsg.id = 'ai-loading-msg';
        chatBox.appendChild(loadingMsg);

        try {
            const res = await fetch(`${API_BASE_URL}/api/manual-applications/${currentAppId}/chat`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}` 
                },
                body: JSON.stringify({ 
                    question: question,
                    currentStepData: currentStep 
                })
            });
            const data = await res.json();
            
            // Loading entfernen
            document.getElementById('ai-loading-msg').remove();

            const aiMsg = document.createElement('div');
            aiMsg.className = 'message msg-ai';
            aiMsg.textContent = data.answer;
            chatBox.appendChild(aiMsg);

        } catch (error) {
            document.getElementById('ai-loading-msg').textContent = 'Fehler bei der Verbindung zum Coach.';
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});