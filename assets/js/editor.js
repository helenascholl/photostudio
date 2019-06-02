'use strict';

const SUPPORTED_FILE_EXTENSIONS = [
    '.png',
    '.jpg',
    '.jpeg',
    '.jpe',
    '.jif',
    '.jfif',
    '.jfi'
];
const CURSORS = {
    select_layer: 'pointer',
    select_rectangle: 'crosshair',
    free_select: 'crosshair',
    move: 'move',
    fill: 'default',
    draw: 'default'
};
let workspaceWidth;
let workspaceHeight;
let workspaceTop;
let fullImage;
let scrollPosition;
let selection;
let ctxSelection;
let layers;
let selectedArea = [];
let selectedLayer = null;
let tool = 'select_layer';
let selectedColor;
let clipboard;
let brushDiameter = 10;
let layerCounter = 0;

window.addEventListener('load', init);

function init() {
    let file = document.getElementById('file');

    selection = document.getElementById('selection');
    ctxSelection = selection.getContext('2d');
    layers = document.getElementById('layers');
    selectedColor = document.getElementById('selectedColor');
    scrollPosition = {
        x: 0,
        y: 0
    };

    resize();
    initSavePopup();
    initFirebase();
    addKeydownEventListeners();

    file.title = '';
    file.accept = SUPPORTED_FILE_EXTENSIONS[0];

    for (let i = 0; i < SUPPORTED_FILE_EXTENSIONS.length; i++) {
        file.accept += `, ${SUPPORTED_FILE_EXTENSIONS[i]}`;
    }

    firebase.auth().onAuthStateChanged(authStateChanged);

    for (let element of document.getElementsByClassName('tool')) {
        element.addEventListener('click', () => {
            tool = element.id;
            layers.style.cursor = CURSORS[element.id];
        });
    }

    document.getElementById('back').addEventListener('click', back);
    file.addEventListener('change', uploadImage);
    document.getElementById('uploadImage').addEventListener('click', uploadImageToDatabase);
    document.getElementById('openAddLayerPopup').addEventListener('click', openAddLayerPopup);
    document.getElementById('addLayerWidth').addEventListener('change', validateAddLayerWidth);
    document.getElementById('addLayerHeight').addEventListener('change', validateAddLayerHeight);
    document.getElementById('cancelAddLayer').addEventListener('click', closeAddLayer);
    document.getElementById('close').addEventListener('click', closeSavePopup);
    document.getElementById('addLayer').addEventListener('click', () => {
        closeAddLayer();
        addEmptyLayer();
    });
    layers.addEventListener('mousedown', mousedown);
    layers.addEventListener('scroll', scrollLayers);
    document.getElementById('openSavePopup').addEventListener('click', () => {
        if (createImage()) {
            openSavePopup();
        }
    });
    selectedColor.addEventListener('change', drawSelectedColor);
    document.getElementById('download').addEventListener('click', download);
    window.addEventListener('keydown', keydown);
    window.addEventListener('resize', resize);

    window.removeEventListener('load', init);

    document.getElementById('load').style.opacity = 0;
}

