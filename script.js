// script.js (FINALE VERSION FÜR DIE ÖFFENTLICHE WEBSEITE)

document.addEventListener('DOMContentLoaded', () => {
 // Funktion für die Fade-In Animation beim Scrollen
 function setupScrollAnimation() {
 const elementsToFadeIn = document.querySelectorAll('.fade-in-element');
 if (elementsToFadeIn.length === 0) return;

 const observer = new IntersectionObserver((entries) => {
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 entry.target.classList.add('is-visible');
 observer.unobserve(entry.target);
 }
 });
 }, { threshold: 0.1 });

 elementsToFadeIn.forEach(element => {
 observer.observe(element);
 });
 }

 const cookieBanner = document.getElementById('cookie-banner');
const cookieAcceptButton = document.getElementById('cookie-accept-button');

// Prüfe, ob das Cookie bereits gesetzt ist
if (!document.cookie.split(';').some((item) => item.trim().startsWith('cookie_consent='))) {
    // Wenn nicht, zeige den Banner an
    if(cookieBanner) cookieBanner.classList.remove('hidden');
}

// Füge den Listener für den Akzeptieren-Button hinzu
if (cookieAcceptButton) {
    cookieAcceptButton.addEventListener('click', () => {
        // Setze ein Cookie, das 1 Jahr gültig ist
        document.cookie = "cookie_consent=true; max-age=31536000; path=/; SameSite=Lax";
        // Verstecke den Banner mit der CSS-Klasse
        if(cookieBanner) cookieBanner.classList.add('hidden');
    });
}

    // =======================================================
    // NEUE LOGIK FÜR DIE INTERAKTIVE DEMO
    // =======================================================
    const demoButton = document.getElementById('run-demo-button');
    const demoOutput = document.getElementById('demo-output-content');

    if (demoButton && demoOutput) {
        const resultHtml = `
            <h5>Was das bedeutet:</h5>
            <p>Das Jobcenter wird Ihre Leistungen zum <strong>01. August 2025</strong> stoppen, weil Sie angeforderte Unterlagen nicht eingereicht haben.</p>
            <h5>Was zu tun ist:</h5>
            <ul>
                <li><strong>Handlung:</strong> Reichen Sie die geforderten Nachweise (Gehaltsabrechnungen, etc.) ein.</li>
                <li><strong>Frist:</strong> Sofort, spätestens bis zum <strong>15. Juli 2025</strong>.</li>
            </ul>
        `;

        demoButton.addEventListener('click', () => {
            demoOutput.innerHTML = ''; // Leere den Platzhalter-Text
            demoOutput.classList.remove('empty');
            
            // Simuliere eine kurze "Ladezeit" für den WOW-Effekt
            const spinner = document.createElement('div');
            spinner.className = 'inline-spinner';
            spinner.style.margin = 'auto'; // Zentriert den Spinner
            demoOutput.appendChild(spinner);

            setTimeout(() => {
                demoOutput.innerHTML = resultHtml;
            }, 800); // 0.8 Sekunden Verzögerung
        });
    }

    function setupB2BDemo() {
    const demoButton = document.getElementById('run-b2b-demo-button');
    const demoOutput = document.getElementById('b2b-demo-output-content');

    if (demoButton && demoOutput) {
        const resultHtml = `
            <h5>Analyse-Ergebnis:</h5>
            <p>Zahlungsaufforderung von <strong>ABC-Versicherung AG</strong> über <strong>3.325,00 €</strong>.</p>
            <ul>
                <li><strong>Klient:</strong> Mustermann (Zuordnung offen)</li>
                <li><strong>Aktenzeichen:</strong> Az.: 4711-M/25</li>
                <li><strong>Handlung:</strong> Zahlung der Gesamtsumme.</li>
                <li><strong>Frist:</strong> <strong>28.07.2025</strong> (Dringend)</li>
            </ul>
        `;

        demoButton.addEventListener('click', () => {
            demoOutput.innerHTML = '';
            demoOutput.classList.remove('empty');
            
            const spinner = document.createElement('div');
            spinner.className = 'inline-spinner';
            spinner.style.margin = 'auto';
            demoOutput.appendChild(spinner);

            setTimeout(() => {
                demoOutput.innerHTML = resultHtml;
            }, 800);
        });
    }
}

