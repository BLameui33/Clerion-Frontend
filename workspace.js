/**
 * workspace.js
 * Frontend-Logik für den persönlichen Workspace (B2C) und das B2B-Cockpit.
 */

const API_BASE_URL = 'https://api.clerion.de'; // Pfad ggf. anpassen
const token = localStorage.getItem('behoerdenhilfe_token');
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');


function setupMenu() {
    const menu = document.getElementById('main-menu');
    menu.innerHTML = ''; 

    const isB2B = currentUser.type === 'b2b';

    const tiles = [
        // 1. Orientierung
        { id: 'knowledge', title: 'Orientierung', icon: '🧭', desc: 'Wegweiser & Wissen.' },

         { id: 'tracker', title: 'Realitäts-Check', icon: '📊', desc: 'Wie war der Tag? Kurz & knapp.', show: !isB2B },
        
        // 2. Organisation 
        { id: 'org', title: 'Orga & Notizen', icon: '✅', desc: 'Aufgaben und Gedanken sortieren.' },

        { id: 'companion', title: 'Gedanken-Sortierer', icon: '🤖', desc: 'Entscheidungen treffen & Klarheit finden.' },

        // 3. Tagebuch (Nur B2C)
        { id: 'diary', title: 'Tagebuch', icon: '📖', desc: 'Gedanken frei von der Leber schreiben.', show: !isB2B },

        { id: 'relief', title: 'Entlastungs-Finder', icon: '⚖️', desc: 'Hilfe finden, ohne zu suchen.', show: !isB2B },
        
        // 4. Dokumente / Koffer
        { id: 'docs', title: isB2B ? 'Vorlagen & Docs' : 'Notfall-Koffer', icon: isB2B ? '📂' : '🎒', desc: 'Wichtige Unterlagen an einem Ort.' },

        // 5. Selfcare 
       
        { id: 'selfcare', title: 'Ruhe-Oase', icon: '☕', desc: 'Kleine Pause für den Kopf.', link: 'selfcare.html'},

        // 6. B2B Features
        { id: 'snippets', title: 'Textbausteine', icon: '📋', desc: 'Effizient antworten.', show: isB2B },
        { id: 'sandbox', title: 'Datenschutz-Box', icon: '🛡️', desc: 'Texte anonymisieren.', show: isB2B },
    ];

    tiles.forEach(tile => {
        if (tile.show === false) return;

        const el = document.createElement('div');
        el.className = 'menu-tile';
        el.innerHTML = `
            <div class="tile-icon">${tile.icon}</div>
            <div class="tile-title">${tile.title}</div>
            <div class="tile-desc">${tile.desc}</div>
        `;
        
        el.onclick = () => {
            if (tile.link) {
                // Wenn es ein Link ist (wie bei Selfcare), Seite wechseln
                window.location.href = tile.link;
            } else {
                // Sonst Modul öffnen
                openModule(tile.id);
            }
        };
        
        menu.appendChild(el);
    });
}

function openModule(moduleId) {
    // 1. Menü ausblenden
    document.getElementById('main-menu').classList.add('hidden');

    // 2. Alle Module sicherheitshalber verstecken (active wegnehmen)
    document.querySelectorAll('.module-view').forEach(el => el.classList.remove('active'));

    // 3. Das gewählte Modul suchen und anzeigen
    const target = document.getElementById('mod-' + moduleId);
    if (target) {
        target.classList.remove('hidden'); // Falls hidden Klasse drauf war
        target.classList.add('active');

        if (moduleId === 'tracker') {
            loadTrackerHistory();
        }
    } else {
        console.warn("Modul nicht gefunden: " + moduleId);
    }
}

// Wird vom "Zurück" Button aufgerufen
window.showMenu = function() {
    // 1. Alle Module verstecken
    document.querySelectorAll('.module-view').forEach(el => el.classList.remove('active'));
    
    // 2. Menü wieder anzeigen
    document.getElementById('main-menu').classList.remove('hidden');
}

// =================================================================
// 1. STATISCHE INHALTE (Wissensdatenbank & Tipps)
// =================================================================

// Sanfte Hinweise für den B2C-Bereich
const gentleHints = [
    "Sie müssen nicht alles auf einmal erledigen.",
    "Viele Menschen brauchen mehrere Anläufe für Anträge. Das ist normal.",
    "Atmen Sie durch. Behördenfristen betragen oft 2 bis 4 Wochen.",
    "Ein Schritt nach dem anderen reicht völlig aus.",
    "Es ist in Ordnung, sich Hilfe zu holen, wenn es zu viel wird.",
  "Sie müssen das nicht heute lösen.",
  "Es ist okay, wenn gerade nur ein kleiner Schritt geht.",
  "Sie dürfen sich Zeit lassen.",
  "Atmen Sie kurz durch – dann geht’s weiter.",
  "Sie müssen nicht stark sein, um weiterzumachen.",
  "Pause ist erlaubt.",
  "Heute reicht auch „ein bisschen“.",
  "Sie sind nicht allein damit.",
  "Es ist normal, wenn das gerade viel ist.",
  "Sie dürfen jederzeit speichern und später weitermachen.",
  "Es muss nicht perfekt sein, nur machbar.",
  "Ein Schritt nach dem anderen.",
  "Wenn es zu viel wird: kurz stoppen ist auch Fortschritt.",
  "Sie müssen nicht alles im Kopf behalten – Stück für Stück.",
  "Es ist okay, Hilfe anzunehmen.",
  "Sie machen das in Ihrem Tempo.",
  "Auch kleine Erledigungen zählen.",
  "Es ist verständlich, wenn Sie gerade müde sind.",
  "Sie dürfen freundlich mit sich sein.",
  "Das hier darf sich leicht anfühlen – soweit es geht.",
  "Wenn heute nur Ordnung entsteht, ist das schon viel.",
  "Sie müssen jetzt nicht alles verstehen.",
  "Es ist okay, erstmal nur anzufangen.",
  "Sie dürfen Dinge später ergänzen.",
  "Wenn etwas fehlt: das lässt sich oft klären.",
  "Sie müssen nicht alles alleine tragen.",
  "Langsam ist nicht falsch. Langsam ist nachhaltig.",
  "Es ist in Ordnung, wenn Sie kurz den Überblick verlieren.",
  "Es ist okay, wenn Sie heute nur bis hierhin kommen.",
  "Sie sind gerade weiter, als es sich anfühlt."
];

const b2bMotivations = [
    "Jeder kleine Schritt zählt. Sie schaffen das!",
    "Fokussieren Sie sich auf das Machbare. Kleine Erfolge motivieren.",
    "Erinnern Sie sich an Ihre Erfolge: Was haben Sie diese Woche bereits gemeistert?",
    "Eine kurze Pause kann Wunder wirken. Stehen Sie kurz auf und dehnen Sie sich.",
    "Sie meistern komplexe Aufgaben – das ist eine Leistung!",
    "Jeder kleine Schritt zählt. Sie schaffen das!",
  "Fokussieren Sie sich auf das Machbare. Kleine Erfolge motivieren.",
  "Erinnern Sie sich an Ihre Erfolge: Was haben Sie diese Woche bereits gemeistert?",
  "Eine kurze Pause kann Wunder wirken. Stehen Sie kurz auf und dehnen Sie sich.",
  "Sie meistern komplexe Aufgaben – das ist eine Leistung!",

  "Sie müssen nicht alles heute abschließen – Priorisieren reicht.",
  "Professionell arbeiten heißt auch: Grenzen setzen.",
  "Kurz innehalten: Was ist der nächste sinnvolle Schritt?",
  "Ein sauberer nächster Schritt ist besser als zehn halbe.",
  "Dokumentation kostet Zeit – sie schützt später Nerven.",
  "Wenn es gerade zu viel ist: erst stabilisieren, dann entscheiden.",
  "Nicht alles ist dringlich. Wählen Sie bewusst, was jetzt dran ist.",
  "Es ist okay, Dinge zu vertagen, wenn die Lage es erfordert.",
  "Sie dürfen Aufgaben abgeben – das ist gutes Fallmanagement.",
  "Teamarbeit ist kein Luxus, sondern Qualitätssicherung.",
  "Eine Rückfrage ist keine Schwäche, sondern Sorgfalt.",
  "Auch kleine Entlastungen für Klient:innen sind große Wirkung.",
  "Sie können nur das steuern, was heute in Ihrem Einfluss liegt.",
  "Kurz prüfen: Was bringt heute am meisten Wirkung pro Minute?",
  "Wenn es emotional wird: einmal atmen, dann erst antworten.",
  "Sie tragen viel Verantwortung – und Sie müssen sie nicht alleine tragen.",
  "Ein klares Nein schützt Ihr Ja an anderer Stelle.",
  "Es ist in Ordnung, nicht jede Lücke sofort zu schließen.",
  "Routine entlastet: Standard-Schrittfolgen sind erlaubt.",
  "Wenn die To-do-Liste wächst: ein Punkt weniger ist auch Fortschritt.",
  "Sie arbeiten mit Menschen – nicht mit perfekten Bedingungen.",
  "Ihr Blick fürs Wesentliche ist Teil Ihrer Expertise.",
  "Ein kurzer Realitätscheck: Was ist heute realistisch leistbar?",
  "Sie dürfen freundlich mit sich sein – auch im Professionellen.",
  "Manches braucht mehrere Kontakte. Das ist Prozess, nicht Scheitern.",
  "Sie schaffen Orientierung in komplexen Systemen – das zählt.",
  "Wenn Sie müde sind: eine Minute Pause ist besser als durchbeißen.",
  "Heute reicht „gut und sicher“ – nicht „maximal“."
];

