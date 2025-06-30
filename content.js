(() => {
    const DEBUG = true;

    function log(message) {
        if (DEBUG) console.log(`[WhatsApp Translator] ${message}`);
    }

    // Log di avvio immediato per confermare che lo script si carica
    console.log("🌐 [WhatsApp Translator] Content script loaded!");
    console.log("🌐 [WhatsApp Translator] Current URL:", window.location.href);
    console.log("🌐 [WhatsApp Translator] Is WhatsApp Web:", window.location.href.includes('web.whatsapp.com'));

    function findInputElements() {
        log('Searching for input elements...');
        
        // Usa selettori più robusti e multipli per trovare l'input
        let editableDiv = null;
        
        // Prova diversi selettori comuni per l'input di WhatsApp
        const selectors = [
            // Selettori specifici per WhatsApp Web
            'div[contenteditable="true"][data-tab="10"]',
            'div[contenteditable="true"][role="textbox"]',
            'div[contenteditable="true"]',
            '[data-tab="10"]',
            '.copyable-text[contenteditable="true"]',
            // Selettori più generici
            'footer div[contenteditable="true"]',
            '[contenteditable="true"]'
        ];
        
        for (const selector of selectors) {
            try {
                const elements = document.querySelectorAll(selector);
                log(`Found ${elements.length} elements for selector: ${selector}`);
                
                for (const element of elements) {
                    // Verifica che l'elemento sia visibile e interagibile
                    if (element.offsetHeight > 0 && element.offsetWidth > 0) {
                        // Preferisci elementi che sono nel footer o che sembrano input di testo
                        if (element.closest('footer') || 
                            element.getAttribute('role') === 'textbox' ||
                            element.getAttribute('data-tab') === '10') {
                            editableDiv = element;
                            log(`Found input using selector: ${selector}`);
                            break;
                        }
                    }
                }
                if (editableDiv) break;
            } catch (e) {
                log(`Error with selector ${selector}: ${e.message}`);
            }
        }
        
        // Se non trova nulla con i selettori specifici, prova il più generico
        if (!editableDiv) {
            try {
                const allContentEditable = document.querySelectorAll('[contenteditable="true"]');
                log(`Found ${allContentEditable.length} total contenteditable elements`);
                
                for (const element of allContentEditable) {
                    if (element.offsetHeight > 0 && element.offsetWidth > 0 && 
                        element.textContent !== undefined) {
                        editableDiv = element;
                        log(`Using generic contenteditable element`);
                        break;
                    }
                }
            } catch (e) {
                log(`Error finding generic input: ${e.message}`);
            }
        }
        
        if (!editableDiv) {
            log('No input field found with any method');
            return null;
        }

        log(`Input element found: ${editableDiv.tagName}`);
        log(`Input ID: ${editableDiv.id || 'none'}`);
        log(`Input classes: ${editableDiv.className || 'none'}`);
        log(`Input text: "${editableDiv.textContent || ''}"`);
        
        return { editableDiv };
    }

    function showNotification(message, isError = false) {
        // Rimuovi notifiche esistenti
        const existingNotifications = document.querySelectorAll('.translator-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = 'translator-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            background-color: ${isError ? '#ff4444' : '#00a884'};
            color: white;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-weight: 500;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animazione di entrata
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animazione di uscita e rimozione
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        log(`Notification shown: ${message}`);
    }

    function detectLanguage(text) {
        log(`Detecting language for: "${text}"`);
        
        const italianWords = ['che', 'con', 'per', 'una', 'del', 'della', 'di', 'da', 'in', 'un', 'il', 'la', 'le', 'gli', 'sono', 'è', 'ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'questo', 'questa', 'quello', 'quella', 'dove', 'quando', 'come', 'perché', 'però', 'anche', 'già', 'più', 'molto', 'tutto', 'tutti', 'tutte', 'non', 'ma', 'se', 'poi', 'così', 'suo', 'sua', 'loro', 'fare', 'dire', 'dopo', 'prima', 'altro', 'bene', 'qui', 'ora', 'anni', 'tempo', 'vita', 'mano', 'casa', 'paese'];
        const englishWords = ['the', 'of', 'and', 'to', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'his', 'they', 'i', 'at', 'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we', 'when', 'your', 'can', 'said', 'there', 'each', 'which', 'do', 'how', 'their', 'if', 'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make', 'like', 'into', 'him', 'has', 'two', 'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call', 'who', 'its', 'now', 'find', 'long', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part'];
        
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 1);
        let italianScore = 0;
        let englishScore = 0;
        
        words.forEach(word => {
            if (italianWords.includes(word)) {
                italianScore++;
                log(`Italian word found: ${word}`);
            }
            if (englishWords.includes(word)) {
                englishScore++;
                log(`English word found: ${word}`);
            }
        });
        
        log(`Language scores - Italian: ${italianScore}, English: ${englishScore}`);
        
        if (italianScore === 0 && englishScore === 0) {
            log('No recognized words, defaulting to Italian');
            return 'it';
        }
        
        const detectedLang = italianScore > englishScore ? 'it' : 'en';
        log(`Detected language: ${detectedLang}`);
        return detectedLang;
    }

    async function translateText(text) {
        log(`🌐 Starting translation for: "${text}"`);
        
        const sourceLang = detectLanguage(text);
        const targetLang = sourceLang === 'it' ? 'en' : 'it';
        
        log(`📝 Source: ${sourceLang} → Target: ${targetLang}`);
        
        // Prova prima con MyMemory API
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
            log(`🔗 API URL: ${url}`);
            
            const response = await fetch(url);
            log(`📡 API Response Status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            log(`📦 API Response Data:`, data);

            if (data.responseStatus === 200 && data.responseData?.translatedText) {
                const translatedText = data.responseData.translatedText;
                log(`✅ Translation Success: "${text}" → "${translatedText}"`);
                
                // Verifica che la traduzione sia valida
                if (translatedText !== text && 
                    translatedText.toLowerCase() !== text.toLowerCase() &&
                    translatedText.trim() !== '' &&
                    translatedText.trim().length > 0) {
                    return translatedText;
                }
                log('⚠️ Translation is same as original or empty, trying fallback');
            } else {
                log(`❌ API Error - Status: ${data.responseStatus}, Message: ${data.responseDetails || 'Unknown'}`);
            }
        } catch (error) {
            log(`❌ MyMemory API Error: ${error.message}`);
        }
        
        // Fallback con dizionario semplificato
        log('🔄 Trying simple dictionary fallback...');
        try {
            const simpleTranslations = {
                // Italiano → Inglese
                'ciao': 'hello',
                'grazie': 'thank you',
                'prego': 'you\'re welcome',
                'come stai': 'how are you',
                'come va': 'how are you',
                'bene': 'good',
                'male': 'bad',
                'buongiorno': 'good morning',
                'buonasera': 'good evening',
                'buonanotte': 'good night',
                'per favore': 'please',
                'scusa': 'sorry',
                'mi dispiace': 'I\'m sorry',
                'sì': 'yes',
                'no': 'no',
                'forse': 'maybe',
                'aiuto': 'help',
                'casa': 'house',
                'lavoro': 'work',
                'famiglia': 'family',
                'amico': 'friend',
                'amore': 'love',
                'tempo': 'time',
                'oggi': 'today',
                'domani': 'tomorrow',
                'ieri': 'yesterday',
                
                // Inglese → Italiano
                'hello': 'ciao',
                'hi': 'ciao',
                'thank you': 'grazie',
                'thanks': 'grazie',
                'how are you': 'come stai',
                'good': 'bene',
                'bad': 'male',
                'good morning': 'buongiorno',
                'good evening': 'buonasera',
                'good night': 'buonanotte',
                'please': 'per favore',
                'sorry': 'scusa',
                'yes': 'sì',
                'no': 'no',
                'maybe': 'forse',
                'help': 'aiuto',
                'house': 'casa',
                'work': 'lavoro',
                'family': 'famiglia',
                'friend': 'amico',
                'love': 'amore',
                'time': 'tempo',
                'today': 'oggi',
                'tomorrow': 'domani',
                'yesterday': 'ieri'
            };
            
            const lowerText = text.toLowerCase().trim();
            if (simpleTranslations[lowerText]) {
                const fallbackResult = simpleTranslations[lowerText];
                log(`✅ Dictionary Translation: "${text}" → "${fallbackResult}"`);
                return fallbackResult;
            }
            
            log('⚠️ No dictionary match found');
        } catch (error) {
            log(`❌ Dictionary fallback error: ${error.message}`);
        }
        
        // Ultimo tentativo: traduzione fonetica/logica
        log('🔄 Trying smart fallback...');
        if (sourceLang === 'it') {
            // Italiano → Inglese
            const smartTranslation = text
                .replace(/ciao/gi, 'hello')
                .replace(/grazie/gi, 'thank you')
                .replace(/come stai/gi, 'how are you')
                .replace(/bene/gi, 'good')
                .replace(/buongiorno/gi, 'good morning');
            
            if (smartTranslation !== text) {
                log(`✅ Smart Translation: "${text}" → "${smartTranslation}"`);
                return smartTranslation;
            }
        } else {
            // Inglese → Italiano
            const smartTranslation = text
                .replace(/hello/gi, 'ciao')
                .replace(/hi/gi, 'ciao')
                .replace(/thank you/gi, 'grazie')
                .replace(/thanks/gi, 'grazie')
                .replace(/how are you/gi, 'come stai')
                .replace(/good morning/gi, 'buongiorno');
            
            if (smartTranslation !== text) {
                log(`✅ Smart Translation: "${text}" → "${smartTranslation}"`);
                return smartTranslation;
            }
        }
        
        log('❌ All translation methods failed');
        throw new Error(`Unable to translate "${text}". Try with common words like "ciao", "hello", "grazie", etc.`);
    }

    function replaceText(editableDiv, newText) {
        log(`Attempting to replace text with: "${newText}"`);
        
        try {
            // Salva il testo originale per debug
            const originalText = editableDiv.textContent || editableDiv.innerText || '';
            log(`Original text: "${originalText}"`);
            
            // Metodo 1: Usa execCommand con selezione completa (il più affidabile per WhatsApp)
            try {
                editableDiv.focus();
                log('🎯 Input focused for text replacement');
                
                // PRIMA: Seleziona tutto il contenuto (simula Ctrl+A)
                const range = document.createRange();
                range.selectNodeContents(editableDiv);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Verifica che tutto il testo sia selezionato
                const selectedText = selection.toString();
                log(`📋 Selected text for replacement: "${selectedText}"`);
                log(`🔄 Will replace with: "${newText}"`);
                
                // Sostituisce tutto il testo selezionato con execCommand
                if (document.execCommand) {
                    const success = document.execCommand('insertText', false, newText);
                    log(`📝 execCommand insertText result: ${success}`);
                    
                    if (success) {
                        log('✅ Text completely replaced using execCommand');
                        
                        // Posiziona il cursore alla fine
                        setTimeout(() => {
                            const range = document.createRange();
                            const sel = window.getSelection();
                            range.selectNodeContents(editableDiv);
                            range.collapse(false); // Collassa alla fine
                            sel.removeAllRanges();
                            sel.addRange(range);
                            editableDiv.focus();
                            
                            log('🎯 Cursor positioned at end');
                        }, 50);
                        
                        // Verifica che la sostituzione sia avvenuta
                        setTimeout(() => {
                            const finalText = editableDiv.textContent || editableDiv.innerText || '';
                            log(`🔍 Final text after replacement: "${finalText}"`);
                            
                            if (finalText.trim() === newText.trim()) {
                                log('✅ Text replacement confirmed successful!');
                            } else {
                                log('⚠️ Text replacement may not be complete');
                                log(`Expected: "${newText.trim()}"`);
                                log(`Found: "${finalText.trim()}"`);
                            }
                        }, 100);
                        
                        return; // Successo
                    } else {
                        log('❌ execCommand failed, trying DOM manipulation');
                    }
                } else {
                    log('❌ execCommand not available, trying DOM manipulation');
                }
            } catch (e) {
                log(`❌ Selection method failed: ${e.message}`);
            }
            
            // Metodo 2: Simula Ctrl+A + typing (alternativo)
            try {
                log('🔄 Trying Ctrl+A simulation method...');
                editableDiv.focus();
                
                // Simula Ctrl+A per selezionare tutto
                const ctrlAEvent = new KeyboardEvent('keydown', {
                    key: 'a',
                    code: 'KeyA',
                    ctrlKey: true,
                    bubbles: true,
                    cancelable: true
                });
                editableDiv.dispatchEvent(ctrlAEvent);
                
                // Aspetta un momento
                setTimeout(() => {
                    // Ora tutto dovrebbe essere selezionato, sostituisce
                    if (document.execCommand) {
                        const success = document.execCommand('insertText', false, newText);
                        log(`📝 Ctrl+A + insertText result: ${success}`);
                        
                        if (success) {
                            log('✅ Text replaced using Ctrl+A simulation');
                            return;
                        }
                    }
                    
                    // Se fallisce, prova a digitare direttamente
                    const inputEvent = new InputEvent('input', {
                        inputType: 'insertText',
                        data: newText,
                        bubbles: true,
                        cancelable: false
                    });
                    editableDiv.dispatchEvent(inputEvent);
                    
                    log('📝 Used InputEvent as fallback');
                }, 50);
                
            } catch (e) {
                log(`❌ Ctrl+A simulation failed: ${e.message}`);
            }
            try {
                editableDiv.focus();
                
                // Pulisce completamente il contenuto
                while (editableDiv.firstChild) {
                    editableDiv.removeChild(editableDiv.firstChild);
                }
                
                // Aggiunge il nuovo testo come nodo di testo
                const textNode = document.createTextNode(newText);
                editableDiv.appendChild(textNode);
                
                // Posiziona il cursore alla fine
                const range = document.createRange();
                range.setStartAfter(textNode);
                range.collapse(true);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                
                log('Text replaced using DOM manipulation');
            } catch (e) {
                log(`DOM manipulation failed: ${e.message}`);
                
                // Metodo 3: Fallback semplice
                editableDiv.textContent = newText;
                editableDiv.focus();
                log('Used fallback textContent method');
            }
            
            // Triggera tutti gli eventi necessari per WhatsApp
            const events = [
                'input',
                'keydown',
                'keyup', 
                'keypress',
                'change',
                'blur',
                'focus'
            ];
            
            events.forEach(eventType => {
                try {
                    let event;
                    if (eventType.startsWith('key')) {
                        event = new KeyboardEvent(eventType, {
                            bubbles: true,
                            cancelable: true,
                            key: ' ',
                            code: 'Space'
                        });
                    } else {
                        event = new Event(eventType, {
                            bubbles: true,
                            cancelable: true
                        });
                    }
                    editableDiv.dispatchEvent(event);
                    log(`Dispatched ${eventType} event`);
                } catch (e) {
                    log(`Failed to dispatch ${eventType} event: ${e.message}`);
                }
            });
            
            // Verifica finale e forza l'aggiornamento di WhatsApp
            setTimeout(() => {
                const finalText = editableDiv.textContent || editableDiv.innerText || '';
                log(`📋 Final text verification: "${finalText}"`);
                
                if (finalText.trim() === newText.trim()) {
                    log('✅ Text replacement successful!');
                    
                    // Forza l'aggiornamento visuale di WhatsApp
                    editableDiv.focus();
                    editableDiv.click();
                    
                    // Triggera un evento di input aggiuntivo per forzare l'aggiornamento
                    setTimeout(() => {
                        const inputEvent = new InputEvent('input', {
                            bubbles: true,
                            cancelable: false,
                            inputType: 'insertText',
                            data: ' '
                        });
                        editableDiv.dispatchEvent(inputEvent);
                        
                        // Rimuovi lo spazio extra aggiunto
                        setTimeout(() => {
                            if (editableDiv.textContent.endsWith(' ')) {
                                editableDiv.textContent = editableDiv.textContent.slice(0, -1);
                            }
                            editableDiv.focus();
                            
                            // Posiziona il cursore alla fine
                            const range = document.createRange();
                            const sel = window.getSelection();
                            if (editableDiv.childNodes.length > 0) {
                                range.setStartAfter(editableDiv.childNodes[editableDiv.childNodes.length - 1]);
                            } else {
                                range.setStart(editableDiv, 0);
                            }
                            range.collapse(true);
                            sel.removeAllRanges();
                            sel.addRange(range);
                            
                            log('🔄 Forced WhatsApp visual update');
                        }, 50);
                    }, 50);
                    
                } else {
                    log('❌ Text replacement may have failed');
                    log(`Expected: "${newText.trim()}"`);
                    log(`Found: "${finalText.trim()}"`);
                    
                    // Fallback: prova a sostituire di nuovo
                    editableDiv.textContent = newText;
                    editableDiv.focus();
                }
            }, 100);
            
        } catch (error) {
            log(`Error in replaceText: ${error.message}`);
            log(`Stack trace: ${error.stack}`);
        }
    }

    function addTranslateButton() {
        if (document.querySelector('#translate-btn')) {
            log('Translation button already exists');
            return;
        }

        log('Adding translation button...');

        // Crea il pulsante di traduzione
        const button = document.createElement('button');
        button.id = 'translate-btn';
        button.innerHTML = '🌐';
        button.title = 'Translate Italian ↔ English';
        
        button.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #00a884;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            outline: none;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        button.onmouseover = () => {
            button.style.backgroundColor = '#008f6f';
            button.style.transform = 'scale(1.1)';
        };
        button.onmouseout = () => {
            button.style.backgroundColor = '#00a884';
            button.style.transform = 'scale(1)';
        };

        button.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            log('Translation button clicked');

            const elements = findInputElements();
            if (!elements) {
                log('Input elements not found');
                showNotification('Input field not found!', true);
                return;
            }

            const { editableDiv } = elements;
            
            // Legge il testo dal campo con metodi multipli
            let text = '';
            
            // PRIMA prova a leggere tutto il contenuto del campo (non solo la selezione)
            
            // Metodo 1: textContent (il più diretto)
            if (editableDiv.textContent && editableDiv.textContent.trim()) {
                text = editableDiv.textContent.trim();
                log(`📝 Got text using textContent: "${text}"`);
            }
            
            // Metodo 2: innerText (fallback)
            if (!text && editableDiv.innerText && editableDiv.innerText.trim()) {
                text = editableDiv.innerText.trim();
                log(`📄 Got text using innerText: "${text}"`);
            }
            
            // Metodo 3: Cerca negli span figli (WhatsApp spesso usa span)
            if (!text) {
                const spans = editableDiv.querySelectorAll('span');
                const spanTexts = Array.from(spans).map(span => span.textContent || span.innerText || '').filter(t => t.trim());
                if (spanTexts.length > 0) {
                    text = spanTexts.join(' ').trim();
                    log(`🏷️ Got text from spans: "${text}"`);
                }
            }
            
            // Metodo 4: Cerca nei nodi di testo diretti
            if (!text) {
                const walker = document.createTreeWalker(
                    editableDiv,
                    NodeFilter.SHOW_TEXT,
                    null,
                    false
                );
                
                const textNodes = [];
                let node;
                while (node = walker.nextNode()) {
                    if (node.textContent && node.textContent.trim()) {
                        textNodes.push(node.textContent.trim());
                    }
                }
                
                if (textNodes.length > 0) {
                    text = textNodes.join(' ').trim();
                    log(`� Got text from text nodes: "${text}"`);
                }
            }
            
            // Metodo 5: innerHTML pulito (ultimo resort)
            if (!text && editableDiv.innerHTML) {
                text = editableDiv.innerHTML.replace(/<[^>]*>/g, '').trim();
                if (text) {
                    log(`🔧 Got text using innerHTML (stripped): "${text}"`);
                }
            }
            
            // Metodo 6: SOLO se proprio non riesci a leggere, prova la selezione (disabilitato per ora)
            /*
            if (!text) {
                try {
                    editableDiv.focus();
                    
                    // Seleziona tutto il contenuto per forzare WhatsApp a "riconoscere" il testo
                    const range = document.createRange();
                    range.selectNodeContents(editableDiv);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Prova a leggere dalla selezione
                    const selectedText = selection.toString().trim();
                    if (selectedText) {
                        text = selectedText;
                        log(`📋 Got text from forced selection: "${text}"`);
                    }
                    
                    // Rimuovi la selezione
                    selection.removeAllRanges();
                    
                } catch (e) {
                    log(`❌ Forced selection error: ${e.message}`);
                }
            }
            */
            
            // Debug: mostra il testo trovato
            log(`🎯 Final text from input field: "${text}"`);
            
            if (!text) {
                log('❌ No text to translate');
                showNotification('Please enter some text to translate!', true);
                return;
            }

            if (text.length > 500) {
                log('⚠️ Text too long, truncating...');
                text = text.substring(0, 500);
            }

            log(`🚀 Starting translation process for: "${text}"`);
            button.innerHTML = '⌛';
            button.style.cursor = 'wait';

            try {
                log('🔄 Calling translateText function...');
                const translatedText = await translateText(text);
                log(`🎉 Translation received: "${translatedText}"`);
                
                if (translatedText && 
                    translatedText.trim() !== '' && 
                    translatedText !== text &&
                    translatedText.toLowerCase() !== text.toLowerCase()) {
                    
                    log('✅ Translation is valid, applying to input field...');
                    replaceText(editableDiv, translatedText);
                    
                    // Forza il focus e l'aggiornamento visuale
                    setTimeout(() => {
                        editableDiv.focus();
                        editableDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Simula un piccolo movimento del cursore per "svegliare" WhatsApp
                        const event = new KeyboardEvent('keydown', {
                            key: 'End',
                            code: 'End',
                            bubbles: true
                        });
                        editableDiv.dispatchEvent(event);
                        
                        log('🔄 Forced UI update and focus');
                    }, 200);
                    
                    showNotification('✅ Translation complete!');
                    log('🎯 Translation process successful');
                } else {
                    log(`⚠️ Translation invalid - Original: "${text}", Translated: "${translatedText}"`);
                    showNotification('⚠️ Translation unchanged or empty!', true);
                }
            } catch (error) {
                log(`❌ Translation error: ${error.message}`);
                log(`❌ Error stack: ${error.stack}`);
                showNotification(`❌ Translation failed: ${error.message}`, true);
            } finally {
                button.innerHTML = '🌐';
                button.style.cursor = 'pointer';
                log('🏁 Translation process completed');
            }
        };

        // Aggiungi il pulsante al body
        document.body.appendChild(button);
        log('Translation button added successfully');
        
        // Aggiungi anche un pulsante di test per il debug
        if (DEBUG) {
            addTestButton();
        }
        
        // Mostra notifica di caricamento
        setTimeout(() => {
            showNotification('WhatsApp Translator loaded! 🌐');
        }, 1000);
    }

    function addTestButton() {
        if (document.querySelector('#test-btn')) {
            return;
        }

        const testButton = document.createElement('button');
        testButton.id = 'test-btn';
        testButton.innerHTML = '🔧';
        testButton.title = 'Test Text Reading & Replacement';
        
        testButton.style.cssText = `
            position: fixed;
            bottom: 160px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #ff6b6b;
            border: none;
            color: white;
            font-size: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        `;

        testButton.onclick = () => {
            log('🔧 TEST BUTTON CLICKED');
            
            const elements = findInputElements();
            if (!elements) {
                alert('❌ Input field not found!');
                return;
            }

            const { editableDiv } = elements;
            
            // Test di lettura dettagliato
            log('📖 === DETAILED TEXT READING TEST ===');
            
            const methods = [
                { name: 'textContent', value: editableDiv.textContent },
                { name: 'innerText', value: editableDiv.innerText },
                { name: 'innerHTML', value: editableDiv.innerHTML },
                { name: 'outerHTML', value: editableDiv.outerHTML?.substring(0, 200) + '...' }
            ];
            
            methods.forEach(method => {
                log(`${method.name}: "${method.value}"`);
            });
            
            // Test lettura span
            const spans = editableDiv.querySelectorAll('span');
            log(`Found ${spans.length} span elements:`);
            spans.forEach((span, i) => {
                log(`  Span ${i}: "${span.textContent || span.innerText}"`);
            });
            
            // Lettura finale
            const currentText = editableDiv.textContent || editableDiv.innerText || '';
            log(`� Final current text: "${currentText}"`);
            
            if (!currentText.trim()) {
                alert('⚠️ No text found in input field!\n\nTry typing some text first, then click this button.');
                return;
            }
            
            // Test scrittura
            const testText = `[TRANSLATED] ${currentText}`;
            log(`✏️ Writing test text: "${testText}"`);
            
            replaceText(editableDiv, testText);
            
            alert(`🔧 Test completed!\n\nRead: "${currentText}"\nWrote: "${testText}"\n\nCheck console for details.`);
        };

        document.body.appendChild(testButton);
        log('Test button added');
    }

    function checkAndAddButton() {
        if (!window.location.href.includes('web.whatsapp.com')) {
            log('Not on WhatsApp Web');
            return;
        }
        
        if (!document.querySelector('#translate-btn')) {
            log('Button not found, adding...');
            addTranslateButton();
        } else {
            log('Button already exists');
        }
    }

    function initExtension() {
        log('WhatsApp Translator Extension starting...');
        
        // Alert di debug per confermare caricamento
        if (DEBUG) {
            setTimeout(() => {
                console.log("🌐 [WhatsApp Translator] Extension initialization complete");
            }, 100);
        }
        
        // Prova subito
        setTimeout(checkAndAddButton, 1000);
        
        // Prova dopo 3 secondi
        setTimeout(checkAndAddButton, 3000);
        
        // Prova dopo 5 secondi
        setTimeout(checkAndAddButton, 5000);
        
        // Osserva i cambiamenti nel DOM
        const observer = new MutationObserver(() => {
            if (!document.querySelector('#translate-btn')) {
                setTimeout(checkAndAddButton, 200);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Controllo periodico
        setInterval(() => {
            if (!document.querySelector('#translate-btn')) {
                checkAndAddButton();
            }
        }, 10000);
    }

    // Avvia l'estensione
    initExtension();
})();
