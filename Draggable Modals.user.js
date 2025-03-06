// ==UserScript==
// @name         Draggable Modals
// @namespace    http://tampermonkey.net/
// @version      5.2
// @description  Make specific modals draggable.
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Draggable%20Modals.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Draggable%20Modals.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function makeModalDraggable(modal) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let initialLeft = 0;
        let initialTop = 0;

        const modalContent = modal.querySelector('.modal-content');
        const modalHeader = modal.querySelector('.modal-header');
        if (!modalContent || !modalHeader) return;

        modalContent.style.position = 'absolute';

        modalHeader.addEventListener('mousedown', (e) => {
            const closeButton = modalHeader.querySelector('.close');
            const ignoredSpan = modalHeader.querySelector('span[ng-if="vm.customer != {}"]');

            if ((closeButton && closeButton.contains(e.target)) ||
                (ignoredSpan && ignoredSpan.contains(e.target))) {
                return;
            }

            isDragging = true;

            startX = e.clientX;
            startY = e.clientY;

            const computedStyle = getComputedStyle(modalContent);
            initialLeft = parseFloat(computedStyle.left || '0');
            initialTop = parseFloat(computedStyle.top || '0');

            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                // Calculate the new position based on movement relative to the initial position
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                modalContent.style.left = `${initialLeft + deltaX}px`;
                modalContent.style.top = `${initialTop + deltaY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
            }
        });
    }

    function periodicallyCheckModals() {
        setInterval(() => {
            const modals = document.querySelectorAll('div[uib-modal-window="modal-window"]');
            modals.forEach((modal) => {
                if (!modal.hasAttribute('draggable-applied')) {
                    const modalText = modal.innerText || modal.textContent;
                    if (modalText.includes('Schedule')) {
                        return;
                    }

                    makeModalDraggable(modal);
                    modal.setAttribute('draggable-applied', 'true');
                }
            });
        }, 1000);
    }

    periodicallyCheckModals();
})();