function resize() {
    let styledSelectedColor = document.getElementById('styledSelectedColor');
    let ctx = styledSelectedColor.getContext('2d');
    let imgData;
    let color = toRgb(selectedColor.value);

    workspaceWidth = innerWidth / 100 * 85;
    workspaceHeight = innerHeight / 100 * 95;
    workspaceTop = innerHeight / 100 * 5;
    
    selection.width = workspaceWidth;
    selection.height = workspaceHeight;

    styledSelectedColor.width = innerWidth / 100 * 6;
    styledSelectedColor.height = innerWidth / 100 * 3;

    imgData = ctx.getImageData(0, 0, styledSelectedColor.width, styledSelectedColor.height);

    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = color[0];
        imgData.data[i + 1] = color[1];
        imgData.data[i + 2] = color[2];
        imgData.data[i + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
}

function initSavePopup() {
    let filename = document.getElementById('filename');
    let filenameText = document.getElementById('filenameText').style;
    let filenameBorder = document.getElementById('filenameBorder').style;
    let fileExtension = document.getElementById('fileExtension');

    filename.addEventListener('focus', () => {
        filenameText.fontSize = '1.1vmin';
        filenameText.paddingTop = '0';
        filenameText.color = 'black';

        document.getElementById('saveError').style.opacity = 0;

        filenameBorder.backgroundColor = 'rgb(0, 191, 255)';
    });

    filename.addEventListener('blur', () => {
        if (!filename.value) {
            filenameText.fontSize = '2vmin';
            filenameText.paddingTop = '1.9vmin';
        }

        filenameBorder.backgroundColor = 'lightgray';
    });

    for (let extension of SUPPORTED_FILE_EXTENSIONS) {
        let option = document.createElement('option');

        option.textContent = extension;
        option.value = extension;

        fileExtension.appendChild(option);
    }
}

function addKeydownEventListeners() {
    let downloadKeydown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            download();
        } else if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
        }
    };

    let uploadImageKeydown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            uploadImageToDatabase();
        }
    };

    let filenameKeydown = (event) => {
        if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault();
        }
    };

    let addLayerWidthKeydown = (event) => {
        if (event.key === 'Tab' && event.shiftKey) {
            event.preventDefault();
        }
    };

    let addLayerKeydown = (event) => {
        if (event.key === 'Enter') {
            closeAddLayer();
            addEmptyLayer();
        }
    };

    let cancelAddLayerKeydown = (event) => {
        if (event.key === 'Enter') {
            closeAddLayer();
        } else if (event.key === 'Tab' && !event.shiftKey) {
            event.preventDefault();
        }
    };

    let addKeydownEventListener = (id, callback) => {
        let element = document.getElementById(id);

        element.addEventListener('focus', () => {
            window.addEventListener('keydown', callback);
        });
        element.addEventListener('blur', () => {
            window.removeEventListener('keydown', callback);
        });
    };

    addKeydownEventListener('download', downloadKeydown);
    addKeydownEventListener('uploadImage', uploadImageKeydown);
    addKeydownEventListener('filename', filenameKeydown);
    addKeydownEventListener('addLayerWidth', addLayerWidthKeydown);
    addKeydownEventListener('addLayer', addLayerKeydown);
    addKeydownEventListener('cancelAddLayer', cancelAddLayerKeydown);
}

function authStateChanged(user) {
    if (sessionStorage.getItem('image') && user) {
        firebase.storage().ref(`images/${user.uid}/${sessionStorage.getItem('image')}`).getDownloadURL().then((url) => {
            let xhr = new XMLHttpRequest();

            xhr.responseType = 'blob';
            xhr.addEventListener('load', () => {
                let img = new Image();

                img.src = window.URL.createObjectURL(xhr.response);
                img.addEventListener('load', () => {
                    createNewLayer(img.width, img.height).getContext('2d').drawImage(img, 0, 0);
                });
            });
            xhr.open('GET', url);
            xhr.send();
        }).catch((error) => {
            console.error(error.message);
        });

        sessionStorage.removeItem('image');
    }
}

function back() {
    document.getElementById('load').style.opacity = 1;

    setTimeout(() => {
        window.open('../', '_self');
    }, 500);
}

function uploadImage(event) {
    let img = new Image();

    img.src = URL.createObjectURL(event.target.files[0]);

    img.addEventListener('load', () => {
        createNewLayer(img.width, img.height).getContext('2d').drawImage(img, 0, 0);
    });

    event.target.value = '';
}

function uploadImageToDatabase() {
    let uploadImageLoader = document.getElementById('uploadImageLoader').style;

    if (uploadImageLoader.display !== 'flex') {
        if (validateFilename()) {
            let uploadImageText = document.getElementById('uploadImageText').style;

            uploadImageText.display = 'none';
            uploadImageLoader.display = 'flex';

            if (firebase.auth().currentUser) {
                let currentDate = new Date();
                let filename = `${document.getElementById('filename').value}${document.getElementById('fileExtension').value}-${currentDate.getUTCFullYear()}-${currentDate.getUTCMonth() + 1}-${currentDate.getUTCDate()}-${currentDate.getUTCHours()}-${currentDate.getUTCMinutes()}-${currentDate.getUTCSeconds()}`;
                let path = `images/${firebase.auth().currentUser.uid}`;

                fullImage.toBlob((blob) => {
                    firebase.storage().ref(`${path}/${filename}`).put(blob).then(() => {
                        uploadImageText.display = 'block';
                        uploadImageLoader.display = 'none';
                    }).catch((error) => {
                        console.error(error.message);
                    });
                });

                firebase.database().ref(path).once('value').then((snapshot) => {
                    let data = snapshot.val();

                    if (data) {
                        data.push(filename);
                    } else {
                        data = [filename];
                    }

                    firebase.database().ref(path).set(data).catch((error) => {
                        console.error(error.message);
                    });
                }).catch((error) => {
                    console.error(error.message);
                });
            } else {
                uploadImageText.display = 'block';
                uploadImageLoader.display = 'none';

                inputError('Please log in to save images to Your Photos.', false);
            }
        }
    }
}