const knowledgeBase = {
    // --- B2C LEBENSLAGEN ---

   pflege: {
  title: "Pflege & Gesundheit",
  content: `
    <p>Pflegebedürftigkeit kommt oft plötzlich. Hier ist der Überblick, um Ruhe zu bewahren:</p>
    
    <strong>🏛️ Zuständige Stellen</strong>
    <ul>
      <li><strong>Pflegekasse:</strong> Ihr erster Ansprechpartner für Pflegegrade.</li>
      <li><strong>Medizinischer Dienst (MD):</strong> Kommt zur Begutachtung nach Hause.</li>
      <li><strong>Sozialamt:</strong> "Hilfe zur Pflege", wenn die Rente nicht reicht.</li>
    </ul>

    <strong>📝 Wichtige Anträge</strong>
    <ul>
      <li>Erstantrag auf Pflegegrad (formlos möglich!)</li>
      <li>Verhinderungspflege (für Auszeiten der Pflegeperson)</li>
      <li>Wohnumfeldverbessernde Maßnahmen (z.B. Treppenlift)</li>
    </ul>

    <strong>💡 Pro-Tipp für den MD-Besuch</strong>
    <p>Der Medizinische Dienst prüft streng. <em>Beschönigen Sie nichts.</em> Führen Sie 14 Tage vorher ein <strong>Pflegetagebuch</strong> und notieren Sie jede Hilfeleistung minutengenau. Das ist oft entscheidend für den Pflegegrad.</p>
    
    <p style="color: #d9534f;"><strong>⚠️ Frist beachten:</strong> Widerspruch gegen den Bescheid muss binnen <strong>1 Monat</strong> erfolgen.</p>

    <div class="info-link-container">
      <a href="https://kassen-lotse.de" class="info-link" target="_blank">
        Sie möchten mehr wissen? Zu unseren kostenlosen Info-Seiten
      </a>
    </div>

    <div class="ws-subtopics" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px; color: #666;">Weitere Tipps im Thema Pflege</div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🩺 MD-Besuch: So bereitest du dich vor</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Pflegetagebuch führen (14 Tage, gern minutengenau und mit Beispielen).</li>
            <li>Auch „schlechte Tage“ dokumentieren (Stürze, Inkontinenz, Verwirrtheit, Nachtsituation).</li>
            <li>Unterlagen griffbereit: Diagnosen, Medikamentenplan, Arztbriefe, Entlassberichte, Therapien.</li>
            <li>Wenn möglich: Eine zweite Person dabei haben (Unterstützung/Zeuge).</li>
            <li>Wohnung zeigen: Stolperstellen, Bad, Treppen, Hilfsmittelbedarf (realistisch).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📄 Pflegegrad: Antrag, Ablauf, typische Fehler</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Erstantrag kann formlos gestellt werden (Hauptsache Datum ist gesichert).</li>
            <li>Beschreiben Sie Hilfe konkret: Was genau? Wie oft? Wie lange? Was passiert ohne Hilfe?</li>
            <li>Häufiger Fehler: „Geht schon irgendwie“ – das senkt die Einstufung.</li>
            <li>Nach dem MD-Termin: Notieren, was besprochen/gezeigt wurde (für späteren Widerspruch hilfreich).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>💶 Pflegegeld, Pflegesachleistung & Kombinationsleistung</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li><strong>Pflegegeld:</strong> wenn privat gepflegt wird (z.B. Angehörige/Nachbarn).</li>
            <li><strong>Pflegesachleistung:</strong> wenn ein Pflegedienst Leistungen erbringt.</li>
            <li><strong>Kombinationsleistung:</strong> wenn beides zusammen genutzt wird (Pflegedienst + Familie).</li>
            <li>Wichtig: Beratungseinsätze/Termine einhalten, damit es keine Kürzungen/Probleme gibt.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧺 Entlastung im Alltag: was viele nicht nutzen</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Es gibt oft Möglichkeiten für Unterstützung im Alltag (Haushalt, Betreuung, Begleitung) – nicht alles ist „Pflegedienst“.</li>
            <li>Praktisch: Liste machen, was am meisten entlastet (Einkaufen, Duschen, Essen, Nacht, Termine).</li>
            <li>Tipp: Erst Entlastung planen, dann Leistungen passend dazu auswählen (statt umgekehrt).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧑‍🦽 Hilfsmittel & Wohnumfeld: schneller zu mehr Sicherheit</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Typische Sofort-Helfer: Duschhocker, Haltegriffe, Toilettensitzerhöhung, Rollator, Pflegebett (je nach Bedarf).</li>
            <li>Wohnung „pflegesicher“ machen: Stolperfallen entfernen, Licht/Wege optimieren, Bad entlasten.</li>
            <li>Wohnumfeldverbesserungen früh anstoßen, wenn Treppen/Bad die Hauptprobleme sind.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>⏳ Auszeiten organisieren: Verhinderungspflege & Kurzzeitpflege</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Wenn Pflegepersonen erschöpfen, kippt oft das ganze System – Auszeiten sind Teil der Versorgung.</li>
            <li>Planen Sie „Notfall-Optionen“: Wer kann einspringen? Was ist kurzfristig möglich?</li>
            <li>Tipp: Früh anfangen (Anbieter/Plätze sind oft knapp, besonders kurzfristig).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>✉️ Pflegegrad zu niedrig? Widerspruch & Höherstufung</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Frist im Blick behalten: Widerspruch meist innerhalb von 1 Monat.</li>
            <li>Begründung „greifbar“ machen: konkrete Alltagssituationen + Häufigkeit + Zeitaufwand.</li>
            <li>Wenn sich der Zustand verschlechtert: auch eine Höherstufung kann sinnvoll sein (nicht ewig warten).</li>
            <li>Alles geordnet abgeben (Kopien, Datum, Nachweis der Abgabe).</li>
          </ul>
        </div>
      </div>

    </div>
  `
},


    krankheit: {
  title: "Krankheit & Behinderung",
  content: `
    <p>Wenn die Gesundheit dauerhaft eingeschränkt ist, stehen Ihnen Nachteilsausgleiche zu.</p>

    <strong>🏛️ Zuständige Stellen</strong>
    <ul>
      <li><strong>Versorgungsamt:</strong> Feststellung des GdB (Grad der Behinderung).</li>
      <li><strong>Rentenversicherung:</strong> Reha-Maßnahmen & Erwerbsminderungsrente.</li>
      <li><strong>Krankenkasse:</strong> Krankengeld (nach 6 Wochen Lohnfortzahlung).</li>
    </ul>

    <strong>📂 Vorbereitung ist alles</strong>
    <p>Sammeln Sie <strong>alle Arztberichte</strong> der letzten 2 Jahre <em>bevor</em> Sie Anträge stellen. Behörden ermitteln zwar selbst, aber eigene Unterlagen beschleunigen das Verfahren massiv.</p>

    <strong>💡 Gut zu wissen</strong>
    <p>Ein GdB ab 50 gilt als "Schwerbehinderung" (besonderer Kündigungsschutz, Zusatzurlaub). Darunter (GdB 30-40) ist eine "Gleichstellung" über die Agentur für Arbeit möglich.</p>

    <div class="info-link-container">
      <a href="https://kassen-lotse.de" class="info-link" target="_blank">
        Sie möchten mehr wissen? Zu unseren kostenlosen Info-Seiten
      </a>
    </div>

    <div class="ws-subtopics" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px; color:#666;">Weitere Tipps im Thema Krankheit & Behinderung</div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧾 GdB-Antrag: So wird er “stark”</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Diagnosen allein reichen selten – entscheidend sind konkrete Einschränkungen im Alltag.</li>
            <li>Nutzen Sie Formulierungen wie: „Kann nicht länger als X Minuten stehen / braucht Hilfe beim …“.</li>
            <li>Listen Sie behandelnde Ärzte vollständig auf (inkl. Fachrichtungen, Zeiträume).</li>
            <li>Wenn möglich: Befundberichte als Kopie direkt beilegen (beschleunigt oft).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📑 Unterlagen-Checkliste (damit nichts fehlt)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Arztbriefe / Entlassberichte (Krankenhaus, Reha).</li>
            <li>Aktueller Medikamentenplan.</li>
            <li>Berichte von Physio/Ergo/Psychotherapie (wenn vorhanden).</li>
            <li>Eigene Liste: Einschränkungen nach Lebensbereichen (Mobilität, Haushalt, Arbeit, Schlaf, Schmerzen).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧠 Erwerbsminderungsrente: typische Stolperfallen</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Die Rentenversicherung schaut stark auf Reha/Behandlung: „Reha vor Rente“ ist häufig die Logik.</li>
            <li>Wichtig ist die Frage: Wie viele Stunden pro Tag ist Arbeit realistisch möglich?</li>
            <li>Sammeln Sie Nachweise zu Krankheitsverlauf, Therapie, Arbeitsunfähigkeitszeiten.</li>
            <li>Wenn ein Bescheid kommt: Fristen prüfen und Unterlagen nachweisbar einreichen.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🛡️ Schwerbehindertenausweis: was bringt er konkret?</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Mögliche Vorteile: Zusatzurlaub, Kündigungsschutz, Steuererleichterungen (je nach Fall).</li>
            <li>Merkzeichen können zusätzliche Nachteilsausgleiche eröffnen (z.B. Mobilität).</li>
            <li>Prüfen Sie auch: Gleichstellung (GdB 30–40) kann im Job helfen.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>⏱️ Widerspruch & Fristen: so gehst du sicher</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Frist sofort notieren (Bescheid + Zugangstag).</li>
            <li>Zur Fristwahrung kann ein kurzer Widerspruch erstmal reichen – Begründung nachreichen.</li>
            <li>Fordern Sie Akteneinsicht bzw. die medizinische Begründung an, wenn unklar.</li>
          </ul>
        </div>
      </div>

    </div>
  `
},


    finanzen: {
  title: "Finanzen & Existenzsicherung",
  content: `
    <p>Finanzielle Engpässe erzeugen Druck. Wichtig ist jetzt schnelles Handeln, um Ansprüche zu sichern.</p>

    <strong>🏛️ Wer hilft wann?</strong>
    <ul>
      <li><strong>Jobcenter:</strong> Bürgergeld (bei Erwerbsfähigkeit).</li>
      <li><strong>Sozialamt:</strong> Grundsicherung (bei Alter oder Erwerbsminderung).</li>
      <li><strong>Wohngeldstelle:</strong> Zuschuss zur Miete (für Geringverdiener).</li>
    </ul>

    <strong>⚠️ Die wichtigste Regel: Der Erste des Monats</strong>
    <p>Anträge wirken immer auf den 1. des Monats zurück. <strong>Beispiel:</strong> Wenn Sie am 31. Mai den Antrag stellen, bekommen Sie Geld für den ganzen Mai. Stellen Sie ihn am 1. Juni, ist das Geld für Mai verloren.
    <br><em>Tipp: Stellen Sie Anträge zur Fristwahrung zunächst "formlos" (per Fax/Mail).</em></p>

    <strong>🚫 Stolperfalle "Mitwirkung"</strong>
    <p>Reagieren Sie sofort auf Post. Fehlende Unterlagen sind der häufigste Grund für Zahlungstops. Reichen Sie alles <strong>nachweisbar</strong> ein.</p>

    <div class="info-link-container">
      <a href="https://sozialrecht-lotse.de" class="info-link" target="_blank">
        Sie möchten mehr wissen? Zu unseren kostenlosen Info-Seiten
      </a>
    </div>

    <div class="ws-subtopics" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px; color:#666;">Weitere Tipps im Thema Finanzen</div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📨 Antrag fristwahrend stellen (auch ohne Unterlagen)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Schicken Sie sofort eine kurze Nachricht: „Hiermit beantrage ich Leistungen ab dem …“ (Name, Anschrift, Datum, Unterschrift).</li>
            <li>Wichtig: Datum nachweisbar machen (Faxbericht, Einschreiben, Abgabe gegen Stempel, Upload-Quittung).</li>
            <li>Unterlagen können nachgereicht werden – Hauptsache, der Antrag ist „drin“.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧾 Welche Leistung passt? (Jobcenter vs. Wohngeld vs. Sozialamt)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li><strong>Jobcenter:</strong> meist, wenn erwerbsfähig und Einkommen nicht reicht.</li>
            <li><strong>Sozialamt (SGB XII):</strong> meist bei Alter oder dauerhafter Erwerbsminderung.</li>
            <li><strong>Wohngeld:</strong> oft bei Arbeit/Rente, wenn „nur“ die Miete zu hoch ist (kein Bürgergeld/Grundsicherung-Bezug).</li>
            <li>Wenn unsicher: trotzdem fristwahrend stellen – Zuständigkeit kann geklärt werden.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📎 Mitwirkung ohne Chaos: So vermeidest du Zahlungstopps</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Post sofort öffnen, Fristen notieren, fehlende Dokumente priorisieren.</li>
            <li>Alles in einer Liste sammeln: „Was wird verlangt?“ + „Was habe ich schon geschickt?“</li>
            <li>Nur Kopien abgeben (Originale behalten), jede Abgabe nachweisbar machen.</li>
            <li>Wenn etwas fehlt: kurz schriftlich mitteilen, wann es nachgereicht wird (statt gar nicht reagieren).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🏦 Kontoauszüge & Nachweise: typische Fehler vermeiden</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Meist werden mehrere Monate Kontoauszüge verlangt – vollständig und lesbar einreichen.</li>
            <li>Große Barabhebungen/Überweisungen kurz erklären (sonst kommen Rückfragen).</li>
            <li>Quittungen/Belege zu besonderen Ausgaben griffbereit halten (Miete, Strom, Schulden, medizinische Kosten).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🚨 Akut-Krise: kein Geld / Sperre / Räumungsdruck</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Bei sofortiger Notlage: um Vorschuss / Abschlagszahlung bitten (schriftlich + telefonisch nachhaken).</li>
            <li>Bei Strom-/Gassperre: schnell Kontakt zum Versorger + (je nach Fall) Jobcenter/Sozialamt für Übernahme/Darlehen prüfen.</li>
            <li>Bei Mietrückstand: parallel Wohnen-Thema prüfen (Darlehen/Übernahme möglich, wenn Wohnung gesichert werden muss).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>✉️ Wenn ein Bescheid falsch wirkt: Widerspruch “smart”</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Frist sofort notieren (Bescheid + Zugangstag).</li>
            <li>Zur Fristwahrung reicht oft ein kurzer Widerspruch – Begründung kann nachgereicht werden.</li>
            <li>Prüfen: Einkommen richtig angerechnet? Bedarfsgemeinschaft korrekt? Kosten der Unterkunft korrekt?</li>
            <li>Belege geordnet beifügen (Nummern/Übersicht hilft gegen „übersehen“).</li>
          </ul>
        </div>
      </div>

    </div>
  `
},


    rente: {
  title: "Rente & Altersvorsorge",
  content: `
    <p>Rentenfragen sind komplex. Klären Sie Lücken im Versicherungsverlauf so früh wie möglich.</p>

    <strong>🏛️ Die Themen</strong>
    <ul>
      <li><strong>Altersrente:</strong> Der Klassiker zum Ruhestand.</li>
      <li><strong>Erwerbsminderungsrente:</strong> Wenn Sie aus Gesundheitsgründen nicht mehr arbeiten können.</li>
      <li><strong>Hinterbliebenenrente:</strong> Witwen- oder Waisenrente.</li>
    </ul>

    <strong>💡 Der wichtigste Schritt: Kontenklärung</strong>
    <p>Prüfen Sie Ihren Versicherungsverlauf bei der Deutschen Rentenversicherung. Sind alle Ausbildungszeiten, Kindererziehungszeiten und Pflegezeiten erfasst? Lücken kosten bares Geld.</p>
    
    <p><em>Hinweis: Rentenbescheide sind oft fehlerhaft. Eine Prüfung durch Rentenberater oder Sozialverbände (z.B. VdK, SoVD) lohnt sich oft.</em></p>

    <div class="info-link-container">
      <a href="https://kassen-lotse.de" class="info-link" target="_blank">
        Sie möchten mehr wissen? Zu unseren kostenlosen Info-Seiten
      </a>
    </div>


    <div class="ws-subtopics" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px; color:#666;">Weitere Tipps im Thema Rente</div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🗂️ Kontenklärung: so findest du Lücken schnell</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Zeitleiste bauen: Schule/Ausbildung, Jobs, Arbeitslosigkeit, Krankheit, Kinderzeiten, Pflegezeiten.</li>
            <li>Für jede Phase prüfen: ist sie im Versicherungsverlauf wirklich erfasst?</li>
            <li>Fehlende Zeiten sofort sammeln (Zeugnisse, Verträge, Bescheide, Nachweise über Pflege/Kindererziehung).</li>
            <li>Tipp: Alles als „Nachweis-Mappe“ ablegen – spätere Rentenanträge werden deutlich leichter.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>👵 Altersrente: welche Fragen zuerst klären?</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Wann ist der frühestmögliche Start – und was bedeutet das für die Höhe?</li>
            <li>Welche Zeiten zählen bei dir besonders (Kindererziehung, Pflege, Minijob, Ausbildung)?</li>
            <li>Übergang planen: Rente + Hinzuverdienst / Teilzeit / Krankengeld- oder ALG-Phase.</li>
            <li>Wichtig: Rentenantrag nicht „auf den letzten Drücker“ – lieber frühzeitig vorbereiten.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🩺 Erwerbsminderungsrente: was oft entscheidend ist</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Im Mittelpunkt steht meist die Frage: wie viele Stunden pro Tag ist Arbeit realistisch möglich?</li>
            <li>Unterlagen bündeln: Befunde, Therapieverlauf, AU-Zeiten, Reha-Berichte (wenn vorhanden).</li>
            <li>Typisch: „Reha vor Rente“ – daher Reha-Ablauf und Berichte gut aufbewahren.</li>
            <li>Alles schriftlich halten und Fristen sauber notieren (auch bei Nachfragen).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>👶 Kindererziehungs- & Pflegezeiten: häufig übersehen</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Prüfen, ob Kindererziehungszeiten vollständig drin sind (vor allem bei mehreren Kindern / Umzügen).</li>
            <li>Pflegezeiten können rentenrechtlich relevant sein – besonders, wenn Angehörige gepflegt wurden.</li>
            <li>Wenn Zeiten fehlen: Nachweise sammeln (Bescheide, Meldungen, Pflegekasse, Zeiträume).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📬 Rentenbescheid prüfen: typische Fehlerstellen</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Stimmen die Versicherungszeiten (Monate/Jahre) mit deiner Zeitleiste überein?</li>
            <li>Sind Ausbildungszeiten, Kinderzeiten, Pflegezeiten korrekt aufgeführt?</li>
            <li>Fehlen Arbeitgeber/Zeiträume oder sind Verdienste falsch zugeordnet, kommen oft falsche Berechnungen raus.</li>
            <li>Wenn unsicher: gezielt prüfen lassen (Rentenberatung/Sozialverband) statt „einfach akzeptieren“.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🕯️ Hinterbliebenenrente: erste Schritte nach einem Todesfall</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Wichtige Unterlagen schnell sichern: Sterbeurkunde, Versicherungsnummern, letzte Renten-/Gehaltsunterlagen.</li>
            <li>Übergang beachten: kurzfristige finanzielle Lücke früh ansprechen (Antrag zügig vorbereiten).</li>
            <li>Wenn mehrere Stellen betroffen sind: Liste machen (Rentenversicherung, Krankenkasse, ggf. Arbeitgeber/Versorgung).</li>
          </ul>
        </div>
      </div>

    </div>
  `
},


    wohnen: {
  title: "Wohnen & Miete",
  content: `
    <p>Das Zuhause zu sichern hat oberste Priorität. Hier gibt es staatliche Unterstützung.</p>

    <strong>🏛️ Wichtige Anträge</strong>
    <ul>
      <li><strong>Wohngeld:</strong> Mietzuschuss für Menschen mit eigenem Einkommen, das aber knapp ist.</li>
      <li><strong>WBS (Wohnberechtigungsschein):</strong> Berechtigt zum Bezug günstiger Sozialwohnungen.</li>
    </ul>

    <strong>⚖️ Wohngeld oder Bürgergeld/Grundsicherung?</strong>
    <p>Das ist ein Entweder-oder-Prinzip.
    <br><strong>Wohngeld</strong> hat Vorrang, wenn Sie damit (plus ggf. Kinderzuschlag) Ihren Bedarf decken können. Rechnen Sie durch, was für Sie günstiger ist.</p>

    <strong>🚨 Bei Räumungsklage</strong>
    <p>Gehen Sie sofort zum Amtsgericht oder zur "Fachstelle für Wohnungsnotfälle" Ihrer Stadt. Drohende Obdachlosigkeit kann oft durch Darlehensübernahme der Mietschulden (durch Jobcenter/Sozialamt) abgewendet werden.</p>

    <div class="info-link-container">
      <a href="https://mieter-lotse.de" class="info-link" target="_blank">
        Sie möchten mehr wissen? Zu unseren kostenlosen Info-Seiten
      </a>
    </div>

    <div class="ws-subtopics" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px; color:#666;">Weitere Tipps im Thema Wohnen</div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📉 Mietrückstand: was sofort hilft (ohne Panik)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Sofort Überblick schaffen: Wie viel Rückstand? Für welche Monate? (Liste machen).</li>
            <li>Vermieter schriftlich kontaktieren (kurz + sachlich) und Zahlungsplan/Teilzahlung anbieten.</li>
            <li>Parallel prüfen: Jobcenter/Sozialamt können in Notlagen Mietschulden als Darlehen übernehmen (Wohnungserhalt).</li>
            <li>Alles schriftlich und nachweisbar kommunizieren (E-Mail/Brief + Kopien behalten).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📨 Kündigung erhalten: die wichtigsten ersten Schritte</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Datum notieren, Unterlagen abheften (Kündigung, Mahnungen, Schriftverkehr).</li>
            <li>Wenn die Kündigung wegen Zahlungsverzug kommt: sehr schnell Hilfe holen (Wohnung kann oft noch gerettet werden).</li>
            <li>Fachstelle Wohnungsnotfälle / Mieterberatung / Anwaltliche Hilfe prüfen, wenn Unklarheiten bestehen.</li>
            <li>Wichtig: Nicht abtauchen – frühe Reaktion verbessert fast immer die Chancen.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>⚖️ Räumungsklage & Gericht: was du mitnehmen solltest</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Alle Unterlagen geordnet: Mietvertrag, Kündigung, Kontoauszüge/Zahlungsnachweise, Schriftverkehr.</li>
            <li>Wenn Geld fehlt: Bescheide/Anträge (Jobcenter/Sozialamt/Wohngeld) als Nachweis der Bemühung beilegen.</li>
            <li>Ziel ist oft: Zeit gewinnen + Finanzierung klären (z.B. Darlehen zur Mietschuldenübernahme).</li>
            <li>Fristen ernst nehmen: Schreiben vom Gericht niemals liegen lassen.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧮 Wohngeld: typische Stolperfallen (damit es schneller geht)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Häufige Verzögerung: fehlende Einkommens- oder Mietnachweise (alles vollständig einreichen).</li>
            <li>Wichtig: Änderungen sofort melden (Einkommen, Umzug, Haushaltsgröße) – sonst drohen Rückforderungen.</li>
            <li>Wenn das Einkommen schwankt: Unterlagen gesammelt und sauber sortiert abgeben.</li>
            <li>Tipp: Parallel prüfen, ob Kinderzuschlag zusätzlich möglich ist (wenn Kinder im Haushalt leben).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🏘️ WBS & Sozialwohnung: so gehst du strategisch vor</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>WBS früh beantragen – er ist oft Voraussetzung, bevor du überhaupt Besichtigungen bekommst.</li>
            <li>Suchprofil anlegen: Größe, Stadtteile, „zumutbare“ Umgebung (realistisch bleiben).</li>
            <li>Dokumenten-Mappe bereithalten (Ausweis, Einkommensnachweise, Mietschuldenfreiheitsbescheinigung falls vorhanden).</li>
            <li>Wenn akute Not besteht: Dringlichkeit bei der Stelle/Fachstelle ansprechen (Nachweise mitnehmen).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧾 Nebenkostenabrechnung / Mieterhöhung: was prüfen?</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Alles abheften: Abrechnung, Erhöhungsschreiben, Zeitraum, Vorauszahlungen, Zählerstände.</li>
            <li>Bei hoher Nachzahlung: Ratenzahlung anfragen und Hilfe prüfen (wenn Bürgergeld/Sozialhilfe bezogen wird).</li>
            <li>Wenn etwas „komisch“ wirkt: Beratung einholen (Mieterberatung/Mieterschutzverein).</li>
          </ul>
        </div>
      </div>

    </div>
  `
},


    // --- B2B ARBEITSTHEMEN ---

briefe: {
  title: "Briefe & Kommunikation",
  content: `
    <p>Effizientes Postmanagement ist der Schlüssel zur Fristwahrung.</p>

    <strong>🔄 Prozesskette Posteingang</strong>
    <ol>
      <li><strong>Eingangsstempel:</strong> Sofort bei Erhalt datieren (Beweissicherung).</li>
      <li><strong>Fristen notieren:</strong> Sofort im Kalender/Tool vermerken (vor Ablauf!).</li>
      <li><strong>Klient informieren:</strong> Zeitnahe Weiterleitung zur Beruhigung.</li>
    </ol>

    <strong>📄 Dokumenten-Check</strong>
    <ul>
      <li><strong>Anhörung (§ 24 SGB X):</strong> Hier muss zwingend Stellung genommen werden.</li>
      <li><strong>Mitwirkungspflicht (§ 60 SGB I):</strong> Fehlende Unterlagen führen zum Versagungsbescheid.</li>
    </ul>

    <strong>💡 Tool-Tipp: "Verstehen statt Raten"</strong>
    <p>Behördendeutsch erzeugt Rückfragen. Nutzen Sie die <strong>Clerion-Übersetzung</strong>, um Inhalte mit einem Klick in "Einfache Sprache" umzuwandeln und an den Klienten zu senden.</p>

    <!-- NEU: Mini-Accordions -->
    <div class="ws-subtopics" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px; color:#666;">Weitere Tipps im Thema Briefe & Kommunikation</div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📥 Posteingang “QS”: 60 Sekunden, die später Stunden sparen</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Dokumenttyp identifizieren: Bescheid / Anhörung / Mitwirkung / Einladung / Erinnerung.</li>
            <li>Frist & Rechtsbehelfsbelehrung sofort prüfen (wenn vorhanden).</li>
            <li>Aktennotiz anlegen: „Worum geht’s? Was will die Behörde? Was fehlt?“</li>
            <li>Unterlagenbedarf in 3 Stufen markieren: sofort / diese Woche / später.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>⏱️ Fristenmanagement: kleinster Standard, der zuverlässig wirkt</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Immer 2 Termine setzen: „interne Vorfrist“ + „echte Frist“ (z.B. 5 Tage vorher).</li>
            <li>Fristgrund notieren: „Widerspruch“, „Mitwirkung“, „Anhörung“, „Termin“.</li>
            <li>Wenn Unterlagen fehlen: sofort Zwischenmeldung raus (statt bis zum Fristende warten).</li>
            <li>Nachweislogik: Versandart + Beleg + Ablageort (immer gleich).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧩 Anhörung (§ 24 SGB X): schneller Aufbau für Stellungnahmen</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>1 Satz Einordnung: „Hiermit nehme ich zur Anhörung vom … Stellung.“</li>
            <li>Faktenlage kurz (chronologisch): was ist passiert, was wurde eingereicht, wann?</li>
            <li>Belege nummerieren und im Text referenzieren („Anlage 1“, „Anlage 2“…).</li>
            <li>Klare Bitte am Ende: „Von einer nachteiligen Entscheidung ist abzusehen.“</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📎 Mitwirkung (§ 60 SGB I): so vermeidest du “Unterlagen-Schleifen”</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Check: fordert die Behörde wirklich “alles”, oder nur einen bestimmten Zeitraum?</li>
            <li>Wenn etwas nicht beschaffbar ist: schriftlich begründen + Alternativen anbieten.</li>
            <li>Unterlagenpakete sauber bündeln (Deckblatt + Anlagenliste).</li>
            <li>Nur Kopien versenden; Originale bleiben beim Klienten/der Akte.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>☎️ Klientenkommunikation: kurze Updates, die Vertrauen schaffen</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Nach Eingang sofort 1 Kurzinfo: „Brief ist da, Frist ist notiert, nächster Schritt ist …“</li>
            <li>Komplexes Behördendeutsch immer in 3 Punkten übersetzen: Thema / Risiko / To-do.</li>
            <li>Realistische Zeitfenster nennen („Rückmeldung in 2–5 Werktagen“), statt vage bleiben.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧾 Dokumentation: was in die Akte muss (Minimum)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Datum + Art des Dokuments + Frist + nächster Schritt.</li>
            <li>Was wurde wann versendet (inkl. Anlagenliste) + Versandnachweis.</li>
            <li>Telefonate: 3-Zeilen-Protokoll (Anlass, Ergebnis, Follow-up).</li>
          </ul>
        </div>
      </div>

    </div>
  `
},


    antraege_b2b: {
  title: "Antragsmanagement",
  content: `
    <p>Vollständigkeit vor Schnelligkeit: Vermeiden Sie unnötige Nachforderungsschleifen.</p>

    <strong>🗂️ Vorgangsarten</strong>
    <ul>
      <li><strong>Erstantrag:</strong> Basis für alle Leistungen.</li>
      <li><strong>WBA (Weiterbewilligung):</strong> Rechtzeitig 6 Wochen vor Ablauf stellen.</li>
      <li><strong>Überprüfungsantrag (§ 44 SGB X):</strong> Um alte, falsche Bescheide (bis zu 1 Jahr rückwirkend) zu korrigieren.</li>
    </ul>

    <strong>✅ Qualitätssicherung (QS)</strong>
    <p>Prüfen Sie vor Versand:
    <br>• Aktuelle Vollmacht liegt bei?
    <br>• Bankverbindung (IBAN) noch korrekt?
    <br>• Alle Nachweise lückenlos nummeriert?</p>

    <strong>🚀 Workflow-Optimierung</strong>
    <p>Nutzen Sie den <em>integrierten Antragshelfer</em>. Er führt durch komplexe Formularfelder und verhindert Flüchtigkeitsfehler.</p>

    
    <div class="ws-subtopics" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px; color:#666;">Profi-Checks für Anträge (B2B)</div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧾 Antragspaket “One Shot”: so vermeidest du Nachforderungen</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Deckblatt/Anschreiben mit Ziel, Aktenzeichen, Zeitraum, Kontakt und Anlagenliste.</li>
            <li>Nachweise nummerieren (Anlage 1…n) und im Anschreiben referenzieren.</li>
            <li>Jeden Nachweis auf Aktualität prüfen (Zeitraum/Monat passt wirklich?).</li>
            <li>Wenn etwas fehlt: Zwischenmeldung + konkretes Nachreichdatum (statt “kommt noch”).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>✅ QS-Check vor Versand (90 Sekunden)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Stammdaten: Name, Anschrift, BG-/Kundennummer, Zuständigkeit, Bankdaten.</li>
            <li>Formular: Datum, Unterschrift, Pflichtfelder, richtige Anlagen angekreuzt.</li>
            <li>Haushalt: Personen im Haushalt/Bedarfsgemeinschaft plausibel, Änderungen markiert.</li>
            <li>KdU: Miete/Heizkosten/Nebenkosten nachvollziehbar und belegbar.</li>
            <li>Nachweise: vollständig, lesbar, sortiert, doppelte/alte Versionen entfernt.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📅 WBA-Workflow: Standard-Taktung ohne Stress</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>6 Wochen vorher: WBA anstoßen (Termin + interne Vorfrist setzen).</li>
            <li>4 Wochen vorher: Unterlagen komplettieren (Einkommen, Kontoauszüge, Miete, Änderungen).</li>
            <li>2 Wochen vorher: QS + Versandnachweis + Rückfragenpuffer.</li>
            <li>Nach Versand: Status “Warten” + Reminder (wenn keine Eingangsbestätigung/Info kommt).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🔁 Änderungsmitteilungen: der häufigste “Nachforderungs-Treiber”</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Änderungen immer in Klartext benennen: Was hat sich geändert? Seit wann? Welche Nachweise liegen bei?</li>
            <li>Typische Trigger: neues Einkommen, Umzug/Miete, Haushaltsänderung, Kindergeld/KiZ, Krankenversicherung.</li>
            <li>Wenn der Klient unsicher ist: lieber “Änderung prüfen lassen” statt gar nicht melden.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧠 Plausibilitätscheck: 5 Fragen vor dem Abschicken</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Passt der Zeitraum aller Nachweise wirklich zum Antrag (Monate/Quartal/letzte 3 Monate)?</li>
            <li>Ist jede größere Buchung/Abweichung kurz erklärbar (damit keine Rückfrage kommt)?</li>
            <li>Ist die Wohnsituation klar (Mietvertrag/Erhöhung/NK-Abrechnung/Heizkosten)?</li>
            <li>Ist die Erwerbssituation konsistent (Job, Minijob, Selbständigkeit, AU, Kündigung)?</li>
            <li>Ist das Anschreiben so klar, dass ein Fremder in 30 Sekunden versteht, was beantragt wird?</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📌 § 44 SGB X Überprüfungsantrag: sauber aufsetzen</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Bescheid exakt benennen (Datum, Zeitraum, Aktenzeichen) und Kopie beifügen.</li>
            <li>Fehlerbild benennen: Rechenfehler, falsches Einkommen, falsche KdU, fehlende Berücksichtigung von Nachweisen.</li>
            <li>Belege geordnet nachreichen (mit Anlagenliste) und klaren Prüfauftrag formulieren.</li>
            <li>Interne Doku: Erwartung + nächster Schritt (Warten/Frist/ggf. Widerspruch gegen neuen Bescheid).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🔒 Vollmacht & Datenschutz: Standard, der Ärger spart</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Aktuelle Vollmacht immer als Anlage (Datum prüfen) + ggf. Ausweiskopie nur wenn erforderlich.</li>
            <li>Nur erforderliche Daten/Seiten einreichen (keine “Überbelege”, wenn es vermeidbar ist).</li>
            <li>Bei Kommunikation über Dritte: klare Zuständigkeit und Einwilligung dokumentieren.</li>
          </ul>
        </div>
      </div>

    </div>
  `
},


   widerspruch: {
  title: "Widerspruch & Rechtsbehelfe",
  content: `
    <p>Nicht jeder Bescheid ist korrekt. Hier ist juristische Präzision gefragt.</p>

    <strong>⚖️ Prüfungsschema: Wann widersprechen?</strong>
    <ul>
      <li><strong>Rechenfehler:</strong> Einkommen falsch angerechnet?</li>
      <li><strong>Ermessensfehler:</strong> Wurden individuelle Umstände ignoriert?</li>
      <li><strong>Unterlagen:</strong> Wurden eingereichte Belege übersehen?</li>
    </ul>

    <strong>📅 Fristenmanagement (Ausschlussfristen)</strong>
    <p><strong>Standard:</strong> 1 Monat nach Bekanntgabe des Bescheids.
    <br><strong>Sonderfall:</strong> 1 Jahr (!) bei fehlender oder falscher Rechtsbehelfsbelehrung (§ 66 SGG).</p>

    <strong>⚠️ Eskalation & Abgabe</strong>
    <p>Kennen Sie Ihre Grenzen: Geht es ins Klageverfahren oder werden komplexe Rechtsgebiete (z.B. Erbrecht, Unterhaltsrecht) berührt? -> <em>Abgabe an Fachanwälte empfohlen.</em></p>

    
    <div class="ws-subtopics" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px; color:#666;">Profi-Checks für Widersprüche</div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>⏱️ Frist retten: “Kurz-Widerspruch” (ohne Begründung)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Wenn die Zeit knapp ist: Widerspruch fristwahrend einlegen und Begründung nachreichen.</li>
            <li>Wichtig: Bescheid eindeutig benennen (Datum, Aktenzeichen, Zeitraum) + Unterschrift.</li>
            <li>Nachweisbarer Versand/Abgabe (Upload-Quittung, Faxbericht, Stempel) standardisieren.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧩 Begründungs-Formel (robust & schnell)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li><strong>These:</strong> „Der Bescheid ist rechtswidrig und verletzt den Anspruch, weil …“</li>
            <li><strong>Fakten:</strong> chronologisch (was wurde wann eingereicht / was ist passiert?).</li>
            <li><strong>Fehlerbild:</strong> Rechenfehler / Tatsachenfehler / Ermessensfehler / Verfahrensfehler.</li>
            <li><strong>Belege:</strong> Anlagen nummerieren und im Text referenzieren (Anlage 1…n).</li>
            <li><strong>Antrag:</strong> „Bescheid aufheben/ändern und neu bescheiden / Leistungen nachzahlen“.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧮 Klassiker: Rechenfehler & Anrechnung (Checkliste)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Wurde das richtige Einkommen im richtigen Monat berücksichtigt (Zufluss/Zeitraum sauber)?</li>
            <li>Wurden einmalige Zahlungen falsch verteilt oder doppelt berücksichtigt?</li>
            <li>KdU plausibel? Miete/Heizkosten/NDK korrekt übernommen?</li>
            <li>Wurden eingereichte Nachweise „übersehen“ (Anlagenliste + Einreichdatum nennen)?</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>👁️ Akteneinsicht & Begründung anfordern (wenn es “unklar” ist)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Wenn die Berechnung nicht nachvollziehbar ist: schriftlich Erläuterung/Berechnungsbogen anfordern.</li>
            <li>Optional Akteneinsicht anregen, wenn entscheidende Unterlagen/Vermerke fehlen oder strittig sind.</li>
            <li>Praxis: Erst Frist sichern, dann Unterlagen anfordern und Begründung nachreichen.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🚨 Eilfall: wenn Leistung stoppt (Risiko-Logik)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Wenn existenzsichernde Zahlungen ausbleiben: parallel zur Rechtsprüfung sofort “Kurzmaßnahmen” planen (Vorschuss/Abhilfe anregen).</li>
            <li>Klientenseitig: Notfall-Liste (Miete, Strom, Lebensmittel, Medikamente) priorisieren und dokumentieren.</li>
            <li>Wenn es Richtung Gericht geht: Übergabe an spezialisierte Stellen/Anwälte frühzeitig vorbereiten.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🗣️ Ton & Stil: juristisch klar, aber deeskalierend</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Keine Emotionen in den Text – nur Fakten, Fehlerbild, Belege, Antrag.</li>
            <li>Kurze Absätze, klare Überschriften („Sachverhalt“, „Begründung“, „Antrag“).</li>
            <li>Keine “Roman”-Anhänge: Anlagenliste + nur relevante Nachweise (Datenminimierung).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>⚖️ Übergang zur Klage: wann “Abgabe” sinnvoll wird</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Wenn komplexe Rechtsmaterie berührt ist oder hohe Risiken bestehen: früh Fachanwälte/Verbände einbinden.</li>
            <li>Wenn sich Streitpunkte wiederholen: Fallchronik + Belegmappe vorbereiten (spart Kosten/Zeiten).</li>
            <li>Interne QS: Was ist das Ziel (Zahlung, Aufhebung, Neuberechnung)? Was ist der Beweis?</li>
          </ul>
        </div>
      </div>

    </div>
  `
},


   orga: {
  title: "Zuständigkeiten & Orga",
  content: `
    <p>Die korrekte Zuordnung spart Zeit und verhindert "Unzuständigkeits"-Bescheide.</p>

    <strong>🧭 Triage: Wer ist zuständig?</strong>
    <table style="width:100%; font-size: 0.9em; border-collapse: collapse;">
      <tr>
        <td style="padding: 4px; border-bottom: 1px solid #eee;">Erwerbsfähig + Hilfebedürftig</td>
        <td style="padding: 4px; border-bottom: 1px solid #eee;"><strong>Jobcenter (SGB II)</strong></td>
      </tr>
      <tr>
        <td style="padding: 4px; border-bottom: 1px solid #eee;">Nicht erwerbsfähig / Altersrente</td>
        <td style="padding: 4px; border-bottom: 1px solid #eee;"><strong>Sozialamt (SGB XII)</strong></td>
      </tr>
      <tr>
        <td style="padding: 4px;">Pflegebedarf</td>
        <td style="padding: 4px;"><strong>Pflegekasse + Sozialamt</strong></td>
      </tr>
    </table>

    <br>
    <strong>📊 Status-Tracking in Clerion</strong>
    <p>Halten Sie die Akten sauber:
    <br>🔴 <strong>Offen:</strong> Handlungsbedarf sofort.
    <br>🟡 <strong>Warten:</strong> Rückmeldung Behörde/Klient steht aus.
    <br>🟢 <strong>Erledigt:</strong> Vorgang archivieren.</p>

    
    <div class="ws-subtopics" style="margin-top:18px;">
      <div style="font-weight:600; margin-bottom:10px; color:#666;">Profi-Orga für saubere Fälle</div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧾 Intake in 3 Minuten: was am Anfang immer geklärt sein muss</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Wer ist Antragsteller? Wer wohnt im Haushalt? (Personen + Beziehung + Zuständigkeiten).</li>
            <li>Welche Leistung/Ziel genau? (z.B. Erstleistung, WBA, KdU-Problem, Sanktion, Pflege, Rente).</li>
            <li>Welche Fristen laufen bereits? (Bescheid-/Schreibdatum + Rechtsbehelfsbelehrung).</li>
            <li>Welche Kommunikation ist erlaubt? (Vollmacht/Einwilligung, bevorzugter Kanal).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🧭 Zuständigkeit klären: “Beweisfragen”, die Unzuständigkeit verhindern</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Erwerbsfähigkeit/Alter: krankgeschrieben, Reha/EM-Rente, Altersrente, dauerhaft erwerbsgemindert?</li>
            <li>Wohnort/gewöhnlicher Aufenthalt klar? (Umzug/Unterkunft/Übergangssituationen markieren).</li>
            <li>Leistungsüberschneidungen: Wohngeld vs. Bürgergeld, Pflegekasse vs. Sozialamt, Familienkasse/KiZ etc.</li>
            <li>Wenn unsicher: schriftlich Zuständigkeit erfragen statt „ins Blaue“ beantragen.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📬 Unzuständigkeit droht: Standard-Reaktion (ohne Zeitverlust)</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Frist sichern: parallel kurze Anzeige/Antrag bei der wahrscheinlich zuständigen Stelle (wenn nötig).</li>
            <li>Belege bündeln: Nachweis Wohnort, Status (erwerbsfähig/nicht), Bescheide anderer Träger.</li>
            <li>Dokumentieren: wer hat wann was abgelehnt/weitergeleitet (Fallchronik).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🗂️ Aktenstruktur: Minimum, das immer funktioniert</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Chronik (laufend): Datum – Ereignis – Frist – nächster Schritt.</li>
            <li>Bescheide/Schreiben getrennt von Nachweisen (damit nichts “untergeht”).</li>
            <li>Versandnachweise separat: Upload-Quittungen, Faxberichte, Eingangsbestätigungen.</li>
            <li>Versionierung: eindeutige Dateinamen (Datum + Vorgang + Version).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>📊 Status-Disziplin: wann ein Vorgang “Offen / Warten / Erledigt” ist</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li><strong>Offen:</strong> Es gibt einen konkreten nächsten Schritt, der von euch gemacht werden muss.</li>
            <li><strong>Warten:</strong> Alles ist raus, aber es fehlt Rückmeldung/Entscheidung/Unterlage von außen.</li>
            <li><strong>Erledigt:</strong> Ziel erreicht ODER bewusst abgeschlossen (inkl. kurzer Abschlussnotiz „warum“).</li>
            <li>Best Practice: “Warten” immer mit Reminder-Datum (sonst verschwindet der Fall).</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>⏰ Reminder-Logik: Nachfassen ohne Chaos</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>Nach Versand: kurzer Check nach X Tagen (Eingang da? Bearbeitung gestartet?).</li>
            <li>Wenn keine Rückmeldung: sachliches Nachfassen mit Aktenzeichen + Einreichdatum + Anlagenliste.</li>
            <li>Bei Frist-/Existenzrisiko: Priorität hoch setzen und Eskalationsoptionen vorbereiten.</li>
          </ul>
        </div>
      </div>

      <div class="sub-acc-item">
        <div class="sub-acc-title">
          <span>🤝 Übergabe/Vertretung: “handover”, der wirklich trägt</span>
          <span class="sub-acc-icon">+</span>
        </div>
        <div class="sub-acc-content">
          <ul>
            <li>1 Absatz: Ziel des Falls + aktueller Stand + größte Risiken.</li>
            <li>3 Bulletpoints: nächste Schritte (mit Fristen) + wer wartet auf wen.</li>
            <li>Anlagen: letzter Bescheid, letzter Schriftsatz, Versandnachweis, wichtigste Nachweise.</li>
          </ul>
        </div>
      </div>

    </div>
  `
}
};

