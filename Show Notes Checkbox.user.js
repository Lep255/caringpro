// ==UserScript==
// @name         Show Notes Checkbox
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically check the show notes checkbox on aide schedules
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    
// @downloadURL  
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function checkShowNotesCheckbox() {
        var labels = document.querySelectorAll('.d-flex label.kt-checkbox--brand');
        labels.forEach(function(label) {
            if (label.textContent.includes('Show Notes')) {
                var checkbox = label.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.checked) {
                    checkbox.checked = true;
                    checkbox.dispatchEvent(new Event('click'));
                }
            }
        });
    }

    function periodicallyCheckElement() {
        setInterval(checkShowNotesCheckbox, 1000);
    }

    periodicallyCheckElement();
})();
