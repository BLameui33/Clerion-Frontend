// konto.js
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://api.clerion.de';
    const authToken = localStorage.getItem('behoerdenhilfe_token');
    
    // Sicherheits-Check: Wenn kein Token da ist, zurück zur Startseite
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }

    // =======================================================
    // HILFSFUNKTIONEN
    // =======================================================

    async function initializeView() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) {
                localStorage.removeItem('behoerdenhilfe_token');
                window.location.href = 'index.html';
                return;
            }
            const currentUser = await response.json();

            // KORREKTUR: Wir prüfen jetzt auf den Typ, nicht auf die Rolle.
            // Dies erfasst den Inhaber und alle Mitarbeiter.
            const deleteSection = document.querySelector('.card[style*="border-color: var(--error-color);"]');
            if (deleteSection && currentUser.type === 'b2b') {
                deleteSection.style.display = 'none'; // Versteckt den Block für ALLE B2B-Nutzer.
            }

        } catch (error) {
            console.error("Fehler beim Initialisieren der Ansicht:", error);
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

    // =======================================================
    // EVENT-LISTENER FÜR DIE FORMULARE
    // =======================================================

    // --- E-Mail-Adresse ändern ---
    const changeEmailForm = document.getElementById('change-email-form');
    if (changeEmailForm) {
        changeEmailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newEmail = document.getElementById('new-email-input').value;
            if (!confirm(`Möchten Sie wirklich eine Bestätigungs-E-Mail an "${newEmail}" senden?`)) return;

            try {
                const response = await fetch(`${API_BASE_URL}/api/user/request-email-change`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ newEmail })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                showNotification(data.message, 'success');
                changeEmailForm.reset();
            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            }
        });
    }

    // --- Passwort ändern ---
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password-input').value;
            const newPassword = document.getElementById('new-password-input').value;
            const confirmNewPassword = document.getElementById('confirm-new-password-input').value;

            if (newPassword !== confirmNewPassword) {
                showNotification('Die neuen Passwörter stimmen nicht überein.', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.message);
                
                showNotification(data.message + ' Sie werden zur Sicherheit in 3 Sekunden ausgeloggt.', 'success');
                // Logge den Nutzer aus Sicherheitsgründen aus
                setTimeout(() => {
                    localStorage.removeItem('behoerdenhilfe_token');
                    window.location.href = 'index.html';
                }, 3000);

            } catch (error) {
                showNotification(`Fehler: ${error.message}`, 'error');
            }
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

    // --- Konto löschen (Modal-Logik) ---
    const openDeleteModalButton = document.getElementById('open-delete-modal-button');
    const deleteModalOverlay = document.getElementById('delete-modal-overlay');
    const closeModalButton = document.getElementById('close-modal-button');
    const finalDeleteButton = document.getElementById('final-delete-button');

    if (openDeleteModalButton) {
        openDeleteModalButton.addEventListener('click', () => {
            deleteModalOverlay.classList.remove('hidden');
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => deleteModalOverlay.classList.add('hidden'));
    }
    
    if (deleteModalOverlay) {
        deleteModalOverlay.addEventListener('click', (e) => {
            if (e.target === deleteModalOverlay) deleteModalOverlay.classList.add('hidden');
        });
    }

    if (finalDeleteButton) {
        finalDeleteButton.addEventListener('click', async () => {
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
                showNotification(`Fehler: ${error.message}`, 'error');
            }
        });
    }

initializeView();
});