// --- NEUE LOGIK FÜR DIE ADMIN-DEMO ---
function setupAdminDemo() {
    const inviteButton = document.getElementById('demo-invite-button');
    const memberList = document.getElementById('demo-member-list');
    const licenseCount = document.getElementById('demo-license-count');
    const caseList = document.getElementById('demo-case-list');
    const selectedMemberName = document.getElementById('demo-selected-member-name');

    if (!inviteButton) return; // Beendet die Funktion, wenn die Elemente nicht da sind

    let memberCount = 1;
    const maxLizenzen = 2;

    const caseData = {
        admin: [
            { title: "Widerspruch Jobcenter (Klient: Meier)", date: "05.07.2025" },
            { title: "Antrag auf Fristverlängerung Finanzamt (Klient: Schulze)", date: "02.07.2025" }
        ],
        neuerMitarbeiter: [
            { title: "Analyse Mahnung Stadtwerke (Klient: Huber)", date: "06.07.2025" }
        ]
    };

    function renderCases(memberName) {
        let cases = [];
        if (memberName.includes('Admin')) {
            cases = caseData.admin;
            selectedMemberName.textContent = "ihre-email@firma.de";
        } else {
            cases = caseData.neuerMitarbeiter;
            selectedMemberName.textContent = "neuer.mitarbeiter@kanzlei.de";
        }
        
        caseList.innerHTML = '';
        cases.forEach(c => {
            const li = document.createElement('li');
            li.innerHTML = `<div class="case-title">${c.title}</div><div class="case-date">${c.date}</div>`;
            caseList.appendChild(li);
        });
    }

    function updateActiveMember(selectedLi) {
        document.querySelectorAll('#demo-member-list li').forEach(li => li.classList.remove('active'));
        selectedLi.classList.add('active');
        renderCases(selectedLi.textContent);
    }

    // Initiale Fälle für den Admin laden
    renderCases("Admin");

    // Event-Listener für Klicks auf die Mitgliederliste
    memberList.addEventListener('click', (e) => {
        const targetLi = e.target.closest('li.selectable');
        if (targetLi) {
            updateActiveMember(targetLi);
        }
    });

    // Event-Listener für den Einlade-Button
    inviteButton.addEventListener('click', () => {
        if (memberCount >= maxLizenzen) {
            alert('Lizenz-Limit für diese Demo erreicht!');
            return;
        }

        memberCount++;
        const newMember = document.createElement('li');
        newMember.classList.add('selectable');
        newMember.dataset.member = "neuerMitarbeiter";
        newMember.innerHTML = `<span>neuer.mitarbeiter@kanzlei.de</span>`;
        memberList.appendChild(newMember);

        licenseCount.textContent = `${memberCount} / ${maxLizenzen} Sitze`;
        updateActiveMember(newMember);
        
        if (memberCount >= maxLizenzen) {
            inviteButton.disabled = true;
            inviteButton.textContent = 'Limit erreicht';
        }
    });
}

function setupPdfDemo() {
    const pdfDemoButton = document.getElementById('run-pdf-demo-button');
    const pdfPreviewPage = document.querySelector('.pdf-preview-page');
    const pdfContent = pdfPreviewPage ? pdfPreviewPage.querySelector('.pdf-content') : null;
    const pdfSpinner = pdfPreviewPage ? pdfPreviewPage.querySelector('.pdf-spinner-overlay') : null;

    if (!pdfDemoButton || !pdfPreviewPage || !pdfContent || !pdfSpinner) {
        return; // Beendet die Funktion, wenn die Demo-Elemente nicht auf der Seite sind
    }
    
    // Der simulierte Inhalt des PDFs
    const pdfHtmlContent = `
        <p class="recipient">Jobcenter Musterstadt<br>Musterweg 1<br>12345 Musterstadt</p>
        <p class="subject">Antwort auf Ihr Schreiben vom 15.07.2025</p>
        <p class="salutation">Sehr geehrte Damen und Herren,</p>
        <p class="body">bezugnehmend auf Ihr Schreiben möchte ich Ihnen mitteilen, dass ich die Forderung nicht auf einmal begleichen kann. Ich bitte daher um die Möglichkeit einer Ratenzahlung und schlage eine monatliche Rate von [Betrag] vor...</p>
        <p class="closing">Mit freundlichen Grüßen,</p>
        <p class="closing">Ihre Unterschrift</p>
        
        <p class="sender-name">Max Mustermann</p>
    `;

    pdfDemoButton.addEventListener('click', () => {
        // Reset, falls die Demo schon mal lief
        pdfPreviewPage.classList.remove('is-generated');
        pdfContent.innerHTML = '';
        
        // Spinner anzeigen
        pdfSpinner.classList.remove('hidden');
        
        // Simuliere die Wartezeit für die PDF-Erstellung
        setTimeout(() => {
            pdfContent.innerHTML = pdfHtmlContent;
            pdfSpinner.classList.add('hidden');
            pdfPreviewPage.classList.add('is-generated');
        }, 1500); // 1.5 Sekunden Verzögerung
    });
}