// =================================================================
// 2. INITIALISIERUNG & SETUP
// =================================================================

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Check
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

  
     setupMenu();

    // 2. UI Anpassung je nach User-Typ (B2B / B2C)
    setupUserInterface();

    // 3. Einstellungen laden (Onboarding prüfen)
    const settings = await fetchSettings();
    if (!settings) {
        // Kein Onboarding gefunden -> Modal öffnen
        showOnboarding();
    } else {
        // Einstellungen vorhanden -> Inhalte rendern
        renderWorkspaceContent(settings);
    }

    // 4. Daten laden (Notizen, Checklisten, Docs)
    loadNotes();
    loadChecklist();
    loadDocuments();
    initDiary()

    // 5. Event Listener registrieren
    setupEventListeners();
});

function setupUserInterface() {
    if (currentUser.type === 'b2b') {
        document.body.classList.add('b2b-mode');
        document.getElementById('ws-greeting').textContent = 'Ihr Cockpit';

        // Titel anpassen
        document.getElementById('docs-title').textContent = '📂 Vorlagen & Dokumente';
        document.getElementById('checklist-title').textContent = '📌 Aufgaben & Workflows';

        // B2C Hinweis-Container ausblenden
        document.getElementById('gentle-hint-container').classList.add('hidden');

        // --- MOTIVATIONSSPRUCH LOGIK ---
        const subtextEl = document.getElementById('ws-subtext');
        if (subtextEl) {
            if (typeof b2bMotivations !== 'undefined' && b2bMotivations.length > 0) {
                const randomMotiv = b2bMotivations[Math.floor(Math.random() * b2bMotivations.length)];
                subtextEl.textContent = randomMotiv;
                subtextEl.style.fontStyle = 'italic';
                subtextEl.style.opacity = '0.9';
                subtextEl.style.color = 'var(--ws-accent)';
            } else {
                subtextEl.textContent = 'Effizienz & Struktur für Ihre Klientenarbeit.';
            }
        }

        const filterContainer = document.getElementById('docs-filter-container');
        if (filterContainer) {
            filterContainer.innerHTML = `
                <button class="filter-btn active-filter" onclick="filterDocs('all')" data-filter="all">Alle</button>
                <button class="filter-btn" onclick="filterDocs('vorlagen')" data-filter="vorlagen">Vorlagen</button>
                <button class="filter-btn" onclick="filterDocs('antraege')" data-filter="antraege">Anträge</button>
                <button class="filter-btn" onclick="filterDocs('infos')" data-filter="infos">Infos/Allgemein</button>
            `;
        }

        initB2BFeatures();

    } else {
        // --- B2C Logik ---
        const displayName = currentUser.username.includes('@') ? currentUser.username.split('@')[0] : currentUser.username;
        document.getElementById('ws-greeting').textContent = `Hallo ${displayName}.`;
        
        // Zufälligen sanften Hinweis anzeigen
        const hintElement = document.getElementById('gentle-hint-container');
        if (hintElement && typeof gentleHints !== 'undefined' && gentleHints.length > 0) {
            const randomHint = gentleHints[Math.floor(Math.random() * gentleHints.length)];
            hintElement.textContent = `„${randomHint}“`;
            hintElement.classList.remove('hidden');
        }
    }
}