function openAddLayerPopup() {
    let addLayerPopup = document.getElementById('addLayerPopup').style;

    document.getElementById('addLayerColor').value = selectedColor.value;
    addLayerPopup.display = 'block';
    
    addLayerWidth.value = 600;
    addLayerHeight.value = 400;

    setTimeout(() => {
        addLayerPopup.opacity = 1;
        addLayerPopup.bottom = '1vw';
    }, 50);
}

function validateAddLayerWidth() {
    let addLayerWidth = document.getElementById('addLayerWidth');

    for (let i = 0; i < addLayerWidth.value.length; i++) {
        if (!/^[0-9]/.test(addLayerWidth.value[i])) {
            addLayerWidth.value = addLayerWidth.value.substring(0, i) + addLayerWidth.value.substring(i + 1);
        }
    }
}

function validateAddLayerHeight() {
    let addLayerHeight = document.getElementById('addLayerHeight');

    for (let i = 0; i < addLayerHeight.value.length; i++) {
        if (!/^[0-9]/.test(addLayerHeight.value[i])) {
            addLayerHeight.value = addLayerHeight.value.substring(0, i) + addLayerHeight.value.substring(i + 1);
        }
    }
}

function closeAddLayer() {
    let addLayerPopup = document.getElementById('addLayerPopup').style;

    addLayerPopup.opacity = 0;
    addLayerPopup.bottom = '2vw';

    setTimeout(() => {
        addLayerPopup.display = 'none';
    }, 100);
}

function closeSavePopup() {
    let savePopup = document.getElementById('savePopup').style;
    let filename = document.getElementById('filename');

    document.getElementById('wrapper').style.pointerEvents = 'none';
    savePopup.transform = 'scale(0, 0)';
    savePopup.opacity = 0;

    filename.value = '';
    filename.focus();
    filename.blur();
}

