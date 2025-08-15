// ==UserScript==
// @name         Toggle Hide/Unhide Row Divs
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Hide/unhide specific divs with toggle option in Actions dropdown
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

    function hideRows() {
        if (!hiddenEnabled) return;
        classesToHide.forEach(cls => {
            const selector = 'div.' + cls.trim().split(/\s+/).join('.');
            document.querySelectorAll(`${selector}:not([hidden])`).forEach(el => {
                el.setAttribute('hidden', '');
            });
        });
    }

    function unhideRows() {
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

    let toggleItem = null;

    function addToggleOption() {
        const menu = document.querySelector('.dropdown-menu[aria-labelledby="dropdownMenuButton"]');
        if (menu && !menu.querySelector('.toggle-hide-item')) {
            toggleItem = document.createElement('a');
            toggleItem.className = 'dropdown-item toggle-hide-item';
            toggleItem.href = 'javascript:;';
            toggleItem.textContent = 'Unhide hidden rows';
            toggleItem.addEventListener('click', toggleHideUnhide);

            menu.appendChild(document.createElement('div')).className = 'dropdown-divider';
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
