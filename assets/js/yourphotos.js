'use strict';

window.addEventListener('load', init);

function init() {
    initFirebase();

    firebase.auth().onAuthStateChanged((user) => {
        let loader = document.getElementById('loader').style;

        if (user) {
            let photos = document.getElementById('photos').style;

            firebase.database().ref(`images/${user.uid}`).once('value').then((snapshot) => {
                let data = snapshot.val();

                if (data) {
                    createPhotos(data);
                } else {
                    document.getElementById('noPhotos').style.display = 'flex';
                }

                photos.display = 'block';
                loader.opacity = 0;
    
                setTimeout(() => {
                    photos.opacity = 1;
                    loader.display = 'none';
                }, 200);
            }).catch((error) => {
                console.log(error.message);
            });
        } else {
            let noAccount = document.getElementById('noAccount').style;

            noAccount.display = 'flex';
            loader.opacity = 0;

            setTimeout(() => {
                noAccount.opacity = 1;
                loader.display = 'none';
            }, 200);
        }
    });

    document.getElementById('back').addEventListener('click', () => {
        navigateTo('../');
    });
    document.getElementById('logIn').addEventListener('click', () => {
        sessionStorage.setItem('link', '../yourphotos');
        navigateTo('../account');
    });
    document.getElementById('download').addEventListener('click', downloadPhoto);
    document.getElementById('rename').addEventListener('click', renamePhoto);
    document.getElementById('delete').addEventListener('click', deletePhoto);
    window.removeEventListener('load', init);

    document.getElementById('load').style.opacity = 0;
}

function navigateTo(path) {
    document.getElementById('load').style.opacity = 1;

    setTimeout(() => {
        window.open(path, '_self');
    }, 500);
}

function downloadPhoto() {
    let photo = document.getElementById('contextmenu').selectedPhoto;

    firebase.storage().ref(`images/${firebase.auth().currentUser.uid}/${photo}`).getDownloadURL().then((url) => {
        let xhr = new XMLHttpRequest();
        let a = document.createElement('a');

        a.download = photo.split('-')[0];

        xhr.responseType = 'blob';
        xhr.addEventListener('load', () => {
            a.href = xhr.response;
        });
        xhr.open('GET', url);
        xhr.send();

        // a.href = url;
        // a.download = photo.split('-')[0];
        // a.click();
    });
}

function renamePhoto() {

}

function deletePhoto() {

}

function createPhotos(data) {
    let delay = 1;

    for (let nameString of data) {
        let photo = document.createElement('div');
        let file = document.createElement('div');
        let filenameDiv = document.createElement('div');
        let fileImage = document.createElement('i');
        let splitNameString = nameString.split('-');
        let filename = splitNameString[0];
        let photos = document.getElementById('photos');

        photo.className = 'photo';
        photo.style.opacity = 0;
        photo.style.transform = 'scale(0, 0)';
        file.className = 'file';
        filenameDiv.className = 'filename';
        fileImage.className = 'fa fa-file-image-o';

        filenameDiv.textContent = filename;
        filenameDiv.title = filename;

        photo.filename = nameString;

        file.addEventListener('contextmenu', openContextmenu);
        photos.addEventListener('click', () => {
            let contextmenu = document.getElementById('contextmenu').style;

            contextmenu.height = '0';

            setTimeout(() => {
                document.getElementById('contextmenu').style.display = 'none';
            }, 100);
        });

        file.appendChild(fileImage);
        photo.appendChild(file);
        photo.appendChild(filenameDiv);
        photos.appendChild(photo);

        setTimeout(() => {
            photo.style.opacity = 1;
            photo.style.transform = 'scale(1, 1)';
        }, delay += 10);
    }
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

function openContextmenu(event) {
    let contextmenu = document.getElementById('contextmenu');
    let photo = event.target;

    while (photo.className !== 'photo') {
        photo = photo.parentNode;
    }

    contextmenu.selectedPhoto = photo.filename;

    event.preventDefault();

    if (contextmenu.style.height === '12vmin') {
        contextmenu.style.height = '0';

        setTimeout(() => {
            contextmenu.style.left = event.clientX + 'px';
            contextmenu.style.top = event.clientY + 'px';
            contextmenu.style.height = '12vmin';
        }, 100);
    } else {
        contextmenu.style.display = 'block';
        contextmenu.style.left = event.clientX + 'px';
        contextmenu.style.top = event.clientY + 'px';

        setTimeout(() => {
            contextmenu.style.height = '12vmin';
        }, 100);
    }
}