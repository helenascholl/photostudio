'use strict';

window.addEventListener('load', init);

function init() {
    initFirebase();

    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            document.getElementById('noAccount').style.display = 'flex';
            document.getElementById('photos').style.display = 'none';
        } else {
            firebase.database().ref(`images/${user.uid}`).once('value').then((snapshot) => {
                let data = snapshot.val();
                let delay = 1;

                if (data) {
                    for (let nameString of data) {
                        let photo = document.createElement('div');
                        let file = document.createElement('div');
                        let filenameDiv = document.createElement('div');
                        let fileImage = document.createElement('i');
                        let splitNameString = nameString.split('-');
                        let filename = splitNameString[0];

                        photo.className = 'photo';
                        photo.style.opacity = 0;
                        photo.style.transform = 'scale(0, 0)';
                        file.className = 'file';
                        filenameDiv.className = 'filename';
                        fileImage.className = 'fa fa-file-image-o';

                        filenameDiv.textContent = filename;
                        filenameDiv.title = filename;

                        photo.filename = nameString;

                        photo.date = {
                            year: splitNameString[1],
                            month: splitNameString[2],
                            day: splitNameString[3],
                            hour: splitNameString[4],
                            minute: splitNameString[5],
                            second: splitNameString[6]
                        };

                        photo.addEventListener('contextmenu', openOptions);

                        file.appendChild(fileImage);
                        photo.appendChild(file);
                        photo.appendChild(filenameDiv);
                        document.getElementById('photos').appendChild(photo);

                        setTimeout(() => {
                            photo.style.opacity = 1;
                            photo.style.transform = 'scale(1, 1)';
                        }, delay += 10);
                    }
                } else {
                    // no photos
                }
            }).catch((error) => {
                console.log(error.message);
            });
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

function openOptions(event) {
    let options = document.getElementById('options');

    event.preventDefault();

    options.style.left = event.clientX + 'px';
    options.style.top = event.clientY + 'px';
    options.style.display = 'flex';
}