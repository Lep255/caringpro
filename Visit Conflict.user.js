// ==UserScript==
// @name         Calendar Filtering
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Filtering for aide/patient sections.
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @grant        none
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Calendar%20Filtering.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Calendar%20Filtering.user.js
// ==/UserScript==

(function () {
  'use strict';

  const normalizeName = (name) =>
    name.replace(/patient\s*:\s*/i, '').trim().toLowerCase();

  let activeView = null;

  function addIncMissToggle(toolbarSelector, toggleId, callback) {
    const toolbar = document.querySelector(toolbarSelector);
    if (!toolbar || toolbar.querySelector(`#${toggleId}`)) return;

    const label = document.createElement('label');
    label.className =
      'kt-checkbox kt-checkbox--brand align-self-center kt-margin-r-20 text-nowrap';
    label.innerHTML = `
      <input type="checkbox" id="${toggleId}">
      Inc/Miss
      <span></span>
    `;

    toolbar.insertBefore(label, toolbar.firstChild);
    label.querySelector('input').addEventListener('change', callback);
  }

  function handleContactSection() {
    if (activeView === 'contacts') return;
    activeView = 'contacts';

    function getUncheckedPatientNames() {
      return Array.from(document.querySelectorAll('input.patient-checkbox'))
        .filter(cb => !cb.checked)
        .map(cb => normalizeName(cb.nextElementSibling?.textContent || ''));
    }

    function addCheckboxToPatient(span) {
      if (span.querySelector('input.patient-checkbox')) return;

      const nameSpan = span.querySelector('span.ng-binding');
      const anchor = span.querySelector('a[ng-click]');
      if (!nameSpan || !anchor) return;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.className = 'patient-checkbox';
      checkbox.style.marginRight = '5px';

      checkbox.addEventListener('change', () => {
        nameSpan.style.opacity = checkbox.checked ? '1' : '0.5';
        updateContactEventVisibility();
      });

      anchor.parentElement.insertBefore(checkbox, anchor);
    }

    function updateContactEventVisibility() {
      const unchecked = getUncheckedPatientNames();
      const showIncluded = document.querySelector('#inc_miss_toggle_contacts')?.checked ?? false;

      document.querySelectorAll('td.fc-event-container').forEach(td => {
        if (td.querySelector('.fc-contentCalendarNote')) return;

        const title = td.querySelector('.fc-title');
        if (!title) return;

        const raw = title.textContent || '';
        const isPatientEvent = /^patient\s*:/i.test(raw);
        if (!isPatientEvent) return;

        const name = normalizeName(raw);
        const hiddenByName = unchecked.some(n => name.includes(n));
        const hiddenByStatus = showIncluded && ['paid out', 'completed', 'billed', 'released', 'upcoming'].some(w =>
          raw.toLowerCase().includes(w)
        );

        td.style.visibility = hiddenByName || hiddenByStatus ? 'hidden' : '';
      });
    }

    function addContactIncMissToggle() {
      addIncMissToggle(
        '.d-flex.justify-content-end.align-content-center',
        'inc_miss_toggle_contacts',
        updateContactEventVisibility
      );
    }

    function updateContacts() {
      document
        .querySelectorAll('span[ng-repeat*="patient in vm.patients"]')
        .forEach(addCheckboxToPatient);
      updateContactEventVisibility();
      addContactIncMissToggle();
    }

    const contactObserver = new MutationObserver(updateContacts);
    contactObserver.observe(document.body, { childList: true, subtree: true });

    updateContacts();
  }

  function handleCustomerSection() {
    if (activeView === 'customers') return;
    activeView = 'customers';

    function getUncheckedStaffNames() {
      return Array.from(
        document.querySelectorAll('.kt-checkbox.kt-checkbox--brand-inline.px-3.py-1 input[type="checkbox"]')
      )
        .filter(cb => !cb.checked)
        .map(cb => normalizeName(cb.parentElement?.textContent || ''));
    }

    function updateCustomerEventVisibility() {
      const unchecked = getUncheckedStaffNames();
      const showIncluded = document.querySelector('#inc_miss_toggle_customers')?.checked ?? false;

      document.querySelectorAll('td.fc-event-container').forEach(td => {
        if (td.querySelector('.fc-contentCalendarNote')) return;

        const title = td.querySelector('.fc-title');
        if (!title) return;

        const raw = title.textContent || '';
        const isPatientEvent = /^patient\s*:/i.test(raw);
        if (isPatientEvent) return;

        const name = normalizeName(raw);
        const hiddenByName = unchecked.some(n => name.includes(n));
        const hiddenByStatus = showIncluded && ['paid out', 'completed', 'billed', 'released', 'upcoming'].some(w =>
          raw.toLowerCase().includes(w)
        );

        td.style.visibility = hiddenByName || hiddenByStatus ? 'hidden' : '';
      });
    }

    function bindStaffCheckboxes() {
      document
        .querySelectorAll('.kt-checkbox.kt-checkbox--brand-inline.px-3.py-1 input[type="checkbox"]')
        .forEach(cb => {
          if (cb.dataset.bound) return;
          cb.addEventListener('change', updateCustomerEventVisibility);
          cb.dataset.bound = 'true';
        });
    }

    function addCustomerIncMissToggle() {
      addIncMissToggle(
        '.d-flex.justify-content-end.align-content-center',
        'inc_miss_toggle_customers',
        updateCustomerEventVisibility
      );
    }

    function updateCustomers() {
      bindStaffCheckboxes();
      updateCustomerEventVisibility();
      addCustomerIncMissToggle();
    }

    const customerObserver = new MutationObserver(updateCustomers);
    customerObserver.observe(document.body, { childList: true, subtree: true });

    updateCustomers();
  }

  function detectWhichView() {
    const hash = window.location.hash;
    if (!hash.startsWith('#/contacts') && !hash.startsWith('#/customers')) return;

    const contactRoot = document.querySelector('div[ng-if="vm.patients.length>0"]');
    const customerRoot = document.querySelector('.accordion#accordionExample3');

    if (contactRoot && !customerRoot && activeView !== 'contacts') {
      activeView = null;
      handleContactSection();
    } else if (customerRoot && !contactRoot && activeView !== 'customers') {
      activeView = null;
      handleCustomerSection();
    }
  }

  const initObserver = new MutationObserver(detectWhichView);
  initObserver.observe(document.body, { childList: true, subtree: true });
  detectWhichView();
})();
