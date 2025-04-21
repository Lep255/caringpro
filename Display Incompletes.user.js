// ==UserScript==
// @name         Display "Incomplete"
// @namespace    http://tampermonkey.net/
// @version      5.4
// @description  Change display:none to display:block and highlight text in red if "Incomplete" is present
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Display%20Incompletes.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Display%20Incompletes.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function showHiddenElements() {
        // Find all elements with style="display:none;"
        var hiddenElements = document.querySelectorAll('[style*="display:none;"]');
        hiddenElements.forEach(function(el) {
            el.style.display = 'block';

            // Check if the element contains the word "Incomplete"
            var parentElement = el.closest('span');
            if (parentElement && parentElement.innerHTML.includes('Incomplete')) {
                el.style.color = 'red';
            }
        });
    }

    // Periodically check for hidden elements
    setInterval(showHiddenElements, 1000);

    // Observer to react to DOM changes
    var observerConfig = { childList: true, subtree: true };
    var observer = new MutationObserver(function(mutationsList) {
        for (var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                showHiddenElements();
            }
        }
    });

    observer.observe(document.body, observerConfig);

})();
