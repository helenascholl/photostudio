'use strict';

let background;
let lastCoordinates;

window.addEventListener('load', init);

function init() {
    let scroll = document.getElementById('scroll');

    particlesJS.load('particles-js', 'resources/js/particles.json');

    background = document.getElementById('particles-js');
    resize();

    initFirebase();

    firebase.auth().onAuthStateChanged(authStateChanged);

    scroll.style.left = (100 / innerWidth) * (innerWidth - scroll.clientWidth) / 2 + 'vw';

    if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) {
        scroll.href = '#';

        scroll.addEventListener('click', () => {
            let interval = setInterval(() => {
                scrollTo(0, scrollY + 20);

                if (scrollY >= innerHeight) {
                    scrollTo(0, innerHeight);
                    clearInterval(interval);
                }
            }, 10);
        });
    }

    for (let popup of document.getElementsByClassName('popup')) {
        popup.style.transform = 'scale(0, 0)';
    }
    for (let button of document.getElementsByClassName('editor')) {
        button.addEventListener('click', () => {
            navigateTo('./editor');
        });
    }
    window.addEventListener('click', openInfo);
    document.getElementById('yourPhotos').addEventListener('click', () => {
        navigateTo('./yourphotos');
    });
    document.getElementById('settings').addEventListener('click', () => {
        navigateTo('./settings');
    });
    document.getElementById('logIn').addEventListener('click', () => {
        sessionStorage.setItem('link', '../');
        navigateTo('./account');
    });
    document.getElementById('logOut').addEventListener('click', () => {
        firebase.auth().signOut();
    });
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', mousemove);

    window.removeEventListener('load', init);

    document.getElementById('load').style.opacity = 0;
}

function authStateChanged(user) {
    let accountInfo = document.getElementById('accountInfo');
    let logIn = document.getElementById('logIn');

    if (user) {
        document.getElementById('spinner').style.opacity = 0;
        document.getElementById('logInText').style.opacity = 0;
        accountInfo.style.display = 'block';

        setTimeout(() => {
            logIn.style.display = 'none';
            document.getElementById('placeholder').style.display = 'none';
            document.getElementById('openInfoText').style.opacity = 1;
        }, 200);

        document.getElementById('username').textContent = user.displayName;
        document.getElementById('username').title = user.displayName;
    } else {
        let appear = () => {
            document.getElementById('openInfoText').style.opacity = 0;
            document.getElementById('spinner').style.opacity = 0;
            logIn.style.display = 'flex';

            setTimeout(() => {
                accountInfo.style.display = 'none';
                document.getElementById('placeholder').style.display = 'none';
                document.getElementById('logInText').style.opacity = 1;
            }, 200);
        }

        if (accountInfo.style.display === 'block') {
            accountInfo.style.width = '10vmin';
            accountInfo.style.height = '4.8vmin';

            setTimeout(appear, 500);
        } else {
            appear();
        }
    }
}

function openInfo() {
    let accountInfo = document.getElementById('accountInfo');

    if (!accountInfo.contains(event.target)) {
        accountInfo.style.width = '10vmin';
        accountInfo.style.height = '4.8vmin';
    } else if (event.target === document.getElementById('openInfo') || event.target === document.getElementById('openInfoText')) {
        if (accountInfo.style.width !== '15vmin') {
            accountInfo.style.width = '15vmin';
            accountInfo.style.height = '16vmin';
        } else {
            accountInfo.style.width = '10vmin';
            accountInfo.style.height = '4.8vmin';
        }
    }
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

    lastCoordinates = {
        x: event.clientX,
        y: event.clientY
    };
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
