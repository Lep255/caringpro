// ==UserScript==
// @name         Disable Molina Patients
// @namespace    http://tampermonkey.net/
// @version      5.4
// @description  Disable specific blocks and allow enabling with a consent checkbox based on a list of names
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @grant        none
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Disable%20Molina%20Patients.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Disable%20Molina%20Patients.user.js
// ==/UserScript==

(function () {
    'use strict';

    const targetNames = ['ADA SUAREZ', 'ADIS LOPEZ LEYVA', 'AMPARO DIAZ PENA', 'ANDREA BORGES VILLEGAS', 'ANGEL SANZ', 'BERTHA ESCOBAR', 'CARMELINA CORDERO FONTE', 'CARMEN RODRIGUEZ', 'CATALINA WONG SUAREZ', 'CLARA CEA', 'CLAUDIO OVES', 'CONSUELO CORTES', 'CONSUELO ROQUE', 'ELDA RUENES GONZALEZ', 'ELISA OVES', 'ELSA ARAUJO', 'ESTRELLA VELAZQUEZ', 'EVA DE ARMAS', 'EVA RODRIGUEZ RODRIGUEZ', 'FABIOLA GARCIA', 'GLADYS FERNANDEZ ALEMA', 'GLADYS GOMEZ', 'GLORIA CORZO', 'HERIBERTA ALEMAN', 'ISABEL FUENTES', 'JESUS FERRER', 'JORGE STURLA MIRABAL', 'JUANA ARIAS', 'JUANA RODRIGUEZ', 'LEONILO ROJAS BLANCO', 'LUCAS MARIN GUTIERREZ', 'LUCELLY VELEZ', 'LUIS BONET CASTRO', 'MARIA AGUINAGA', 'MARIA DIAZ', 'MARIA HERNANDEZ', 'MARIA JIMENEZ', 'MARIA RODRIGUEZ', 'MAYKEL OLAZABAL AGUILA', 'MEDARDO DIAZ', 'MIGDALIA BENCOMO', 'MIRIAM GUERRA SERRANO', 'MIRTA HERNANDEZ', 'MYRIAM OLIVERAS', 'NANCY HERNANDEZ', 'NEREIDA HERNANDEZ', 'NORMA BAEZ QUEVEDO', 'NORMA SARNELLI', 'RAQUEL CABALLERO', 'RITA M. PEREZ PERAZA', 'ROSA MORALES', 'SILVIA SANCHEZ HERNANDEZ', 'TEODOMIRA BEJERANO', 'VICTOR COLLAZO', 'YARISEL PEREZ', 'YBONNE YGLESIAS'];

    function disableAllBlocks() {
        const modalTitle = document.querySelector('h5.modal-title.ng-binding');
        const existingLabel = document.querySelector(
            'label.kt-checkbox.kt-checkbox--brand.ng-binding.ng-scope[ng-if="!isMissed.value"]'
        );

        if (modalTitle && targetNames.some(name => modalTitle.textContent.includes(name))) {
            console.log(`A target name found in modal title. Disabling blocks...`);

            const blocks = document.querySelectorAll('div.d-flex > label.kt-radio.kt-radio--bold');
            blocks.forEach(label => {
                const parentDiv = label.closest('div.d-flex');
                if (parentDiv && !parentDiv.classList.contains('consent-required')) {
                    parentDiv.classList.add('consent-required');

                    const inputs = parentDiv.querySelectorAll('input, button, select, textarea');
                    inputs.forEach(input => {
                        input.disabled = true;
                        input.style.pointerEvents = 'none';
                        input.style.opacity = '0.5';
                    });
                    console.log('Block disabled:', parentDiv);
                }
            });

            if (existingLabel) {
                addConsentCheckbox(existingLabel);
            } else {
                console.error('Specified label for consent checkbox not found.');
            }
        } else {
            console.log('No target names found in modal title. Skipping...');
        }
    }

    function addConsentCheckbox(existingLabel) {
        if (!document.querySelector('.single-consent-checkbox-container')) {
            const container = document.createElement('div');
            container.className = 'single-consent-checkbox-container';
            container.style.textAlign = 'center';
            container.style.marginTop = '10px';

            const label = document.createElement('label');
            label.className = 'kt-checkbox kt-checkbox--brand';
            label.style.color = 'red';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';

            label.appendChild(checkbox);
            label.appendChild(
                document.createTextNode(' I would like to adjust this Molina patient')
            );
            label.appendChild(document.createElement('span'));

            container.appendChild(label);

            existingLabel.insertAdjacentElement('afterend', container);

            checkbox.addEventListener('change', function () {
                const blocks = document.querySelectorAll('.consent-required');
                blocks.forEach(block => {
                    const inputs = block.querySelectorAll('input, button, select, textarea');
                    if (checkbox.checked) {
                        inputs.forEach(input => {
                            input.disabled = false;
                            input.style.pointerEvents = 'auto';
                            input.style.opacity = '1';
                        });
                    } else {
                        inputs.forEach(input => {
                            input.disabled = true;
                            input.style.pointerEvents = 'none';
                            input.style.opacity = '0.5';
                        });
                    }
                });
                console.log(`Consent checkbox toggled: ${checkbox.checked}`);
            });

            console.log('Consent checkbox added below the specified label.');
        }
    }

    function observeDOMChanges() {
        const observer = new MutationObserver(() => {
            disableAllBlocks();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        console.log('MutationObserver initialized.');
    }

    disableAllBlocks();
    observeDOMChanges();
})();
