window.addEventListener('load', init);

function init() {
    initFirebase();
    initInputs();
    resizeInputPassword();

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            document.getElementById('noAccount').style.display = 'flex';
            document.getElementById('forms').style.display = 'none';
        }
    });

    addKeydownEventListener('changePasswordConfirm', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('changePassword').focus();
            changePassword();
        }
    });
    addKeydownEventListener('changeUsernamePassword', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('changeUsername').focus();
            changeUsername();
        }
    });
    addKeydownEventListener('deleteAccountPassword', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('deleteAccount').focus();
            deleteAccount();
        }
    });

    document.getElementById('logIn').addEventListener('click', () => {
        sessionStorage.setItem('link', '../settings');
        document.getElementById('load').style.opacity = 1;

        setTimeout(() => {
            window.open('../account', '_self');
        }, 500);
    });
    document.getElementById('changePassword').addEventListener('click', changePassword);
    document.getElementById('changeUsername').addEventListener('click', changeUsername);
    document.getElementById('deleteAccount').addEventListener('click', deleteAccount);
    document.getElementById('back').addEventListener('click', () => {
        document.getElementById('load').style.opacity = 1;

        setTimeout(() => {
            window.open('../', '_self');
        }, 500);
    });
    window.addEventListener('resize', resizeInputPassword);

    window.removeEventListener('click', init);

    setTimeout(() => {
        document.getElementById('load').style.opacity = 0;
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

function inputError(id, message) {
    let error;

    if (id.startsWith('changePassword')) {
        error = document.getElementById(`changePasswordError`);
    } else if (id.startsWith('changeUsername')) {
        error = document.getElementById('changeUsernameError');
    } else {
        error = document.getElementById('deleteAccountError');
    }

    error.textContent = message;
    error.style.opacity = 1;

    document.getElementById(`${id}Border`).style.backgroundColor = 'red';
    document.getElementById(`${id}Text`).style.color = 'red';

    return false;
}

function changePassword() {
    let oldPassword = document.getElementById('changePasswordOldPassword');
    let newPassword = document.getElementById('changePasswordNewPassword');
    let confirm = document.getElementById('changePasswordConfirm');
    let text = document.getElementById('changePasswordText').style;
    let spinner = document.getElementById('changePasswordSpinner').style;
    let user = firebase.auth().currentUser;
    let isValid = true;
    
    if (confirm.value !== newPassword.value) {
        isValid = inputError(confirm.id, 'Please enter the same password again.');
    }
    if (!/[^a-zA-Z0-9]/.test(newPassword.value)) {
        isValid = inputError(newPassword.id, 'Your password must contain at least one special character.');
    }
    if (!/[0-9]/.test(newPassword.value)) {
        isValid = inputError(newPassword.id, 'Your password must contain at least one number.');
    }
    if (!/[A-Z]/.test(newPassword.value)) {
        isValid = inputError(newPassword.id, 'Your password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(newPassword.value)) {
        isValid = inputError(newPassword.id, 'Your password must contain at least one lowercase letter.');
    }
    if (newPassword.value.length < 8) {
        isValid = inputError(newPassword.id, 'Your password must contain at least eight characters.');
    }

    if (isValid) {
        text.display = 'none';
        spinner.display = 'block';

        user.reauthenticateAndRetrieveDataWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, oldPassword.value)).then(() => {
            if (oldPassword.value !== newPassword.value) {
                user.updatePassword(newPassword.value).then(() => {
                    let oldPasswordText = document.getElementById('changePasswordOldPasswordText').style;
                    let newPasswordText = document.getElementById('changePasswordNewPasswordText').style;
                    let confirmText = document.getElementById('changePasswordConfirmText').style;
    
                    oldPassword.value = '';
                    newPassword.value = '';
                    confirm.value = '';
    
                    oldPasswordText.fontSize = '2vmin';
                    oldPasswordText.paddingTop = '1.9vmin';
                    newPasswordText.fontSize = '2vmin';
                    newPasswordText.paddingTop = '1.9vmin';
                    confirmText.fontSize = '2vmin';
                    confirmText.paddingTop = '1.9vmin';
    
                    openPopup('Changed password.');
                    
                    text.display = 'block';
                    spinner.display = 'none';
                });
            } else {
                inputError(newPassword.id, 'Please choose a different password.');
                    
                text.display = 'block';
                spinner.display = 'none';
            }
        }).catch(() => {
            text.display = 'block';
            spinner.display = 'none';

            inputError(oldPassword.id, 'Incorrect password.');
        });
    }
}

function changeUsername() {
    let username = document.getElementById('changeUsernameUsername');
    let password = document.getElementById('changeUsernamePassword');
    let text = document.getElementById('changeUsernameText').style;
    let spinner = document.getElementById('changeUsernameSpinner').style;
    let user = firebase.auth().currentUser;
    let isValid = true;

    if (/[^a-z0-9._]/i.test(username.value)) {
        isValid = inputError(username.id, 'Your username must consist of letters, numbers, dots and underscores.');
    }
    if (username.value.length < 4) {
        isValid = inputError(username.id, 'Your username must contain at least four characters.');
    }
    if (username.value === user.displayName) {
        isValid = inputError(username.id, 'Please choose a different username.');
    }

    if (isValid) {
        text.display = 'none';
        spinner.display = 'block';

        user.reauthenticateAndRetrieveDataWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, password.value)).then(() => {
            user.updateProfile({displayName: username.value}).then(() => {
                let usernameText = document.getElementById('changeUsernameUsernameText').style;
                let usernamePasswordText = document.getElementById('changeUsernamePasswordText').style;

                username.value = '';
                password.value = '';

                usernameText.fontSize = '2vmin';
                usernameText.paddingTop = '1.9vmin';
                usernamePasswordText.fontSize = '2vmin';
                usernamePasswordText.paddingTop = '1.9vmin';

                text.display = 'block';
                spinner.display = 'none';

                openPopup(`Changed username to ${user.displayName}.`);
            });
        }).catch(() => {
            text.display = 'block';
            spinner.display = 'none';

            inputError(password.id, 'Incorrect password.');
        });
    }
}

