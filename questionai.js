/**
 * Inject CSS into shadow root of <plasmo-csui id="qaiSidebarShadowHostEl" /> or <plasmo-csui id="qaiUnderlineWordShadowHostEl" />
 * - Waits for the host element to appear (optional)
 * - Uses an open shadowRoot if present, or attaches one if none exists
 * - If there's a closed shadow root, injection isn't possible and it logs a warning
 * - Replaces previous injected style by id if present
 *
 * Usage: call injectCssIntoPlasmoHost(yourCssString)
 */

const HOST_IDS = ['qaiSidebarShadowHostEl', 'qaiUnderlineWordShadowHostEl', 'qaiSidebarShadowHostEl'];
const STYLE_ID = 'my-custom-shadow-style'; // ID used for updating/removing style

function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const el = document.querySelector(selector);
        if (el) return resolve(el);

        const observer = new MutationObserver((mutations) => {
            const found = document.querySelector(selector);
            if (found) {
                observer.disconnect();
                resolve(found);
            }
        });
        observer.observe(document.documentElement || document.body, {
            childList: true,
            subtree: true,
        });

        if (timeout > 0) {
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timed out waiting for ${selector}`));
            }, timeout);
        }
    });
}

async function injectCssIntoPlasmoHost(cssText, { wait = true, waitTimeout = 5000 } = {}) {
    const results = [];

    for (const hostId of HOST_IDS) {
        const selector = `plasmo-csui#${hostId}`;
        let hostEl;

        try {
            hostEl = wait ? await waitForElement(selector, waitTimeout) : document.querySelector(selector);
        } catch (err) {
            console.warn(`Host element not found for ${hostId}:`, err);
            results.push({ hostId, ok: false, reason: 'host-not-found' });
            continue;
        }

        if (!hostEl) {
            console.warn(`Host element not found (no-wait) for ${hostId}.`);
            results.push({ hostId, ok: false, reason: 'host-not-found' });
            continue;
        }

        // If shadowRoot exists:
        if (hostEl.shadowRoot) {
            const sr = hostEl.shadowRoot;

            // Check for existing style and replace
            let style = sr.getElementById(STYLE_ID);
            if (!style) {
                style = document.createElement('style');
                style.id = STYLE_ID;
                sr.appendChild(style);
            }
            style.textContent = cssText;
            results.push({ hostId, ok: true, used: 'existing-open-shadowRoot' });
            continue;
        }

        // No shadowRoot currently. Try to create an open one if allowed.
        if (typeof hostEl.attachShadow === 'function') {
            try {
                const sr = hostEl.attachShadow({ mode: 'open' });
                const style = document.createElement('style');
                style.id = STYLE_ID;
                style.textContent = cssText;
                sr.appendChild(style);
                results.push({ hostId, ok: true, used: 'attached-new-open-shadowRoot' });
                continue;
            } catch (err) {
                console.warn(`Failed to attach shadow root for ${hostId}:`, err);
                results.push({ hostId, ok: false, reason: 'attach-failed' });
                continue;
            }
        }

        console.warn(`Host ${hostId} has no accessible shadowRoot and attachShadow is not available (or root is closed). Injection not possible.`);
        results.push({ hostId, ok: false, reason: 'closed-or-no-attach' });
    }

    return results;
}

// Example CSS — replace with your rules:
const CUSTOM_CSS = `
/* Example rules scoped inside the shadow root */
.screenshot-popup {
        box-shadow: none !important;
        border: none !important;
        background: transparent !important;
}
.box-area-drawer__overlay .box-area-draw__resizable-block {
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
    outline: none !important;
}
.screenshot-chat-frame-container .chat-frame-content-container {
background: transparent !important;
}
.screenshot-popup.posAnimation {
        box-shadow: none !important;
        border: none !important;
}
.screenshot-popup .header-btns .ding-btn,
.screenshot-popup .popup-title,
.message-toolbar.isLastScreenshotChatReply {
        display: none !important;
}

.common-question {
        display: none !important;
}
.answer .title {
        display: none !important;
}
.chat-mathpix .base-mathpix-content #preview #setText>div:not(:last-child) {
        display: none !important;
}

.chat-mathpix .base-mathpix-content #preview #setText> div:last-child {
        display: block !important;
}

.chat-mathpix .base-mathpix-content #preview #setText> div:last-child strong:first-child {
        display: none !important;
}
.ocr-ai-message-container .answer .answer-content.hasAnswerTitle:after {
        display: none !important;
}
.snapshot__toast {
        display: none !important;
}
.mouse-tips {
        display: none !important;
}
.mathpix-content-body ul {
display: none !important;
}

.new-underline-wordChat-style,
.new-underline-word {
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
}

.new-underline-word .underline-item:nth-child(3),
.new-underline-word .underline-item:nth-child(4),
.new-underline-word .underline-item:nth-child(5) {
    display: none !important;
}

.new-underline-wordChat-style .underline-wordChat-header,
.new-underline-wordChat-style .answer .underline-pop-bottom,
.new-underline-word .underline-item .underline-item-icon,
.new-underline-word .underline-more,
.new-underline-word .underline-logo {
    display: none !important;
}

.new-underline-wordChat-style .answer .answer-result {
    background: transparent !important;
}

.new-underline-wordChat-style .main {
    padding: 0 !important;
    font-family: sans-serif !important;
}

.questions-ai-icon-btn {
    display: none !important;
}

.questions-ai-icon-btn-wrap__screenshot {
    box-shadow: none !important;
    border: none !important;
    background: transparent !important;
    opacity: 0.5 !important;
    top: 0 !important;
}
.questions-ai-icon-btn-wrap {
    top: auto !important;
    bottom: 0 !important;
}
.questions-ai-icon-btn-wrap__screenshot:hover:after {
    display: none !important;
}
.questions-ai-icon-btn-wrap__screenshot .screenshot-icon {
    width: 12px !important;
    height: 12px !important;
}
`;

// Run it:
injectCssIntoPlasmoHost(CUSTOM_CSS, { wait: true, waitTimeout: 8000 })
    .then(results => console.log('injectCssIntoPlasmoHost results:', results))
    .catch(err => console.error(err));

// Optional: function to remove your injected style later
// function removeInjectedStyle() {
//     let removed = 0;
//     for (const hostId of HOST_IDS) {
//         const host = document.querySelector(`plasmo-csui#${hostId}`);
//         if (!host || !host.shadowRoot) continue;
//         const s = host.shadowRoot.getElementById(STYLE_ID);
//         if (s) {
//             s.remove();
//             removed++;
//         }
//     }
//     return removed > 0;
// }

/*
::selection {
  background-color: rgba(0,0,0,0.03);
}
*/