function setupEventListeners() {
    // Auto-Save für Notizen (Debounce: speichert erst 1 Sekunde nach letztem Tippen)
    let timeoutId;
    const notesArea = document.getElementById('personal-notes');
    if (notesArea) {
        notesArea.addEventListener('input', (e) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => saveNotes(e.target.value), 1000);
        });
    }

    // Datei Upload
    const triggerBtn = document.getElementById('trigger-upload-btn');
    const fileInput = document.getElementById('doc-upload-input');

    if (triggerBtn && fileInput) {
        // 1. Wenn man auf den schönen Button klickt -> Klick an das versteckte Feld weiterleiten
        triggerBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // 2. Wenn eine Datei ausgewählt wurde -> Hochladen starten
        fileInput.addEventListener('change', uploadDocument);
    }

    // Onboarding Auswahl-Buttons (Visuelles Feedback)
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('selected');
        });
    });
}



const knowledgeContainer = document.getElementById("knowledge-container");
if (knowledgeContainer) {
  knowledgeContainer.addEventListener("click", (e) => {
    const titleEl = e.target.closest(".sub-acc-title");
    if (!titleEl) return;

    const item = titleEl.closest(".sub-acc-item");
    if (!item) return;

    // Optional: auf den jeweiligen Block begrenzen (falls später mehrere Blöcke existieren)
    const wrapper = item.closest(".ws-subtopics") || knowledgeContainer;

    const content = item.querySelector(".sub-acc-content");
    const icon = item.querySelector(".sub-acc-icon");
    if (!content || !icon) return;

    const willOpen = !content.classList.contains("open");

    // 1) Alle anderen schließen
    wrapper.querySelectorAll(".sub-acc-item .sub-acc-content.open").forEach((openEl) => {
      if (openEl !== content) openEl.classList.remove("open");
    });
    wrapper.querySelectorAll(".sub-acc-item .sub-acc-icon").forEach((ic) => {
      ic.textContent = "+";
    });

    // 2) Gewähltes toggeln
    if (willOpen) {
      content.classList.add("open");
      icon.textContent = "–";
    } else {
      content.classList.remove("open");
      icon.textContent = "+";
    }
  });
}



