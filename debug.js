// Script di debug per WhatsApp Translator
// Incolla questo nella console di Chrome su WhatsApp Web per testare l'estensione

console.log('=== WhatsApp Translator Debug ===');

// 1. Verifica che il pulsante sia presente
const button = document.querySelector('#translate-btn');
console.log('Pulsante traduzione trovato:', button ? 'SÌ' : 'NO');

if (button) {
    console.log('Posizione pulsante:', button.style.position);
    console.log('Dimensioni pulsante:', button.style.width, 'x', button.style.height);
}

// 2. Verifica che l'input sia rilevato
const inputs = document.querySelectorAll('[contenteditable="true"]');
console.log('Input contenteditable trovati:', inputs.length);

inputs.forEach((input, index) => {
    console.log(`Input ${index + 1}:`, {
        elemento: input.tagName,
        classes: input.className,
        id: input.id,
        inFooter: input.closest('footer') ? 'SÌ' : 'NO',
        visibile: input.offsetHeight > 0 && input.offsetWidth > 0 ? 'SÌ' : 'NO',
        testo: input.textContent
    });
});

// 3. Test della API di traduzione
async function testTranslationAPI() {
    console.log('=== Test API di Traduzione ===');
    
    try {
        const response = await fetch('https://api.mymemory.translated.net/get?q=ciao&langpair=it|en');
        const data = await response.json();
        
        console.log('Status API:', response.status);
        console.log('Risposta API:', data);
        console.log('Traduzione ricevuta:', data.responseData?.translatedText);
        
        return data.responseData?.translatedText;
    } catch (error) {
        console.error('Errore API:', error);
        return null;
    }
}

// 4. Test della funzione di rilevamento lingua
function testLanguageDetection(text = 'Ciao come stai') {
    console.log('=== Test Rilevamento Lingua ===');
    
    const italianWords = ['che', 'con', 'per', 'una', 'del', 'della', 'di', 'da', 'in', 'un', 'il', 'la', 'le', 'gli', 'sono', 'è', 'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'questo', 'questa', 'quello', 'quella', 'dove', 'quando', 'come', 'perché', 'però', 'anche', 'già', 'più', 'molto', 'tutto', 'tutti', 'tutte'];
    const englishWords = ['the', 'of', 'and', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there'];
    
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    let italianScore = 0;
    let englishScore = 0;
    
    words.forEach(word => {
        if (italianWords.includes(word)) italianScore++;
        if (englishWords.includes(word)) englishScore++;
    });
    
    console.log('Testo:', text);
    console.log('Parole trovate:', words);
    console.log('Punteggio italiano:', italianScore);
    console.log('Punteggio inglese:', englishScore);
    console.log('Lingua rilevata:', italianScore > englishScore ? 'Italiano' : 'Inglese');
    
    return italianScore > englishScore ? 'it' : 'en';
}

// Esegui i test
console.log('Eseguendo test API...');
testTranslationAPI().then(result => {
    console.log('Risultato test API:', result);
});

console.log('Eseguendo test rilevamento lingua...');
testLanguageDetection();
testLanguageDetection('Hello how are you');

console.log('=== Debug completato ===');
console.log('Se vedi errori, controlla la console per maggiori dettagli.');
