document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://api.clerion.de';
    // --- VARIABLEN ---
    let selectedService = null;
    let selectedFiles = []; // Speichert die File-Objekte für den Backend-Upload
    let signaturePad = null;
    let currentTransactionId = null; // Speichert die ID für den PDF-Druck

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
    fileInput.addEventListener('change', async (e) => {
        fileErrorEl.textContent = '';
        fileListEl.innerHTML = '';
        selectedFiles = Array.from(e.target.files);

        // 1. Limit: Maximale Anzahl Dateien (nur für Brief/Bescheid relevant)
        if (selectedService !== 'akte' && selectedFiles.length > 5) {
            fileErrorEl.textContent = 'Maximal 5 Dateien gleichzeitig erlaubt.';
            selectedFiles = [];
            return;
        }

        // PDF.js initialisieren für Seitenzählung
        const pdfjsLib = window.pdfjsLib;
        if (pdfjsLib) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }

        let hasError = false;

        // Jede Datei prüfen
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            // Format-Prüfung
            if (selectedService === 'akte' && !file.type.includes('pdf')) {
                fileErrorEl.textContent = 'Für die Aktenanalyse sind nur PDF-Dateien erlaubt.';
                hasError = true;
                break;
            }

            // Seitenanzahl prüfen bei PDFs
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
            fileInput.value = '';
        } else {
            // Erfolgreich geprüft, Liste anzeigen
            selectedFiles.forEach(f => {
                const li = document.createElement('li');
                li.textContent = `✅ ${f.name}`;
                fileListEl.appendChild(li);
            });
        }
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
    document.getElementById('btn-simulate-payment').addEventListener('click', async () => {
        document.getElementById('btn-simulate-payment').classList.add('hidden');
        document.getElementById('loading-spinner').classList.remove('hidden');

        // 1. Daten für das Backend zusammenbauen
        const formData = new FormData();
        formData.append('serviceType', selectedService);
        formData.append('backupEmail', document.getElementById('backup-email').value);
        
        if (selectedService === 'antrag') {
            formData.append('intentText', document.getElementById('intent-description').value);
        } else {
            // Hängt alle vom Nutzer ausgewählten Dateien an (bis zu 5 Stück)
            selectedFiles.forEach(f => formData.append('documents', f));
        }

        try {
            // 2. Echter Aufruf an unsere neue PayGo Route
            const response = await fetch(`${API_BASE_URL}/api/paygo/analyze`, {
                method: 'POST',
                body: formData // WICHTIG: Kein 'Content-Type' Header setzen bei FormData!
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Fehler bei der Analyse');

            // 3. ID merken für das spätere PDF
            currentTransactionId = data.transactionId;

            // 4. KI-Ergebnis im Frontend aufbauen
            renderAnalysisResult(data.aiExplanation);

            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('btn-simulate-payment').classList.remove('hidden');
            showStep(4);

        } catch (error) {
            showNotification(error.message, 'error');
            document.getElementById('loading-spinner').classList.add('hidden');
            document.getElementById('btn-simulate-payment').classList.remove('hidden');
        }
    });

    // Hilfsfunktion: Rendert die KI-Antwort dynamisch (egal ob Akte, Brief oder Bescheid)
    function renderAnalysisResult(explanation) {
        let html = `<h4>Zusammenfassung</h4><p>${explanation.zusammenfassung || 'Erfolgreich analysiert.'}</p>`;
        
        if (explanation.kernthema) html += `<h4>Kernthema</h4><p>${explanation.kernthema}</p>`;
        
        if (explanation.aktionen && explanation.aktionen.length > 0) {
            html += `<h4>Nächste Schritte</h4><ul>`;
            explanation.aktionen.forEach(a => html += `<li>${a.beschreibung}</li>`);
            html += `</ul>`;
        }
        
        if (explanation.fristen && explanation.fristen.length > 0) {
            html += `<h4 style="color: var(--primary-color);">Fristen</h4><ul>`;
            explanation.fristen.forEach(f => html += `<li><strong>${f.datum}:</strong> ${f.beschreibung}</li>`);
            html += `</ul>`;
        }
        
        if (explanation.wichtige_klauseln && explanation.wichtige_klauseln.length > 0) {
            html += `<h4>Wichtige Klauseln</h4><ul>`;
            explanation.wichtige_klauseln.forEach(k => html += `<li><strong>${k.klausel}:</strong> ${k.erklaerung}</li>`);
            html += `</ul>`;
        }

        document.getElementById('analysis-result-content').innerHTML = html;
        
        // Versuchen, das Aktenzeichen direkt in das PDF-Feld vorab einzufügen, falls die KI eines gefunden hat
        if (explanation.aktenzeichen) {
            document.getElementById('case-reference').value = explanation.aktenzeichen;
        }
    }

    // --- SCHRITT 4: PDF GENERIEREN & DOWNLOADEN ---
    document.getElementById('generate-final-pdf').addEventListener('click', async () => {
        if (!currentTransactionId) return showNotification('Keine aktive Transaktion gefunden.', 'error');
        
        const btn = document.getElementById('generate-final-pdf');
        btn.disabled = true;
        btn.textContent = 'PDF wird erstellt...';

        // Wir ziehen alle lokalen Daten (Briefkopf/Unterschrift) und die Benutzereingaben zusammen
        const payload = {
            transactionId: currentTransactionId,
            senderName: localStorage.getItem('clerion_local-name') || '',
            senderAddress: localStorage.getItem('clerion_local-address') || '',
            email: localStorage.getItem('clerion_local-email') || '',
            phone: localStorage.getItem('clerion_local-phone') || '',
            recipientName: document.getElementById('recipient-name').value,
            recipientAddress: document.getElementById('recipient-address').value,
            caseReference: document.getElementById('case-reference').value,
            bodyText: document.getElementById('freitext-input').value,
            signatureBase64: localStorage.getItem('clerion_signature') || null // Das Base64 Bild der Unterschrift
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/paygo/generate-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Fehler bei der PDF-Generierung auf dem Server.');

            // Da das Backend eine PDF-Datei schickt (Blob), müssen wir sie im Browser entpacken und den Download erzwingen
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'Antwortschreiben.pdf'; // Name der Datei
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

            showNotification('PDF erfolgreich heruntergeladen!', 'success');

        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'PDF generieren & herunterladen';
        }
    });

    // --- SCHRITT 4: PDF GENERIEREN ---
    document.getElementById('generate-final-pdf').addEventListener('click', () => {
        // Hier sammeln wir später die Daten für deinen existierenden createPdf Aufruf zusammen
        const pdfData = {
            senderName: localStorage.getItem('clerion_local-name'),
            senderAddress: localStorage.getItem('clerion_local-address'),
            recipientName: document.getElementById('recipient-name').value,
            recipientAddress: document.getElementById('recipient-address').value,
            caseReference: document.getElementById('case-reference').value,
            bodyText: document.getElementById('freitext-input').value,
            signatureBase64: localStorage.getItem('clerion_signature') // Deine lokal gespeicherte Unterschrift
        };
        
        console.log("PDF Daten bereit für Backend-Generierung:", pdfData);
        alert("Frontend Logik abgeschlossen. Die Daten sind bereit für die PDF Generierung im Backend.");
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
});