function setupScrollHighlighting() {
    const cardsToHighlight = document.querySelectorAll('.scroll-highlight-card');
    if (cardsToHighlight.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // NEUE LOGIK:
            // Wenn eine Karte in den Fokus kommt, füge die Klasse hinzu.
            if (entry.isIntersecting) {
                entry.target.classList.add('is-highlighted');
            } 
            // Wenn sie den Fokus verlässt, entferne die Klasse wieder.
            else {
                entry.target.classList.remove('is-highlighted');
            }
        });
    }, { 
        root: null,
        // Dieser Wert ist entscheidend: Er definiert einen schmalen horizontalen Streifen
        // in der Mitte des Bildschirms. Nur Karten in diesem Bereich sind "aktiv".
        rootMargin: '-40% 0px -40% 0px', 
        threshold: 0
    });

    cardsToHighlight.forEach(card => {
        observer.observe(card);
    });
}

function setupCounterAnimation() {
    const counters = document.querySelectorAll('.metric-number');
    if (counters.length === 0) return;

    const animateCounter = (element) => {
        // Schritt 1: Hole den Zielwert als Text, z.B. "80%"
        const targetString = element.getAttribute('data-target');
        if (!targetString) return;

        // Schritt 2: Extrahiere die reine Zahl (ignoriert alles andere)
        const targetNumber = parseInt(targetString.replace(/[^0-9]/g, ''), 10);
        
        // Schritt 3: Finde heraus, welches Suffix am Ende stand (z.B. "+" oder "%")
        const suffixMatch = targetString.match(/(\D+)$/);
        const suffix = suffixMatch ? suffixMatch[0] : '';

        // Wenn keine gültige Zahl gefunden wurde, abbrechen
        if (isNaN(targetNumber)) {
            element.textContent = targetString; // Zeige den Originaltext an
            return;
        }

        const duration = 2000;
        const stepTime = 20;
        const totalSteps = duration / stepTime;
        const increment = targetNumber / totalSteps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetNumber) {
                clearInterval(timer);
                // Füge das gemerkte Suffix am Ende wieder hinzu
                element.textContent = targetNumber.toLocaleString('de-DE') + suffix;
            } else {
                element.textContent = Math.round(current).toLocaleString('de-DE');
            }
        }, stepTime);
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function setupMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active'); // Für den "Schließen"-Effekt des Icons
        });
    }
}

function initVideoOnScroll() {
    const videos = document.querySelectorAll('.lazy-video');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(e => console.log(e));
            } else {
                video.pause();
            }
        });
    }, { threshold: 0.5 });
    videos.forEach(video => observer.observe(video));
}

