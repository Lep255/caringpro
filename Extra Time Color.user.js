// ==UserScript==
// @name         Extra Time Color
// @namespace    http://tampermonkey.net/
// @version      5.2
// @description  Add and replace CSS styles for elements
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Extra%20Time%20Color.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Extra%20Time%20Color.user.js
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Track whether the CSS style has been added
    var cssStyleAdded = false;

    // Function to add and replace CSS styles
    function addAndReplaceCSS() {
        var elements = document.querySelectorAll('.text-danger');
        elements.forEach(function(element) {
            if (element.classList.length === 1) {
                element.classList.remove('text-danger');
                element.classList.add('text-danger-edit');
            }
        });
        // Add CSS styles if not already added
        if (!cssStyleAdded) {
            GM_addStyle('.text-danger-edit { color: blue !important; }');
            cssStyleAdded = true;
        }
        // Delete elements with class 'text-danger-edit' if they have 'float: right'
        var dangerEditElements = document.querySelectorAll('.text-danger-edit');
        dangerEditElements.forEach(function(editElement) {
            var computedStyle = window.getComputedStyle(editElement);
            if (computedStyle.getPropertyValue('float') === 'right') {
                editElement.remove();
            }
        });
    }

    var observer = new MutationObserver(function(mutationsList, observer) {
        mutationsList.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                addAndReplaceCSS();
            }
        });
    });

    var observerConfig = { childList: true, subtree: true };
    observer.observe(document.body, observerConfig);
    addAndReplaceCSS();
})();
