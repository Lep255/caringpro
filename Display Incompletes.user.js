// ==UserScript==
// @name         Display "Incomplete"
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Change display:none to display:block and highlight text in red if "Incomplete" is present
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    
// @downloadURL  
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function showHiddenElements() {
        // Find all elements with style="display:none;"
        var hiddenElements = document.querySelectorAll('[style*="display:none;"]');
        hiddenElements.forEach(function(el) {
            // Change display:none to display:block
            el.style.display = 'block';

            // Check if the element contains the word "Incomplete" in a related context
            var parentElement = el.closest('span'); // Adjust if necessary to find the right parent element
            if (parentElement && parentElement.innerHTML.includes('Incomplete')) {
                // If "Incomplete" is found, change the text color to red
                el.style.color = 'red';
            }
        });
    }

    // Set interval to periodically check for hidden elements and update display and text color conditionally
    setInterval(showHiddenElements, 1000);

    // Observer to react to DOM changes and update display and text color conditionally
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