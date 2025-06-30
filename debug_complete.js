// Script di debug completo per WhatsApp Translator
// Testa sia la lettura che la scrittura del testo

console.log('🔧 === WHATSAPP TRANSLATOR COMPLETE DEBUG ===');

// Funzione per trovare l'input di WhatsApp
function findWhatsAppInput() {
    console.log('🔍 Searching for WhatsApp input field...');
    
    const selectors = [
        'div[contenteditable="true"][data-tab="10"]',
        'div[contenteditable="true"][role="textbox"]', 
        'div[contenteditable="true"]',
        '[data-tab="10"]',
        '.copyable-text[contenteditable="true"]',
        'footer div[contenteditable="true"]'
    ];
    
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`📋 Selector "${selector}": found ${elements.length} elements`);
        
        for (const element of elements) {
            if (element.offsetHeight > 0 && element.offsetWidth > 0) {
                if (element.closest('footer') || 
                    element.getAttribute('role') === 'textbox' ||
                    element.getAttribute('data-tab') === '10') {
                    console.log('✅ Found WhatsApp input:', element);
                    return element;
                }
            }
        }
    }
    
    console.log('❌ WhatsApp input not found');
    return null;
}

// Test di lettura del testo
function testTextReading() {
    console.log('📖 === TESTING TEXT READING ===');
    
    const input = findWhatsAppInput();
    if (!input) {
        console.log('❌ Cannot test - input not found');
        return null;
    }
    
    const methods = [
        'textContent',
        'innerText', 
        'innerHTML'
    ];
    
    let currentText = '';
    
    methods.forEach(method => {
        const value = input[method];
        console.log(`📝 ${method}: "${value}"`);
        if (value && value.trim() && !currentText) {
            currentText = value.trim();
        }
    });
    
    console.log(`📋 Final text: "${currentText}"`);
    return { input, currentText };
}

// Test di scrittura del testo
function testTextWriting(input, testText) {
    console.log('✏️ === TESTING TEXT WRITING ===');
    console.log(`✏️ Writing: "${testText}"`);
    
    const originalText = input.textContent || '';
    console.log(`📝 Original text: "${originalText}"`);
    
    try {
        // Metodo 1: execCommand
        console.log('🔄 Trying execCommand method...');
        input.focus();
        
        const range = document.createRange();
        range.selectNodeContents(input);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        
        const success = document.execCommand('insertText', false, testText);
        console.log(`✅ execCommand result: ${success}`);
        
        setTimeout(() => {
            const newText = input.textContent || '';
            console.log(`📝 Text after execCommand: "${newText}"`);
            
            if (newText.includes(testText)) {
                console.log('✅ execCommand method worked!');
            } else {
                console.log('❌ execCommand method failed, trying DOM manipulation...');
                
                // Metodo 2: DOM manipulation
                input.focus();
                
                // Pulisce il contenuto
                while (input.firstChild) {
                    input.removeChild(input.firstChild);
                }
                
                // Aggiunge il nuovo testo
                const textNode = document.createTextNode(testText);
                input.appendChild(textNode);
                
                // Posiziona il cursore
                const range2 = document.createRange();
                range2.setStartAfter(textNode);
                range2.collapse(true);
                const selection2 = window.getSelection();
                selection2.removeAllRanges();
                selection2.addRange(range2);
                
                console.log('🔄 Applied DOM manipulation method');
                
                setTimeout(() => {
                    const finalText = input.textContent || '';
                    console.log(`📝 Final text: "${finalText}"`);
                    
                    if (finalText.includes(testText)) {
                        console.log('✅ DOM manipulation method worked!');
                    } else {
                        console.log('❌ DOM manipulation method failed');
                    }
                    
                    // Triggera gli eventi
                    const events = ['input', 'keydown', 'keyup', 'change'];
                    events.forEach(eventType => {
                        const event = new Event(eventType, { bubbles: true });
                        input.dispatchEvent(event);
                        console.log(`📡 Dispatched ${eventType} event`);
                    });
                    
                }, 100);
            }
        }, 100);
        
    } catch (error) {
        console.log(`❌ Error in text writing: ${error.message}`);
    }
}

// Test completo
function runCompleteTest() {
    console.log('🚀 === RUNNING COMPLETE TEST ===');
    
    const readResult = testTextReading();
    
    if (readResult && readResult.input) {
        const testText = readResult.currentText ? 
            `[TRANSLATED] ${readResult.currentText}` : 
            'Test translation: Ciao → Hello';
        
        testTextWriting(readResult.input, testText);
        
        console.log('✅ Test completed! Check the results above.');
        console.log('📝 You should see the test text in the WhatsApp input field.');
    } else {
        console.log('❌ Cannot run writing test - no input found');
    }
}

// Esegui il test automaticamente
runCompleteTest();

// Funzioni di utilità per test manuali
window.testWhatsAppTranslator = {
    findInput: findWhatsAppInput,
    testReading: testTextReading,
    testWriting: testTextWriting,
    runComplete: runCompleteTest
};

console.log('🔧 === DEBUG COMPLETE ===');
console.log('💡 You can also run manual tests:');
console.log('   - testWhatsAppTranslator.findInput()');
console.log('   - testWhatsAppTranslator.testReading()');
console.log('   - testWhatsAppTranslator.runComplete()');
