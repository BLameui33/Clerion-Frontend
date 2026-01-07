// NEUE VERSION: vertrag-assistent.js
document.addEventListener('DOMContentLoaded', () => {
    // === DOM-Elemente ===
    const logoutButton = document.getElementById('logout-button');
    const uploadInput = document.getElementById('document-upload');
    const analyzeButton = document.getElementById('analyze-button');
    const loadingSpinner = document.getElementById('loading-spinner');
    const fileNameLabel = document.getElementById('file-name-label');

    const analysisOutput = document.getElementById('analysis-output');
    const analysisSection = document.querySelector('.analysis-result-section');
    const chatSection = document.querySelector('.chat-section');
    const chatInput = document.getElementById('chat-input');
    const chatSendButton = document.getElementById('chat-send-button');
    const chatResponseContainer = document.getElementById('chat-response-container');
    const copyAnalysisButton = document.getElementById('copy-analysis-button');
    const resetButton = document.getElementById('reset-button');

    // === Konfiguration ===
    const API_BASE_URL = 'https://api.clerion.de';
    const authToken = localStorage.getItem('behoerdenhilfe_token');
    let documentAnalysis = ''; // Speicherung der KI-Analyse für spätere Chatfragen

    // === Sicherheitscheck ===
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }




    // === Logout ===
    logoutButton?.addEventListener('click', () => {
        localStorage.removeItem('behoerdenhilfe_token');
        window.location.href = 'index.html';
    });

    uploadInput?.addEventListener('change', () => {
    const files = uploadInput.files;
    const fileList = document.getElementById('file-list');
    
    if (files.length === 0) {
        fileNameLabel.textContent = 'Keine Dateien ausgewählt';
        fileList.innerHTML = '';
        return;
    }
    
    if (files.length > 5) {
        showNotification('Maximal 5 Dateien erlaubt.', 'error');
        uploadInput.value = '';
        fileNameLabel.textContent = 'Keine Dateien ausgewählt';
        fileList.innerHTML = '';
        return;
    }
    
    fileNameLabel.textContent = `${files.length} Datei(en) ausgewählt`;
    
    // Liste aller Dateien anzeigen
    let listHTML = '<ul style="margin: 0; padding-left: 1.2rem;">';
    for (let i = 0; i < files.length; i++) {
        listHTML += `<li>${files[i].name}</li>`;
    }
    listHTML += '</ul>';
    fileList.innerHTML = listHTML;
});


    // === Dokument analysieren ===
    analyzeButton?.addEventListener('click', async () => {
    const files = uploadInput.files;

    const docTypeInput = document.querySelector('input[name="docType"]:checked');
    const docType = docTypeInput ? docTypeInput.value : 'vertrag';

    if (files.length === 0) {
        showNotification('Bitte wählen Sie mindestens eine Datei aus.', 'error');
        return;
    }

    if (files.length > 5) {
        showNotification('Maximal 5 Dateien erlaubt.', 'error');
        return;
    }

    // Dateiformate prüfen
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.includes('pdf') && !file.type.startsWith('image/')) {
            showNotification(`Datei "${file.name}" hat ein ungültiges Format. Nur PDF oder Bilder erlaubt.`, 'error');
            return;
        }
    }

    // PDF-Seitenbegrenzung prüfen (für alle PDFs)
    const pdfjsLib = window.pdfjsLib;
    if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.includes('pdf')) {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                if (pdf.numPages > 5) {
                    showNotification(`PDF "${file.name}" hat ${pdf.numPages} Seiten. Maximal 5 Seiten pro PDF erlaubt.`, 'error');
                    return;
                }
            }
        }
    }

    // Upload & Analyse
    analyzeButton.disabled = true;
    analyzeButton.textContent = 'Dokumente werden geprüft...';
    loadingSpinner.style.display = 'inline-block';
    analysisOutput.value = '';

    const formData = new FormData();
    
    // Alle Dateien hinzufügen
    for (let i = 0; i < files.length; i++) {
        formData.append('documents', files[i]);
    }
    formData.append('docType', docType);

    try {
        const response = await fetch(`${API_BASE_URL}/api/vertrag/analyse`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Analyse fehlgeschlagen.');

        documentAnalysis = data.analysis;
        analysisOutput.value = data.analysis;
        analysisSection.classList.remove('hidden');
        chatSection.classList.remove('hidden');
        showNotification('Analyse erfolgreich abgeschlossen.', 'success');

    } catch (error) {
        console.error('Fehler bei der Analyse:', error);
        showNotification(`Fehler: ${error.message}`, 'error');
        analysisOutput.value = `Fehler: ${error.message}`;
    } finally {
        analyzeButton.disabled = false;
        analyzeButton.textContent = 'Dokumente prüfen';
        loadingSpinner.style.display = 'none';
    }
});

    // === Chat mit KI ===
    chatSendButton?.addEventListener('click', async () => {
        const userQuestion = chatInput.value.trim();
        if (!userQuestion) {
            showNotification('Bitte geben Sie eine Frage ein.', 'error');
            return;
        }

        chatSendButton.disabled = true;
        chatSendButton.textContent = 'Antwort wird generiert...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/vertrag/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    analysis: documentAnalysis,
                    question: userQuestion
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Fehler bei der Kommunikation mit der KI.');

            const answer = data.reply;
            documentAnalysis += `\n\nNutzer: ${userQuestion}\nKI: ${answer}`;

            // Antwort-Blase über dem Eingabefeld
            const responseBubble = document.createElement('div');
            responseBubble.className = 'chat-bubble';
            responseBubble.innerHTML = `
                <p><strong>Ihre Frage:</strong> ${userQuestion}</p>
                <p style="margin-top: 0.5rem;"><strong>KI-Antwort:</strong><br>${answer}</p>
            `;
            chatResponseContainer.prepend(responseBubble);

            chatInput.value = '';

        } catch (error) {
            showNotification(`Fehler: ${error.message}`, 'error');
        } finally {
            chatSendButton.disabled = false;
            chatSendButton.textContent = 'Frage senden';
        }
    });

    // === Analyse kopieren ===
    copyAnalysisButton?.addEventListener('click', () => {
        const textToCopy = analysisOutput.value;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy)
                .then(() => showNotification('Analyse in Zwischenablage kopiert!', 'success'))
                .catch(() => showNotification('Kopieren fehlgeschlagen.', 'error'));
        }
    });

    // === Reset ===
    resetButton?.addEventListener('click', () => {
    uploadInput.value = '';
    fileNameLabel.textContent = 'Keine Dateien ausgewählt';
    document.getElementById('file-list').innerHTML = ''; // NEUE ZEILE
    analysisOutput.value = '';
    chatInput.value = '';
    chatResponseContainer.innerHTML = '';
    documentAnalysis = '';
    analysisSection.classList.add('hidden');
    chatSection.classList.add('hidden');
    showNotification('Assistent wurde zurückgesetzt.', 'success');
});

    // === Hilfsfunktion ===
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        container.appendChild(notification);
        setTimeout(() => notification.remove(), 3500);
    }
});
