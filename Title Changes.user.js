// ==UserScript==
// @name         Title Changes
// @namespace    http://tampermonkey.net/
// @version      5.2
// @description  Change document titles based on modal and section names dynamically within modal header conditionally displayed after delay
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Title%20Changes.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Title%20Changes.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function setModalTitleAsDocumentTitle() {
        var modalTitleElement = document.querySelector('.modal-header .modal-title .ng-binding');
        if (modalTitleElement) {
            var modalTitleText = modalTitleElement.textContent.trim();
            if (modalTitleText) {
                var newTitle = '';
                var prefix = '';
                if (window.location.hash.includes('/customers/')) {
                    prefix = 'Patient: ';
                } else if (window.location.hash.includes('/clinicians')) {
                    prefix = 'CNA: ';
                    modalTitleText = modalTitleText.replace('Schedule - ', '');
                } else if (window.location.hash.includes('/contacts')) {
                    prefix = 'HHA: ';
                    modalTitleText = modalTitleText.replace('Schedule - ', '');
                }
                newTitle = prefix + modalTitleText;

                if (newTitle !== document.title) {
                    document.title = newTitle;
                }
            }
        } else {
            setDocumentTitle();
        }
    }

    function setDocumentTitle() {
        if (window.location.hash.includes('/customers/')) {
            document.title = 'Patients';
        } else if (window.location.hash.includes('/clinicians')) {
            document.title = 'CNA';
        } else if (window.location.hash.includes('/contacts')) {
            document.title = 'HHA';
        } else {
            document.title = 'InMyTeam - Home Health Care Solution';
        }
    }

    setInterval(setModalTitleAsDocumentTitle, 1000);

    var observerConfig = { childList: true, subtree: true };
    var observer = new MutationObserver(function(mutationsList) {
        for (var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                setModalTitleAsDocumentTitle();
            }
        }
    });

    observer.observe(document.body, observerConfig);
    window.addEventListener('hashchange', function() {
        setModalTitleAsDocumentTitle();
    });
})();
