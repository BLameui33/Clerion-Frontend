document.addEventListener('DOMContentLoaded', () => {

    const API_BASE_URL = 'https://api.clerion.de';
    const templatesContainer = document.getElementById('templates-container');
    const searchInput = document.getElementById('search-input');
    let allTemplates = []; // Hier speichern wir die geladenen Daten

    /**
     * Hauptfunktion zum Rendern der Vorlagenliste
     */
    function renderTemplates(filter = '') {
        templatesContainer.innerHTML = '';
        const filterLowerCase = filter.toLowerCase();

        // Filtert die Daten basierend auf der Sucheingabe
        const filteredData = allTemplates
            .map(category => {
    const filteredForms = category.formulare.filter(form => {
    // Titel kann String ODER Array sein
    let rawTitel = form.titel;
    let titel = '';

    if (Array.isArray(rawTitel)) {
        titel = rawTitel.join(' ').toLowerCase();
    } else if (typeof rawTitel === 'string') {
        titel = rawTitel.toLowerCase();
    }

    const beschreibung =
        typeof form.beschreibung === 'string'
            ? form.beschreibung.toLowerCase()
            : '';

    return titel.includes(filterLowerCase) || beschreibung.includes(filterLowerCase);
});
                return { ...category, formulare: filteredForms };
            })
            .filter(category => category.formulare.length > 0);

        if (filteredData.length === 0) {
            templatesContainer.innerHTML = '<p>Keine passenden Vorlagen gefunden.</p>';
            return;
        }

        // Baut die HTML-Struktur für jede Kategorie auf
        filteredData.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'template-category';

            const header = document.createElement('h3');
            header.className = 'category-header';
            header.textContent = category.kategorie;
            header.addEventListener('click', () => {
                // Klappt die Liste auf und zu
                categoryElement.classList.toggle('open');
            });

            const formList = document.createElement('ul');
            formList.className = 'form-list';
            
            category.formulare.forEach(form => {
    const formItem = document.createElement('li');
    formItem.className = 'form-item';

    const displayTitel = Array.isArray(form.titel) ? form.titel[0] : form.titel;

    formItem.innerHTML = `
        <div class="form-item-text">
            <strong>${displayTitel}</strong>
            <p>${form.beschreibung}</p>
        </div>
        <a href="antragshelfer.html?vorlage=${form.datei}" class="btn btn-primary">Verwenden</a>
    `;
    formList.appendChild(formItem);
});

            categoryElement.appendChild(header);
            categoryElement.appendChild(formList);
            templatesContainer.appendChild(categoryElement);
        });
    }

    /**
     * Initialisierungsfunktion: Lädt die JSON-Daten und richtet die Suche ein
     */
    async function initialize() {
    try {
        const response = await fetch(`${API_BASE_URL}/vorlagen/vorlagen.json`);
        if (!response.ok) throw new Error('Vorlagen konnten nicht geladen werden.');
        allTemplates = await response.json();
        console.log('allTemplates aus vorlagen.json:', allTemplates);

        const categorySelect = document.getElementById('categorySelect');
        if (categorySelect) {
            allTemplates.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.kategorie;
                opt.textContent = cat.kategorie;
                categorySelect.appendChild(opt);
            });
        }

        renderTemplates();

        searchInput.addEventListener('input', (e) => {
            renderTemplates(e.target.value);
        });

    } catch (error) {
        templatesContainer.innerHTML = `<p class="error">${error.message}</p>`;
    }
}

    document.getElementById("formUpload").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fileInput = e.target.querySelector('input[type="file"]');
  const file = fileInput.files[0];
  const category = document.getElementById('categorySelect').value;
  const title = e.target.description.value.trim();

  if (!file) return alert("Bitte wähle eine PDF-Datei aus.");
  if (!category) return alert("Bitte wähle eine Kategorie aus.");
  if (!title) return alert("Bitte gib einen Titel für die Vorlage ein.");

  const formData = new FormData();
  formData.append('file', file);
  formData.append('description', title);
  //formData.append('description', e.target.description.value);
  formData.append('category', category);
  

  try {
    const res = await fetch("https://api.clerion.de/api/superadmin/upload-vorlage", {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("behoerdenhilfe_token")}`,
      },
    });

    const data = await res.json();
    document.getElementById("uploadMessage").textContent = data.message || "Upload erfolgreich!";
    document.getElementById("uploadMessage").style.color = "green";
    e.target.reset();
  } catch (error) {
    console.error(error);
    document.getElementById("uploadMessage").textContent = "Fehler beim Hochladen.";
    document.getElementById("uploadMessage").style.color = "red";
  }
});





    initialize();
});

function openUpload() {
  document.getElementById('uploadModal').classList.remove('hidden');
}

function closeUpload() {
  document.getElementById('uploadModal').classList.add('hidden');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeUpload();
  }
});