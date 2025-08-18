// ==UserScript==
// @name         Show Notes Checkbox (Conditional)
// @namespace    http://tampermonkey.net/
// @version      5.5
// @description  Click Show Notes only if present and blockUI is gone
// @author       You
// @match        https://*.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Show%20Notes%20Checkbox.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Show%20Notes%20Checkbox.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function clickShowNotesIfReady() {
        const blockUIExists = document.querySelector('.blockUI') !== null;
        const showNotesLabel = Array.from(document.querySelectorAll('.d-flex label.kt-checkbox--brand'))
            .find(label => label.textContent.includes('Show Notes'));

        if (!blockUIExists && showNotesLabel) {
            const checkbox = showNotesLabel.querySelector('input[type="checkbox"]');
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('click'));
                console.log('Show Notes checkbox clicked');
            }
        }
    }

    // Poll every 500ms for readiness
    setInterval(clickShowNotesIfReady, 500);
})();
