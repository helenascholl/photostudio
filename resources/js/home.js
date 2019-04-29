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
                accountInfo.style.width = '7vmax';
                accountInfo.style.height = '3.5vmax';

                setTimeout(appear, 500);
            } else {
                appear();
            }

            sessionStorage.setItem('link', '../');
        }
    });

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
    } else {
        scroll.addEventListener('click', () => {
            document.getElementById('html').style.scrollBehavior = 'smooth';
        });
    }

    for (let button of document.getElementsByClassName('editor')) {
        button.addEventListener('click', () => {
            navigateTo('./editor');
        });
    }
    document.getElementById('openInfo').addEventListener('click', () => {
        let accountInfo = document.getElementById('accountInfo').style;

        if (accountInfo.width !== '12vmax') {
            accountInfo.width = '12vmax';
            accountInfo.height = '15.3vmax';
        } else {
            accountInfo.width = '7vmax';
            accountInfo.height = '3.5vmax';
        }
    });
    document.getElementById('yourPhotos').addEventListener('click', () => {
        navigateTo('./yourphotos');
    });
    document.getElementById('changePassword').addEventListener('click', changePassword)
    document.getElementById('logOut').addEventListener('click', () => {
        firebase.auth().signOut();
    });
    document.getElementById('logIn').addEventListener('click', () => {
        navigateTo('./account');
    });
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', mousemove);

    window.removeEventListener('load', init);

    document.getElementById('load').style.opacity = 0;
}

function changePassword() {
    let oldPassword = document.getElementById('oldPassword');
    let newPassword = document.getElementById('newPassword');
    let confirm = document.getElementById('confirm');

    if (newPassword.value === confirm.value) {
        firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, oldPassword.value)).then(() => {
            firebase.auth().currentUser.updatePassword(newPassword.value);
        });
    }

    // TODO: finish
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
