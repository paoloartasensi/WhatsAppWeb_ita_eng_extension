// Script di debug semplice da incollare nella console di WhatsApp Web
// Per verificare se l'estensione si sta caricando

console.log("=== WHATSAPP TRANSLATOR DEBUG ===");

// 1. Verifica se l'estensione è caricata
console.log("1. Checking if extension is loaded...");
const existingButton = document.querySelector('#translate-btn');
console.log("Existing button found:", existingButton);

// 2. Verifica se lo script content.js è stato eseguito
console.log("2. Checking if content script logs are present...");
// Guarda nella console se ci sono log con [WhatsApp Translator]

// 3. Forza la creazione del pulsante
console.log("3. Manually creating button...");

function createDebugButton() {
    // Rimuovi il pulsante esistente se presente
    const existing = document.querySelector('#translate-btn');
    if (existing) {
        existing.remove();
        console.log("Removed existing button");
    }

    // Crea un nuovo pulsante
    const button = document.createElement('button');
    button.id = 'translate-btn';
    button.innerHTML = '🌐';
    button.title = 'Translate Italian ↔ English (DEBUG)';
    
    button.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #ff6b6b;
        border: 2px solid #ffffff;
        color: white;
        font-size: 20px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        outline: none;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
    `;

    button.onclick = () => {
        alert("Debug button clicked! Extension is working.");
        console.log("Debug button clicked successfully");
    };

    document.body.appendChild(button);
    console.log("Debug button created and added to page");
}

createDebugButton();

// 4. Verifica permessi e URL
console.log("4. Current page info:");
console.log("URL:", window.location.href);
console.log("Domain:", window.location.hostname);
console.log("Is WhatsApp Web:", window.location.href.includes('web.whatsapp.com'));

// 5. Test di ricerca input
console.log("5. Testing input search...");
const selectors = [
    'div[contenteditable="true"][data-tab="10"]',
    'div[contenteditable="true"][role="textbox"]',
    'div[contenteditable="true"]',
    '[data-tab="10"]',
    '.copyable-text[contenteditable="true"]',
    'footer div[contenteditable="true"]'
];

selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`Selector "${selector}": found ${elements.length} elements`);
    if (elements.length > 0) {
        console.log("First element:", elements[0]);
    }
});

console.log("=== DEBUG COMPLETE ===");
console.log("If you see a RED button in the bottom right, the manual creation worked.");
console.log("Check above logs for any issues with selectors or extension loading.");
