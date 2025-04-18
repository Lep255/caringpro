// ==UserScript==
// @name         Disable Molina/Sunshine/LH
// @namespace    http://tampermonkey.net/
// @version      6.7
// @description  Disables form controls for Sunshine/Molina patients and shows insurance line under status block for all patients;
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
            }
        });

        waitForLabelAndAddCheckbox();

    }

    function waitForElementsToExistAndRun(retries = 15) {
    const targetLabel = document.querySelector(
        'label.kt-checkbox.kt-checkbox--brand.ng-binding.ng-scope[ng-if="!isMissed.value"]'
    );
    const targetBlocks = document.querySelectorAll('div.d-flex > label.kt-radio.kt-radio--bold');

        if (targetLabel && targetBlocks.length > 0) {
            disableRelevantBlocks();
            addConsentCheckbox(targetLabel);
        } else if (retries > 0) {
            setTimeout(() => waitForElementsToExistAndRun(retries - 1), 300);
        }
    }


    function waitForLabelAndAddCheckbox(retries = 10) {
    const existingLabel = document.querySelector(
        'label.kt-checkbox.kt-checkbox--brand.ng-binding.ng-scope[ng-if="!isMissed.value"]'
    );
        if (existingLabel) {
            addConsentCheckbox(existingLabel);
        } else if (retries > 0) {
            setTimeout(() => waitForLabelAndAddCheckbox(retries - 1), 300);
        }
    }

    function insertInsuranceLine(name) {
        const statusDiv = document.querySelector('div[ng-if="vm.ownStatus"]');
        if (!statusDiv) return;

        const existingInsuranceDiv = document.querySelector('.insurance-note');
        if (existingInsuranceDiv) return;

        const insuranceDiv = document.createElement('div');
        insuranceDiv.className = 'insurance-note';
        insuranceDiv.style.marginTop = '4px';
        insuranceDiv.style.fontWeight = 'bold';
        insuranceDiv.textContent = `Insurance: ${name}`;

        statusDiv.insertAdjacentElement('afterend', insuranceDiv);
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
            label.appendChild(document.createTextNode(' Adjust Sunshine/Molina/L.H. patient'));
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
        }
    }

    const handleResponse = async (url, responseClone) => {
        if (!url.includes("GetForEdit")) return;

        try {
            const json = await responseClone.json();
            const name = json?.result?.visit?.insuranceCompanyName?.toUpperCase();
            if (!name) return;

            insertInsuranceLine(name);

            if (name.includes("MOLINA") || name.includes("SUNSHINE") || name.includes("LITTLE")) {
                waitForElementsToExistAndRun();
            }
        } catch (_) {}
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

                    insertInsuranceLine(name);

                    if (name.includes("MOLINA") || name.includes("SUNSHINE") || name.includes("LITTLE")) {
                        waitForElementsToExistAndRun();
                    }
                } catch (_) {}
            }
        });
        return originalSend.apply(this, args);
    };
})();
