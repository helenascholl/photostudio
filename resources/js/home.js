'use strict';

let background;
let lastCoordinates;

window.addEventListener('load', init);

function init() {
    let popup = document.getElementById('popup');
    let logInPopup = document.getElementById('logInPopup');
    let createAccountPopup = document.getElementById('createAccountPopup');

    /*firebase.initalizeApp({
        apiKey: "AIzaSyAXDk6pM8wT-6AbE-gl7li9oRmelyfUsbM",
        authDomain: "webprojekt-bf181.firebaseapp.com",
        databaseURL: "https://webprojekt-bf181.firebaseio.com",
        projectId: "webprojekt-bf181",
        storageBucket: "webprojekt-bf181.appspot.com",
        messagingSenderId: "403269192570"
    });*/

    initInputs();

    popup.style.top = '-60vh';

    background = document.getElementById('backgroundImg');
    resize();

    document.getElementById('close').addEventListener('click', () => {
        popup.style.top = '-60vh';
    });
    document.getElementById('logIn').addEventListener('click', () => {
        popup.style.top = '20vh';
    });
    document.getElementById('switchToLogIn').addEventListener('click', () => {
        logInPopup.style.left = '0';
        createAccountPopup.style.left = '50vw';
    });
    document.getElementById('switchToCreateAccount').addEventListener('click', () => {
        logInPopup.style.left = '-50vw';
        createAccountPopup.style.left = '0';
    });
    document.getElementById('scroll').addEventListener('click', () => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $('#content').offset().top
        }, 750);
    });
    document.getElementById('edit').addEventListener('click', edit);
    document.getElementById('createAccount', createAccount);
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', mousemove);
    window.removeEventListener('load', init);
}

function resize() {
    if (background.width / background.height < innerWidth / innerHeight) {
        background.height = background.height / background.width * (innerWidth + innerWidth / 40);
        background.width = innerWidth + innerWidth / 40;
    } else if (background.width / background.height > innerWidth / innerHeight) {
        background.width = background.width / background.height * (innerHeight + innerHeight / 40);
        background.height = innerHeight + innerHeight / 40;
    } else {
        background.width = innerWidth;
        background.height = innerHeight;
    }

    background.style.marginLeft = (background.width - innerWidth) / -2 + 'px';
    background.style.marginTop = (background.height - innerHeight) / -2 + 'px';

    resizeInputPassword();
}

function mousemove(event) {
    if (lastCoordinates !== undefined) {
        background.style.marginLeft = parseFloat(background.style.marginLeft) + (event.clientX - lastCoordinates.x) / 80 + 'px';
        background.style.marginTop = parseFloat(background.style.marginTop) + (event.clientY - lastCoordinates.y) / 80 + 'px';
    }
    
    lastCoordinates = {x: event.clientX, y: event.clientY};
}

function edit() {
    let load = document.getElementById('load');

    load.style.zIndex = 3;
    load.style.opacity = 1;

    setTimeout(() => {
        window.open('./editor/', '_self');
    }, 500);
}

function createAccount() {
    
}

function logIn() {

}

function initInputs() {
    for (let border of document.getElementsByClassName('inputBorder')) {
        border.style.backgroundColor = 'lightgray';
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

        text.fontSize = '2vmin';
        text.paddingTop = '1.9vmin';

        input.addEventListener('focus', () => {
            text.fontSize = '1.1vmin';
            text.paddingTop = '0';

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
