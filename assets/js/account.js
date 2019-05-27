'use strict';

let lastKey;

window.addEventListener('load', init);

function init() {
    let rememberMe = document.getElementById('rememberMe');

    let logInKeydown = (event) => {
        if (event.key === 'Enter') {
            logIn();
        }
    };
    let createAccountKeydown = (event) => {
        if (event.key === 'Enter') {
            createAccount();
        }
    };
    let preventTabBack = (event) => {
        if (lastKey === 'Shift' && event.key === 'Tab') {
            event.preventDefault();
        }

        lastKey = event.key;
    };

    rememberMe.checked = false;

    initInputs();
    initFirebase();

    document.getElementById('close').addEventListener('click', () => {
        document.getElementById('load').style.opacity = 1;

        setTimeout(() => {
            if (sessionStorage.getItem('link')) {
                window.open(sessionStorage.getItem('link'), '_self');
            } else {
                window.open('../', '_self');
            }
        }, 500);
    });

    addKeydownEventListener('logInPassword', logInKeydown);
    addKeydownEventListener('createAccountConfirm', createAccountKeydown);
    addKeydownEventListener('logIn', logInKeydown);
    addKeydownEventListener('createAccount', createAccountKeydown);
    addKeydownEventListener('logInEmail', preventTabBack);
    addKeydownEventListener('createAccountUsername', preventTabBack);
    addKeydownEventListener('switchToCreateAccount', (event) => {
        if (event.key === 'Enter') {
            switchToCreateAccount();
        } else if (lastKey !== 'Shift') {
            event.preventDefault();
        }

        lastKey = event.key;
    });
    addKeydownEventListener('switchToLogIn', (event) => {
        if (event.key === 'Enter') {
            switchToLogIn();
        } else if (lastKey !== 'Shift') {
            event.preventDefault();
        }

        lastKey = event.key;
    });
    addKeydownEventListener('rememberMe', (event) => {
        if (event.key === 'Enter') {
            checkRememberMe();
        }
    });
    
    rememberMe.addEventListener('focus', () => {
        rememberMe.style.color = '#7f7f7f';
    });
    rememberMe.addEventListener('blur', () => {
        rememberMe.style.color = 'black';
    });
    document.getElementById('checkbox').addEventListener('click', checkRememberMe);
    document.getElementById('switchToLogIn').addEventListener('click', switchToLogIn);
    document.getElementById('switchToCreateAccount').addEventListener('click', switchToCreateAccount);
    document.getElementById('createAccount').addEventListener('click', createAccount);
    document.getElementById('logIn').addEventListener('click', logIn);

    window.removeEventListener('load', init);

    setTimeout(() => {
        document.getElementById('load').style.opacity = 0;
        document.getElementById('logInEmail').focus();
    }, 200);
}

function addKeydownEventListener(id, callback) {
    document.getElementById(id).addEventListener('focus', () => {
        window.addEventListener('keydown', callback);
    });
    document.getElementById(id).addEventListener('blur', () => {
        window.removeEventListener('keydown', callback);
    });
}

function switchToLogIn() {
    document.getElementById('logInForm').style.left = '0';
    document.getElementById('createAccountForm').style.left = '30vw';

    setTimeout(() => {
        document.getElementById('logInEmail').focus();
    }, 200);
}

function switchToCreateAccount() {
    document.getElementById('logInForm').style.left = '-30vw';
    document.getElementById('createAccountForm').style.left = '0';
    
    setTimeout(() => {
        document.getElementById('createAccountUsername').focus();
    }, 200);
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

function checkRememberMe() {
    let rememberMe = document.getElementById('rememberMe');

    if (rememberMe.textContent === 'check_box') {
        rememberMe.textContent = 'check_box_outline_blank';
        rememberMe.checked = false;
    } else {
        rememberMe.textContent = 'check_box';
        rememberMe.checked = true;
    }
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
        let loader = document.getElementById('createAccountLoader').style;
        let text = document.getElementById('createAccountText').style;

        loader.display = 'flex';
        text.display = 'none';

        firebase.auth().createUserWithEmailAndPassword(email.value, password.value).then(() => {
            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION).then(() => {
                firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(() => {
                    firebase.auth().currentUser.updateProfile({displayName: username.value}).then(() => {
                        document.getElementById('load').style.opacity = 1;

                        setTimeout(() => {
                            if (sessionStorage.getItem('link')) {
                                window.open(sessionStorage.getItem('link'), '_self');
                            } else {
                                window.open('../', '_self');
                            }
                        }, 500);
                    }).catch((error) => {
                        console.log(error.message);
                    });
                }).catch((error) => {
                    console.log(error.message);
                });
            }).catch((error) => {
                console.log(error.message);
            });
        }).catch((error) => {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    inputError('createAccountEmail', error.message);
                    break;

                case 'auth/invalid-email':
                    inputError('createAccountEmail', 'Please enter a valid email address.');
                    break;

                default:
                    inputError('createAccountPassword', 'An error occured while creating an account.');
                    console.log(error.message);
            }
            
            loader.display = 'none';
            text.display = 'block';
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

    error.textContent = message;
    error.style.opacity = 1;

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
        let loader = document.getElementById('logInLoader').style;
        let text = document.getElementById('logInText').style;

        loader.display = 'flex';
        text.display = 'none';

        if (document.getElementById('rememberMe').checked) {
            persistence = firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } else {
            persistence = firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
        }
    
        persistence.then(() => {
            firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(() => {
                document.getElementById('load').style.opacity = 1;

                setTimeout(() => {
                    if (sessionStorage.getItem('link')) {
                        window.open(sessionStorage.getItem('link'), '_self');
                    } else {
                        window.open('../', '_self');
                    }
                }, 500);
            }).catch((error) => {
                loader.display = 'none';
                text.display = 'block';

                if (error.code === 'auth/wrong-password') {
                    inputError(password.id, 'Incorrect email address or password.');
                } else {
                    console.log(error.message);
                }
            });
        }).catch((error) => {
            console.log(error.message);
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
                input.type = 'password';
            } else {
                icon.textContent = 'visibility';
                input.type = 'text';
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
