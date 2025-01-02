// ==UserScript==
// @name         Sticky Patient Info and Actions
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Make the patient info and actions sections sticky on scroll.
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Sticky%20Patient%20Info%20&%20Action.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Sticky%20Patient%20Info%20&%20Action.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function makeSectionsSticky() {
        var patientInfoSection = document.querySelector('.row.kt-margin-b-10:nth-child(1)');
        var actionSection = document.querySelector('.row.kt-margin-b-0.w-100');

        if (patientInfoSection) {
            patientInfoSection.style.position = 'sticky';
            patientInfoSection.style.top = '0';
            patientInfoSection.style.zIndex = '1000';
            patientInfoSection.style.backgroundColor = 'white';
            patientInfoSection.style.padding = '10px';
        }

        if (actionSection) {
            actionSection.style.position = 'sticky';
            actionSection.style.top = `${patientInfoSection.offsetHeight}px`;
            actionSection.style.zIndex = '1000';
            actionSection.style.backgroundColor = 'white';
            actionSection.style.padding = '10px';
            actionSection.style.display = 'flex';
            actionSection.style.justifyContent = 'space-between';
            actionSection.style.alignItems = 'center';
        }

        var dropdownContainer = document.querySelector('.d-flex.justify-content-end.align-content-center .dropdown.dropdown-inline.ng-scope');
        if (dropdownContainer && actionSection) {
            dropdownContainer.style.marginLeft = 'auto';
            dropdownContainer.style.marginRight = '20px';
            actionSection.appendChild(dropdownContainer);
        }
    }

    function modifyCSSRule() {
        // Get all stylesheets loaded on the page
        const styleSheets = document.styleSheets;

        for (let sheet of styleSheets) {
            try {
                if (sheet.href && sheet.href.includes("vendor/css?v=")) {
                    const rules = sheet.cssRules || sheet.rules;

                    for (let rule of rules) {
                        if (rule.selectorText === '.w-100') {
                            rule.style.setProperty('width', '101.346%', 'important');
                            console.log('.w-100 rule modified to width: 101.346% !important;');
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error("Error accessing stylesheet: ", e);
            }
        }
    }

    window.addEventListener('load', function() {
        makeSectionsSticky();
        modifyCSSRule();
    });

    const observer = new MutationObserver(() => {
        makeSectionsSticky();
        modifyCSSRule();
    });

    const observerConfig = { childList: true, subtree: true };
    observer.observe(document.body, observerConfig);
})();