// =================================================================
// 3. ONBOARDING LOGIK
// =================================================================

let onboardingRole = 'self'; // Standard

function showOnboarding() {
    document.getElementById('ws-onboarding').classList.remove('hidden');
    
    // Wenn B2B, überspringen wir Schritt 1 (Rolle) und zeigen direkt Themen
    if (currentUser.type === 'b2b') {
        document.getElementById('ob-step-1').classList.add('hidden');
        document.getElementById('ob-step-2-b2b').classList.remove('hidden');
    } else {
        document.getElementById('ob-step-1').classList.remove('hidden');
        document.getElementById('ob-step-2-b2c').classList.add('hidden');
    }
}

// Wird vom HTML aufgerufen: onclick="setOnboardingRole('self')"
window.setOnboardingRole = function(role) {
    onboardingRole = role;
    document.getElementById('ob-step-1').classList.add('hidden');
    document.getElementById('ob-step-2-b2c').classList.remove('hidden');
}

// B2C Abschluss
window.finishOnboardingB2C = async function() {
    const selectedTopics = Array.from(document.querySelectorAll('#b2c-topics .selected')).map(b => b.dataset.val);
    
    // Mindestens ein Thema sollte gewählt sein, sonst Fallback
    if(selectedTopics.length === 0) selectedTopics.push('finanzen'); // Default

    await saveSettings({
        targetPerson: onboardingRole,
        lifeSituations: selectedTopics
    });
    
    document.getElementById('ws-onboarding').classList.add('hidden');
    window.location.reload(); // Seite neu laden um Inhalte anzuzeigen
}

// B2B Abschluss
window.finishOnboardingB2B = async function() {
    const selectedWasters = Array.from(document.querySelectorAll('#b2b-topics .selected')).map(b => b.dataset.val);
    
    if(selectedWasters.length === 0) selectedWasters.push('orga'); // Default

    await saveSettings({
        jobRole: 'pro',
        timeWasters: selectedWasters // Wir speichern B2B-Themen im "timeWasters" Feld der DB
    });

    document.getElementById('ws-onboarding').classList.add('hidden');
    window.location.reload();
}

