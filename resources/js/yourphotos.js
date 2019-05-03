'use strict';

window.addEventListener('load', init);

function init() {
    initFirebase();

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            document.getElementById('popup').style.display = 'block';
        }
    });

    document.getElementById('back').addEventListener('click', () => {
        navigateTo('../');
    });
    document.getElementById('logIn').addEventListener('click', () => {
        sessionStorage.setItem('link', '../yourphotos');
        navigateTo('../account');
    });
    window.removeEventListener('load', init);

    document.getElementById('load').style.opacity = 0;
}

function navigateTo(path) {
    document.getElementById('load').style.opacity = 1;

    setTimeout(() => {
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