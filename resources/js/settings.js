'use strict';

window.addEventListener('load', init);

function init() {
    window.removeEventListener('load', init);

    document.getElementById('load').style.opacity = 0;
}