async function saveSettings(data) {
    try {
        await fetch(`${API_BASE_URL}/api/workspace/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
    } catch (e) {
        console.error("Fehler beim Speichern der Settings", e);
    }
}

// =================================================================
// 4. INHALTE RENDERN (Wissen & Orientierung)
// =================================================================

async function fetchSettings() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/settings`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (!res.ok) return null;
        return await res.json();
    } catch(e) { return null; }
}

function renderWorkspaceContent(settings) {
    const container = document.getElementById('knowledge-container');
    container.innerHTML = ''; // Leeren

    let topicsToRender = [];

    // Unterscheidung: Welche Themenfelder aus der DB nutzen wir?
    if (currentUser.type === 'b2b') {
        // B2B nutzt das Feld 'timeWasters' für die Themenauswahl
        if (settings.timeWasters && Array.isArray(settings.timeWasters)) {
            topicsToRender = settings.timeWasters;
        }
    } else {
        // B2C nutzt 'lifeSituations'
        if (settings.lifeSituations && Array.isArray(settings.lifeSituations)) {
            topicsToRender = settings.lifeSituations;
        }
    }

    // Rendern der Accordions
    if (topicsToRender.length > 0) {
        topicsToRender.forEach(topicKey => {
            const kbEntry = knowledgeBase[topicKey];
            if (kbEntry) {
                appendAccordion(container, kbEntry.title, kbEntry.content);
            }
        });
    } else {
        container.innerHTML = '<p style="padding:10px; color:#888;">Keine Themen ausgewählt. Bitte Einstellungen prüfen.</p>';
    }
}

function appendAccordion(parent, title, content) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'knowledge-item';
    
    // HTML Struktur für das Accordion
    itemDiv.innerHTML = `
        <div class="knowledge-title">
            <span>${title}</span>
            <span class="acc-icon">▼</span>
        </div>
        <div class="knowledge-content">
            ${content}
        </div>
    `;

    // Klick-Event direkt anhängen
    const titleDiv = itemDiv.querySelector('.knowledge-title');
    const contentDiv = itemDiv.querySelector('.knowledge-content');
    const iconSpan = itemDiv.querySelector('.acc-icon');

    titleDiv.addEventListener('click', () => {
        const isOpen = contentDiv.classList.contains('open');
        // Toggle Klasse
        contentDiv.classList.toggle('open');
        // Icon drehen (optional per CSS, hier simpel Texttausch)
        iconSpan.textContent = isOpen ? '▼' : '▲';
    });

    parent.appendChild(itemDiv);
}

// =================================================================
// 5. FUNKTIONEN: NOTIZEN
// =================================================================

async function loadNotes() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/notes`, { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        const notesArea = document.getElementById('personal-notes');
        if(notesArea) notesArea.value = data.content || '';
    } catch (e) { console.error(e); }
}

async function saveNotes(content) {
    try {
        await fetch(`${API_BASE_URL}/api/workspace/notes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content })
        });
        
        // Visuelles Feedback "Gespeichert"
        const status = document.getElementById('note-save-status');
        if(status) {
            status.style.opacity = 1;
            setTimeout(() => status.style.opacity = 0, 2000);
        }
    } catch (e) { console.error(e); }
}

// =================================================================
// 6. FUNKTIONEN: CHECKLISTEN
// =================================================================

async function loadChecklist() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/checklist`, { headers: { 'Authorization': `Bearer ${token}` } });
        const items = await res.json();
        const list = document.getElementById('checklist-list');
        list.innerHTML = '';

        items.forEach(item => {
            const li = document.createElement('li');
            li.style.display = 'flex'; 
            li.style.alignItems = 'center';
            li.style.gap = '10px'; 
            li.style.marginBottom = '8px';
            li.style.padding = '5px';
            li.style.borderBottom = '1px dashed #eee';

            li.innerHTML = `
                <input type="checkbox" ${item.isDone ? 'checked' : ''} class="cl-checkbox">
                <span style="flex:1; ${item.isDone ? 'text-decoration:line-through; color:#aaa' : ''}">${item.text}</span>
                <button class="cl-delete" style="border:none; background:none; color:#e74c3c; cursor:pointer; font-weight:bold;">&times;</button>
            `;

            // Event Listeners für die Elemente in der Liste
            const checkbox = li.querySelector('.cl-checkbox');
            checkbox.addEventListener('change', () => toggleChecklist(item.id, checkbox.checked));

            const delBtn = li.querySelector('.cl-delete');
            delBtn.addEventListener('click', () => deleteChecklist(item.id));

            list.appendChild(li);
        });
    } catch(e) { console.error(e); }
}

// Wird via HTML button onclick="addChecklistItem()" aufgerufen
window.addChecklistItem = async function() {
    const input = document.getElementById('checklist-input');
    if (!input.value.trim()) return;

    try {
        await fetch(`${API_BASE_URL}/api/workspace/checklist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ text: input.value })
        });
        input.value = ''; // Input leeren
        loadChecklist(); // Liste neu laden
    } catch(e) { console.error(e); }
}

async function toggleChecklist(id, isDone) {
    await fetch(`${API_BASE_URL}/api/workspace/checklist/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isDone })
    });
    loadChecklist(); // Reload um Styling (Durchstreichen) sauber anzuwenden
}

async function deleteChecklist(id) {
    await fetch(`${API_BASE_URL}/api/workspace/checklist/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
    });
    loadChecklist();
}

// =================================================================
// 7. FUNKTIONEN: DOKUMENTE (Notfall-Koffer / Vorlagen)
// =================================================================

let currentDocFilter = 'all';

// Wird via HTML Buttons aufgerufen: onclick="filterDocs('finanzen')"
window.filterDocs = function(category) {
    currentDocFilter = category;
    
    // Visuelles Feedback für die Filter-Buttons
    document.querySelectorAll('#docs-filter-container button').forEach(btn => {
        if(btn.dataset.filter === category) btn.classList.add('active-filter'); // CSS Klasse müsste man definieren
        else btn.classList.remove('active-filter');
    });

    loadDocuments(); // Neu laden mit Filter-Logik
}

async function loadDocuments() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/documents`, { headers: { 'Authorization': `Bearer ${token}` } });
        const allDocs = await res.json();
        
        // Filtern im Frontend
        const filteredDocs = currentDocFilter === 'all' 
            ? allDocs 
            : allDocs.filter(d => d.category === currentDocFilter);

        renderDocs(filteredDocs);
    } catch(e) { console.error(e); }
}

function renderDocs(docs) {
    const list = document.getElementById('documents-list');
    list.innerHTML = '';
    
    if (docs.length === 0) {
        list.innerHTML = '<p style="color:#999; font-size:0.9rem; font-style:italic; padding:10px;">Der Koffer ist leer.</p>';
        return;
    }
    
    docs.forEach(doc => {
        const div = document.createElement('div');
        div.className = 'doc-item';
        div.style.cssText = "display:flex; align-items:center; justify-content:space-between; width:100%; overflow:hidden; margin-bottom:8px; gap:10px;";

        const icon = doc.fileName.endsWith('.pdf') ? '📄' : '🖼️';
        
        // HIER IST DIE ÄNDERUNG:
        div.innerHTML = `
        <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; flex: 1; min-width: 0;">
            <span style="flex-shrink: 0;">${icon}</span>
            <a href="#" 
               onclick="downloadSecureFile('/api/workspace/documents/download/${doc.id}', '${doc.fileName}'); return false;"
               title="${doc.fileName}" 
               style="text-decoration:none; color:#333; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; display: block; width: 100%;">
                ${doc.fileName}
            </a>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-shrink: 0; margin-left: auto;">
            <span style="font-size:0.7rem; color:#aaa; background:#eee; padding:2px 5px; border-radius:4px; white-space: nowrap;">
                ${doc.category || 'Allgemein'}
            </span>
            <button class="doc-delete" style="border:none; background:none; color:#999; cursor:pointer; padding:5px;">🗑</button>
        </div>
        `;
        
        div.querySelector('.doc-delete').addEventListener('click', () => deleteDoc(doc.id));
        list.appendChild(div);
    });
}


async function uploadDocument() {
    const input = document.getElementById('doc-upload-input');
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    const categoryToSave = (currentDocFilter !== 'all') ? currentDocFilter : 'allgemein';
    formData.append('category', categoryToSave);

    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/documents`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        
        if (res.ok) {
            input.value = ''; // Reset
            loadDocuments();
        } else {
            alert("Fehler beim Hochladen.");
        }
    } catch(e) { console.error(e); }
}

async function deleteDoc(id) {
    if(!confirm('Möchten Sie dieses Dokument wirklich aus dem Speicher löschen?')) return;
    try {
        await fetch(`${API_BASE_URL}/api/workspace/documents/${id}`, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        loadDocuments();
    } catch(e) { console.error(e); }
}

// =================================================================
// 8. FUNKTIONEN: TAGEBUCH (JOURNAL)
// =================================================================

// Wird beim Laden der Seite aufgerufen (in DOMContentLoaded einfügen!)
function initDiary() {
    // 1. Datum setzen (Deutsch formatiert: "Sonntag, 4. Januar 2026")
    const dateEl = document.getElementById('diary-display-date');
    if (dateEl) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('de-DE', options);
    }

    // 2. Platzhalter anpassen je nach B2B / B2C
    const inputEl = document.getElementById('diary-input');
    if (inputEl) {
        if (currentUser.type === 'b2b') {
            inputEl.placeholder = "Notizen zum Arbeitstag: Offene Vorgänge, Ideen oder wichtige Erinnerungen...";
        } else {
            inputEl.placeholder = "Liebes Tagebuch, heute habe ich...";
        }
    }

    // 3. Verlauf laden (aber noch zugeklappt lassen)
    loadDiaryHistory();
    
    // 4. History Button Listener
    const historyBtn = document.getElementById('toggle-history-btn');
    const historyContainer = document.getElementById('diary-history-container');
    if (historyBtn && historyContainer) {
        historyBtn.addEventListener('click', () => {
            historyContainer.classList.toggle('open');
            historyBtn.textContent = historyContainer.classList.contains('open') ? '🔼 Zuklappen' : '📜 Alte Einträge';
        });
    }
}

async function saveDiaryEntry() {
    const input = document.getElementById('diary-input');
    const text = input.value.trim();
    
    // Abbruch, wenn kein Text eingegeben wurde
    if (!text) return;

    // --- FEHLERBEHEBUNG ---
    // Wir suchen den Button jetzt über die korrekte Klasse aus Ihrer HTML-Datei: "diary-btn-save"
    const btn = document.querySelector('.diary-footer .diary-btn-save');
    
    let originalContent = '<span>Eintrag speichern</span> <span class="icon">✨</span>'; // Fallback

    if (btn) {
        // Wir speichern den alten Inhalt (damit das Icon später wieder da ist)
        originalContent = btn.innerHTML;
        // Button Status ändern
        btn.innerHTML = 'Speichere... ⏳'; // innerHTML nutzen, damit wir Icons nutzen können
        btn.disabled = true;
    }

    try {
        await fetch(`${API_BASE_URL}/api/workspace/journal`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                text: text, 
                mood: 'neutral' 
            })
        });

        // Erfolg: Feld leeren & Liste neu laden
        input.value = ''; 
        loadDiaryHistory(); 
        
        // Button zurücksetzen
        if (btn) {
            btn.innerHTML = 'Gespeichert! ✅';
            setTimeout(() => { 
                btn.innerHTML = originalContent; 
                btn.disabled = false; 
            }, 2000);
        }

    } catch (e) {
        console.error(e);
        if (btn) {
            btn.innerHTML = 'Fehler ❌';
            setTimeout(() => { 
                btn.innerHTML = originalContent; 
                btn.disabled = false; 
            }, 2000);
        }
    }
}

