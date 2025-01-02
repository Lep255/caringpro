// ==UserScript==
// @name         Manual Wrench
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Enhance visibility of manual visits
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Manual%20Wrench.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Manual%20Wrench.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function manualWrench() {
        const elements = document.querySelectorAll('i.la.la-wrench[style="color:#99cc99"]');
        elements.forEach(element => {
            element.style.color = 'black';
            element.style.fontWeight = 'bold';
        });
    }

    function runColorChangeObserver() {
        manualWrench();
        const observer = new MutationObserver(manualWrench);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    runColorChangeObserver();
})();
