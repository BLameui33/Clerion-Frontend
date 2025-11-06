// NEUE VERSION: email-assistent.js
document.addEventListener('DOMContentLoaded', () => {
    // === DOM-Elemente holen ===
    const logoutButton = document.getElementById('logout-button');
    const originalEmailInput = document.getElementById('original-email-input');
    const aiDraftOutput = document.getElementById('ai-draft-output');
    const generateDraftButton = document.getElementById('generate-draft-button');
    const refinementSection = document.getElementById('refinement-section');
    const refinementInput = document.getElementById('refinement-input');
    const updateDraftButton = document.getElementById('update-draft-button');
    const copyButton = document.getElementById('copy-button');
    const resetButton = document.getElementById('reset-button');

    // === Konfiguration und State ===
    const API_BASE_URL = 'https://api.clerion.de';
    const authToken = localStorage.getItem('behoerdenhilfe_token');
    let originalEmailForRefinement = ''; // Speichert die erste E-Mail für den Kontext bei Folgeanfragen

    // === Initialisierung & Sicherheit ===
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }


    // --- EVENT LISTENERS ---

    // 1. Logout-Button
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('behoerdenhilfe_token');
            window.location.href = 'index.html';
        });
    }

    // 2. Ersten Entwurf generieren
    if (generateDraftButton) {
        generateDraftButton.addEventListener('click', async () => {
            const emailText = originalEmailInput.value.trim();
            if (!emailText) {
                showNotification('Bitte fügen Sie die E-Mail ein, auf die Sie antworten möchten.', 'error');
                return;
            }

            // UI für Ladevorgang anpassen
            generateDraftButton.disabled = true;
            generateDraftButton.textContent = 'Entwurf wird erstellt...';
            aiDraftOutput.value = 'KI denkt nach...';

            try {
                const response = await fetch(`${API_BASE_URL}/api/email/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ emailText })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                aiDraftOutput.value = data.reply;
                originalEmailForRefinement = emailText; // Original-E-Mail für spätere Verfeinerungen speichern
                refinementSection.classList.remove('hidden');

            } catch (error) {
                aiDraftOutput.value = `Fehler: ${error.message}`;
            } finally {
                generateDraftButton.disabled = false;
                generateDraftButton.textContent = 'Antwort-Entwurf generieren';
            }
        });
    }

    // 3. Bestehenden Entwurf aktualisieren/verfeinern
    if (updateDraftButton) {
        updateDraftButton.addEventListener('click', async () => {
            const currentDraft = aiDraftOutput.value.trim();
            const instruction = refinementInput.value.trim();

            if (!instruction) {
                showNotification('Bitte geben Sie eine Anweisung zur Verbesserung ein.', 'error');
                return;
            }

            // UI für Ladevorgang anpassen
            updateDraftButton.disabled = true;
            updateDraftButton.textContent = 'Aktualisiere...';

            try {
                const response = await fetch(`${API_BASE_URL}/api/email/refine`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({
                        originalEmail: originalEmailForRefinement,
                        currentDraft,
                        instruction
                    })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);

                aiDraftOutput.value = data.newDraft;
                refinementInput.value = ''; // Eingabefeld für Anweisung leeren

            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            } finally {
                updateDraftButton.disabled = false;
                updateDraftButton.textContent = 'Entwurf aktualisieren';
            }
        });
    }

    // 4. Text in die Zwischenablage kopieren
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const textToCopy = aiDraftOutput.value;
            if (textToCopy) {
                navigator.clipboard.writeText(textToCopy)
                    .then(() => showNotification('Text in die Zwischenablage kopiert!', 'success'))
                    .catch(() => showNotification('Kopieren fehlgeschlagen.', 'error'));
            }
        });
    }

    // 5. Gesamten Vorgang zurücksetzen
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            originalEmailInput.value = '';
            aiDraftOutput.value = '';
            refinementInput.value = '';
            originalEmailForRefinement = '';
            refinementSection.classList.add('hidden');
            generateDraftButton.disabled = false;
            showNotification('Assistent wurde zurückgesetzt.', 'success');
        });
    }

    // --- HILFSFUNKTION ---
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        if (!container) return;
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        container.appendChild(notification);
        setTimeout(() => { notification.remove(); }, 3000);
    }
});

