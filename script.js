// 1. DEFINIZIONE DELLA CLASSE (Deve stare per prima!)
class Cliente {
    constructor(nomeStudio, dataUltimoControllo, profiloRischio, checklist) {
        this.nomeStudio = nomeStudio;
        this.dataUltimoControllo = dataUltimoControllo;
        this.profiloRischio = profiloRischio;
        this.checklist = checklist;
        this.prossimoControllo = this.calcolaProssimaScadenza();
    }

    calcolaProssimaScadenza() {
        const mesiPerRischio = { "Alto": 12, "Medio": 18, "Basso": 30 };
        const data = new Date(this.dataUltimoControllo);
        data.setMonth(data.getMonth() + (mesiPerRischio[this.profiloRischio] || 12));
        return data.toISOString().split('T')[0];
    }

    calcolaStatoCompliance() {
        const oggi = new Date(); oggi.setHours(0,0,0,0);
        const dataScadenza = new Date(this.prossimoControllo);
        const giorniMancanti = (dataScadenza - oggi) / (1000 * 60 * 60 * 24);

        if (giorniMancanti < 0) return "rosso";
        if (giorniMancanti < 60) return "giallo";
        return "verde";
    }
}

// 2. FUNZIONI DI SUPPORTO
function salvaDati() { 
    localStorage.setItem('clientiStudio', JSON.stringify(clientiStudio)); 
}

function caricaDati() {
    const dati = localStorage.getItem('clientiStudio');
    if (!dati) return [];
    return JSON.parse(dati).map(c => new Cliente(c.nomeStudio, c.dataUltimoControllo, c.profiloRischio, c.checklist));
}

// 3. INIZIALIZZAZIONE DATI (Ora la classe è conosciuta)
let clientiStudio = caricaDati();

// 4. LOGICA UI
function renderizzaClienti() {
    const container = document.getElementById('dashboard-clienti');
    container.innerHTML = '';
    
    [...clientiStudio].sort((a, b) => new Date(a.prossimoControllo) - new Date(b.prossimoControllo))
    .forEach(c => {
        const stato = c.calcolaStatoCompliance();
        let motivazioni = [];
        const oggi = new Date();
        const dataScadenza = new Date(c.prossimoControllo);
        
        if (dataScadenza < oggi) motivazioni.push("Controllo periodico scaduto.");
        else if ((dataScadenza - oggi) / (1000*60*60*24) < 60) motivazioni.push("Controllo in scadenza tra meno di 60 giorni.");
        
        if (!c.checklist.visura) motivazioni.push("Manca Visura.");
        if (!c.checklist.dichiarazione) motivazioni.push("Manca Dichiarazione Cliente.");
        if (!c.checklist.valutazioneRischio) motivazioni.push("Manca Valutazione Rischio.");
        if (!c.checklist.controlloPeriodico) motivazioni.push("Manca Scheda Controllo.");

        const card = document.createElement('div');
        card.className = `cliente-card ${stato}`;
        const listaMotivi = motivazioni.length > 0 ? `<ul>${motivazioni.map(m => `<li>${m}</li>`).join('')}</ul>` : `<p><em>Tutto in regola.</em></p>`;

        card.innerHTML = `
            <h3>${c.nomeStudio}</h3>
            <p>Rischio: <strong>${c.profiloRischio}</strong> | Scadenza: <strong>${c.prossimoControllo}</strong></p>
            ${listaMotivi}
        `;
        container.appendChild(card);
    });
}

// 5. EVENTI
document.getElementById('form-nuovo-cliente').addEventListener('submit', (e) => {
    e.preventDefault();
    const nuovo = new Cliente(
        document.getElementById('nomeStudio').value,
        document.getElementById('dataUltimoControllo').value,
        document.getElementById('profiloRischio').value,
        {
            visura: document.getElementById('visura').checked,
            dichiarazione: document.getElementById('dichiarazione').checked,
            valutazioneRischio: document.getElementById('valutazioneRischio').checked,
            controlloPeriodico: document.getElementById('controlloPeriodico').checked
        }
    );
    clientiStudio.push(nuovo);
    salvaDati();
    renderizzaClienti();
    e.target.reset();
});

renderizzaClienti();