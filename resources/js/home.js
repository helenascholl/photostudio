'use strict';

let background;
let lastCoordinates;

window.addEventListener('load', init);

function init() {
    let popup = document.getElementById('popup');
    let logInPopup = document.getElementById('logInPopup');
    let createAccountPopup = document.getElementById('createAccountPopup');

    firebase.initializeApp({
        apiKey: "AIzaSyAXDk6pM8wT-6AbE-gl7li9oRmelyfUsbM",
        authDomain: "webprojekt-bf181.firebaseapp.com",
        databaseURL: "https://webprojekt-bf181.firebaseio.com",
        projectId: "webprojekt-bf181",
        storageBucket: "webprojekt-bf181.appspot.com",
        messagingSenderId: "403269192570"
    });

    particlesJS.load('particles-js', 'resources/js/particles.json');

    initInputs();

    popup.style.top = '-60vh';

    background = document.getElementById('particles-js');
    resize();

    document.getElementById('close').addEventListener('click', () => {
        popup.style.top = '-60vh';
    });
    document.getElementById('logIn').addEventListener('click', () => {
        popup.style.top = '20vh';
    });
    document.getElementById('switchToLogIn').addEventListener('click', () => {
        logInPopup.style.left = '0';
        createAccountPopup.style.left = '30vw';
    });
    document.getElementById('switchToCreateAccount').addEventListener('click', () => {
        logInPopup.style.left = '-30vw';
        createAccountPopup.style.left = '0';
    });
    document.getElementById('scroll').addEventListener('click', () => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $('#content').offset().top
        }, 750);
    });
    document.getElementById('edit').addEventListener('click', edit);
    document.getElementById('createAccount').addEventListener('click', createAccount);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', mousemove);
    window.removeEventListener('load', init);
}

function resize() {
    background.style.width = innerWidth + innerWidth / 75 + 'px';
    background.style.height = innerHeight + innerHeight / 75 + 'px';

    background.style.marginLeft = (parseFloat(background.style.width) - innerWidth) / -2 + 'px';
    background.style.marginTop = (parseFloat(background.style.height) - innerHeight) / -2 + 'px';

    resizeInputPassword();
}

function mousemove(event) {
    if (lastCoordinates !== undefined) {
        background.style.marginLeft = parseFloat(background.style.marginLeft) + (event.clientX - lastCoordinates.x) / 150 + 'px';
        background.style.marginTop = parseFloat(background.style.marginTop) + (event.clientY - lastCoordinates.y) / 150 + 'px';
    }
    
    lastCoordinates = {x: event.clientX, y: event.clientY};
}

function edit() {
    let load = document.getElementById('load');

    load.style.opacity = 1;

    setTimeout(() => {
        window.open('./editor/', '_self');
    }, 500);
}

function createAccount() {
    let isValid = true;
    let username = document.getElementById('createAccountUsername');
    let email = document.getElementById('createAccountEmail');
    let password = document.getElementById('createAccountPassword');
    let confirm = document.getElementById('createAccountConfirm');

    if (confirm.value !== password.value) {
        isValid = inputError(confirm.id, 'Please enter the same password again.');
    }
    if (!/[^a-zA-Z0-9]/.test(password.value)) {
        isValid = inputError(password.id, 'Your password must contain at least one special character.');
    }
    if (!/[0-9]/.test(password.value)) {
        isValid = inputError(password.id, 'Your password must contain at least one number.');
    }
    if (!/[A-Z]/.test(password.value)) {
        isValid = inputError(password.id, 'Your password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password.value)) {
        isValid = inputError(password.id, 'Your password must contain at least one lowercase letter.');
    }
    if (password.value.length < 8) {
        isValid = inputError(password.id, 'Your password must contain at least eight characters.');
    }
    if (email.value === '') {
        isValid = inputError(email.id, 'You must enter an email to create an account.');    
    }
    if (/[^a-z0-9._]/i.test(username.value)) {
        isValid = inputError(username.id, 'Your username must consist of letters, numbers, dots and underscores.');
    }
    if (username.value.length < 4) {
        isValid = inputError(username.id, 'Your username must contain at least four characters.');
    }

    if (isValid) {
        // TODO: handle errors

        let createUser = firebase.auth().createUserWithEmailAndPassword(email.value, password.value);

        createUser.catch((error) => {
            if (error.code === 'auth/email-already-in-use') {
                inputError('createAccountEmail', error.message);
            }
        });

        createUser.then(() => {
                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                    .then(() => {
                        firebase.auth().signInWithEmailAndPassword(email.value, password.value)
                            .then(() => {
                                firebase.auth().currentUser.updateProfile({displayName: username.value});
                            });
                    });

            });

        
    }
}

function inputError(id, message) {
    let error = document.getElementById(`error`);

    error.style.opacity = 1;
    error.textContent = message;

    document.getElementById(`${id}Border`).style.backgroundColor = 'red';
    document.getElementById(`${id}Text`).style.color = 'red';

    return false;
}

function logIn() {
    // TODO: implement signing in
}

function initInputs() {
    for (let border of document.getElementsByClassName('inputBorder')) {
        border.style.backgroundColor = 'lightgray';
    }

    for (let element of document.getElementsByClassName('passwordVisibility')) {
        element.style.fontSize = '2.5vmin';
    }

    for (let icon of document.getElementsByClassName('passwordVisibility')) {
        icon.addEventListener('click', () => {
            let input = document.getElementById(icon.id.replace('Visibility', ''));

            if (icon.textContent === 'visibility') {
                icon.textContent = 'visibility_off';
                input.type = 'text';
            } else {
                icon.textContent = 'visibility';
                input.type = 'password';
            }
        });
    }

    for (let input of document.getElementsByTagName('input')) {
        let text = document.getElementById(`${input.id}Text`).style;

        text.color = 'black';
        text.fontSize = '2vmin';
        text.paddingTop = '1.9vmin';

        input.addEventListener('focus', () => {
            text.fontSize = '1.1vmin';
            text.paddingTop = '0';
            text.color = 'black';

            document.getElementById('error').style.opacity = 0;
            document.getElementById(`${input.id}Border`).style.backgroundColor = 'rgb(0, 191, 255)';
        });

        input.addEventListener('blur', () => {
            if (!input.value) {
                text.fontSize = '2vmin';
                text.paddingTop = '1.9vmin';
            }

            document.getElementById(`${input.id}Border`).style.backgroundColor = 'lightgray';
        });
    }
}

function resizeInputPassword() {
    let width = ((20 * innerWidth) / 100 - document.getElementsByClassName('passwordVisibility')[0].clientWidth) * (100 / innerWidth) - 0.5 + 'vw';

    for (let input of document.getElementsByClassName('password')) {
        input.style.width = width;
    }
}