async function loadDiaryHistory() {
    const container = document.getElementById('diary-history-container');
    if (!container) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/journal`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const entries = await res.json();

        container.innerHTML = '';
        
        if (entries.length === 0) {
            container.innerHTML = '<p style="padding:15px; text-align:center; color:#aaa; font-style:italic;">Noch keine Einträge. Schreiben Sie den ersten!</p>';
            return;
        }

        entries.forEach(entry => {
            const dateStr = new Date(entry.createdAt).toLocaleDateString('de-DE', { 
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit' 
            });
            
            const div = document.createElement('div');
            div.className = 'diary-entry-item';
            div.innerHTML = `
                <span class="diary-entry-date">${dateStr} Uhr</span>
                <div style="white-space: pre-wrap;">${entry.text}</div>
            `;
            container.appendChild(div);
        });

    } catch (e) { console.error(e); }
}

// =================================================================
// 10. REALITÄTS-TRACKER LOGIK
// =================================================================

let currentTrackerData = {
    intensity: null,
    drains: [] // "Krafträuber"
};

// Wählt Leicht/Mittel/Schwer
window.selectTrackerIntensity = function(btnElement, value) {
    // 1. Alle Buttons deselektieren
    document.querySelectorAll('.tracker-btn').forEach(b => b.classList.remove('selected'));
    
    // 2. Gewählten Button markieren
    btnElement.classList.add('selected');
    
    // 3. Wert speichern
    currentTrackerData.intensity = value;
}

// Wählt Tags an/ab
window.toggleTrackerTag = function(btnElement) {
    btnElement.classList.toggle('active');
    
    const tagText = btnElement.innerText;
    
    if (currentTrackerData.drains.includes(tagText)) {
        // Entfernen
        currentTrackerData.drains = currentTrackerData.drains.filter(t => t !== tagText);
    } else {
        // Hinzufügen
        currentTrackerData.drains.push(tagText);
    }
}

window.saveTrackerEntry = async function() {
    // Validierung: Hat der Nutzer eine Intensität gewählt?
    if (!currentTrackerData.intensity) {
        alert("Bitte wählen Sie kurz aus, wie sich der Tag anfühlt (Leicht/Mittel/Schwer).");
        return;
    }

    const note = document.getElementById('tracker-note').value;
    const saveBtn = document.getElementById('btn-save-tracker');
    const feedbackEl = document.getElementById('tracker-feedback');
    const checkIcon = document.getElementById('tracker-check');

    // Button Feedback: Deaktivieren
    saveBtn.disabled = true;
    saveBtn.innerHTML = 'Speichere... ⏳';

    const payload = {
        date: new Date().toISOString(),
        intensity: currentTrackerData.intensity,
        drains: currentTrackerData.drains, // Array
        note: note
    };

    try {
        // ECHTER API CALL
        const res = await fetch(`${API_BASE_URL}/api/workspace/tracker`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Fehler beim Speichern');

        // Erfolg
        saveBtn.innerHTML = 'Gespeichert';
        saveBtn.style.background = '#2e7d32'; // Grün
        if(checkIcon) checkIcon.style.display = 'inline';
        
        // Feedback Text einblenden
        if(feedbackEl) feedbackEl.style.opacity = '1';

        // Nach 2 Sekunden Reset & Menü
        setTimeout(() => {
            resetTracker();
            loadTrackerHistory();
           
        }, 2000);

    } catch (e) {
        console.error(e);
        alert("Das hat leider nicht geklappt. Bitte prüfen Sie Ihre Verbindung.");
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Eintrag sichern';
    }
}

function resetTracker() {
    // Reset Data
    currentTrackerData = { intensity: null, drains: [] };
    
    // Reset UI
    document.querySelectorAll('.tracker-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.tracker-tag').forEach(b => b.classList.remove('active'));
    document.getElementById('tracker-note').value = '';
    
    // Reset Button & Feedback
    const saveBtn = document.getElementById('btn-save-tracker');
    saveBtn.disabled = false;
    saveBtn.innerHTML = 'Eintrag sichern';
    saveBtn.style.background = ''; // Reset CSS Var
    document.getElementById('tracker-feedback').style.opacity = '0';
}

async function loadTrackerHistory() {
    const list = document.getElementById('tracker-history-list');
    if(!list) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/tracker`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const entries = await res.json();

        list.innerHTML = '';

        if (entries.length === 0) {
            list.innerHTML = '<p style="text-align:center; color:#bbb; padding:10px;">Noch keine Einträge vorhanden.</p>';
            return;
        }

        // Mapping für Icons
        const icons = { 'leicht': '☁️', 'mittel': '⚖️', 'schwer': '🏔️' };

        entries.forEach(entry => {
            // Datum formatieren (z.B. "Do, 29.01. - 14:30")
            const dateObj = new Date(entry.createdAt);
            const dateStr = dateObj.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
            
            // Tags rendern (drains ist ja jetzt ein echtes Array dank Backend)
            let tagsHtml = '';
            if (entry.drains && Array.isArray(entry.drains)) {
                tagsHtml = entry.drains.map(t => `<span class="mini-tag">${t}</span>`).join('');
            }

            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-icon" title="${entry.intensity}">
                    ${icons[entry.intensity] || '❓'}
                </div>
                <div class="history-content">
                    <div class="history-date">${dateStr}</div>
                    <div style="font-size:0.9rem; color:#333;">${entry.note || 'Keine Notiz'}</div>
                    <div class="history-tags">${tagsHtml}</div>
                </div>
            `;
            list.appendChild(item);
        });

    } catch (e) {
        console.error("Fehler beim Laden der History", e);
        list.innerHTML = '<p style="color:red; font-size:0.8rem;">Ladefehler.</p>';
    }
}


// =================================================================
// 11. ENTLASTUNGS-FINDER LOGIK
// =================================================================

const reliefContent = {
  zeit: {
    title: "🕰️ Zeit & Schlaf gewinnen",
    items: [
      "<strong>Akut frei nehmen (Pflegeunterstützungsgeld):</strong> Wenn plötzlich Pflege organisiert werden muss, dürfen Beschäftigte kurzfristig der Arbeit fernbleiben – und bekommen dafür meist einen Lohnersatz. Das nennt sich <em>Pflegeunterstützungsgeld</em> und gilt für bis zu 10 Arbeitstage pro Kalenderjahr je pflegebedürftiger Person. (In 2026 gibt es dabei auch einen gesetzlichen Tages-Höchstbetrag.)",
      "<strong>Verhinderungspflege:</strong> Wenn du als Pflegeperson ausfällst (Krankheit, Termine, Erholung), kann eine Ersatzpflege bezahlt werden – z.B. durch Angehörige, Nachbarn oder einen Dienst. Tipp: Plane das wie „Urlaubstage“, nicht erst im Notfall: Wer früh sucht, findet eher verlässliche Vertretung und spart Stress.",
      "<strong>Kurzzeitpflege:</strong> Für Krisenphasen oder nach Klinikaufenthalten kann vorübergehend stationäre Pflege helfen – oft als „Puffer“, wenn Zuhause (noch) nicht stabil organisiert ist. Praktisch: Kurzzeitpflege kann auch entlasten, wenn du erstmal wieder schlafen musst und Entscheidungen klar treffen willst.",
      "<strong>Pflegezeit & Familienpflegezeit:</strong> Wenn du länger entlastet werden musst, gibt es gesetzliche Modelle zur Freistellung oder Teilzeit (Pflegezeit bis zu 6 Monate; Familienpflegezeit bis zu 24 Monate). Für beide kann ein <em>zinsloses Darlehen</em> beantragt werden, um Verdienstausfälle abzufedern.",
      "<strong>Entlastungsbetrag (monatlich):</strong> Der Entlastungsbetrag ist dafür gedacht, dir regelmäßig Zeitfenster freizuschaufeln – z.B. über anerkannte Angebote für Unterstützung im Alltag (Haushalt, Betreuung, Begleitung). Nutze ihn strategisch: 2–3 Stunden pro Woche sind oft der Unterschied zwischen „funktionieren“ und „durchhalten“."
    ]
  },

  papier: {
    title: "📄 Papierkram bewältigen",
    items: [
      "<strong>Pflegestützpunkte:</strong> Kostenlose, unabhängige Beratung vor Ort – gut, wenn du Orientierung brauchst: Welche Leistung passt? Was ist kombinierbar? Was muss beantragt werden? Besonders hilfreich ist die Beratung, wenn mehrere Baustellen gleichzeitig laufen (Pflegegrad, Umbau, Hilfsmittel, Dienste).",
      "<strong>Pflegekasse: schriftlich + mit Checkliste arbeiten:</strong> Mach dir eine einfache „Akte Pflege“: (1) Bescheide, (2) Anträge, (3) Rechnungen/Quittungen, (4) Kontakte, (5) Notizen. Viele Konflikte entstehen nicht aus bösem Willen, sondern aus fehlenden Unterlagen – eine saubere Ablage spart Wochen.",
      "<strong>Sozialverbände (VdK/SoVD):</strong> Für einen Mitgliedsbeitrag unterstützen diese häufig bei Widersprüchen und sozialrechtlichen Themen. Das ist Gold wert, wenn du merkst, dass dich Schreiben, Fristen oder Gutachten emotional auffressen.",
      "<strong>Vollmachten & rechtliche Klarheit:</strong> Vorsorgevollmacht, Betreuungsverfügung und Patientenverfügung einmal sauber regeln – das verhindert später „Papierkram im Ausnahmezustand“. Tipp: Lege eine Notfallmappe an (Kopien, Kontaktliste, wichtige Diagnosen/Medikation).",
      "<strong>Pflegegrad gut vorbereiten:</strong> Notiere 7–14 Tage lang konkret, wobei Hilfe nötig ist (Was? Wie oft? Wie lange? Welche Risiken?). Das ist die beste Grundlage für Gespräche mit Gutachtern und schützt vor dem Gefühl, sich „rechtfertigen“ zu müssen."
    ]
  },

  koerper: {
    title: "💪 Körperliche Entlastung",
    items: [
      "<strong>Wohnumfeldverbesserung (Umbau-Zuschuss):</strong> Typische Entlastungs-Hits sind Haltegriffe, rutschfeste Böden, Bett auf Arbeitshöhe, Duschstuhl, Türschwellen entfernen oder eine bodengleiche Dusche. Wichtig: Häufig gilt „erst Antrag/Absprache, dann Umbau“ – sonst gibt es Ärger mit der Erstattung.",
      "<strong>Rückenschonend pflegen – ohne „Heldentum“:</strong> Wenn du beim Heben, Drehen oder Transfer regelmäßig Schmerzen hast, ist das ein Warnsignal, kein Normalzustand. Fordere Hilfsmittel ein (z.B. Transferhilfen) und lass dir Techniken zeigen – ein kurzer Profi-Termin spart dir Monate Beschwerden.",
      "<strong>Pflegehilfsmittel zum Verbrauch:</strong> Handschuhe, Flächendesinfektion, Bettschutzeinlagen etc. können die tägliche Belastung senken, weil du weniger improvisieren musst und hygienisch sicherer bist. Der Effekt ist unterschätzt: weniger Stress, weniger Diskussionen, weniger „Feuerwehrmodus“.",
      "<strong>Pflegedienst gezielt einsetzen:</strong> Du musst nicht alles abgeben – aber du kannst die körperlich schwersten oder konfliktreichsten Aufgaben delegieren (z.B. Duschen, Lagern, Anziehen). Das ist oft die schnellste Art, wieder „Kraft für Beziehung“ statt „Kraft für Körperarbeit“ zu haben.",
      "<strong>Tagespflege als Entlastungsanker:</strong> Wenn die Situation passt, kann Tagespflege dir feste freie Zeitblöcke geben (z.B. 1–3 Tage/Woche). Für viele Angehörige ist das der Punkt, an dem Schlaf und Alltag erstmals wieder planbar werden."
    ]
  },

  psyche: {
    title: "🧘 Emotionale Stärke",
    items: [
      "<strong>Pflegetelefon (anonym & kostenlos):</strong> Wenn du merkst, dass du innerlich „zu“ machst, kann ein Gespräch helfen – ohne Erklärungspflicht. Das Pflegetelefon des Bundesfamilienministeriums ist Mo–Do 9–18 Uhr erreichbar (030 20179131).",
      "<strong>Schuldgefühle entschärfen:</strong> Viele pflegende Angehörige denken: „Wenn ich Hilfe hole, lasse ich jemanden im Stich.“ Dreh den Satz um: Hilfe holen ist Versorgungssicherheit – für die pflegebedürftige Person und für dich.",
      "<strong>Selbsthilfegruppen:</strong> Der stärkste Effekt ist oft nicht „Tipps“, sondern Normalisierung: Du merkst, dass deine Überforderung kein persönliches Versagen ist. Das senkt Druck und macht Entscheidungen klarer.",
      "<strong>Kur/Reha für Pflegende:</strong> Es gibt Maßnahmen speziell für pflegende Angehörige, wenn Erschöpfung, Schlafprobleme, Angst oder depressive Symptome auftreten. Wichtig ist: Warte nicht auf den völligen Zusammenbruch – frühe Anzeichen reichen als Anlass, das Thema ärztlich anzusprechen.",
      "<strong>Mini-Regeln für den Alltag:</strong> Baue 1–2 kleine Stopps ein (z.B. 10 Minuten Spaziergang, Duschen ohne Zeitdruck, 20 Minuten Powernap). Das klingt banal, ist aber oft der Unterschied zwischen „Daueranspannung“ und „wieder handlungsfähig“."
    ]
  },

  finanzen: {
    title: "💰 Finanzen sichern",
    items: [
      "<strong>Pflegegrad prüfen / Höherstufung:</strong> Wenn sich Mobilität, Orientierung, Kontinenz, Verhalten oder Selbstversorgung verschlechtert haben, kann ein neuer Antrag mehr Leistungen bringen. Tipp: Nicht nur Diagnosen nennen, sondern konkrete Auswirkungen im Alltag (Häufigkeit, Dauer, Risiko).",
      "<strong>Entlastung ist auch „Geld wert“:</strong> Viele Familien verlieren Geld, weil Leistungen verfallen oder nicht kombiniert werden (z.B. Entlastungsbetrag nicht genutzt, Hilfsmittel nicht beantragt, keine Vertretung organisiert). Eine halbe Stunde Beratung kann hier mehr bringen als stundenlanges Googeln.",
      "<strong>Zinsloses Darlehen bei Freistellung:</strong> Wer Pflegezeit/Familienpflegezeit nutzt, kann zur Abfederung des Einkommensverlustes ein zinsloses Darlehen beantragen (Auszahlung monatlich, Rückzahlung nach Ende der Freistellung).",
      "<strong>Landespflegegeld / regionale Extras:</strong> Je nach Bundesland oder Kommune gibt es zusätzliche Unterstützungen (z.B. Landespflegegeld in Bayern). Das lohnt sich als Checkpunkt in deiner Beratungsliste – es ist oft „stilles Geld“, das viele nicht kennen.",
      "<strong>Steuervorteile:</strong> Den Pflege-Pauschbetrag bzw. außergewöhnliche Belastungen (je nach Situation) in der Steuererklärung prüfen. Wenn du unsicher bist: Lohnsteuerhilfeverein oder Steuerberatung spart Zeit und reduziert Fehler."
    ]
  }
};


window.showReliefSuggestions = function() {
    const resultsContainer = document.getElementById('relief-results');
    const checkboxes = document.querySelectorAll('.relief-grid input:checked');
    
    resultsContainer.innerHTML = ''; // Reset
    resultsContainer.classList.remove('hidden');

    if (checkboxes.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align:center; color:#888;">Bitte wählen Sie oben mindestens einen Bereich aus.</p>';
        return;
    }

    // Intro Satz
    const intro = document.createElement('p');
    intro.style.cssText = "margin-bottom:20px; font-weight:500; color:#333;";
    intro.textContent = "Basierend auf Ihrer Auswahl könnten diese Wege helfen:";
    resultsContainer.appendChild(intro);

    // Durch alle ausgewählten Boxen gehen
    checkboxes.forEach(chk => {
        const key = chk.value;
        const data = reliefContent[key];

        if (data) {
            const box = document.createElement('div');
            box.className = 'suggestion-box';
            
            // Liste der Tipps erstellen
            const listHtml = data.items.map(item => `<li style="margin-bottom:8px;">${item}</li>`).join('');

            box.innerHTML = `
                <span class="suggestion-title">${data.title}</span>
                <ul style="padding-left:20px; margin-top:10px; color:#555; line-height:1.6;">
                    ${listHtml}
                </ul>
            `;
            resultsContainer.appendChild(box);
        }
    });

    // Scroll zum Ergebnis
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// =================================================================
// 12. KI BEGLEITER (COMPANION)
// =================================================================

let companionMode = null;     // 'decision' oder 'thoughts'
let companionHistory = [];    // Array für den Chatverlauf

// Startet den Chat (wird von den Karten aufgerufen)
window.startCompanion = function(mode) {
    companionMode = mode;
    companionHistory = []; // Reset bei Neustart

    // UI umschalten
    document.getElementById('companion-selection').classList.add('hidden');
    document.getElementById('companion-chat-view').classList.remove('hidden');
    document.getElementById('companion-chat-view').style.display = 'flex'; 

    const chatContainer = document.getElementById('chat-history-container');
    chatContainer.innerHTML = ''; // Leer machen

    // Erste Nachricht vom Bot (Simuliert)
    let introText = "";
    if (mode === 'decision') {
        introText = "Hallo. Ich sehe, du stehst vor einer Entscheidung. Magst du mir kurz erzählen, worum es geht?";
    } else {
        introText = "Hallo. Lass uns gemeinsam etwas Ordnung schaffen. Was geht dir gerade durch den Kopf?";
    }

    addChatBubble(introText, 'bot');
    
    // Enter-Taste im Input Feld aktivieren
    document.getElementById('companion-input').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendCompanionMessage();
    });
}

// Nachricht senden
window.sendCompanionMessage = async function() {
    const input = document.getElementById('companion-input');
    const text = input.value.trim();
    if (!text) return;

    // 1. User Bubble anzeigen
    addChatBubble(text, 'user');
    input.value = '';

    // 2. Loading Indikator
    const chatContainer = document.getElementById('chat-history-container');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-loading';
    loadingDiv.textContent = 'Begleiter denkt nach...';
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        // 3. Backend Call
        const res = await fetch(`${API_BASE_URL}/api/workspace/companion`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({
                message: text,
                mode: companionMode,
                history: companionHistory // Kontext mitsenden
            })
        });

        const data = await res.json();
        
        // Loading entfernen
        loadingDiv.remove();

        if (data.reply) {
            addChatBubble(data.reply, 'bot');
            
            // History updaten (User + Bot) für nächsten Request
            companionHistory.push({ role: "user", content: text });
            companionHistory.push({ role: "assistant", content: data.reply });
            
            // Begrenzen der History (damit Token nicht explodieren), z.B. letzte 10 Nachrichten
            if(companionHistory.length > 10) companionHistory = companionHistory.slice(-10);
        }

    } catch (e) {
        console.error(e);
        loadingDiv.textContent = 'Verbindungsproblem. Bitte versuche es noch einmal.';
    }
}

// Hilfsfunktion: Bubble rendern
function addChatBubble(text, role) {
    const container = document.getElementById('chat-history-container');
    const div = document.createElement('div');
    div.className = `chat-bubble ${role}`;
    // Einfache Umwandlung von Newlines in <br> für bessere Lesbarkeit
    div.innerHTML = text.replace(/\n/g, '<br>');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight; // Auto-Scroll nach unten
}

// =================================================================
// 13. KRISEN-MODUS LOGIK
// =================================================================

function toggleCrisisMode() {
    const overlay = document.getElementById('crisis-overlay');
    const isHidden = overlay.classList.contains('hidden');
    
    if (isHidden) {
        overlay.classList.remove('hidden');
        loadCrisisData(); // Daten laden beim Öffnen
    } else {
        overlay.classList.add('hidden');
    }
}

function toggleCrisisEdit() {
    const viewMode = document.getElementById('crisis-view-mode');
    const editMode = document.getElementById('crisis-edit-mode');
    const btn = document.getElementById('btn-crisis-edit');

    if (editMode.classList.contains('hidden')) {
        // Bearbeiten starten
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
        btn.textContent = "Abbrechen";
        
        // Inputs füllen
        document.getElementById('crisis-input-c1').value = localStorage.getItem('crisis_c1') || '';
        document.getElementById('crisis-input-c2').value = localStorage.getItem('crisis_c2') || '';
        document.getElementById('crisis-input-meds').value = localStorage.getItem('crisis_meds') || '';
    } else {
        // Abbrechen
        viewMode.classList.remove('hidden');
        editMode.classList.add('hidden');
        btn.textContent = "Bearbeiten";
    }
}

function saveCrisisData() {
    const c1 = document.getElementById('crisis-input-c1').value;
    const c2 = document.getElementById('crisis-input-c2').value;
    const meds = document.getElementById('crisis-input-meds').value;

    // In LocalStorage speichern (bleibt im Browser, auch offline)
    localStorage.setItem('crisis_c1', c1);
    localStorage.setItem('crisis_c2', c2);
    localStorage.setItem('crisis_meds', meds);

    // UI aktualisieren
    loadCrisisData();
    toggleCrisisEdit(); // Modus wechseln
}

function loadCrisisData() {
    const c1 = localStorage.getItem('crisis_c1');
    const c2 = localStorage.getItem('crisis_c2');
    const meds = localStorage.getItem('crisis_meds');

    const viewC1 = document.getElementById('display-contact-1');
    const viewC2 = document.getElementById('display-contact-2');
    const viewMeds = document.getElementById('display-meds');

    // Kontakt 1 mit Link
    if (c1) {
        // Versuchen, eine Nummer zu extrahieren für tel: Link
        const number = c1.replace(/[^0-9+]/g, '');
        viewC1.innerHTML = `👤 <a href="tel:${number}" style="color:#333; text-decoration:none;">${c1}</a> <span style="font-size:0.8rem; color:green;">(Antippen zum Anrufen)</span>`;
    } else {
        viewC1.textContent = "• Kein Kontakt 1 eingetragen";
    }

    // Kontakt 2
    viewC2.textContent = c2 ? `👤 ${c2}` : "• Kein Kontakt 2 eingetragen";
    
    // Medis
    viewMeds.textContent = meds || "Keine Informationen hinterlegt.";
    // Zeilenumbrüche beachten
    viewMeds.innerHTML = (meds || "Keine Infos.").replace(/\n/g, '<br>');
}

// =================================================================
// 9. B2B FEATURES (Snippets & Sandbox)
// =================================================================


function initB2BFeatures() {
    // Karten sichtbar machen
    document.getElementById('b2b-snippets-card').classList.remove('hidden');
    document.getElementById('b2b-sandbox-card').classList.remove('hidden');
    
    // Daten laden
    loadSnippets();
}

// --- SNIPPETS LOGIK ---

async function loadSnippets() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/workspace/snippets`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        const snippets = await res.json();
        const list = document.getElementById('snippet-list');
        list.innerHTML = '';

        if (snippets.length === 0) {
            list.innerHTML = '<p style="font-style:italic; color:#999; font-size:0.9rem;">Keine Bausteine vorhanden.</p>';
            return;
        }

        snippets.forEach(snip => {
            const div = document.createElement('div');
            div.style.cssText = 'background:white; border:1px solid #eee; padding:10px; margin-bottom:8px; border-radius:6px; display:flex; justify-content:space-between; align-items:center;';
            
            div.innerHTML = `
                <div style="overflow:hidden; margin-right:10px;">
                    <strong style="font-size:0.9rem; display:block;">${snip.title}</strong>
                    <div style="font-size:0.8rem; color:#666; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:200px;">${snip.content}</div>
                </div>
                <div style="display:flex; gap:5px;">
                    <button onclick="copyToClipboard('${snip.content.replace(/'/g, "\\'")}')" class="button-secondary" title="Kopieren" style="padding:4px 8px;">📋</button>
                    <button onclick="deleteSnippet(${snip.id})" class="button-secondary" title="Löschen" style="padding:4px 8px; color:#e74c3c;">&times;</button>
                </div>
            `;
            list.appendChild(div);
        });

    } catch(e) { console.error(e); }
}

async function addSnippet() {
    const titleIn = document.getElementById('snippet-title');
    const contentIn = document.getElementById('snippet-content');
    
    if (!titleIn.value || !contentIn.value) return alert("Bitte Titel und Inhalt ausfüllen.");

    try {
        await fetch(`${API_BASE_URL}/api/workspace/snippets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ 
                title: titleIn.value, 
                content: contentIn.value, 
                category: 'general' 
            })
        });
        
        titleIn.value = '';
        contentIn.value = '';
        loadSnippets();

    } catch(e) { console.error(e); }
}

async function deleteSnippet(id) {
    if(!confirm("Baustein löschen?")) return;
    try {
        await fetch(`${API_BASE_URL}/api/workspace/snippets/${id}`, { 
            method: 'DELETE', 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        loadSnippets();
    } catch(e) { console.error(e); }
}

// --- SANDBOX LOGIK ---

function copySandbox() {
    const text = document.getElementById('sandbox-input').value;
    if(!text) return;
    copyToClipboard(text);
    alert("Text in die Zwischenablage kopiert! Sie können ihn jetzt sicher weiterverwenden.");
}

// Hilfsfunktion fürs Kopieren
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Optional: Kleines Feedback (Toast) anzeigen
        const btn = document.activeElement;
        if(btn && btn.tagName === 'BUTTON') {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✅';
            setTimeout(() => btn.innerHTML = originalText, 1000);
        }
    });
}