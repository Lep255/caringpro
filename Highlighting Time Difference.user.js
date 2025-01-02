// ==UserScript==
// @name         Highlighting Time Difference
// @namespace    http://tampermonkey.net/
// @version      5.1
// @description  Highlights time in red if X (from X/Y format) is under 15 minutes, and in orange if more than 7 minutes are missing from total.
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Highlighting%20Time%20Difference.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Highlighting%20Time%20Difference.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function highlightTimes() {

        var timeElements = document.querySelectorAll('div.font-italic');

        timeElements.forEach(function(div) {

            var timeText = div.textContent.trim();

            // Ignore cases where X contains "-"
            if (timeText.includes('-')) {
                div.style.color = ''; // No color for invalid "-"
                return;
            }

            // Match X/Y where X can be in hours or minutes and Y can be hours or minutes
            var timeMatch = timeText.match(/^\D*(\d+h)?\s*(\d+m)?\s*\/\s*(\d+h)?\s*(\d+m)?$/);

            if (timeMatch) {
                // Convert the first time (X) into minutes
                var xValue = convertToMinutes(timeMatch[1], timeMatch[2]);
                // Convert the second time (Y) into minutes
                var yValue = convertToMinutes(timeMatch[3], timeMatch[4]);

                // Only highlight in red if X is strictly under 15 minutes
                if (xValue < 15) {
                    div.style.color = 'red';
                }
                // Highlight in orange if the remaining time is more than 7 minutes less than Y and not already red
                else if (yValue - xValue > 6) {
                    div.style.color = 'orange';
                } else {
                    div.style.color = ''; // Reset color if neither condition is true
                }
            } else {
                div.style.color = ''; // Reset color if no valid match
            }
        });
    }

    // Function to convert both hours and minutes into total minutes
    function convertToMinutes(hoursStr, minutesStr) {
        var totalMinutes = 0;

        if (hoursStr && hoursStr.endsWith('h')) {
            totalMinutes += parseInt(hoursStr) * 60; // Convert hours to minutes
        }

        if (minutesStr && minutesStr.endsWith('m')) {
            totalMinutes += parseInt(minutesStr); // Already in minutes
        }

        return totalMinutes;
    }

    setInterval(highlightTimes, 1000); // Check every second

    var observerConfig = { childList: true, subtree: true };
    var observer = new MutationObserver(function(mutationsList) {
        for (var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                highlightTimes();
            }
        }
    });

    observer.observe(document.body, observerConfig);
})();
