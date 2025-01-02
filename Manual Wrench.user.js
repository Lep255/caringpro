// ==UserScript==
// @name         Manual Wrench
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Enhance visibility of manual visits
// @author       You
// @match        https://caringpro.inmyteam.com/*
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
