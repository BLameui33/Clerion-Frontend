document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://api.clerion.de';
    // --- VARIABLEN ---
    let selectedService = null;
    let selectedFiles = []; // Speichert die File-Objekte für den Backend-Upload
    let signaturePad = null;
    let currentTransactionId = null; // Speichert die ID für den PDF-Druck
    let currentAnalysisSummary = ""; // Speichert den Kontext für die KI-Antwort
    let fullAnalysisContextText = ""; // Speichert den kompletten Analysetext für PDF & Chat

    const savedTransactionId = localStorage.getItem('clerion_pending_tx');
    const savedStep = localStorage.getItem('clerion_current_step');

    if (savedTransactionId && savedStep == "4") {
        currentTransactionId = savedTransactionId;
        // Optional: Hier könnte man einen automatischen Re-Fetch der Analyse machen
        // oder dem Nutzer einen Button zeigen: "Letzte Analyse wiederherstellen"
        console.log("Wiederherstellung verfügbar für ID:", currentTransactionId);
    }

    // --- DOM ELEMENTE ---
    const steps = {
        1: document.getElementById('step-1'),
        2: document.getElementById('step-2'),
        3: document.getElementById('step-3'),
        4: document.getElementById('step-4')
    };
    
    const serviceCards = document.querySelectorAll('.service-card');
    const uploadArea = document.getElementById('upload-area');
    const textAreaArea = document.getElementById('text-area-container');
    const fileInput = document.getElementById('document-upload');
    const fileListEl = document.getElementById('file-list');
    const fileErrorEl = document.getElementById('file-error');
    const uploadHint = document.getElementById('upload-hint');

    // --- LOKALES GEDÄCHTNIS (Sidebar) ---
    const localFields = ['local-name', 'local-address', 'local-email', 'local-phone'];
    
    // Laden beim Start
    localFields.forEach(id => {
        const val = localStorage.getItem(`clerion_${id}`);
        if(val) document.getElementById(id).value = val;
    });

    // Speichern Button
    document.getElementById('save-local-data-btn').addEventListener('click', () => {
        localFields.forEach(id => {
            localStorage.setItem(`clerion_${id}`, document.getElementById(id).value);
        });
        showNotification('Absenderdaten lokal gespeichert.', 'success');
    });

    // Signatur-Pad Initialisierung
    const canvas = document.getElementById('signature-canvas');
    if (canvas) {
        // Skalierung für scharfe Darstellung
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        
        signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgba(255, 255, 255, 0)' });
        
        // Gespeicherte Signatur laden
        const savedSignature = localStorage.getItem('clerion_signature');
        if(savedSignature) {
            signaturePad.fromDataURL(savedSignature);
            document.getElementById('signature-status').style.display = 'block';
        }

        document.getElementById('signature-clear-btn').addEventListener('click', () => {
            signaturePad.clear();
            localStorage.removeItem('clerion_signature');
            document.getElementById('signature-status').style.display = 'none';
        });

        document.getElementById('signature-save-btn').addEventListener('click', () => {
            if (signaturePad.isEmpty()) return showNotification('Bitte unterschreiben Sie zuerst.', 'error');
            localStorage.setItem('clerion_signature', signaturePad.toDataURL("image/png"));
            document.getElementById('signature-status').style.display = 'block';
            showNotification('Unterschrift lokal gespeichert.', 'success');
        });
    }

    // --- SCHRITT-NAVIGATION ---
    function showStep(stepNumber) {
        Object.values(steps).forEach(step => step.classList.remove('active'));
        steps[stepNumber].classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    document.querySelectorAll('.btn-back').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showStep(e.target.dataset.target.split('-')[1]);
        });
    });

    // --- SCHRITT 1: SERVICE AUSWÄHLEN ---
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            serviceCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedService = card.dataset.service;
            document.getElementById('btn-next-to-input').disabled = false;
        });
    });

    document.getElementById('btn-next-to-input').addEventListener('click', () => {
        // UI anpassen basierend auf Auswahl
        fileInput.value = '';
        selectedFiles = [];
        fileListEl.innerHTML = '';
        fileErrorEl.textContent = '';

        if (selectedService === 'antrag') {
            uploadArea.classList.add('hidden');
            textAreaArea.classList.remove('hidden');
            document.getElementById('input-title').textContent = 'Was möchten Sie beantragen?';
        } else {
            uploadArea.classList.remove('hidden');
            textAreaArea.classList.add('hidden');
            document.getElementById('input-title').textContent = 'Dokumente hochladen';
            
            // Upload-Regeln anpassen
            if (selectedService === 'akte') {
                fileInput.accept = ".pdf";
                fileInput.removeAttribute('multiple');
                uploadHint.textContent = 'Erlaubt: 1 PDF-Datei (max. 100 Seiten).';
            } else { // Brief & Bescheid
                fileInput.accept = ".pdf, image/*";
                fileInput.setAttribute('multiple', 'multiple');
                uploadHint.textContent = 'Erlaubt: PDF (max. 5 Seiten) oder max. 5 Bilder (JPG/PNG).';
            }
        }
        showStep(2);
    });

    // --- SCHRITT 2: UPLOAD & LIMIT-PRÜFUNG ---
    
    // NEU: Hilfsfunktion, um die Liste mit "X" zu zeichnen
    function renderFileList() {
        fileListEl.innerHTML = '';
        if (selectedFiles.length === 0) {
            fileInput.value = ''; // Input zurücksetzen, wenn leer
            return;
        }

        selectedFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.style.display = 'flex';
            li.style.justifyContent = 'space-between';
            li.style.alignItems = 'center';
            li.style.marginBottom = '0.5rem';
            li.style.padding = '0.5rem';
            li.style.background = 'var(--bg-secondary)';
            li.style.borderRadius = '4px';

            const fileNameSpan = document.createElement('span');
            fileNameSpan.textContent = `📄 ${file.name}`;
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&#10006;'; // X Symbol
            removeBtn.style.background = 'none';
            removeBtn.style.border = 'none';
            removeBtn.style.color = 'var(--error-color, red)';
            removeBtn.style.cursor = 'pointer';
            removeBtn.style.fontWeight = 'bold';
            
            // Lösch-Logik
            removeBtn.addEventListener('click', () => {
                selectedFiles.splice(index, 1); // Datei aus Array entfernen
                renderFileList(); // Liste neu zeichnen
            });

            li.appendChild(fileNameSpan);
            li.appendChild(removeBtn);
            fileListEl.appendChild(li);
        });
    }

    fileInput.addEventListener('change', async (e) => {
        fileErrorEl.textContent = '';
        
        // Wir nehmen die neu ausgewählten Dateien (überschreibt vorherige Auswahl)
        selectedFiles = Array.from(e.target.files);

        if (selectedService !== 'akte' && selectedFiles.length > 5) {
            fileErrorEl.textContent = 'Maximal 5 Dateien gleichzeitig erlaubt.';
            selectedFiles = [];
            renderFileList();
            return;
        }

        const pdfjsLib = window.pdfjsLib;
        if (pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }

        let hasError = false;

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            if (selectedService === 'akte' && !file.type.includes('pdf')) {
                fileErrorEl.textContent = 'Für die Aktenanalyse sind nur PDF-Dateien erlaubt.';
                hasError = true;
                break;
            }

            if (file.type.includes('pdf') && pdfjsLib) {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    
                    if (selectedService === 'akte' && pdf.numPages > 100) {
                        fileErrorEl.textContent = `Das PDF hat ${pdf.numPages} Seiten (Maximal 100 erlaubt).`;
                        hasError = true;
                        break;
                    }
                    if (selectedService !== 'akte' && pdf.numPages > 5) {
                        fileErrorEl.textContent = `Das PDF hat ${pdf.numPages} Seiten (Maximal 5 erlaubt für Schnellprüfung).`;
                        hasError = true;
                        break;
                    }
                } catch (err) {
                    fileErrorEl.textContent = `Fehler beim Lesen der PDF-Datei: ${file.name}`;
                    hasError = true;
                    break;
                }
            }
        }

        if (hasError) {
            selectedFiles = [];
        }
        
        // Neue Render-Funktion aufrufen
        renderFileList();
    });

    document.getElementById('btn-next-to-pay').addEventListener('click', () => {
        const backupEmail = document.getElementById('backup-email').value;
        
        if (!backupEmail) return showNotification('Bitte geben Sie eine Backup E-Mail Adresse an.', 'error');
        
        if (selectedService === 'antrag') {
            if(!document.getElementById('intent-description').value) return showNotification('Bitte beschreiben Sie Ihr Anliegen.', 'error');
        } else {
            if(selectedFiles.length === 0) return showNotification('Bitte laden Sie Dokumente hoch.', 'error');
        }

        document.getElementById('summary-service').textContent = selectedService.toUpperCase();
        document.getElementById('summary-email').textContent = backupEmail;
        
        showStep(3);
    });

    // --- SCHRITT 3: ECHTER API AUFRUF (ANALYSE) ---
    // --- SCHRITT 3: ECHTE PAYPAL BEZAHLUNG & ANALYSE ---
    
    // Wir definieren die Preise für die Services
    const servicePrices = {
        brief: "3.99",
        bescheid: "4.99",
        antrag: "2.99",
        akte: "13.99"
    };

    if (window.paypal) {
        paypal.Buttons({
            createOrder: function(data, actions) {
                // 1. Preis basierend auf der Auswahl holen
                const price = servicePrices[selectedService];
                
                // 2. Order bei PayPal anlegen
                return actions.order.create({
                    purchase_units: [{
                        amount: { value: price },
                        description: 'Clerion Dokumenten-Analyse: ' + selectedService.toUpperCase()
                    }]
                });
            },
            onApprove: function(data, actions) {
                // 3. Wenn der Nutzer bestätigt, buchen wir das Geld ab
                return actions.order.capture().then(function(details) {
                    
                    // UI umstellen: Button weg, Lade-Spinner an
                    document.getElementById('paypal-button-container').classList.add('hidden');
                    document.getElementById('loading-spinner').classList.remove('hidden');

                    // 4. Jetzt schicken wir das Dokument und die Order-ID ans Backend
                    executeRealAnalysis(data.orderID);
                });
            },
            onError: function(err) {
                showNotification('Zahlung abgebrochen oder fehlgeschlagen.', 'error');
            }
        }).render('#paypal-button-container');
    }

    // Die echte Fetch-Funktion (ersetzt die Simulator-Logik)
    async function executeRealAnalysis(paypalOrderId) {
        const formData = new FormData();
        formData.append('serviceType', selectedService);
        formData.append('backupEmail', document.getElementById('backup-email').value);
        formData.append('paypalOrderId', paypalOrderId); // WICHTIG: ID ans Backend senden!
        
        if (selectedService === 'antrag') {
            formData.append('intentText', document.getElementById('intent-description').value);
        } else {
            selectedFiles.forEach(f => formData.append('documents', f));
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/paygo/analyze`, {
                method: 'POST',
                body: formData
            });
            
            const responseData = await response.json();
            if (!response.ok) throw new Error(responseData.message || 'Fehler bei der Analyse');

            currentTransactionId = responseData.transactionId;
            localStorage.setItem('clerion_pending_tx', currentTransactionId);

            if (selectedService === 'antrag') {
                document.getElementById('analysis-result-content').style.display = 'none';
                document.getElementById('freitext-input').value = document.getElementById('intent-description').value;
                document.getElementById('btn-draft-text').click();
            } else {
                document.getElementById('analysis-result-content').style.display = 'block';
                currentAnalysisSummary = responseData.aiExplanation.zusammenfassung || ""; 
                renderAnalysisResult(responseData.aiExplanation);
            }

            const pdfSection = document.getElementById('pdf-generator-section');
            if (selectedService === 'bescheid' || selectedService === 'akte') {
                pdfSection.style.display = 'none';
            } else {
                pdfSection.style.display = 'block';
            }

            document.getElementById('loading-spinner').classList.add('hidden');
            showStep(4);

        } catch (error) {
            showNotification(error.message, 'error');
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('paypal-button-container').classList.remove('hidden'); // Bei Fehler Button wieder zeigen
        }
    }

    function renderAnalysisResult(explanation) {
        let html = `<h4>Zusammenfassung</h4><p>${explanation.zusammenfassung || 'Erfolgreich analysiert.'}</p>`;
        fullAnalysisContextText = `ZUSAMMENFASSUNG:\n${explanation.zusammenfassung || 'Erfolgreich analysiert.'}\n\n`;

        if (explanation.kernthema) {
            html += `<h4>Kernthema</h4><p>${explanation.kernthema}</p>`;
            fullAnalysisContextText += `KERNTHEMA:\n${explanation.kernthema}\n\n`;
        }
        
        if (explanation.aktionen && explanation.aktionen.length > 0) {
            html += `<h4>Nächste Schritte</h4><ul>`;
            fullAnalysisContextText += `NÄCHSTE SCHRITTE:\n`;
            explanation.aktionen.forEach(a => {
                html += `<li>${a.beschreibung}</li>`;
                fullAnalysisContextText += `- ${a.beschreibung}\n`;
            });
            html += `</ul>`;
            fullAnalysisContextText += `\n`;
        }
        
        if (explanation.fristen && explanation.fristen.length > 0) {
            html += `<h4 style="color: var(--primary-color);">Fristen</h4><ul>`;
            fullAnalysisContextText += `FRISTEN:\n`;
            explanation.fristen.forEach(f => {
                html += `<li><strong>${f.datum}:</strong> ${f.beschreibung}</li>`;
                fullAnalysisContextText += `- ${f.datum}: ${f.beschreibung}\n`;
            });
            html += `</ul>`;
            fullAnalysisContextText += `\n`;
        }
        
        if (explanation.wichtige_klauseln && explanation.wichtige_klauseln.length > 0) {
            html += `<h4>Wichtige Klauseln</h4><ul>`;
            fullAnalysisContextText += `WICHTIGE KLAUSELN:\n`;
            explanation.wichtige_klauseln.forEach(k => {
                html += `<li><strong>${k.klausel}:</strong> ${k.erklaerung}</li>`;
                fullAnalysisContextText += `- ${k.klausel}: ${k.erklaerung}\n`;
            });
            html += `</ul>`;
            fullAnalysisContextText += `\n`;
        }

        document.getElementById('analysis-result-content').innerHTML = html;
        if (explanation.aktenzeichen) {
            document.getElementById('case-reference').value = explanation.aktenzeichen;
        }

        // NEU: UI Logik für Chat und Download
        if (selectedService !== 'antrag') {
            document.getElementById('btn-download-analysis').style.display = 'block';
            // Chat bei Bescheid & Akte (oder auch bei Brief, wenn du willst)
            document.getElementById('chat-section').style.display = 'block'; 
        }
    }

    // --- TEXT ENTWURF & KORREKTUR ---
    const btnDraft = document.getElementById('btn-draft-text');
    const correctionWindow = document.getElementById('correction-window');
    const finalLetterArea = document.getElementById('final-letter-textarea');
    const btnApplyCorrection = document.getElementById('btn-apply-correction');
    const btnFinalPdf = document.getElementById('generate-final-pdf');

    btnDraft.addEventListener('click', async () => {
        const intentText = document.getElementById('freitext-input').value.trim();
        if (!intentText) return showNotification('Bitte beschreiben Sie kurz Ihr Anliegen.', 'error');

        btnDraft.disabled = true;
        btnDraft.textContent = 'Erstelle Entwurf...';

        // NEU: Wir senden den Kontext der Briefanalyse mit ans Backend!
        const payload = { intentText };
        if (selectedService === 'brief' && currentAnalysisSummary) {
            payload.documentContext = currentAnalysisSummary;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/paygo/generate-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            finalLetterArea.value = data.letterText;
            correctionWindow.classList.remove('hidden');
            btnFinalPdf.disabled = false;

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            btnDraft.disabled = false;
            btnDraft.textContent = 'KI-Entwurf neu erstellen';
        }
    });

    btnApplyCorrection.addEventListener('click', async () => {
        const correctionInstruction = document.getElementById('correction-instruction').value.trim();
        const previousText = finalLetterArea.value.trim();
        
        if (!correctionInstruction) return showNotification('Bitte geben Sie einen Änderungswunsch ein.', 'error');

        btnApplyCorrection.disabled = true;
        btnApplyCorrection.textContent = 'Ändere...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/paygo/generate-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ previousText, correctionInstruction })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            finalLetterArea.value = data.letterText;
            document.getElementById('correction-instruction').value = ''; 

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            btnApplyCorrection.disabled = false;
            btnApplyCorrection.textContent = 'KI Ändern lassen';
        }
    });

    // --- SCHRITT 4: PDF GENERIEREN & DOWNLOADEN ---
    btnFinalPdf.addEventListener('click', async () => {
        if (!currentTransactionId) return showNotification('Keine aktive Transaktion gefunden.', 'error');
        
        btnFinalPdf.disabled = true;
        btnFinalPdf.textContent = 'PDF wird erstellt...';

        // BUGFIX: Wir prüfen sicherheitshalber, ob das Korrektur-Fenster offen ist. 
        // Wenn ja, nehmen wir den Text von dort. Wenn nein, nehmen wir den Text aus dem kleinen Feld (falls der Nutzer keinen Entwurf wollte).
        let safeBodyText = document.getElementById('freitext-input').value;
        if (!correctionWindow.classList.contains('hidden')) {
            safeBodyText = finalLetterArea.value;
        }

        const payload = {
            transactionId: currentTransactionId,
            senderName: localStorage.getItem('clerion_local-name') || '',
            senderAddress: localStorage.getItem('clerion_local-address') || '',
            email: localStorage.getItem('clerion_local-email') || '',
            phone: localStorage.getItem('clerion_local-phone') || '',
            recipientName: document.getElementById('recipient-name').value,
            recipientAddress: document.getElementById('recipient-address').value,
            caseReference: document.getElementById('case-reference').value,
            bodyText: safeBodyText, 
            signatureBase64: localStorage.getItem('clerion_signature') || null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/paygo/generate-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Fehler bei der PDF-Generierung auf dem Server.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Antwortschreiben.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            showNotification('PDF erfolgreich heruntergeladen!', 'success');

            localStorage.removeItem('clerion_pending_tx');

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            btnFinalPdf.disabled = false;
            btnFinalPdf.textContent = 'PDF generieren & herunterladen';
        }
    });

    

    // --- HILFSFUNKTION BENACHRICHTIGUNGEN ---
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return alert(message);

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        container.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    // --- NEU: ANALYSE DOWNLOAD & CHAT LOGIK ---
    const btnDownloadAnalysis = document.getElementById('btn-download-analysis');
    const btnSendChat = document.getElementById('btn-send-chat');
    const chatInput = document.getElementById('chat-input');
    const chatHistory = document.getElementById('chat-history');

    // 1. Analyse als PDF herunterladen
    btnDownloadAnalysis.addEventListener('click', async () => {
        btnDownloadAnalysis.disabled = true;
        btnDownloadAnalysis.textContent = 'PDF wird erstellt...';

        try {
            const response = await fetch(`${API_BASE_URL}/api/paygo/generate-analysis-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisText: fullAnalysisContextText })
            });

            if (!response.ok) throw new Error('Fehler bei der PDF-Generierung.');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Clerion_Analyse_Ergebnis.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            btnDownloadAnalysis.disabled = false;
            btnDownloadAnalysis.textContent = '📄 Analyse als PDF herunterladen';
        }
    });

    // 2. Chat-Nachricht senden
    btnSendChat.addEventListener('click', async () => {
        const question = chatInput.value.trim();
        if (!question) return;

        // User Nachricht ins UI packen
        addChatMessage('Sie', question, '#fff', '#333', '1px solid #ddd');
        chatInput.value = '';
        btnSendChat.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/paygo/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
    question: question, 
    transactionId: currentTransactionId 
})
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            // KI Antwort ins UI packen
            addChatMessage('KI Assist', data.reply, '#e6f0ff', '#004085', 'none');

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            btnSendChat.disabled = false;
        }
    });

    // Hilfsfunktion für die Chat-Sprechblasen
    function addChatMessage(sender, text, bgColor, textColor, border) {
        const msgDiv = document.createElement('div');
        msgDiv.style.background = bgColor;
        msgDiv.style.color = textColor;
        msgDiv.style.border = border;
        msgDiv.style.padding = '0.8rem';
        msgDiv.style.borderRadius = '8px';
        msgDiv.innerHTML = `<strong style="font-size: 0.8rem; text-transform: uppercase;">${sender}</strong><br><span style="font-size: 0.95rem;">${text}</span>`;
        
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Automatisch nach unten scrollen
    }
});