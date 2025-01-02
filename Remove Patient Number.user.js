// ==UserScript==
// @name         Remove Patient Phone Number
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Remove phone number from patient names in the header dynamically within modal header conditionally displayed after delay
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Remove%20Patient%20Number.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Remove%20Patient%20Number.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function removePhoneNumberSpan() {
        var phoneSpan = document.querySelector('span.ng-binding.ng-scope[ng-if="!vm.readOnlyUser && vm.customer.phone!=null && vm.customer.phone!=\'\'"]');
        if (phoneSpan) {
            phoneSpan.remove();
        }
    }

    // Check every 1 second to ensure the phone number span is removed
    setInterval(removePhoneNumberSpan, 1000);

    // Additional mutation observer for header changes
    var observerConfig = { childList: true, subtree: true };
    var observer = new MutationObserver(function(mutationsList) {
        for (var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                removePhoneNumberSpan();
            }
        }
    });

    observer.observe(document.body, observerConfig);
    window.addEventListener('hashchange', function() {
        removePhoneNumberSpan();
    });
})();
