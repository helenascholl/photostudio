'use strict';

let background;
let lastCoordinates;

window.addEventListener('load', init);

function init() {
    let popup = document.getElementById('popup');
    let logInPopup = document.getElementById('logInPopup');
    let createAccountPopup = document.getElementById('createAccountPopup');
    let rememberMe = document.getElementById('rememberMe');
    let scroll = document.getElementById('scroll');

    particlesJS.load('particles-js', 'resources/js/particles.json');

    initFirebase();
    initInputs();

    if (sessionStorage.getItem('scrollY') != null) {
        scrollTo(0, parseFloat(sessionStorage.getItem('scrollY')));
    }

    popup.style.top = '-61vh';

    background = document.getElementById('particles-js');
    resize();

    document.getElementById('openAccountPopup').isOpen = false;

    scroll.style.left = (100 / innerWidth) * (innerWidth - scroll.clientWidth) / 2 + 'vw';

    rememberMe.checked = false;

    for (let button of document.getElementsByClassName('editor')) {
        button.addEventListener('click', () => {
            navigateTo('./editor');
        });
    }

    document.getElementById('checkbox').addEventListener('click', () => {
        if (rememberMe.textContent === 'check_box') {
            rememberMe.textContent = 'check_box_outline_blank';
            rememberMe.checked = false;
        } else {
            rememberMe.textContent = 'check_box';
            rememberMe.checked = true;
        }
    });
    document.getElementById('close').addEventListener('click', () => {
        popup.style.top = '-61vh';
    });
    document.getElementById('openLogInPopup').addEventListener('click', () => {
        popup.style.top = '20vh';
    });
    document.getElementById('openAccountPopup').addEventListener('click', openAccountPopup);
    document.getElementById('switchToLogIn').addEventListener('click', () => {
        logInPopup.style.left = '0';
        createAccountPopup.style.left = '30vw';
    });
    document.getElementById('switchToCreateAccount').addEventListener('click', () => {
        logInPopup.style.left = '-30vw';
        createAccountPopup.style.left = '0';
    });
    /*document.getElementById('upload').addEventListener('click', () => {
        // TODO: user can upload files
        // https://stackoverflow.com/questions/41214447/firebase-user-uploads-and-profile-pictures
    });*/
    scroll.addEventListener('click', () => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $('#links').offset().top
        }, 750);
    });
    document.getElementById('logOut').addEventListener('click', () => {
        firebase.auth().signOut();
    });
    document.getElementById('yourPhotos').addEventListener('click', () => {
        navigateTo('./yourphotos');
    });
    document.getElementById('createAccount').addEventListener('click', createAccount);
    document.getElementById('logIn').addEventListener('click', logIn);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', mousemove);

    window.removeEventListener('load', init);
    
    document.getElementById('load').style.opacity = 0;
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

    firebase.auth().onAuthStateChanged((user) => {
        let placeholder = document.getElementById('placeholder');

        if (user) {
            document.getElementById('openLogInPopup').style.display = 'none';
            document.getElementById('openAccountPopup').style.display = 'block';
            document.getElementById('username').textContent = user.displayName;
        } else {
            document.getElementById('openAccountPopup').style.display = 'none';
            document.getElementById('openLogInPopup').style.display = 'flex';
        }

        if (placeholder != null) {
            document.getElementById('body').removeChild(placeholder);
        }
    });
}

