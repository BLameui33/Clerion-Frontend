document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://api.clerion.de';
    let authToken = localStorage.getItem('behoerdenhilfe_token');
    
    // UI-Elemente
    const b2bClientSelector = document.getElementById('b2b-client-selector');
    const clientSelect = document.getElementById('client-select-dropdown');
    const promptInput = document.getElementById('ai-prompt-input');
    const generateButton = document.getElementById('generate-pdf-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const logoutButton = document.getElementById('logout-button');

    // --- Initialisierung ---
    
    async function initialize() {
        if (!authToken) {
            window.location.href = 'index.html';
            return;
        }

  

        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('behoerdenhilfe_token');
            window.location.href = 'index.html';
        });

        generateButton.addEventListener('click', generateApplication);

        await fetchCurrentUserAndClients();
    }

    // --- Daten laden (Klienten & Nutzer) ---

    async function fetchCurrentUserAndClients() {
        try {
            // 1. Nutzer holen
            const userResponse = await fetch(`${API_BASE_URL}/auth/me`, { 
                headers: { 'Authorization': `Bearer ${authToken}` } 
            });
            if (!userResponse.ok) throw new Error("Sitzung ungültig.");
            const user = await userResponse.json();

            // 2. Wenn B2B, Klienten laden
            if (user.type === 'b2b') {
                const clientsResponse = await fetch(`${API_BASE_URL}/api/clients?type=application`, { 
                    headers: { 'Authorization': `Bearer ${authToken}` } 
                });
                if (!clientsResponse.ok) throw new Error('Klienten konnten nicht geladen werden.');
                
                const clients = await clientsResponse.json();
                
                clients.forEach(client => {
                    const option = document.createElement('option');
                    option.value = client.id;
                    option.textContent = client.name;
                    clientSelect.appendChild(option);
                });
                
                b2bClientSelector.classList.remove('hidden');
            }
        } catch (e) {
            console.error(e.message);
            if (e.message === "Sitzung ungültig.") {
                localStorage.removeItem('behoerdenhilfe_token');
                window.location.href = 'index.html';
            }
        }
    }

    // --- Kernfunktion: Antrag generieren ---

    async function generateApplication() {
  const prompt = document.getElementById('ai-prompt-input').value.trim();
  const clientId = document.getElementById('client-select-dropdown')?.value || null;
  const recipientName = document.getElementById('recipient-name').value.trim();
  const recipientAddress = document.getElementById('recipient-address').value.trim();
  const senderName = document.getElementById('sender-name').value.trim();
  const senderAddress = document.getElementById('sender-address').value.trim();

  const generateButton = document.getElementById('generate-pdf-button');
  const loadingIndicator = document.getElementById('loading-indicator');

  if (!recipientName || !recipientAddress) {
    alert('Bitte geben Sie die vollständigen Empfängerdaten ein.');
    return;
  }
  if (!prompt) {
    alert('Bitte geben Sie eine Anweisung für die KI ein.');
    return;
  }

  // UI-Zustand anpassen
  generateButton.disabled = true;
  loadingIndicator.classList.remove('hidden');
  generateButton.textContent = 'PDF wird vorbereitet...';

  try {
    // === 1️⃣ KI-VORSCHAU anfordern ===
    const previewRes = await fetch(`${API_BASE_URL}/api/applications/generate-formless-preview`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ prompt })
    });

    const previewData = await previewRes.json();
    if (!previewRes.ok) throw new Error(previewData.message || 'KI-Vorschau fehlgeschlagen.');

    // === 2️⃣ Overlay öffnen & Text anzeigen ===
    const overlay = document.getElementById('review-overlay');
    const reviewTextarea = document.getElementById('review-textarea');
    reviewTextarea.value = previewData.previewText;

    // Meta-Daten speichern (Titel, Betreff, Dateiname)
    window.previewMeta = previewData.meta;

    // Optional: Titel & Betreff im Overlay anzeigen, falls vorhanden
    const metaTitle = document.getElementById('review-title');
    const metaSubject = document.getElementById('review-subject');
    if (metaTitle) metaTitle.textContent = previewData.meta?.title || 'Formloser Antrag';
    if (metaSubject) metaSubject.textContent = previewData.meta?.subject || '';

    overlay.classList.remove('hidden');
    loadingIndicator.classList.add('hidden');
    generateButton.disabled = false;
    generateButton.textContent = 'Antrag generieren & speichern';

    // === 3️⃣ Listener für "Abbrechen" ===
    document.getElementById('cancel-review').onclick = () => {
      overlay.classList.add('hidden');
    };

    // === 4️⃣ Listener für "PDF final erstellen" ===
    document.getElementById('confirm-review').onclick = async () => {
      const finalText = reviewTextarea.value;
      overlay.classList.add('hidden');
      loadingIndicator.classList.remove('hidden');
      generateButton.disabled = true;
      generateButton.textContent = 'PDF wird erstellt...';

      try {
        const saveRes = await fetch(`${API_BASE_URL}/api/applications/generate-formless`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            finalText,
            clientId,
            recipientName,
            recipientAddress,
            senderName,
            senderAddress,
            // Meta-Daten aus Vorschau beibehalten
            title: window.previewMeta?.title,
            filename: window.previewMeta?.filename,
            subject: window.previewMeta?.subject
          })
        });

        const saveData = await saveRes.json();
        if (!saveRes.ok) throw new Error(saveData.message || 'Fehler beim Erstellen des PDFs.');

        // Erfolg – weiterleiten
        alert('Der Antrag wurde erfolgreich erstellt!');
        window.location.href = `antragshelfer.html?id=${saveData.applicationId}`;
      } catch (err) {
        console.error(err);
        alert('Fehler beim Speichern des Antrags. Bitte versuchen Sie es erneut.');
      } finally {
        loadingIndicator.classList.add('hidden');
        generateButton.disabled = false;
        generateButton.textContent = 'Antrag generieren & speichern';
      }
    };

  } catch (error) {
    console.error('Fehler bei der KI-Vorschau:', error);
    alert(`Fehler: ${error.message}`);
    loadingIndicator.classList.add('hidden');
    generateButton.disabled = false;
    generateButton.textContent = 'Antrag generieren & speichern';
  }
}



    initialize();
});