function addEmptyLayer() {
    let width = document.getElementById('addLayerWidth').value;
    let height = document.getElementById('addLayerHeight').value;
    let ctx = createNewLayer(width, height).getContext('2d');
    let imgData = ctx.getImageData(0, 0, width, height);
    let color = toRgb(document.getElementById('addLayerColor').value);

    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = color[0];
        imgData.data[i + 1] = color[1];
        imgData.data[i + 2] = color[2];
        imgData.data[i + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
}

function mousedown(event) {
    if (event.button === 0) {
        switch (tool) {
            case 'select_layer':
                selectLayer(event);
                break;

            case 'select_rectangle':
                selectRectangle(event);
                break;

            case 'free_select':
                freeSelect(event);
                break;
            
            case 'move':
                move(event);
                break;

            case 'fill':
                fill(event);
                break;

            case 'draw':
                draw(event);
                break;
        }
    }
}

function scrollLayers() {
    for (let coordinates of selectedArea) {
        coordinates.x -= layers.scrollLeft - scrollPosition.x;
        coordinates.y -= layers.scrollTop - scrollPosition.y;
    }

    scrollPosition = {
        x: layers.scrollLeft,
        y: layers.scrollTop
    };

    drawSelectedArea();
}

function createImage() {
    if (layers.childNodes.length > 0) {
        let sortedLayers = sortByZIndex(layers.childNodes);
        let left = parseFloat(layers.childNodes[0].style.left);
        let top = parseFloat(layers.childNodes[0].style.top);
        let right = parseFloat(layers.childNodes[0].style.left) + layers.childNodes[0].width;
        let bottom = parseFloat(layers.childNodes[0].style.top) + layers.childNodes[0].height;
        let ctx;
        let imgData;

        fullImage = document.createElement('canvas');
        ctx = fullImage.getContext('2d');

        for (let layer of sortedLayers) {
            if (parseFloat(layer.style.left) < left) {
                left = parseFloat(layer.style.left);
            }

            if (parseFloat(layer.style.top) < top) {
                top = parseFloat(layer.style.top);
            }

            if (parseFloat(layer.style.left) + layer.width > right) {
                right = parseFloat(layer.style.left) + layer.width;
            }

            if (parseFloat(layer.style.top) + layer.height > bottom) {
                bottom = parseFloat(layer.style.top) + layer.height;
            }
        }

        fullImage.width = right - left;
        fullImage.height = bottom - top;

        imgData = ctx.getImageData(0, 0, fullImage.width, fullImage.height);

        for (let i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = 255;
            imgData.data[i + 1] = 255;
            imgData.data[i + 2] = 255;
            imgData.data[i + 3] = 0;
        }

        for (let layer of sortedLayers) {
            let data = layer.getContext('2d').getImageData(0, 0, layer.width, layer.height).data;

            for (let i = 0; i < layer.height; i++) {
                let canvasIndex = (fullImage.width * 4) * (parseInt(layer.style.top) - top + i) + (parseInt(layer.style.left) - left) * 4;
                let layerIndex = layer.width * 4 * i;

                for (let j = 0; j < layer.width * 4; j += 4) {
                    let alphaA = data[layerIndex + j + 3];
                    let alphaB = imgData.data[canvasIndex + j + 3];
                    let alphaC = alphaA + (255 - alphaA) * alphaB;

                    imgData.data[canvasIndex + j] = (alphaA * data[layerIndex + j] + (255 - alphaA) * alphaB * imgData.data[canvasIndex + j]) / alphaC;
                    imgData.data[canvasIndex + j + 1] = (alphaA * data[layerIndex + j + 1] + (255 - alphaA) * alphaB * imgData.data[canvasIndex + j + 1]) / alphaC;
                    imgData.data[canvasIndex + j + 2] = (alphaA * data[layerIndex + j + 2] + (255 - alphaA) * alphaB * imgData.data[canvasIndex + j + 2]) / alphaC;
                    imgData.data[canvasIndex + j + 3] = alphaC;
                }
            }
        }

        ctx.putImageData(imgData, 0, 0);

        return true;
    }

    return false;
}

function openSavePopup() {
    let savePopup = document.getElementById('savePopup').style;

    document.getElementById('wrapper').style.pointerEvents = 'all';
    savePopup.transform = 'scale(1, 1)';
    savePopup.opacity = 1;

    setTimeout(() => {
        document.getElementById('filename').focus();
    }, 200);
}

function drawSelectedColor() {
    let styledSelectedColor = document.getElementById('styledSelectedColor');
    let ctx = styledSelectedColor.getContext('2d');
    let imgData = ctx.getImageData(0, 0, styledSelectedColor.width, styledSelectedColor.height);
    let color = toRgb(selectedColor.value);

    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = color[0];
        imgData.data[i + 1] = color[1];
        imgData.data[i + 2] = color[2];
        imgData.data[i + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
}

function download() {
    if (validateFilename()) {
        let a = document.createElement('a');
        let fileExtension = document.getElementById('fileExtension').value;
        let mimeType = 'image/';

        if (fileExtension[1] === 'j') {
            mimeType += 'jpeg';
        } else {
            mimeType += fileExtension.substring(1);
        }

        a.href = fullImage.toDataURL(mimeType);
        a.download = document.getElementById('filename').value + fileExtension;
        a.click();
    }
}

function keydown(event) {
    switch (event.key.toLowerCase()) {
        case 'c':
            if (event.ctrlKey) {
                copy();
            }
            break;

        case 'x':
            if (event.ctrlKey) {
                if (copy()) {
                    deleteSelectedArea();
                }
            }
            break;

        case 'v':
            if (event.ctrlKey) {
                paste();
            }
            break;

        case 'o':
            if (event.ctrlKey) {
                event.preventDefault();
                document.getElementById('file').click();
            }
            break;

        case 's':
            if (event.ctrlKey) {
                event.preventDefault();
                if (createImage()) {
                    openSavePopup();
                }
            }
            break;

        case 'delete':
            deleteSelectedArea();
            break;
    }
}

function copy() {
    if (selectedLayer) {
        let pathCanvas = document.createElement('canvas');
        let pathCtx = pathCanvas.getContext('2d');
        let pathImageData;
        let copy = document.createElement('canvas');
        let copyCtx = copy.getContext('2d');
        let copyImageData;
        let selectedLayerImageData = selectedLayer.getContext('2d').getImageData(0, 0, selectedLayer.width, selectedLayer.height);
        let left = parseFloat(selectedLayer.style.left);
        let top = parseFloat(selectedLayer.style.top);

        pathCanvas.width = selectedLayer.width;
        pathCanvas.height = selectedLayer.height;

        copy.width = selectedLayer.width;
        copy.height = selectedLayer.height;
        copyImageData = copyCtx.getImageData(0, 0, copy.width, copy.height);

        pathCtx.moveTo(selectedArea[0].x - left + layers.scrollLeft, selectedArea[0].y - top + layers.scrollTop);

        for (let coordinates of selectedArea) {
            pathCtx.lineTo(coordinates.x - left + layers.scrollLeft, coordinates.y - top + layers.scrollTop);
        }

        pathCtx.lineTo(selectedArea[0].x - left + layers.scrollLeft, selectedArea[0].y - top + layers.scrollTop);
        pathCtx.fill();

        pathCtx.globalCompositeOperation = 'destination-in';

        pathCtx.drawImage(selectedLayer, 0, 0);

        pathImageData = pathCtx.getImageData(0, 0, pathCanvas.width, pathCanvas.height);


        for (let i = 0; i < selectedLayerImageData.data.length; i += 4) {
            let isInSelectedArea = false;

            for (let j = 0; j < 4 && !isInSelectedArea; j++) {
                if (pathImageData.data[i + j] !== 0) {
                    isInSelectedArea = true;
                }
            }

            if (isInSelectedArea) {
                copyImageData.data[i] = selectedLayerImageData.data[i];
                copyImageData.data[i + 1] = selectedLayerImageData.data[i + 1];
                copyImageData.data[i + 2] = selectedLayerImageData.data[i + 2];
                copyImageData.data[i + 3] = selectedLayerImageData.data[i + 3];
            } else {
                copyImageData.data[i] = 255;
                copyImageData.data[i + 1] = 255;
                copyImageData.data[i + 2] = 255;
                copyImageData.data[i + 3] = 0;
            }
        }

        copyCtx.putImageData(copyImageData, 0, 0);

        clipboard = copy;

        return true;
    }
}

function paste() {
    if (clipboard) {
        createNewLayer(clipboard.width, clipboard.height).getContext('2d')
        .putImageData(clipboard.getContext('2d').getImageData(0, 0, clipboard.width, clipboard.height), 0, 0);
    }
}

function deleteSelectedArea() {
    if (selectedLayer) {
        let pathCanvas = document.createElement('canvas');
        let pathCtx = pathCanvas.getContext('2d');
        let pathImageData;
        let selectedLayerCtx = selectedLayer.getContext('2d');
        let selectedLayerImageData = selectedLayerCtx.getImageData(0, 0, selectedLayer.width, selectedLayer.height);
        let left = parseFloat(selectedLayer.style.left);
        let top = parseFloat(selectedLayer.style.top);

        pathCanvas.width = selectedLayer.width;
        pathCanvas.height = selectedLayer.height;

        pathCtx.moveTo(selectedArea[0].x - left + layers.scrollLeft, selectedArea[0].y - top + layers.scrollTop);

        for (let coordinates of selectedArea) {
            pathCtx.lineTo(coordinates.x - left + layers.scrollLeft, coordinates.y - top + layers.scrollTop);
        }

        pathCtx.lineTo(selectedArea[0].x - left + layers.scrollLeft, selectedArea[0].y - top + layers.scrollTop);
        pathCtx.fill();

        pathCtx.globalCompositeOperation = 'destination-in';

        pathCtx.drawImage(selectedLayer, 0, 0);

        pathImageData = pathCtx.getImageData(0, 0, pathCanvas.width, pathCanvas.height);


        for (let i = 0; i < selectedLayerImageData.data.length; i += 4) {
            let isInSelectedArea = false;

            for (let j = 0; j < 4 && !isInSelectedArea; j++) {
                if (pathImageData.data[i + j] !== 0) {
                    isInSelectedArea = true;
                }
            }

            if (isInSelectedArea) {
                selectedLayerImageData.data[i] = 255;
                selectedLayerImageData.data[i + 1] = 255;
                selectedLayerImageData.data[i + 2] = 255;
                selectedLayerImageData.data[i + 3] = 0;
            }
        }

        selectedLayerCtx.putImageData(selectedLayerImageData, 0, 0);
    }
}

function validateFilename() {
    let filename = document.getElementById('filename').value;
    let isValid = true;

    if (/[^a-z0-9_]/i.test(filename)) {
        isValid = inputError('The filename must consist of letters, numbers and underscores.');
    }
    if (!filename) {
        isValid = inputError('Please enter a filename.');
    }

    return isValid;
}

function toRgb(hexcode) {
    let rgbColor = [
        hexcode.substring(1, 3),
        hexcode.substring(3, 5),
        hexcode.substring(5, 7)
    ];

    for (let i = 0; i < rgbColor.length; i++) {
        let decNumber = 0;

        for (let j = 0; j < rgbColor[i].length; j++) {
            let digit;

            switch(rgbColor[i][j]) {
                case 'a':
                    digit = 10;
                    break;

                case 'b':
                    digit = 11;
                    break;

                case 'c':
                    digit = 12;
                    break;

                case 'd':
                    digit = 13;
                    break;

                case 'e':
                    digit = 14;
                    break;

                case 'f':
                    digit = 15;
                    break;

                default:
                    digit = parseInt(rgbColor[i][j]);
                    break;
            }

            decNumber += digit * 16 ** (1 - j);
        }

        rgbColor[i] = decNumber;
    }

    return rgbColor;
}

function inputError(message, filenameError) {
    let error = document.getElementById('saveError');

    error.textContent = message;
    error.style.opacity = 1;

    if (filenameError) {
        document.getElementById('filenameText').style.backgroundColor = 'red';
        document.getElementById('filenameBorder').style.color = 'red';
    }

    return false;
}

function sortByZIndex(array) {
    let i = array.lenght - 1;
    let swapped;

    do {
        swapped = false;

        for (let j = 0; j < i; i++) {
            if (parseFloat(array[j].style.zIndex) > parseFloat(array[j + 1].style.zIndex)) {
                let help = array[j];
                array[j] = array[j + 1];
                array[j + 1] = help;

                swapped = true;
            }
        }

        i--;
    } while (swapped && i > 0);

    return array;
}

function drawSelectedArea() {
    if (selectedArea != []) {
        ctxSelection.beginPath();
        ctxSelection.clearRect(0, 0, selection.width, selection.height);
        ctxSelection.moveTo(selectedArea[0].x, selectedArea[0].y);
        ctxSelection.setLineDash([5, 5]);
        ctxSelection.strokeStyle = '#000000';

        for (let coordinates of selectedArea) {
            ctxSelection.lineTo(coordinates.x, coordinates.y);
        }

        ctxSelection.lineTo(selectedArea[0].x, selectedArea[0].y);
        ctxSelection.stroke();

        ctxSelection.beginPath();
        ctxSelection.moveTo(selectedArea[0].x, selectedArea[0].y);
        ctxSelection.setLineDash([0, 5, 5, 0]);
        ctxSelection.strokeStyle = '#ffffff';

        for (let coordinates of selectedArea) {
            ctxSelection.lineTo(coordinates.x, coordinates.y);
        }

        ctxSelection.lineTo(selectedArea[0].x, selectedArea[0].y);
        ctxSelection.lineCap = 'butt';
        ctxSelection.lineJoin = 'butt';
        ctxSelection.stroke();

        ctxSelection.setLineDash([]);
    }
}

function createNewLayer(width, height) {
    let layer = document.createElement('canvas');
    let layerDivs = document.getElementById('layerDivs');
    let childNodes = layerDivs.childNodes;
    let layerDiv = document.createElement('div');
    let left = document.createElement('div');
    let up = document.createElement('i');
    let down = document.createElement('i');
    let name = document.createElement('span');

    layer.width = width;
    layer.height = height;
    layer.style.left = 0;
    layer.style.top = 0;
    layer.style.zIndex = layerCounter;
    layer.id = `layer${layerCounter}`;

    up.className = 'material-icons';
    up.textContent = 'keyboard_arrow_up';
    down.className = 'material-icons';
    down.textContent = 'keyboard_arrow_down';

    selection.style.zIndex = layerCounter + 1;
    document.getElementById('addLayerPopup').style.zIndex = layerCounter + 2;
    document.getElementById('savePopup').style.zIndex = layerCounter + 2;
    document.getElementById('load').style.zIndex = layerCounter + 3;
    
    layers.appendChild(layer);

    selectedArea = [
        {
            x: parseFloat(layer.style.left) - layers.scrollLeft,
            y: parseFloat(layer.style.top) - layers.scrollTop
        }, {
            x: parseFloat(layer.style.left) + layer.width - layers.scrollLeft,
            y: parseFloat(layer.style.top) - layers.scrollTop
        }, {
            x: parseFloat(layer.style.left) + layer.width - layers.scrollLeft,
            y: parseFloat(layer.style.top) + layer.height - layers.scrollTop
        }, {
            x: parseFloat(layer.style.left) - layers.scrollLeft,
            y: parseFloat(layer.style.top) + layer.height - layers.scrollTop
        }
    ];

    layerDiv.addEventListener('click', () => {
        for (let div of document.getElementsByClassName('layerDiv')) {
            div.style.backgroundColor = 'transparent';
        }

        layerDiv.style.backgroundColor = 'white';

        selectedArea = [
            {
                x: parseFloat(layer.style.left),
                y: parseFloat(layer.style.top)
            }, {
                x: parseFloat(layer.style.left) + layer.width,
                y: parseFloat(layer.style.top)
            }, {
                x: parseFloat(layer.style.left) + layer.width,
                y: parseFloat(layer.style.top) + layer.height
            }, {
                x: parseFloat(layer.style.left),
                y: parseFloat(layer.style.top) + layer.height
            }
        ];

        drawSelectedArea();

        selectedLayer = layer;
    });

    up.addEventListener('click', () => {
        let swapped = false;

        for (let i = 1; i < childNodes.length && !swapped; i++) {
            if (childNodes[i] === layerDiv) {
                let layerAbove = document.getElementById(childNodes[i - 1].id.replace('Div', '')).style;

                layerAbove.zIndex = parseFloat(layerAbove.zIndex) - 1;
                layer.style.zIndex = parseFloat(layer.style.zIndex) + 1;

                layerDivs.insertBefore(layerDiv, childNodes[i - 1]);

                swapped = true;
            }
        }
    });

    down.addEventListener('click', () => {
        let swapped = false;

        for (let i = 0; i < childNodes.length - 1 && !swapped; i++) {
            if (childNodes[i] === layerDiv) {
                let layerBelow = document.getElementById(childNodes[i + 1].id.replace('Div', '')).style;

                layerBelow.zIndex = parseFloat(layerBelow.zIndex) + 1;
                layer.style.zIndex = parseFloat(layer.style.zIndex) - 1;

                layerDivs.insertBefore(childNodes[i + 1], layerDiv);

                swapped = true;
            }
        }
    });

    for (let div of document.getElementsByClassName('layerDiv')) {
        div.style.backgroundColor = 'transparent';
    }

    name.textContent = `Layer #${layerCounter + 1}`;
    name.title = `Layer #${layerCounter}`;
    layerDiv.className = 'layerDiv';
    layerDiv.style.backgroundColor = 'white';
    layerDiv.id = `layer${layerCounter}Div`;

    layerCounter++;

    left.appendChild(up);
    left.appendChild(down);
    layerDiv.appendChild(left);
    layerDiv.appendChild(name);

    if (childNodes.length > 0) {
        layerDivs.insertBefore(layerDiv, childNodes[0]);
    } else {
        layerDivs.appendChild(layerDiv);
    }

    drawSelectedArea();

    selectedLayer = layer;

    return layer;
}