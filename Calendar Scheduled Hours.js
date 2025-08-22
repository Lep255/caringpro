// ==UserScript==
// @name         Calendar Scheduled Hours (network-based, precise)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Sum scheduled hours per day from GetContactSchedule and append to FullCalendar day numbers (rounded to 0.25h increments)
// @match        https://*.inmyteam.com/*
// @updateURL    https://raw.githubusercontent.com/Lep255/caringpro/refs/heads/main/Calendar%20Scheduled%20Hours.js
// @downloadURL  https://raw.githubusercontent.com/Lep255/caringpro/refs/heads/main/Calendar%20Scheduled%20Hours.js
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

  // Keep latest computed totals
  let latestTotals = {};

  // Extract visits from common wrappers
  function extractVisits(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.result)) return json.result;
    if (Array.isArray(json.result?.data)) return json.result.data;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.events)) return json.events;
    for (const k in json) {
      const v = json[k];
      if (Array.isArray(v) && v.length && typeof v[0] === 'object' && ('scheduledStartDateTime' in v[0] || 'start' in v[0])) {
        return v;
      }
    }
    return [];
  }

  // Round to nearest 0.25
  const roundQuarter = hrs => Math.round(hrs * 4) / 4;

  // ONLY scheduled hours, in 0.25 increments
  function computeTotalsFromScheduled(visits) {
    const totals = {};
    for (const v of visits) {
      const sStr = v.scheduledStartDateTime;
      const eStr = v.scheduledEndDateTime;
      if (!sStr || !eStr) continue;

      const start = new Date(sStr);
      const end = new Date(eStr);
      if (isNaN(start) || isNaN(end)) continue;

      let hrs = (end - start) / (1000 * 60 * 60);
      if (hrs < 0) hrs += 24;

      hrs = roundQuarter(hrs);

      const dateKey = ymdLocal(start);
      totals[dateKey] = (totals[dateKey] || 0) + hrs;
    }
    return totals;
  }

  // Find the day-number element
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

      const base = el.getAttribute('data-original') || el.textContent.replace(/\s*\(.*\)$/, '');
      el.setAttribute('data-original', base);

      const suffix = ` (${hours.toFixed(2)}h)`;
      el.textContent = base + suffix;

      el.style.color = hours > 16 ? 'red' : '';
    });
  }

  const applyTotalsDebounced = debounce(() => {
    if (Object.keys(latestTotals).length) applyTotals(latestTotals);
  }, 80);

  // Handle JSON text from network
  function handleScheduleText(text) {
    try {
      const json = JSON.parse(text);
      const visits = extractVisits(json);
      if (!visits.length) return;

      latestTotals = computeTotalsFromScheduled(visits);
      applyTotalsDebounced(); // update UI
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
          handleScheduleText(this.responseText);
        }
      });
    }
    return origSend.apply(this, args);
  };

  // ---- Re-apply when DOM changes ----
  const mo = new MutationObserver(applyTotalsDebounced);
  mo.observe(document.body, { childList: true, subtree: true });

  // Also periodically
  setInterval(applyTotalsDebounced, 2000);
})();
