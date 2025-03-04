// ==UserScript==
// @name         Disable Molina/Sunshine
// @namespace    http://tampermonkey.net/
// @version      5.9
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
    'ADA SUAREZ', 'ADIS LOPEZ LEYVA', 'AMPARO DIAZ PENA', 'ANDREA BORGES VILLEGAS', 'ANGEL SANZ',
    'BERTHA ESCOBAR', 'CARMELINA CORDERO FONTE', 'CATALINA WONG SUAREZ', 'CLARA CEA', 'CLAUDIO OVES',
    'CONSUELO CORTES', 'CONSUELO ROQUE', 'ELDA RUENES GONZALEZ', 'ELISA OVES', 'ESTRELLA VELAZQUEZ',
    'EVA DE ARMAS', 'EVA RODRIGUEZ RODRIGUEZ', 'GLADYS FERNANDEZ ALEMA', 'GLADYS GOMEZ', 'HERIBERTA ALEMAN',
    'ISABEL FUENTES', 'JESUS FERRER', 'JORGE STURLA MIRABAL', 'JUANA RODRIGUEZ', 'LEONILO ROJAS BLANCO',
    'LUCAS MARIN GUTIERREZ', 'LUCELLY VELEZ', 'MARIA AGUINAGA', 'MARIA BALLESTER', 'MARIA DIAZ',
    'MARIA JIMENEZ', 'MEDARDO DIAZ', 'MIRIAM GUERRA SERRANO', 'MIRTA HERNANDEZ', 'MYRIAM OLIVERAS',
    'NANCY HERNANDEZ', 'NEREIDA HERNANDEZ', 'NORMA BAEZ QUEVEDO', 'NORMA SARNELLI', 'RAQUEL CABALLERO',
    'RITA M. PEREZ PERAZA', 'ROSA MORALES', 'SILVIA SANCHEZ HERNANDEZ', 'TEODOMIRA BEJERANO', 'VICTOR COLLAZO',
    'YARISEL PEREZ', 'YBONNE YGLESIAS', 'ADELAIDA ABRAHAM', 'AMELIA FLEITES', 'ANASTACIA ALFONSO',
    'ANDREA DIAZ', 'ANTONIA LORENZO CASTAN', 'ANTONIA B. DOMINGUEZ', 'ARELIS E. CARRALERO BERMUDEZ',
    'BECKY PAZ-GARCIA', 'BERTHA MACHADO', 'BLANCA AJETE RODRIGUEZ', 'CARIDAD HERNANDEZ', 'CARIDAD ROCHE',
    'CARLOS A. FANA', 'CARMELO GONZALEZ', 'CARMEN SANTOS', 'CECILIA SANCHEZ GONZALEZ', 'CIRA D. BARCELO TROCHE',
    'DAISY HERNANDEZ RIVERO', 'DANIA R. FERNANDEZ', 'DIANA L. HOOGESTRAAT', 'DIEGO L. RODRIGUEZ',
    'DIGNO CRUZ', 'DULCE FLORES', 'EDDIE CURBELO', 'EDUARDO GONZALEZ RODRIGUEZ', 'ELSA LOPEZ',
    'EMILIA LOPEZ', 'EMMA SANCHEZ', 'ENA ALVAREZ', 'ENRIQUE RODRIGUEZ', 'ESTELA PERAZA',
    'EUSTACIA R. AGUILAR', 'FELICIANO GARCIA', 'FELIPA SALGADO', 'FELIX AGILE', 'FELIX SOCARRAS',
    'FRANCISCO FUENTES', 'FREDESVIND CHAVEZ GARCIA', 'GLIDELMA ESPINOSA VEGA', 'HAYDEE CRIBEIRO',
    'HERLINDA DAVILA DUZU', 'ISAAC GALARZA', 'JOEL CASTILLO', 'JORGE ULLOA', 'JOSE FELIZ',
    'JUANA CASTRESANA LOPEZ', 'JULIO RODRIGUEZ', 'JULIO SARDINAS', 'LIDIA VALDES PENALVE', 'LILIA AGUIAR',
    'MABEL MOYA', 'MARGARITA CRUZ', 'MARIA CORDERO', 'MARIA DE CASTRO', 'MARIA MARTINEZ',
    'MARIA MOREIRA', 'MARIA OSPINA', 'MARIA PADRON', 'MARIA RODRIGUEZ MONT', 'MAYRA LOPEZ',
    'MERCEDES GENTIL', 'MERCEDES D. BOFILL', 'MIRELLA BARREIRO', 'MYRIAM BLANCO POMAR',
    'NIDIA TRUJILLO GOMEZ', 'NIDIA C. ROBLES', 'NIEVES GUERRERO', 'OLGA BALLESTER', 'OLGA DIAZ MORALES',
    'OLGA GARCIA', 'OLGA NAVARRO', 'OLGAMARBEL HERNANDEZ ACOSTA', 'PETRONILA CHAVIANO', 'RAMON A. ARCIS',
    'REYNALDO FERNANDEZ', 'RICARDO AMADOR', 'ROSA SARDINA', 'RUBBY CASTILLO', 'SARA PEREZ',
    'SERGIO CORDERO', 'SILVIA PITA ARCE', 'TERESA AMARO', 'THERESA SMITH', 'TOMAS ROBAINA TEJEDA',
    'WILIANS HERNANDEZ', 'XIOMARA DOMINGUEZ, 'YOLANDA SUAREZ', 'ZENAIDA MOJENA', 'ZENAIDA PICALLO SERRA'
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
