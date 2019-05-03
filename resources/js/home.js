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

        // confirm email
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
    window.addEventListener('click', openInfo);
    document.getElementById('yourPhotos').addEventListener('click', () => {
        navigateTo('./yourphotos');
    });
    document.getElementById('changePassword').addEventListener('click', changePassword);
    document.getElementById('changeEmail').addEventListener('click', changeEmail);
    document.getElementById('deleteAccount').addEventListener('click', deleteAccount);
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

function openInfo() {
    let accountInfo = document.getElementById('accountInfo');

    if (!accountInfo.contains(event.target)) {
        accountInfo.style.width = '7vmax';
        accountInfo.style.height = '3.5vmax';
    } else if (event.target === document.getElementById('openInfo') || event.target === document.getElementById('openInfoText')) {
        if (accountInfo.style.width !== '12vmax') {
            accountInfo.style.width = '12vmax';
            accountInfo.style.height = '15.3vmax';
        } else {
            accountInfo.style.width = '7vmax';
            accountInfo.style.height = '3.5vmax';
        }
    }
}

function changePassword() {
    let oldPassword = document.getElementById('oldPassword');
    let newPassword = document.getElementById('newPassword');
    let confirm = document.getElementById('confirm');
    let user = firebase.auth().currentUser;

    if (newPassword.value === confirm.value) {
        user.reauthenticateAndRetrieveDataWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, oldPassword.value)).then(() => {
            user.updatePassword(newPassword.value);
        });
    } else {
        // error
    }
}

function changeEmail() {
    let email = document.getElementById('email');
    let password = document.getElementById('emailPassword');
    let user = firebase.auth().currentUser;

    user.reauthenticateAndRetrieveDataWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, password.value)).then(() => {
        user.updateEmail(email.value);
        // confirm email
    });
}

function deleteAccount() {
    // delete account
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
