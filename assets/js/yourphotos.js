'use strict';

window.addEventListener('load', init);

function init() {
    let newName = document.getElementById('newName');
    let rename = document.getElementById('rename');

    initFirebase();
    initRenamePopup();

    let focusEvent = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('rename').focus();
            renamePhoto();
        }
    };

    firebase.auth().onAuthStateChanged(authStateChanged);

    document.getElementById('back').addEventListener('click', () => {
        navigateTo('../');
    });
    document.getElementById('logIn').addEventListener('click', () => {
        sessionStorage.setItem('link', '../yourphotos');
        navigateTo('../account');
    });
    document.getElementById('download').addEventListener('click', downloadPhoto);
    document.getElementById('edit').addEventListener('click', editPhoto);
    document.getElementById('openRenamePopup').addEventListener('click', openRenamePopup);
    document.getElementById('rename').addEventListener('click', renamePhoto);
    document.getElementById('delete').addEventListener('click', deletePhoto);
    document.getElementById('close').addEventListener('click', closeRenamePopup);
    newName.addEventListener('focus', () => {
        window.addEventListener('keydown', focusEvent);
    });
    newName.addEventListener('blur', () => {
        window.removeEventListener('keydown', focusEvent);
    });
    rename.addEventListener('focus', () => {
        window.addEventListener('keydown', focusEvent);
    });
    rename.addEventListener('blur', () => {
        window.removeEventListener('keydown', focusEvent);
    });
    window.removeEventListener('load', init);

    document.getElementById('load').style.opacity = 0;
}

function closeRenamePopup() {
    let renamePopup = document.getElementById('renamePopup').style;
    let newName = document.getElementById('newName');

    document.getElementById('wrapper').style.pointerEvents = 'none';
    renamePopup.transform = 'scale(0, 0)';
    renamePopup.opacity = 0;

    newName.value = '';
    newName.focus();
    newName.blur();
}

function authStateChanged(user) {
    let loader = document.getElementById('loader').style;
    let photos = document.getElementById('photos').style;
    let noAccount = document.getElementById('noAccount').style;

    if (user) {
        firebase.database().ref(`images/${user.uid}`).once('value').then((snapshot) => {
            let data = snapshot.val();

            if (data) {
                createPhotos(data);
            } else {
                document.getElementById('noPhotos').style.display = 'flex';
            }

            photos.display = 'block';
            loader.opacity = 0;
            noAccount.opacity = 0;
    
            setTimeout(() => {
                photos.opacity = 1;
                loader.display = 'none';
                noAccount.display = 'none';
            }, 200);
        }).catch((error) => {
            console.error(error.message);
        });
    } else {
        noAccount.display = 'flex';
        loader.opacity = 0;
        photos.opacity = 0;

        setTimeout(() => {
            noAccount.opacity = 1;
            loader.display = 'none';
            photos.display = 'none';
        }, 200);
    }
}

function openRenamePopup() {
    let contextmenu = document.getElementById('contextmenu').style;
    let renamePopup = document.getElementById('renamePopup').style;

    contextmenu.height = 0;

    setTimeout(() => {
        contextmenu.display = 'none';
    }, 100);

    document.getElementById('wrapper').style.pointerEvents = 'all';

    renamePopup.transform = 'scale(1, 1)';
    renamePopup.opacity = 1;

    setTimeout(() => {
        document.getElementById('newName').focus();
    }, 200);
}

function initRenamePopup() {
    let newName = document.getElementById('newName');
    let renameText = document.getElementById('renameText').style;
    let renameBorder = document.getElementById('renameBorder').style;

    newName.addEventListener('focus', () => {
        renameText.fontSize = '1.1vmin';
        renameText.paddingTop = '0';
        renameText.color = 'black';

        document.getElementById('renameError').style.opacity = 0;

        renameBorder.backgroundColor = 'rgb(0, 191, 255)';
    });

    newName.addEventListener('blur', () => {
        if (!newName.value) {
            renameText.fontSize = '2vmin';
            renameText.paddingTop = '1.9vmin';
        }

        renameBorder.backgroundColor = 'lightgray';
    });
}

function navigateTo(path) {
    document.getElementById('load').style.opacity = 1;

    setTimeout(() => {
        window.open(path, '_self');
    }, 500);
}

function downloadPhoto() {
    let contextmenu = document.getElementById('contextmenu');
    let photo = contextmenu.selectedPhoto.filename;

    firebase.storage().ref(`images/${firebase.auth().currentUser.uid}/${photo}`).getDownloadURL().then((url) => {
        let xhr = new XMLHttpRequest();

        xhr.responseType = 'blob';
        xhr.addEventListener('load', () => {
            let a = document.createElement('a');

            a.href = URL.createObjectURL(xhr.response);
            a.download = photo.split('-')[0];
            a.click();
        });
        xhr.open('GET', url);
        xhr.send();
    }).catch((error) => {
        console.error(error.message);
    });

    contextmenu.style.height = 0;

    setTimeout(() => {
        contextmenu.style.display = 'none';
    }, 100);
}

function editPhoto() {
    sessionStorage.setItem('image', document.getElementById('contextmenu').selectedPhoto.filename);
    document.getElementById('load').style.opacity = 1;

    setTimeout(() => {
        window.open('../editor', '_self');
    }, 500);
}

