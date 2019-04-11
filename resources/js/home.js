'use strict';

let background;
let lastCoordinates;

window.addEventListener('load', init);

function init() {
    let scroll = document.getElementById('scroll');

    particlesJS.load('particles-js', 'resources/js/particles.json');

    if (sessionStorage.getItem('scrollY') != null) {
        scrollTo(0, parseFloat(sessionStorage.getItem('scrollY')));
    }

    background = document.getElementById('particles-js');
    resize();

    initFirebase();

    firebase.auth().onAuthStateChanged((user) => {
        let text = document.getElementById('text');

        if (user) {
            text.textContent = 'Account';
        } else {
            text.textContent = 'Log in';
        }

        document.getElementById('placeholder').style.display = 'none';
        document.getElementById('account').style.display = 'flex';
    });

    scroll.style.left = (100 / innerWidth) * (innerWidth - scroll.clientWidth) / 2 + 'vw';

    for (let button of document.getElementsByClassName('editor')) {
        button.addEventListener('click', () => {
            navigateTo('./editor');
        });
    }
    scroll.addEventListener('click', () => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $('#links').offset().top
        }, 750);
    });
    document.getElementById('yourPhotos').addEventListener('click', () => {
        navigateTo('./yourphotos');
    });
    document.getElementById('account').addEventListener('click', () => {
        navigateTo('./account');
    });
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', mousemove);

    window.removeEventListener('load', init);
    
    document.getElementById('load').style.opacity = 0;
}

function resize() {
    background.style.width = innerWidth + innerWidth / 75 + 'px';
    background.style.height = innerHeight + innerHeight / 75 + 'px';

    background.style.marginLeft = (parseFloat(background.style.width) - innerWidth) / -2 + 'px';
    background.style.marginTop = (parseFloat(background.style.height) - innerHeight) / -2 + 'px';
}

function mousemove(event) {
    if (lastCoordinates !== undefined) {
        background.style.marginLeft = parseFloat(background.style.marginLeft) + (event.clientX - lastCoordinates.x) / 150 + 'px';
        background.style.marginTop = parseFloat(background.style.marginTop) + (event.clientY - lastCoordinates.y) / 150 + 'px';
    }
    
    lastCoordinates = {x: event.clientX, y: event.clientY};
}

function navigateTo(path) {
    document.getElementById('load').style.opacity = 1;

    setTimeout(() => {
        sessionStorage.setItem('scrollY', scrollY);
        window.open(path, '_self');
    }, 500);
}

function initFirebase() {
    firebase.initializeApp({
        apiKey: "AIzaSyAXDk6pM8wT-6AbE-gl7li9oRmelyfUsbM",
        authDomain: "webprojekt-bf181.firebaseapp.com",
        databaseURL: "https://webprojekt-bf181.firebaseio.com",
        projectId: "webprojekt-bf181",
        storageBucket: "webprojekt-bf181.appspot.com",
        messagingSenderId: "403269192570"
    });
}