// ==UserScript==
// @name         Disable Molina/Sunshine
// @namespace    http://tampermonkey.net/
// @version      6.1
// @description  Disables form controls for Sunshine/Molina patients;
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @grant        none
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Disable%20Molina%20Patients.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Disable%20Molina%20Patients.user.js
// ==/UserScript==

(function () {
    'use strict';

    function disableRelevantBlocks() {
        const existingLabel = document.querySelector(
            'label.kt-checkbox.kt-checkbox--brand.ng-binding.ng-scope[ng-if="!isMissed.value"]'
        );

        const blocks = document.querySelectorAll('div.d-flex > label.kt-radio.kt-radio--bold');
        blocks.forEach(label => {
            const parentDiv = label.closest('div.d-flex');
            if (parentDiv && !parentDiv.classList.contains('consent-required')) {
                parentDiv.classList.add('consent-required');

                const inputs = parentDiv.querySelectorAll('input, button, select, textarea');
                inputs.forEach(input => {
                    input.disabled = true;
                    input.style.pointerEvents = 'none';
                    input.style.opacity = '0.5';
                });
                console.log(`[BLOCKED] Disabled input section due to Molina/Sunshine match`);
            }
        });

        if (existingLabel) {
            addConsentCheckbox(existingLabel);
        }
    }

    function addConsentCheckbox(existingLabel) {
        if (!document.querySelector('.single-consent-checkbox-container')) {
            const container = document.createElement('div');
            container.className = 'single-consent-checkbox-container';
            container.style.textAlign = 'center';
            container.style.marginTop = '10px';

            const label = document.createElement('label');
            label.className = 'kt-checkbox kt-checkbox--brand';
            label.style.color = 'red';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' Adjust Sunshine/Molina patient'));
            label.appendChild(document.createElement('span'));

            container.appendChild(label);
            existingLabel.insertAdjacentElement('afterend', container);

            checkbox.addEventListener('change', function () {
                const blocks = document.querySelectorAll('.consent-required');
                blocks.forEach(block => {
                    const inputs = block.querySelectorAll('input, button, select, textarea');

                    inputs.forEach(input => {
                        input.disabled = !checkbox.checked;
                        input.style.pointerEvents = checkbox.checked ? 'auto' : 'none';
                        input.style.opacity = checkbox.checked ? '1' : '0.5';
                    });
                });
            });

            console.log('Consent checkbox added (red).');
        }
    }

    const handleResponse = async (url, responseClone) => {
        if (!url.includes("GetForEdit")) return;

        try {
            const json = await responseClone.json();
            const name = json?.result?.visit?.insuranceCompanyName?.toUpperCase();
            if (!name) return;

            if (name.includes("MOLINA") || name.includes("SUNSHINE")) {
                console.log(`[MATCH] Triggering disable for: ${name}`);
                disableRelevantBlocks();
            }
        } catch (err) {
            console.error("Error parsing GetForEdit JSON:", err);
        }
    };

    // Intercept fetch
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        return originalFetch.apply(this, args).then(response => {
            if (response.url.includes("GetForEdit")) {
                handleResponse(response.url, response.clone());
            }
            return response;
        });
    };

    // Intercept XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._url = url;
        return originalOpen.call(this, method, url, ...rest);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener("load", function () {
            if (this._url && this._url.includes("GetForEdit")) {
                try {
                    const json = JSON.parse(this.responseText);
                    const name = json?.result?.visit?.insuranceCompanyName?.toUpperCase();
                    if (!name) return;

                    if (name.includes("MOLINA") || name.includes("SUNSHINE")) {
                        console.log(`[MATCH] Triggering disable for: ${name}`);
                        disableRelevantBlocks();
                    }
                } catch (err) {
                    console.error("Error parsing GetForEdit XHR:", err);
                }
            }
        });
        return originalSend.apply(this, args);
    };
})();
