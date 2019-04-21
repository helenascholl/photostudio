'use strict';

window.addEventListener('load', init);

function init() {
    document.getElementById('back').addEventListener('click', () => {
        document.getElementById('load').style.opacity = 1;

        setTimeout(() => {
            window.open('../', '_self');
        }, 500);
    });

    window.removeEventListener('load', init);

    document.getElementById('load').style.opacity = 0;
}
