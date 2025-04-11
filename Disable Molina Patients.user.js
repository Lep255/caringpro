// ==UserScript==
// @name         Disable Molina/Sunshine
// @namespace    http://tampermonkey.net/
// @version      5.15
// @description  Disable specific blocks and allow enabling with a consent checkbox based on a list of names
// @author       You
// @match        https://caringpro.inmyteam.com/*
// @grant        none
// @updateURL    https://github.com/Lep255/caringpro/raw/refs/heads/main/Disable%20Molina%20Patients.user.js
// @downloadURL  https://github.com/Lep255/caringpro/raw/refs/heads/main/Disable%20Molina%20Patients.user.js
// ==/UserScript==

(function () {
    'use strict';

    const targetNames = [
        'ADA HERRERA', 'ADA SUAREZ', 'AMPARO DIAZ PENA', 'ANDREA BORGES VILLEGAS',
        'ANDREA DIAZ', 'ANA VEGA', 'ANTONIA B. DOMINGUEZ', 'ANTONIA LORENZO CASTAN', 'ARELIS E. CARRALERO BERMUDEZ',
        'BARBARA DOMINGUEZ VILA', 'BECKY PAZ-GARCIA', 'BERTHA MACHADO', 'BLANCA AJETE RODRIGUEZ', 'CARMELINA CORDERO FONTE',
        'CARIDAD ROCHE', 'CARLOS A. FANA', 'CARMELO GONZALEZ', 'CARMEN SANTOS', 'CECILIA SANCHEZ GONZALEZ', 'CIRA D. BARCELO TROCHE',
        'CLARA CEA', 'CLARA URIBE', 'CLAUDIO OVES', 'CONSUELO CORTES', 'CONSUELO ROQUE', 'DAISY HERNANDEZ RIVERO', 'DANIA R. FERNANDEZ', 'DIEGO L. RODRIGUEZ',
        'DIGNO CRUZ', 'DIOSELINA MAZO', 'DULCE FLORES', 'EDDIE CURBELO', 'EDUARDO GONZALEZ RODRIGUEZ', 'ELDA RUENES GONZALEZ',
        'ELISA OVES', 'ELSA LOPEZ', 'EMILIA LOPEZ', 'EMMA SANCHEZ', 'ENA ALVAREZ', 'ENRIQUE RODRIGUEZ', 'ESTELA PERAZA', 'ESTRELLA VELAZQUEZ',
        'EUSTACIA R. AGUILAR', 'EVELYN OCHOA', 'FELICIANO GARCIA', 'FELIPA SALGADO', 'FELIX AGILE', 'FELIX SOCARRAS', 'FRANCISCO FUENTES',
        'FREDESVIND CHAVEZ GARCIA', 'GLADYS FERNANDEZ ALEMA', 'GLADYS GOMEZ', 'GLADYS HEVIA', 'GLADYS MARTINEZ CABALLERO', 'GLIDELMA ESPINOSA VEGA',
        'HAYDEE CRIBEIRO', 'HERIBERTA ALEMAN', 'HERLINDA DAVILA DUZU', 'HILDA GAVILANES SANCHEZ', 'ISABEL FUENTES', 'JOEL CASTILLO',
        'JORGE STURLA MIRABAL', 'JORGE ULLOA', 'JOSE FELIZ', 'JUANA CASTRESANA LOPEZ', 'JUANA RODRIGUEZ', 'JULIO RODRIGUEZ', 'JULIO SARDINAS',
        'LIDIA VALDES PENALVE', 'LILIA AGUIAR', 'LUCAS MARIN GUTIERREZ', 'LUCELLY VELEZ', 'MABEL MOYA', 'MARGARITA CRUZ', 'MARIA AGUINAGA', 'MARIA BALLESTER',
        'MARIA CORDERO', 'MARIA DE CASTRO', 'MARIA DIAZ', 'MARIA JIMENEZ', 'MARIA MARTINEZ', 'MARIA MOREIRA', 'MARIA OSPINA', 'MARIA PADRON',
        'MARIA RODRIGUEZ MONT', 'MAYRA LOPEZ', 'MERCEDES D. BOFILL', 'MERCEDES GENTIL', 'MIRELLA BARREIRO', 'MIRIAM GUERRA SERRANO',
        'MYRIAM BLANCO POMAR', 'MYRIAM OLIVERAS', 'NANCY HERNANDEZ', 'NEREIDA HERNANDEZ', 'NIDIA C. ROBLES', 'NIDIA TRUJILLO GOMEZ', 'NORMA BAEZ QUEVEDO', 'NORMA SARNELLI',
        'OLGA BALLESTER', 'OLGA DIAZ MORALES', 'OLGA GARCIA', 'OLGAMARBEL HERNANDEZ ACOSTA', 'PETRONILA CHAVIANO', 'RAQUEL CABALLERO', 'REYNALDO FERNANDEZ', 'RICARDO AMADOR',
        'RITA M. PEREZ PERAZA', 'ROSA MORALES', 'ROSA SARDINA', 'RUBBY CASTILLO', 'SARA PEREZ', 'SERGIO CORDERO', 'SILVIA PITA ARCE', 'SILVIA SANCHEZ HERNANDEZ',
        'TOMAS ROBAINA TEJEDA', 'TERESA AMARO', 'THERESA SMITH', 'VICTOR COLLAZO', 'WILIANS HERNANDEZ', 'XIOMARA DOMINGUEZ', 'YAHIR SANCHEZ',
        'YARISEL PEREZ', 'YOLANDA SUAREZ', 'YBONNE YGLESIAS', 'ZENAIDA MOJENA', 'ZENAIDA PICALLO SERRA','RAMON A. ARCIS', 'LUCIANA C. RODRIGUEZ', 'ANGEL SANZ',
        'CATALINA WONG SUAREZ', 'EVA RODRIGUEZ RODRIGUEZ', 'EVA DE ARMAS', 'JESUS FERRER', 'LEONILO ROJAS BLANCO', 'MEDARDO DIAZ', 'MIRTA HERNANDEZ', 'TEODOMIRA BEJERANO',
        'AMELIA FLEITES', 'ANASTACIA ALFONSO', 'DIANA L. HOOGESTRAAT', 'MARIANELA CARBO'
    ];

    const otherNames = [
        'TERESA FERNANDEZ', 'HAYDEE GONZALEZ', 'BELKIS CRUZ', 'MARIA RODRIGUEZ', 'MARIA HERNANDEZ'
    ];

    function disableAllBlocks() {
    const modalTitle = document.querySelector('h5.modal-title.ng-binding');
    const existingLabel = document.querySelector(
        'label.kt-checkbox.kt-checkbox--brand.ng-binding.ng-scope[ng-if="!isMissed.value"]'
    );

    if (modalTitle) {
        let matchedType = null;

        if (targetNames.some(name => modalTitle.textContent.includes(name))) {
            matchedType = 'red';
        } else if (otherNames.some(name => modalTitle.textContent.includes(name))) {
            matchedType = 'blue';
        }

        if (matchedType) {
            console.log(`A ${matchedType === 'red' ? 'target' : 'possible'} name found in modal title.`);

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
                addConsentCheckbox(existingLabel, matchedType);
            } else {
                console.error('Specified label for consent checkbox not found.');
            }
        } else {
            console.log('No target names found in modal title. Skipping...');
        }
    }
}

function addConsentCheckbox(existingLabel, color) {
    // Check if a consent checkbox already exists
    if (!document.querySelector('.single-consent-checkbox-container')) {
        const container = document.createElement('div');
        container.className = 'single-consent-checkbox-container';
        container.style.textAlign = 'center';
        container.style.marginTop = '10px';

        const label = document.createElement('label');
        label.className = 'kt-checkbox kt-checkbox--brand';
        label.style.color = color === 'red' ? 'red' : 'blue';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        label.appendChild(checkbox);
        label.appendChild(
            document.createTextNode(color === 'red' ? ' Adjust Molina/Sunshine patient' : ' Adjust Molina/Sunshine patient (Maybe)')
        );
        label.appendChild(document.createElement('span'));

        container.appendChild(label);
        existingLabel.insertAdjacentElement('afterend', container);

        checkbox.addEventListener('change', function () {
            const blocks = document.querySelectorAll('.consent-required');
            blocks.forEach(block => {
                const inputs = block.querySelectorAll('input, button, select, textarea');

                if (checkbox.checked) {
                    console.log('Checkbox checked - enabling inputs.');
                    inputs.forEach(input => {
                        input.disabled = false;
                        input.style.pointerEvents = 'auto';
                        input.style.opacity = '1';
                    });

                    // Ensure the radio button can be selected
                    const radioButton = block.querySelector('input[type="radio"]');
                    if (radioButton) {
                        radioButton.disabled = false;
                        radioButton.style.pointerEvents = 'auto';
                        radioButton.style.opacity = '1';
                    }
                } else {
                    console.log('Checkbox unchecked - disabling inputs.');
                    inputs.forEach(input => {
                        input.disabled = true;
                        input.style.pointerEvents = 'none';
                        input.style.opacity = '0.5';
                    });

                    // Disable the radio button again
                    const radioButton = block.querySelector('input[type="radio"]');
                    if (radioButton) {
                        radioButton.disabled = true;
                        radioButton.style.pointerEvents = 'none';
                        radioButton.style.opacity = '0.5';
                    }
                }
            });
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