function renamePhoto() {
    let buttonLoader = document.getElementById('buttonLoader').style;

    if (buttonLoader.display !== 'flex') {
        let input = document.getElementById('newName');
        let isValid = true;

        if (/[^a-z0-9_]/i.test(input.value)) {
            isValid = inputError('The filename must consist of letters, numbers and underscores.');
        }
        if (!input.value) {
            isValid = inputError('Please enter a new name.');
        }

        if (isValid) {
            let contextmenu = document.getElementById('contextmenu');
            let buttonText = document.getElementById('buttonText').style;
            let renameText = document.getElementById('renameText');
            let photo = contextmenu.selectedPhoto.filename;
            let currentDate = new Date();
            let newName = `${document.getElementById('newName').value}.${photo.split('-')[0].split('.')[1]}-${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth() + 1}-${currentDate.getUTCDate()}-${currentDate.getUTCHours()}-${currentDate.getUTCMinutes()}-${currentDate.getUTCSeconds()}`
            let ref = firebase.storage().ref(`images/${firebase.auth().currentUser.uid}/${photo}`);

            renameText.fontSize = '2vmin';
            renameText.paddingTop = '1.9vmin';
            renameText.color = 'black';

            document.getElementById('renameError').style.opacity = 0;
            document.getElementById('renameBorder').style.backgroundColor = 'lightgray';

            buttonText.display = 'none';
            buttonLoader.display = 'flex';

            ref.getDownloadURL().then((url) => {
                let xhr = new XMLHttpRequest();

                xhr.responseType = 'blob';
                xhr.addEventListener('load', () => {
                    ref.delete().then(() => {
                        firebase.storage().ref(`images/${firebase.auth().currentUser.uid}/${newName}`).put(xhr.response).then(() => {
                            let filenameDiv = contextmenu.selectedPhoto.childNodes[1];
                            let renamePopup = document.getElementById('renamePopup');
                            let renameText = document.getElementById('renameText');

                            filenameDiv.style.opacity = 0;

                            setTimeout(() => {
                                filenameDiv.innerText = newName.split('-')[0];
                                filenameDiv.title = newName.split('-')[0];
                                filenameDiv.style.opacity = 1;
                            }, 200);

                            contextmenu.selectedPhoto.filename = newName;

                            buttonText.display = 'block';
                            buttonLoader.display = 'none';

                            document.getElementById('wrapper').style.pointerEvents = 'none';

                            renameText.fontSize = '2vmin';
                            renameText.paddingTop = '1.9vmin';

                            renamePopup.style.transform = 'scale(0, 0)';
                            renamePopup.style.opacity = 0;

                            input.value = '';

                            input.focus();
                            input.blur();
                        }).catch((error) => {
                            console.error(error.message);
                        });
                    }).catch((error) => {
                        console.error(error.message);
                    });
                });
                xhr.open('GET', url);
                xhr.send();
            }).catch((error) => {
                console.error(error.message);
            });

            firebase.database().ref(`images/${firebase.auth().currentUser.uid}`).once('value').then((snapshot) => {
                let data = snapshot.val();
                let newData = [];

                for (let filename of data) {
                    if (filename !== photo) {
                        newData.push(filename);
                    }
                }

                newData.push(newName);

                firebase.database().ref(`images/${firebase.auth().currentUser.uid}`).set(newData).catch((error) => {
                    console.error(error.message);
                });
            }).catch((error) => {
                console.error(error.message);
            });
        }
    }
}

function deletePhoto() {
    let contextmenu = document.getElementById('contextmenu');
    let photo = contextmenu.selectedPhoto.filename;
    
    firebase.storage().ref(`images/${firebase.auth().currentUser.uid}/${photo}`).delete().then(() => {
        document.getElementById('photos').removeChild(contextmenu.selectedPhoto);
    }).catch((error) => {
        console.error(error.message);
    });

    firebase.database().ref(`images/${firebase.auth().currentUser.uid}`).once('value').then((snapshot) => {
        let data = snapshot.val();
        let newData = [];

        for (let filename of data) {
            if (filename !== photo) {
                newData.push(filename);
            }
        }

        firebase.database().ref(`images/${firebase.auth().currentUser.uid}`).set(newData).catch((error) => {
            console.error(error.message);
        });
    }).catch((error) => {
        console.error(error.message);
    });

    contextmenu.style.height = 0;

    setTimeout(() => {
        contextmenu.style.display = 'none';
    }, 100);
}

function inputError(message) {
    let error = document.getElementById('renameError');

    error.textContent = message;
    error.style.opacity = 1;

    document.getElementById('renameBorder').style.backgroundColor = 'red';
    document.getElementById('renameText').style.color = 'red';

    return false;
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
        photos.addEventListener('scroll', () => {
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
        }, delay += 50);
    }
}

function openContextmenu(event) {
    let contextmenu = document.getElementById('contextmenu');
    let photo = event.target;

    while (photo.className !== 'photo') {
        photo = photo.parentNode;
    }

    contextmenu.selectedPhoto = photo;

    event.preventDefault();

    if (contextmenu.style.height === '16vmin') {
        contextmenu.style.height = '0';

        setTimeout(() => {
            contextmenu.style.left = event.clientX + 'px';
            contextmenu.style.top = event.clientY + 'px';
            contextmenu.style.height = '16vmin';
        }, 100);
    } else {
        contextmenu.style.display = 'block';
        contextmenu.style.left = event.clientX + 'px';
        contextmenu.style.top = event.clientY + 'px';

        setTimeout(() => {
            contextmenu.style.height = '16vmin';
        }, 50);
    }
}