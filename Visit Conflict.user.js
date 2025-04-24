// ==UserScript==
// @name         Visit Conflict
// @namespace    http://tampermonkey.net/
// @version      2.6
// @description  Highlights entire event block within 3 hours.
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Visit%20Conflict.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Visit%20Conflict.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const MAX_HOUR_DIFF = 3;
    const VALID_BILLING_CODES = ['G0156', 'T1021'];
    const conflictVisitIds = new Set();

    const parseDate = str => str ? new Date(str) : null;
    const areDatesClose = (d1, d2) =>
        Math.abs(d1 - d2) <= MAX_HOUR_DIFF * 60 * 60 * 1000;

    function isValidBillingCode(visit) {
        const segments = visit.segments || [];
        return segments.some(seg => VALID_BILLING_CODES.includes(seg.billingCode));
    }

    function analyzeVisits(visits) {
    const byEntity = {}; // could be customer.id or customerName string
    visits.forEach(v => {
        const entityKey = v.customer?.id || v.customerName?.trim().toUpperCase();
        const visitId = v.visitId;
        const start = parseDate(v.actualStartDateTime);
        const end = parseDate(v.actualEndDateTime);

        if (!entityKey || !visitId || !start || !end) return;
        if (!isValidBillingCode(v)) return;

        if (!byEntity[entityKey]) byEntity[entityKey] = [];
        byEntity[entityKey].push({ visitId, start, end });
    });

    for (const entityKey in byEntity) {
        const group = byEntity[entityKey];
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const a = group[i], b = group[j];
                if (
                    areDatesClose(a.start, b.start) ||
                    areDatesClose(a.start, b.end) ||
                    areDatesClose(a.end, b.start) ||
                    areDatesClose(a.end, b.end)
                ) {
                    conflictVisitIds.add(a.visitId);
                    conflictVisitIds.add(b.visitId);
                }
            }
        }
    }
}



    function highlightEventBlocks() {
        document.querySelectorAll("button[ng-click^='editVisit($event,']").forEach(button => {
            const match = button.getAttribute("ng-click").match(/editVisit\(\$event,'([a-f0-9-]+)'\)/);
            if (!match) return;

            const visitId = match[1];
            if (!conflictVisitIds.has(visitId)) return;

            const eventBlock = button.closest("a.fc-day-grid-event");
            if (eventBlock) {
                eventBlock.style.boxShadow = "0 0 0 3px red, 0 0 6px rgba(0, 0, 0, 1)";
            }
        });
    }

    function handleScheduleResponse(json) {
        let visits = [];

        if (Array.isArray(json?.result)) {
            visits = json.result;
        } else if (Array.isArray(json?.result?.data)) {
            visits = json.result.data;
        }

        if (visits.length > 0) {
            analyzeVisits(visits);
            highlightEventBlocks();
        }
    }

    const observer = new MutationObserver(() => {
        if (conflictVisitIds.size > 0) highlightEventBlocks();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        return originalFetch.apply(this, args).then(response => {
            const url = response.url;
            if (url.includes("GetContactSchedule") || url.includes("GetPatientSchedule")) {
                response.clone().json().then(handleScheduleResponse).catch(() => {});
            }
            return response;
        });
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._url = url;
        return originalOpen.call(this, method, url, ...rest);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener("load", function () {
            if (this._url && (this._url.includes("GetContactSchedule") || this._url.includes("GetPatientSchedule"))) {
                try {
                    const json = JSON.parse(this.responseText);
                    handleScheduleResponse(json);
                } catch (_) {}
            }
        });
        return originalSend.apply(this, args);
    };
})();
