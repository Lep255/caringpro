// ==UserScript==
// @name         Search Box Addition
// @namespace    http://tampermonkey.net/
// @version      6.3
// @description  Add a search box to highlight rows in the table dynamically within modal header conditionally displayed after delay
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Search%20Box%20Addition.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Search%20Box%20Addition.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    var searchBox, checkbox;

    function createSearchAndCheckboxContainer() {
        var searchBoxContainer = document.createElement('div');
        searchBoxContainer.className = 'search-box-container';
        searchBoxContainer.style.width = '100%';
        searchBoxContainer.style.padding = '10px';
        searchBoxContainer.style.display = 'flex';
        searchBoxContainer.style.alignItems = 'center';
        searchBoxContainer.style.justifyContent = 'flex-start';
        searchBoxContainer.style.gap = '20px';

        // Search Box
        searchBox = document.createElement('input');
        searchBox.type = 'text';
        searchBox.placeholder = 'Search...';
        searchBox.style.width = '315px';
        searchBox.style.padding = '10px';
        searchBox.style.border = '1px solid #ccc';
        searchBox.style.borderRadius = '4px';
        searchBox.style.fontSize = '13px';

        searchBox.addEventListener('input', function() {
            highlightRowsContainingText(searchBox.value.toLowerCase());
        });

        // Checkbox Container
        var checkboxContainer = document.createElement('div');
        checkboxContainer.style.display = 'flex';
        checkboxContainer.style.alignItems = 'center';
        checkboxContainer.style.gap = '8px';

        var checkboxLabel = document.createElement('label');
        checkboxLabel.className = 'kt-checkbox kt-checkbox--brand kt-margin-0';
        checkboxLabel.style.display = 'flex';
        checkboxLabel.style.alignItems = 'center';
        checkboxLabel.style.cursor = 'pointer';
        checkboxLabel.style.whiteSpace = 'nowrap';

        checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'selectHighlighted';
        checkbox.className = 'ng-pristine ng-untouched ng-valid ng-empty';

        var labelText = document.createTextNode(' Select Highlighted');

        checkbox.addEventListener('change', function() {
            selectHighlightedRows(checkbox.checked);
        });

        checkboxLabel.appendChild(checkbox);
        checkboxLabel.appendChild(document.createElement('span')); // Matches existing checkbox styles
        checkboxLabel.appendChild(labelText);
        checkboxContainer.appendChild(checkboxLabel);

        searchBoxContainer.appendChild(searchBox);
        searchBoxContainer.appendChild(checkboxContainer);

        return searchBoxContainer;
    }

    function highlightRowsContainingText(searchTerm) {
        var rows = document.querySelectorAll('tr.ng-scope');
        rows.forEach(function(row) {
            var cells = row.querySelectorAll('td.ng-binding');
            var rowContainsTerm = Array.from(cells).some(function(cell) {
                return cell.textContent.trim().toLowerCase().includes(searchTerm);
            });
            row.style.backgroundColor = searchTerm && rowContainsTerm ? '#e0e0e0' : '';
        });
    }

    function selectHighlightedRows(shouldSelect) {
        document.querySelectorAll("tr[style*='background-color: rgb(224, 224, 224)']").forEach(row => {
            const rowCheckbox = row.querySelector("input[type='checkbox']");
            if (rowCheckbox) {
                if (rowCheckbox.checked !== shouldSelect) {
                    rowCheckbox.checked = shouldSelect;
                    rowCheckbox.dispatchEvent(new Event('click'));
                }
            }
        });
    }

    function resetSearchAndCheckbox() {
        if (searchBox) searchBox.value = ''; // Clear search input
        if (checkbox) checkbox.checked = false; // Uncheck the checkbox
    }

    function monitorModalChanges() {
        var modalContainer = document.querySelector('.modal-body'); // Adjust selector if necessary
        if (!modalContainer) return;

        new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    resetSearchAndCheckbox();
                }
            });
        }).observe(modalContainer, { childList: true, subtree: true });
    }

    function monitorTheadElement() {
        setTimeout(function() {
            if (document.querySelector('thead.ng-scope[ng-if="vm.data.length>0 && !vm.loading"]')) {
                if (!document.querySelector('.col.col-12.col-sm-5')) {
                    return;
                }
                if (!document.querySelector('.search-box-container')) {
                    document.querySelector('.col.col-12.col-sm-5').insertAdjacentElement('afterend', createSearchAndCheckboxContainer());
                    monitorModalChanges(); // Start monitoring modal changes
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