function deleteAccount() {
    let password = document.getElementById('deleteAccountPassword');
    let text = document.getElementById('deleteAccountText').style;
    let spinner = document.getElementById('deleteAccountSpinner').style;
    let user = firebase.auth().currentUser;

    text.display = 'none';
    spinner.display = 'block';

    user.reauthenticateAndRetrieveDataWithCredential(firebase.auth.EmailAuthProvider.credential(user.email, password.value)).then(() => {
        user.delete().then(() => {
            text.display = 'block';
            spinner.display = 'none';

            openPopup('Account deleted.');

            setTimeout(() => {
                document.getElementById('load').style.opacity = 1;
            }, 1000);

            setTimeout(() => {
                window.open('../', '_self');
            }, 1500);
        });
    }).catch(() => {
        text.display = 'block';
        spinner.display = 'none';

        inputError(password.id, 'Incorrect password.');
    });
}

function openPopup(message) {
    let popup = document.getElementById('popup');

    popup.textContent = message;
    popup.style.bottom = '2vh';

    setTimeout(() => {
        popup.style.bottom = '-7vh';
    }, 1700);
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

function initInputs() {
    for (let border of document.getElementsByClassName('inputBorder')) {
        border.style.backgroundColor = 'lightgray';
    }

    for (let icon of document.getElementsByClassName('passwordVisibility')) {
        icon.style.fontSize = '2.5vmin';

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

            if (input.id.startsWith('changePassword')) {
                document.getElementById('changePasswordError').style.opacity = 0;
            } else if (input.id.startsWith('changeUsername')) {
                document.getElementById('changeUsernameError').style.opacity = 0;
            } else {
                document.getElementById('deleteAccountError').style.opacity = 0;
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
    let width = ((40 * innerWidth) / 100 - document.getElementsByClassName('passwordVisibility')[0].clientWidth) * (100 / innerWidth) - 0.5 + 'vw';

    for (let input of document.getElementsByClassName('password')) {
        input.style.width = width;
    }
}
