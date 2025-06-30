# WhatsApp Translator IT⇄EN

## 🚀 Descrizione
Estensione per Chrome che aggiunge un pulsante di traduzione bidirezionale a WhatsApp Web. Traduce automaticamente i messaggi da italiano a inglese e viceversa.

## ✨ Funzionalità
- **Traduzione bidirezionale**: Rileva automaticamente la lingua (italiano o inglese) e traduce nell'altra lingua
- **Pulsante floating**: Posizionato in basso a destra, sempre visibile
- **Lettura automatica**: Legge automaticamente il testo dal campo messaggio
- **API multiple**: Usa MyMemory API come servizio primario e LibreTranslate come fallback
- **Interfaccia intuitiva**: Pulsante con icona 🌐 e feedback visivo
- **Debug integrato**: Log dettagliati per troubleshooting

## 📦 Installazione
1. Scarica i file dell'estensione
2. Apri Chrome e vai su `chrome://extensions/`
3. Attiva la "Modalità sviluppatore"
4. Clicca su "Carica estensione non pacchettizzata"
5. Seleziona la cartella contenente i file dell'estensione
6. Vai su WhatsApp Web - dovresti vedere il pulsante 🌐 in basso a destra

## 🎯 Utilizzo
1. Apri WhatsApp Web
2. Scrivi un messaggio in italiano o inglese nel campo di input
3. Clicca sul pulsante 🌐 in basso a destra
4. Il testo verrà tradotto automaticamente nel campo

## 🛠️ Troubleshooting

### Il pulsante non appare?
1. Verifica che l'estensione sia attiva in `chrome://extensions/`
2. Ricarica WhatsApp Web (F5)
3. Controlla la console (F12) per errori
4. Cerca messaggi che iniziano con `[WhatsApp Translator]`

### Test manuale:
- Copia il contenuto di `debug_simple.js`
- Incollalo nella console di WhatsApp Web
- Dovrebbe apparire un pulsante rosso di test

## 🔧 File di Debug
- **`debug_simple.js`**: Script di test rapido per la console
- **`debug.js`**: Script completo per debugging avanzato
- **`test.html`**: Pagina di test offline

## 📝 Note tecniche
- Rilevamento automatico della lingua basato su parole comuni
- Gestione robusta degli errori con notifiche utente
- Selettori CSS multipli per garantire compatibilità
- Osservazione DOM per mantenere il pulsante sempre disponibile
- Posizionamento floating per evitare conflitti con l'UI di WhatsApp
