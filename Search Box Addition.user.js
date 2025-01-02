// ==UserScript==
// @name         Search Box Addition
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add a search box to highlight rows in the table dynamically within modal header conditionally displayed after delay
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var searchBoxContainer = null;

    function createSearchBoxContainer() {
        searchBoxContainer = document.createElement('div');
        searchBoxContainer.style.width = '100%';
        searchBoxContainer.style.padding = '10px';
        searchBoxContainer.style.display = 'flex';
        searchBoxContainer.style.justifyContent = 'left';

        var searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.placeholder = 'Search...';
        searchBox.style.width = '315px';
        searchBox.style.padding = '10px';
        searchBox.style.border = '1px solid #ccc';
        searchBox.style.borderRadius = '4px';
        searchBox.style.fontSize = '13px';

        searchBox.addEventListener('input', function() {
            var searchTerm = searchBox.value.toLowerCase();
            highlightRowsContainingText(searchTerm);
        });

        searchBoxContainer.appendChild(searchBox);
    }

    createSearchBoxContainer();

    function highlightRowsContainingText(searchTerm) {
        var rows = document.querySelectorAll('tr.ng-scope');
        rows.forEach(function(row) {
            var cells = row.querySelectorAll('td.ng-binding');
            var rowContainsTerm = Array.from(cells).some(function(cell) {
                return cell.textContent.trim().toLowerCase().includes(searchTerm);
            });
            if (searchTerm && rowContainsTerm) {
                row.style.backgroundColor = '#e0e0e0';
            } else {
                row.style.backgroundColor = '';
            }
        });
    }

    function checkForTheadElement() {
        return document.querySelector('thead.ng-scope[ng-if="vm.data.length>0 && !vm.loading"]') !== null;
    }

    function monitorTheadElement() {
        setTimeout(function() {
            if (checkForTheadElement()) {
                if (!document.querySelector('.col.col-12.col-sm-5')) {
                    return;
                }
                if (!document.querySelector('.search-box-container')) {
                    document.querySelector('.col.col-12.col-sm-5').insertAdjacentElement('afterend', searchBoxContainer);
                    searchBoxContainer.classList.add('search-box-container');
                }
            } else {
                if (document.querySelector('.search-box-container')) {
                    document.querySelector('.search-box-container').remove();
                }
            }
        }, 1000);
    }

    var theadObserver = new MutationObserver(function(mutationsList) {
        mutationsList.forEach(function(mutation) {
            if (mutation.type === 'childList' || mutation.type === 'subtree') {
                monitorTheadElement();
            }
        });
    });

    theadObserver.observe(document.body, { childList: true, subtree: true });
})();