function setupFileDemo() {
    const demoButton = document.getElementById('run-file-demo-button');
    const demoOutput = document.getElementById('file-demo-output-content');

    if (!demoButton || !demoOutput) {
        return; // Stellt sicher, dass der Code nur läuft, wenn die Demo auf der Seite ist
    }

    const resultHtml = `
        <h5>Kernthema:</h5>
        <p>Mietvertrag für eine Immobilie.</p>
        <h5>Wichtige Klauseln:</h5>
        <ul>
            <li><strong>§ 2 Mietzeit:</strong> Das Mietverhältnis beginnt am 01.08.2025 und läuft auf unbestimmte Zeit.</li>
            <li><strong>Kündigungsverzicht:</strong> Beide Parteien verzichten für 2 Jahre auf eine ordentliche Kündigung.</li>
            <li><strong>Kündigungsfrist:</strong> Nach der Mindestdauer beträgt die Frist 3 Monate.</li>
        </ul>
    `;

    demoButton.addEventListener('click', () => {
        demoOutput.innerHTML = '';
        demoOutput.classList.remove('empty');
        
        const spinner = document.createElement('div');
        spinner.className = 'inline-spinner';
        spinner.style.margin = 'auto';
        demoOutput.appendChild(spinner);

        setTimeout(() => {
            demoOutput.innerHTML = resultHtml;
        }, 1200); // Etwas längere Ladezeit, um die Komplexität zu simulieren
    });
}

function setupChatDemo() {
    const chatWindow = document.querySelector('.chat-demo-window');
    if (!chatWindow) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Animation nur einmal abspielen
            }
        });
    }, { threshold: 0.5 }); // Startet, wenn 50% der Demo sichtbar sind

    observer.observe(chatWindow);
}

function setupChatAnimation() {
    const chatWindow = document.querySelector('.chat-animation-window');
    if (!chatWindow) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(chatWindow);
    }

const lettersSlider = document.getElementById('letters-per-day');
const lettersValueDisplay = document.getElementById('letters-per-day-value');
const timeSavedDisplay = document.getElementById('time-saved');
const costSavedDisplay = document.getElementById('cost-saved');

if (lettersSlider) {
    const calculateSavings = () => {
        const lettersPerDay = parseInt(lettersSlider.value);
        lettersValueDisplay.textContent = lettersPerDay;

        // Annahmen
        const minutesSavedPerLetter = 15; // Zeitersparnis pro Brief in Minuten
        const hourlyRate = 45; // Interner Stundensatz in €
        const workdaysPerMonth = 21; // Durchschnittliche Arbeitstage pro Monat

        // Berechnung
        const totalLettersPerMonth = lettersPerDay * workdaysPerMonth;
        const totalMinutesSaved = totalLettersPerMonth * minutesSavedPerLetter;
        const totalHoursSaved = totalMinutesSaved / 60;
        const totalCostSaved = totalHoursSaved * hourlyRate;

        // Anzeige aktualisieren
        timeSavedDisplay.textContent = Math.round(totalHoursSaved);
        costSavedDisplay.textContent = Math.round(totalCostSaved) + ' €';
    };

    // Event-Listener, um bei Änderung des Sliders neu zu berechnen
    lettersSlider.addEventListener('input', calculateSavings);
    calculateSavings();
    
}

function setupFlipCardScroll() {
    const track = document.querySelector('.feature-scroll-track');
    const cards = document.querySelectorAll('.flip-card-inner');

    if (!track || cards.length === 0) return;

    let isTicking = false; // Für Performance-Optimierung

    function updateFlipCards() {
        const rect = track.getBoundingClientRect();
        const trackHeight = rect.height;
        const viewportHeight = window.innerHeight;

        // Fortschritt 0 bis 1
        // Wir ziehen viewportHeight ab, damit 1.0 erreicht ist, wenn die Section endet
        let progress = -rect.top / (trackHeight - viewportHeight);

        // Begrenzen
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;

        // Wir wollen die Drehung über den mittleren Bereich des Scrolls verteilen
        // z.B. von 10% bis 90%, damit es nicht zu hektisch ist
        const startP = 0.1;
        const endP = 0.9;
        
        let rotation = 0;

        if (progress > startP && progress < endP) {
            const innerProgress = (progress - startP) / (endP - startP);
            rotation = innerProgress * 180;
        } else if (progress >= endP) {
            rotation = 180;
        } else {
            rotation = 0;
        }

        cards.forEach((card, index) => {
            // Domino-Effekt: Index * 15 Grad Verzögerung
            let individualRotation = rotation - (index * 15);
            
            // Hard Limit 0 und 180
            if (individualRotation < 0) individualRotation = 0;
            if (individualRotation > 180) individualRotation = 180;

            card.style.transform = `rotateY(${individualRotation}deg)`;
        });

        isTicking = false;
    }

    // Scroll Event Listener mit requestAnimationFrame
    document.addEventListener('scroll', function() {
        if (!isTicking) {
            window.requestAnimationFrame(updateFlipCards);
            isTicking = true;
        }
    });

    // Initial einmal aufrufen
    updateFlipCards();
}

