// ==UserScript==
// @name         Calendar Scheduled Hours (optimized, quarter-hour display)
// @namespace    http://tampermonkey.net/
// @version      1.8
// @description  Sum scheduled hours per day and append to FullCalendar day numbers (display :00, :15, :30, :45), optimized for performance
// @match        https://*.inmyteam.com/*
// @updateURL    https://raw.githubusercontent.com/Lep255/caringpro/refs/heads/main/Calendar%20Scheduled%20Hours.js
// @downloadURL  https://raw.githubusercontent.com/Lep255/caringpro/refs/heads/main/Calendar%20Scheduled%20Hours.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const debounce = (fn, ms = 150) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };

  const ymdLocal = d => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  let latestTotals = {};

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

  const roundQuarterHour = hrs => Math.round(hrs * 4) / 4;

  const formatQuarterHour = hrs => {
    const full = Math.floor(hrs);
    const fraction = hrs - full;
    let suffix = '';
    if (fraction === 0.25) suffix = ':15';
    else if (fraction === 0.5) suffix = ':30';
    else if (fraction === 0.75) suffix = ':45';
    else suffix = ':00';
    return full + suffix;
  };

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

      hrs = roundQuarterHour(hrs);

      const dateKey = ymdLocal(start);
      totals[dateKey] = (totals[dateKey] || 0) + hrs;
    }
    return totals;
  }

  function findDayNumberEl(dateKey) {
    return (
      document.querySelector(`.fc-day-top[data-date="${dateKey}"] .fc-day-number`) ||
      document.querySelector(`td.fc-day[data-date="${dateKey}"] .fc-day-number`)
    );
  }

  // Track what is currently displayed to avoid redundant updates
  const displayedTotals = {};

  function applyTotals(totals) {
    Object.entries(totals).forEach(([dateKey, hours]) => {
      const el = findDayNumberEl(dateKey);
      if (!el) return;

      const formatted = formatQuarterHour(hours);

      // Only update if different
      if (displayedTotals[dateKey] === formatted) return;

      const base = el.getAttribute('data-original') || el.textContent.replace(/\s*\(.*\)$/, '');
      el.setAttribute('data-original', base);

      el.textContent = base + ` (${formatted}h)`;
      el.style.color = hours > 16 ? 'red' : '';

      displayedTotals[dateKey] = formatted;
    });
  }

  const applyTotalsDebounced = debounce(() => {
    if (Object.keys(latestTotals).length) applyTotals(latestTotals);
  }, 100);

  function handleScheduleText(text) {
    try {
      const json = JSON.parse(text);
      const visits = extractVisits(json);
      if (!visits.length) return;

      latestTotals = computeTotalsFromScheduled(visits);
      applyTotalsDebounced();
    } catch (_) {}
  }

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

  // Only observe for significant DOM changes
  const mo = new MutationObserver(mutations => {
    let changed = false;
    for (const m of mutations) {
      if (m.addedNodes.length || m.removedNodes.length) {
        changed = true;
        break;
      }
    }
    if (changed) applyTotalsDebounced();
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // Periodic update in case fetch/XHR was missed
  setInterval(applyTotalsDebounced, 3000);
})();
