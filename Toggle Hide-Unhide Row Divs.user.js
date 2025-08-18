// ==UserScript==
// @name         Toggle Hide/Unhide Row Divs (Contacts Only)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Hide/unhide specific divs with toggle option in Actions dropdown on contacts page only
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Toggle%20Hide-Unhide%20Row%20Divs.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Toggle%20Hide-Unhide%20Row%20Divs.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const classesToHide = [
        'row kt-padding-l-10 kt-padding-r-10 mt-4',
        'col col-12 col-sm-12 mb-3',
        'modal-footer text-center ng-scope'
    ];

    let hiddenEnabled = true; // default: hide active
    let toggleItem = null;

    function isContactsPage() {
        return window.location.hash.includes('/contacts');
    }

    function hideRows() {
        if (!hiddenEnabled || !isContactsPage()) return;
        classesToHide.forEach(cls => {
            const selector = 'div.' + cls.trim().split(/\s+/).join('.');
            document.querySelectorAll(`${selector}:not([hidden])`).forEach(el => {
                el.setAttribute('hidden', '');
            });
        });
    }

    function unhideRows() {
        if (!isContactsPage()) return;
        classesToHide.forEach(cls => {
            const selector = 'div.' + cls.trim().split(/\s+/).join('.');
            document.querySelectorAll(`${selector}[hidden]`).forEach(el => {
                el.removeAttribute('hidden');
            });
        });
    }

    function toggleHideUnhide() {
        hiddenEnabled = !hiddenEnabled;
        if (hiddenEnabled) {
            hideRows();
            toggleItem.textContent = 'Unhide hidden rows';
        } else {
            unhideRows();
            toggleItem.textContent = 'Hide rows again';
        }
    }

    function addToggleOption() {
        if (!isContactsPage()) return;

        // Strictly select the Actions button dropdown
        const actionsButton = document.querySelector('button#dropdownMenuButton.btn.btn-brand.dropdown-toggle');
        if (!actionsButton) return;

        const menu = actionsButton.nextElementSibling; // the dropdown-menu immediately after the button
        if (!menu || !menu.classList.contains('dropdown-menu')) return;

        if (!menu.querySelector('.toggle-hide-item')) {
            toggleItem = document.createElement('a');
            toggleItem.className = 'dropdown-item toggle-hide-item';
            toggleItem.href = 'javascript:;';
            toggleItem.textContent = 'Unhide hidden rows';
            toggleItem.addEventListener('click', toggleHideUnhide);

            const divider = document.createElement('div');
            divider.className = 'dropdown-divider';
            menu.appendChild(divider);
            menu.appendChild(toggleItem);
        }
    }

    hideRows();
    addToggleOption();

    const observer = new MutationObserver(() => {
        hideRows();
        addToggleOption();
    });
    observer.observe(document.body, { childList: true, subtree: true });

})();
