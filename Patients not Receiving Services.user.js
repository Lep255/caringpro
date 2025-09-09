// ==UserScript==
// @name         Patients not Receiving Services
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Collects patientId, name, & insurance
// @match        https://*.inmyteam.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let patientRecords = [];
    let intercepting = false;
    let triggeredFirst = false;
    let waitingForSearch = false;

    // Create Button
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Start Patient Scan';
    Object.assign(exportBtn.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: '9999',
        padding: '10px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    });
    document.body.appendChild(exportBtn);

    exportBtn.addEventListener('click', () => {
        if (intercepting) return;

        // Reset state
        intercepting = true;
        triggeredFirst = false;
        waitingForSearch = true;
        patientRecords = [];

        console.clear();
        console.log('[Patient Scan] Starting, clicking Search...');
        clickSearchButton();
    });

    function clickSearchButton() {
        const searchBtn = [...document.querySelectorAll('input[type="button"]')].find(
            el => el.value === 'Search' && el.getAttribute('ng-click')?.includes('vm.refresh')
        );
        if (searchBtn) {
            searchBtn.click();
        } else {
            console.warn('[Error] Search button not found.');
            alert("⚠️ Scraper: Search button not found.");
            intercepting = false;
        }
    }

    function handleReportResponse(json) {
        if (!intercepting) return;

        if (waitingForSearch) {
            waitingForSearch = false;
            triggeredFirst = true;
            console.log('[Patient Scan] Processing first page...');
        }

        const items = json?.items || json?.result?.items || (Array.isArray(json) ? json : []);
        if (!items.length) {
            console.warn("[Patient Scan] No items found in response");
            return;
        }

        for (const item of items) {
            if (item?.patientId) {
                patientRecords.push({
                    id: item.patientId,
                    name: `${item.displayFirstName || ''} ${item.displayLastName || ''}`.trim(),
                    insurance: item.insuranceCompanyName || ''
                });
                console.log('[Patient Found]', item.patientId, item.displayFirstName, item.displayLastName);
            }
        }
    }

    // Hook fetch
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        return originalFetch.apply(this, args).then(response => {
            if (intercepting && response.url.includes("PatientsNotReceivingServicesReport")) {
                response.clone().json().then(handleReportResponse).catch(() => {});
            }
            return response;
        });
    };

    // Hook XHR
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._url = url;
        return originalOpen.call(this, method, url, ...rest);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener("load", function () {
            if (intercepting && this._url && this._url.includes("PatientsNotReceivingServicesReport")) {
                try {
                    const json = JSON.parse(this.responseText);
                    handleReportResponse(json);
                } catch (_) {}
            }
        });
        return originalSend.apply(this, args);
    };

    // Watch for changes to paginate
    const observer = new MutationObserver(() => {
        if (!intercepting || !triggeredFirst) return;
        clearTimeout(triggerTimeout);
        triggerTimeout = setTimeout(processNextPage, 1000);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    let triggerTimeout = null;

    function processNextPage() {
        const nextBtn = [...document.querySelectorAll('a.page-link')].find(el =>
            el.textContent.trim().toLowerCase() === 'next' &&
            !el.parentElement.classList.contains('disabled') &&
            !el.disabled &&
            !el.hasAttribute('disabled')
        );

        if (nextBtn) {
            console.log('[Pagination] Clicking Next...');
            nextBtn.click();
        } else {
            console.log('[Pagination Finished] Exporting...');
            intercepting = false;
            triggeredFirst = false;
            exportResults();
        }
    }

    function exportResults() {
        if (!patientRecords.length) {
            alert("⚠️ No patients collected.");
            return;
        }

        let csv = "PatientID,Name,Insurance\n";
        for (const p of patientRecords) {
            csv += `"${p.id}","${p.name}","${p.insurance}"\n`;
        }

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'patients.csv';
        a.click();
        URL.revokeObjectURL(url);

        alert(`✅ Exported ${patientRecords.length} patients.`);
    }
})();