// Aufrufen, wenn DOM geladen ist
document.addEventListener('DOMContentLoaded', setupFlipCardScroll);

// =======================================================
// LOGIK FÜR DIE INTERAKTIVE ANTRAGSHELFER-DEMO
// =======================================================
function runAntragshelferDemo() {
    const demoButton = document.getElementById('run-antragshelfer-demo'); // Falls der Button noch existiert
    const activeField = document.getElementById('demo-active-field');
    const explanation = document.getElementById('demo-ai-explanation');
    const chat = document.getElementById('demo-ai-chat');
    const userQuestion = document.getElementById('demo-user-question');
    const aiAnswer = document.getElementById('demo-ai-answer');

    if (!activeField) return; // Stellt sicher, dass die Demo nur läuft, wenn die Elemente da sind

    [explanation, chat, userQuestion, aiAnswer].forEach(el => el.classList.add('hidden'));
    activeField.classList.remove('clicked');
    if(demoButton) demoButton.disabled = true;

    setTimeout(() => {
        activeField.classList.add('clicked');
        // KORREKTUR: DIESE ZEILE WIRD NICHT MEHR AUSGEFÜHRT, DAMIT DER RAHMEN BLEIBT
        // setTimeout(() => activeField.classList.remove('clicked'), 400); 
    }, 500);

    setTimeout(() => {
        explanation.classList.remove('hidden');
    }, 1200);

    setTimeout(() => {
        chat.classList.remove('hidden');
        userQuestion.classList.remove('hidden');
    }, 2500);

    setTimeout(() => {
        aiAnswer.classList.remove('hidden');
        if(demoButton) demoButton.disabled = false;
    }, 3500);
}

// NEU: Die Funktion, die prüft, ob die Demo ins Sichtfeld scrollt
function setupAntragshelferDemoObserver() {
    const demoSection = document.getElementById('antragshelfer-demo-section');
    if (!demoSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runAntragshelferDemo(); // Startet die Animation
                observer.unobserve(entry.target); // Stellt sicher, dass sie nur einmal läuft
            }
        });
    }, { threshold: 0.5 }); // Startet, wenn 50% der Sektion sichtbar sind

    observer.observe(demoSection);
}

function runFormlosAntragDemo() {
  const userField = document.getElementById('demo-user-input');
  const paper = document.querySelector('#letter-card .paper');
  if (!userField || !paper) {
    console.warn("❌ Demo-Elemente nicht gefunden");
    return;
  }

  const userText = "Schreibe einen Antrag auf Kostenübernahme für orthopädische Schuheinlagen.";
  userField.textContent = '';
  paper.classList.remove('show'); // zurücksetzen, damit Animation neu läuft

  let i = 0;
  const speed = 35;

  function typePrompt() {
    if (i < userText.length) {
      userField.textContent += userText.charAt(i);
      i++;
      setTimeout(typePrompt, speed);
    } else {
      // Animation leicht verzögern für Spannung
      setTimeout(() => {
        paper.classList.add('show');
      }, 800);
    }
  }

  typePrompt();
}

function setupFormlosAntragDemoObserver() {
  const section = document.getElementById('formlos-antrag-demo-section');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runFormlosAntragDemo();
        observer.unobserve(entry.target); // nur einmal abspielen
      }
    });
  }, { threshold: 0.1 });

  observer.observe(section);
}



 // Initialer Aufruf 
 
 setupScrollAnimation();
setupB2BDemo();
setupAdminDemo();
setupPdfDemo();
setupScrollHighlighting();
setupCounterAnimation();
setupMobileNav();
initVideoOnScroll()
setupFileDemo();
setupChatDemo();
setupChatAnimation();
setupAntragshelferDemoObserver();
setupFormlosAntragDemoObserver();
setupFlipCardScroll();
});