// superadmin.js (erweiterte Version)
document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://api.clerion.de';
    const authToken = localStorage.getItem('behoerdenhilfe_token');
    const orgTableBody = document.getElementById('org-table-body');
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    let allData = [];

    if (!authToken) { window.location.href = 'index.html'; return; }

    async function fetchData() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/superadmin/organizations`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) {
                if (response.status === 403) window.location.href = 'dashboard.html';
                throw new Error('Daten konnten nicht geladen werden.');
            }
            allData = await response.json();
            renderTable(allData);
        } catch (error) {
            orgTableBody.innerHTML = `<tr><td colspan="8" class="error-row">${error.message}</td></tr>`;
        }
    }

    async function loadPublicTemplates() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/superadmin/public-templates`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("behoerdenhilfe_token")}`,
      },
    });
    const templates = await res.json();

    const tbody = document.getElementById('public-templates-list');
    tbody.innerHTML = '';

    if (!templates.length) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">Keine Vorlagen gefunden.</td></tr>`;
      return;
    }

    templates.forEach(tpl => {
  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td><input type="text" class="tpl-title" value="${tpl.titel}" style="width:100%;"></td>
    <td>${tpl.category}</td>
    <td><input type="text" class="tpl-desc" value="${tpl.beschreibung}" style="width:100%;"></td>
    <td><input type="text" class="tpl-file" value="${tpl.filename}" style="width:100%;"></td>
    <td style="white-space:nowrap;">
  <button class="btn btn-save-template" data-filename="${tpl.filename}">Speichern</button>
  <button class="btn btn-delete-template" data-filename="${tpl.filename}">Löschen</button>
</td>
  `;

  tbody.appendChild(tr);
});

    // Event Listener für die Löschbuttons
   tbody.querySelectorAll('.btn-delete-template').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const filename = e.target.dataset.filename;
    if (!confirm(`Vorlage "${filename}" wirklich löschen?`)) return;

        const data = await res.json();
        alert(data.message);
        loadPublicTemplates(); // neu laden
      });
    });

    // --- VORLAGE SPEICHERN ---
tbody.querySelectorAll('.btn-save-template').forEach(btn => {
  btn.addEventListener('click', async (e) => {
    const filename = e.target.dataset.filename;
    const row = e.target.closest('tr');
    const titel = row.querySelector('.tpl-title').value.trim();
    const beschreibung = row.querySelector('.tpl-desc').value.trim();
    const dateiname = row.querySelector('.tpl-file').value.trim();

    if (!titel || !beschreibung || !dateiname) {
      alert("Bitte fülle alle Felder aus, bevor du speicherst.");
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/superadmin/update-public-template/${filename}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("behoerdenhilfe_token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ titel, beschreibung, dateiname })
    });

    const data = await res.json();
    alert(data.message);
    loadPublicTemplates(); // Neu laden nach Update
  });
});


  } catch (error) {
    console.error("Fehler beim Laden der Vorlagen:", error);
  }
}

// Nach dem Laden der Seite starten
loadPublicTemplates();


    function renderTable(dataToRender) {
        orgTableBody.innerHTML = dataToRender.map(item => `
            <tr data-item-id="${item.id}">
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.ownerEmail || '—'}</td>
                <td>${item.ownerCreatedAt || item.createdAt 
      ? new Date(item.ownerCreatedAt || item.createdAt).toLocaleDateString() 
      : '—'}</td>
                <td><span class="badge ${item.subscriptionStatus}">${item.subscriptionStatus || 'N/A'}</span></td>
                <td>${item.currentUserCount} / ${item.maxSeats}</td>
                <td>${item.totalCases}</td>
                <td>${item.totalApplications}</td>
                <td class="action-cell">
                    <button class="btn-send-reset" data-user-id="${item.ownerUserId}">Reset senden</button>
                    <button class="btn-export-data" data-item-id="${item.id}">Export</button>
                    <button class="btn-delete-item" data-item-id="${item.id}" data-item-name="${item.name}">Löschen</button>
                </td>
            </tr>
        `).join('');
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedStatus = statusFilter.value;

        const filteredData = allData.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm) || item.ownerEmail.toLowerCase().includes(searchTerm);
            const matchesStatus = selectedStatus === 'all' || item.subscriptionStatus === selectedStatus;
            return matchesSearch && matchesStatus;
        });
        renderTable(filteredData);
    }

   async function loadSubmitted() {
  // KORREKTUR 1: "/uploads" entfernen
  const res = await fetch(`${API_BASE_URL}/vorlagen/eingereicht/eingereichte.json`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  
  if (!res.ok) return;
  const list = await res.json();
  const tbody = document.getElementById("submitted-list");
  
  tbody.innerHTML = list.map(f => `
    <tr>
      <td>${f.filename}</td>
      <td>${f.description}</td>
      <td>${f.uploader}</td>
      <td>${new Date(f.createdAt).toLocaleString()}</td>
      <td>
        <!-- KORREKTUR 2: Auch beim Download-Link "/uploads" entfernen -->
        <a href="${API_BASE_URL}/vorlagen/eingereicht/${f.filename}" target="_blank" class="btn btn-secondary">Download</a>
        
        <button class="btn btn-primary" data-file="${f.filename}">In Bibliothek übernehmen</button>
        <button class="btn btn-delete-submission" data-filename="${f.filename}">Löschen</button>
      </td>
    </tr>
  `).join("");
}
loadSubmitted();


// Zentraler Event-Listener für alle Aktionen
    document.body.addEventListener('click', async (e) => {
        const target = e.target;

        // --- DATENEXPORT ---
        if (e.target.classList.contains('btn-export-data')) {
            const itemId = e.target.dataset.itemId;
            e.target.textContent = 'Exportiere...';
            try {
                const response = await fetch(`${API_BASE_URL}/api/superadmin/export/${itemId}`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (!response.ok) throw new Error('Export fehlgeschlagen.');
                const data = await response.json();
                
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `export_item_${itemId}_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
            } catch (error) {
                alert(error.message);
            } finally {
                e.target.textContent = 'Daten exportieren';
            }
        }

        // --- ACCOUNT LÖSCHEN ---
        if (target.classList.contains('btn-delete-item')) {
            const itemId = target.dataset.itemId;
            const itemName = target.dataset.itemName;
            if (confirm(`Sind Sie absolut sicher, dass Sie den Account "${itemName}" (ID: ${itemId}) und alle zugehörigen Daten unwiderruflich löschen möchten?`)) {
                target.textContent = 'Lösche...';
                try {
                    const response = await fetch(`${API_BASE_URL}/api/superadmin/delete-item/${itemId}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (!response.ok) throw new Error((await response.json()).message);
                    document.querySelector(`tr[data-item-id="${itemId}"]`).remove();
                } catch (error) {
                    alert(error.message);
                    target.textContent = 'Löschen';
                }
            }
        }

        // --- PASSWORT-RESET SENDEN ---
        if (target.classList.contains('btn-send-reset')) {
            const userId = target.dataset.userId;
            if (confirm(`Möchten Sie wirklich einen Passwort-Reset-Link an den Nutzer mit der ID ${userId} senden?`)) {
                target.textContent = 'Sende...';
                try {
                    const response = await fetch(`${API_BASE_URL}/api/superadmin/send-reset/${userId}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    if (!response.ok) throw new Error((await response.json()).message);
                    alert('Reset-Link erfolgreich gesendet.');
                } catch (error) {
                    alert(error.message);
                } finally {
                    target.textContent = 'Reset senden';
                }
            }
        }

        if (target.classList.contains('btn-delete-submission')) {
    const filename = target.dataset.filename;
    if (confirm(`Soll die eingereichte Datei "${filename}" wirklich gelöscht werden?`)) {
        target.textContent = 'Lösche...';
        try {
            const response = await fetch(`${API_BASE_URL}/api/superadmin/delete-submission/${filename}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const resData = await response.json();
            if (!response.ok) throw new Error(resData.message);
            
            alert(resData.message);
            target.closest('tr').remove();
        } catch (error) {
            alert('Fehler: ' + error.message);
            target.textContent = 'Löschen';
        }
    }
}

        // --- EINGEREICHTES FORMULAR ÜBERNEHMEN ---
        if (target.classList.contains('btn-primary') && target.dataset.file) {
            const filename = target.dataset.file;
            if (confirm(`Soll die Datei "${filename}" in die Haupt-Bibliothek übernommen werden?`)) {
                target.textContent = 'Übernehme...';
                 try {
                    const response = await fetch(`${API_BASE_URL}/api/superadmin/adopt-submission/${filename}`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${authToken}` }
                    });
                    const resData = await response.json();
                    if (!response.ok) throw new Error(resData.message);

                    alert(resData.message);
                    target.closest('tr').remove(); // Zeile aus der Tabelle entfernen
                } catch (error) {
                    alert('Fehler: ' + error.message);
                    target.textContent = 'In Bibliothek übernehmen';
                }
            }
        }
    });

    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    fetchData();
});