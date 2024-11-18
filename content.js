(() => {
    const DEBUG = true;

    function log(message) {
        if (DEBUG) console.log(`[WhatsApp Translator] ${message}`);
    }

    function findInputElements() {
        // Aggiorna il selettore per trovare l'input corretto
        const editableDiv = document.querySelector('#main > footer > div.x1n2onr6.xhtitgo.x9f619.x78zum5.x1q0g3np.xuk3077.x193iq5w.x122xwht.x1bmpntp.xs9asl8.x1swvt13.x1pi30zi.xnpuxes.copyable-area > div > span > div > div._ak1r > div.x9f619.x12lumcd.x1qrby5j.xeuugli.xisnujt.x6prxxf.x1fcty0u.x1fc57z9.xe7vic5.x1716072.xgde2yp.x89wmna.xbjl0o0.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x178xt8z.xm81vs4.xso031l.xy80clv.x1lq5wgf.xgqcy7u.x30kzoy.x9jhf4c.x1a2a7pz.x13w7htt.x78zum5.x96k8nx.xdvlbce.x1ye3gou.xn6708d.x1ok221b.xu06os2.x1i64zmx.x1emribx > div > div');
        if (!editableDiv) return null;

        return { editableDiv };
    }

    function selectAllText(editableDiv) {
        editableDiv.focus();  // Focus on the input field to ensure selection works

        try {
            // Attempt to select text using document.execCommand
            const successful = document.execCommand('selectAll');
            if (successful) {
                log('Text successfully selected using execCommand.');
                return;
            }
        } catch (e) {
            log('execCommand failed, trying other selection methods.');
        }

        // If execCommand fails, try a manual selection approach
        const range = document.createRange();        // Create a new range
        range.selectNodeContents(editableDiv);       // Set the range to cover all contents of the div
        const selection = window.getSelection();     // Get the selection object
        selection.removeAllRanges();                 // Remove any existing selections
        selection.addRange(range);                   // Add the new selection range
        log('Text selected using Selection API.');
    }

    function simulateCtrlA(editableDiv) {
        // Simulate a Ctrl+A key press to select all text
        const event = new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            key: 'a',
            code: 'KeyA',
            ctrlKey: true,
        });
        editableDiv.dispatchEvent(event);
        log('Simulated Ctrl+A key press.');
    }

    function ensureTextIsSelected(editableDiv) {
        // Try both methods to ensure the text is selected
        selectAllText(editableDiv);
        simulateCtrlA(editableDiv);
    }

    function showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);
            padding: 10px 20px;
            border-radius: 8px;
            background-color: ${isError ? '#ff4444' : '#00a884'};
            color: white;
            font-size: 14px;
            z-index: 9999;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    async function translateText(text) {
        log(`Translating: ${text}`);
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=it|en`
            );
            const data = await response.json();
            log('Translation response:', data);

            if (data.responseData?.translatedText) {
                return data.responseData.translatedText;
            }
            throw new Error('No translation received');
        } catch (error) {
            log(`Translation error: ${error.message}`);
            showNotification('Translation failed!', true);
            return null;
        }
    }

    function replaceText(editableDiv, newText) {
        editableDiv.innerHTML = `<span class="selectable-text copyable-text" data-lexical-text="true">${newText}</span>`;

        const inputEvent = new InputEvent('input', {
            bubbles: true,
            cancelable: true,
            composed: true,
            data: newText
        });
        editableDiv.dispatchEvent(inputEvent);

        log(`Text replaced with: ${newText}`);
    }

    function addTranslateButton() {
        if (document.querySelector('#translate-btn')) return;

        const footer = document.querySelector('footer');
        if (!footer) {
            log('Footer not found');
            return;
        }

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            align-items: center;
            margin-right: 8px;
        `;

        const button = document.createElement('button');
        button.id = 'translate-btn';
        button.innerHTML = '🌐';
        button.title = 'Translate to English';
        button.style.cssText = `
            width: 40px;
            height: 40px;
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
            padding: 0;
            margin: 5px;
        `;

        button.onmouseover = () => button.style.backgroundColor = '#008f6f';
        button.onmouseout = () => button.style.backgroundColor = '#00a884';

        button.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const elements = findInputElements();
            if (!elements) {
                showNotification('Input field not found!', true);
                return;
            }

            const { editableDiv } = elements;

            // Ensure all text is selected before translating
            ensureTextIsSelected(editableDiv);

            const text = editableDiv.textContent?.trim();
            if (!text) {
                showNotification('Please enter some text!', true);
                return;
            }

            log(`Text to translate: "${text}"`);
            button.innerHTML = '⌛';
            button.style.cursor = 'wait';

            // Wait for the selection to be properly applied before translating
            setTimeout(async () => {
                const translatedText = await translateText(text);
                if (translatedText) {
                    replaceText(editableDiv, translatedText);
                    showNotification('Translation complete!');
                    ensureTextIsSelected(editableDiv); // Re-select translated text for clarity
                }

                button.innerHTML = '🌐';
                button.style.cursor = 'pointer';
            }, 500);
        };

        buttonContainer.appendChild(button);

        const buttonsContainer = footer.querySelector('[data-tab="11"]');
        if (buttonsContainer) {
            buttonsContainer.insertBefore(buttonContainer, buttonsContainer.firstChild);
            log('Button added to footer');
        }
    }

    function checkAndAddButton() {
        if (!document.querySelector('#translate-btn')) {
            addTranslateButton();
        }
    }

    setInterval(checkAndAddButton, 1000);

    const observer = new MutationObserver(checkAndAddButton);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    log('Extension starting...');
    setTimeout(checkAndAddButton, 1000);
})();
