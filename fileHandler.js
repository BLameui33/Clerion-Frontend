

const API_BASE_URL_FILE = 'https://api.clerion.de'; // Oder deine URL

/**
 * Lädt ein Dokument sicher herunter (für PDFs, Word, etc.)
 */
async function downloadSecureFile(urlPath, filename) {
    try {
        const token = localStorage.getItem('behoerdenhilfe_token');
        if (!token) {
            alert("Bitte loggen Sie sich erneut ein.");
            return;
        }

        // Der Trick: Wir fetchen die Datei als "Blob" (Binärdaten) mit dem Token im Header
        const response = await fetch(`${API_BASE_URL_FILE}${urlPath}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Download fehlgeschlagen');

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Unsichtbarer Link zum Anklicken
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Aufräumen
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
        console.error('Download Fehler:', error);
        alert('Fehler beim Laden der Datei. Haben Sie die Berechtigung?');
    }
}

/**
 * Lädt ein Bild sicher und zeigt es in einem <img> Tag an (für Signaturen)
 */
async function showSecureImage(urlPath, imgElementId) {
    try {
        const token = localStorage.getItem('behoerdenhilfe_token');
        const imgElement = document.getElementById(imgElementId);
        if (!imgElement) return;

        const response = await fetch(`${API_BASE_URL_FILE}${urlPath}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Bild nicht geladen');

        const blob = await response.blob();
        imgElement.src = window.URL.createObjectURL(blob);
        imgElement.classList.remove('hidden'); // Falls es vorher versteckt war

    } catch (error) {
        console.error('Bild Fehler:', error);
    }
}