function openAccountPopup() {
    let openAccountPopup = document.getElementById('openAccountPopup');
    let accountPopup = document.getElementById('accountPopup');
    let width;
    let height;

    if (openAccountPopup.isOpen) {
        width = '7vmax';
        height = '3.5vmax';

        openAccountPopup.isOpen = false;
    } else {
        if (innerWidth > innerHeight) {
            width = parseFloat(openAccountPopup.style.width) + (100 / innerWidth) * accountPopup.clientWidth + 'vmax';
            height = parseFloat(openAccountPopup.style.height) + (100 / innerWidth) * accountPopup.clientHeight + 'vmax';
        } else {
            width = parseFloat(openAccountPopup.style.width) + (100 / innerHeight) * accountPopup.clientWidth + 'vmax';
            height = parseFloat(openAccountPopup.style.height) + (100 / innerHeight) * accountPopup.clientHeight + 'vmax';
        }

        openAccountPopup.isOpen = true;
    }

    document.getElementById('text').style.width = width;
    openAccountPopup.style.width = width;
    openAccountPopup.style.height = height;
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

function navigateTo(path) {
    document.getElementById('load').style.opacity = 1;

    setTimeout(() => {
        sessionStorage.setItem('scrollY', scrollY);
        window.open(path, '_self');
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
        isValid = inputError(email.id, 'You must enter an email address to create an account.');    
    }
    if (/[^a-z0-9._]/i.test(username.value)) {
        isValid = inputError(username.id, 'Your username must consist of letters, numbers, dots and underscores.');
    }
    if (username.value.length < 4) {
        isValid = inputError(username.id, 'Your username must contain at least four characters.');
    }

    if (isValid) {
        let createUser = firebase.auth().createUserWithEmailAndPassword(email.value, password.value)
            .catch((error) => {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        inputError('createAccountEmail', error.message);
                        break;

                    case 'auth/invalid-email':
                        inputError('createAccountEmail', 'Please enter a valid email address.');
                        break;

                    default:
                        inputError('createAccountPassword', 'An error occured while creating an account.');
                }
        });

        createUser.then(() => {
                firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
                    .then(() => {
                        document.getElementById('openLogInPopup').style.display = 'none';
                        document.getElementById('popup').style.top = '-61vh';

                        firebase.auth().signInWithEmailAndPassword(email.value, password.value)
                            .then(() => {
                                firebase.auth().currentUser.updateProfile({displayName: username.value})
                                    .then(() => {
                                        username.value = '';
                                        email.value = '';
                                        password.value = '';
                                        confirm.value = '';

                                        document.getElementById('username').textContent = firebase.auth().currentUser.displayName;
                                        document.getElementById('logInPopup').style.left = '0';
                                        document.getElementById('createAccountPopup').style.left = '30vw';
                                    });
                            });
                    });
        });
    }
}

function inputError(id, message) {
    let error;

    if (id.startsWith('logIn')) {
        error = document.getElementById(`logInError`);
    } else {
        error = document.getElementById('createAccountError');
    }

    error.style.opacity = 1;
    error.textContent = message;

    document.getElementById(`${id}Border`).style.backgroundColor = 'red';
    document.getElementById(`${id}Text`).style.color = 'red';

    return false;
}

function logIn() {
    let email = document.getElementById('logInEmail');
    let password = document.getElementById('logInPassword');
    let persistence;
    let isValid = true;

    if (password.value === '') {
        isValid = inputError(password.id, 'Please enter a password.');
    }
    if (email.value === '') {
        isValid = inputError(email.id, 'Please enter an email address.');
    }

    if (isValid) {
        if (document.getElementById('rememberMe').checked) {
            persistence = firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } else {
            persistence = firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
        }
    
        persistence.then(() => {
            let signIn = firebase.auth().signInWithEmailAndPassword(email.value, password.value);
            
            signIn.catch(() => {
                inputError(password.id, 'Invalid email adress or password.');
            });

            signIn.then(() => {
                password.value = '';

                document.getElementById('openLogInPopup').style.display = 'none';
                document.getElementById('popup').style.top = '-61vh';
                document.getElementById('username').textContent = firebase.auth().currentUser.displayName;
            });
        });
    }
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

            if (input.id.startsWith('logIn')) {
                document.getElementById('logInError').style.opacity = 0;
            } else {
                document.getElementById('createAccountError').style.opacity = 0;
            }

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