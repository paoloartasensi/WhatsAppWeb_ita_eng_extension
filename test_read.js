// Test rapido di lettura testo - incolla nella console di WhatsApp Web

console.log('🔧 === QUICK TEXT READ TEST ===');

// Trova l'input
const input = document.querySelector('div[contenteditable="true"][data-tab="10"]');
if (!input) {
    console.log('❌ Input not found');
} else {
    console.log('✅ Input found:', input);
    
    // Testa i vari metodi di lettura SENZA toccare la selezione
    console.log('📝 textContent:', `"${input.textContent}"`);
    console.log('📄 innerText:', `"${input.innerText}"`);
    console.log('🏷️ innerHTML:', `"${input.innerHTML}"`);
    
    // Trova span interni
    const spans = input.querySelectorAll('span');
    console.log(`📋 Found ${spans.length} spans:`);
    spans.forEach((span, i) => {
        console.log(`  Span ${i+1}: "${span.textContent}"`);
    });
    
    // TreeWalker per text nodes
    const walker = document.createTreeWalker(
        input,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
        if (node.textContent && node.textContent.trim()) {
            textNodes.push(node.textContent);
        }
    }
    console.log('🌳 Text nodes:', textNodes);
    
    // Risultato finale
    const finalText = input.textContent || input.innerText || '';
    console.log('🎯 FINAL TEXT:', `"${finalText}"`);
    
    if (finalText.trim()) {
        console.log('✅ Text reading should work!');
    } else {
        console.log('❌ No text found - may need selection');
    }
}

console.log('🔧 Test complete. Write some text in the input field and run this again.');
