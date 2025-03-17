// ==UserScript==
// @name         Inactivity White Film Overlay
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Add a white film overlay to the page after 10 seconds of inactivity
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @grant        none
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/White%20Film.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/White%20Film.user.js
// ==/UserScript==
 
(function() {
    'use strict';
 
    let inactivityTimeout;
    const inactivityDelay = 15000; // 15 seconds
 
    // Create an overlay element
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 1)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'none'; // Initially hidden
    document.body.appendChild(overlay);
 
    // Function to reset the inactivity timer and hide the overlay
    function resetInactivityTimer() {
        clearTimeout(inactivityTimeout);
        overlay.style.display = 'none'; // Hide the overlay when activity resumes
        inactivityTimeout = setTimeout(() => {
            overlay.style.display = 'block'; // Show overlay after inactivity
        }, inactivityDelay);
    }
 
    // Reset timer on user activity
    ['mousemove', 'keydown', 'scroll'].forEach(eventType => {
        document.addEventListener(eventType, resetInactivityTimer);
    });
 
    // Initialize inactivity timer
    resetInactivityTimer();
})();