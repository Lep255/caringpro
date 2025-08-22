// ==UserScript==
// @name         Calendar Scheduled Hours (network-based)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Sum scheduled hours per day from GetContactSchedule and append to FullCalendar day numbers
// @match        https://*.inmyteam.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ----- small utils -----
  const debounce = (fn, ms = 100) => {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };
  const ymdLocal = d => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Keep the latest computed totals and signature to avoid double-work
  let latestTotals = {};
  let lastSignature = '';

  // Extract an array of visits from common shapes
  function extractVisits(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;

    // Common wrappers used by this app
    if (Array.isArray(json.result)) return json.result;
    if (Array.isArray(json.result?.data)) return json.result.data;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.events)) return json.events;

    // As a fallback: search shallow keys for an array of objects with scheduledStartDateTime
    for (const k in json) {
      const v = json[k];
      if (Array.isArray(v) && v.length && typeof v[0] === 'object' && ('scheduledStartDateTime' in v[0] || 'start' in v[0])) {
        return v;
      }
    }
    return [];
  }

  // ONLY scheduled hours
  function computeTotalsFromScheduled(visits) {
    const totals = {};
    for (const v of visits) {
      const sStr = v.scheduledStartDateTime; // strictly scheduled
      const eStr = v.scheduledEndDateTime;   // strictly scheduled
      if (!sStr || !eStr) continue;

      const start = new Date(sStr);
      const end = new Date(eStr);
      if (isNaN(start) || isNaN(end)) continue;

      let hrs = (end - start) / (1000 * 60 * 60);
      // if the end is after midnight and browser parsed weirdly
      if (hrs < 0) hrs += 24;

      const dateKey = ymdLocal(start);
      totals[dateKey] = (totals[dateKey] || 0) + hrs;
    }
    return totals;
  }

  // Find the day-number element for a date (supports common FullCalendar DOMs)
  function findDayNumberEl(dateKey) {
    return (
      document.querySelector(`.fc-day-top[data-date="${dateKey}"] .fc-day-number`) ||
      document.querySelector(`td.fc-day[data-date="${dateKey}"] .fc-day-number`)
    );
  }

  // Apply totals next to each day number; red if >16h
  function applyTotals(totals) {
    Object.entries(totals).forEach(([dateKey, hours]) => {
      const el = findDayNumberEl(dateKey);
      if (!el) return;

      // keep original text once
      const base = el.getAttribute('data-original') || el.textContent.replace(/\s*\(.*\)$/, '');
      el.setAttribute('data-original', base);

      // write "(X.Xh)" next to the date
      const suffix = ` (${hours.toFixed(1)}h)`;
      el.textContent = base + suffix;

      // color rule
      el.style.color = hours > 16 ? 'red' : '';
    });
  }

  const applyTotalsDebounced = debounce(() => {
    if (Object.keys(latestTotals).length) applyTotals(latestTotals);
  }, 80);

  // Handle JSON text from fetch/xhr once fully loaded
  function handleScheduleText(text) {
    // de-dupe exact payload to avoid reprocessing
    const sig = text.length + ':' + text.slice(0, 1024);
    if (sig === lastSignature) return;
    lastSignature = sig;

    try {
      const json = JSON.parse(text);
      const visits = extractVisits(json);
      if (!visits.length) return;

      latestTotals = computeTotalsFromScheduled(visits);
      applyTotalsDebounced();  // non-blocking UI update
    } catch (_) { /* ignore non-JSON */ }
  }

  // ---- Intercept fetch ----
  const _fetch = window.fetch;
  window.fetch = function (...args) {
    return _fetch.apply(this, args).then(res => {
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
      if (url && (url.includes('GetContactSchedule') || url.includes('GetPatientSchedule'))) {
        res.clone().text().then(handleScheduleText).catch(() => {});
      }
      return res;
    });
  };

  // ---- Intercept XHR ----
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__tm_url = url;
    return origOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (...args) {
    if (this.__tm_url && (this.__tm_url.includes('GetContactSchedule') || this.__tm_url.includes('GetPatientSchedule'))) {
      this.addEventListener('load', function () {
        if (this.status >= 200 && this.status < 300 && typeof this.responseText === 'string') {
          handleScheduleText(this.responseText); // after fully loaded
        }
      });
    }
    return origSend.apply(this, args);
  };

  // ---- Re-apply when the calendar DOM changes (modals, nav, redraws) ----
  const mo = new MutationObserver(applyTotalsDebounced);
  mo.observe(document.body, { childList: true, subtree: true });

  // Also try periodically (non-blocking)
  setInterval(applyTotalsDebounced, 2000);
})();
