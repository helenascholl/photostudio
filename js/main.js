const WORKSPACE_WIDTH = 1000;
const WORKSPACE_HEIGHT = 700;
const WORKSPACE_LEFT = 80;
const WORKSPACE_TOP = 80;
let background;
let ctxBackground;
let selectedArea;
let selection;
let ctxSelection;
let layers;
let selectedLayer;
let tool = 'select rectangle';

addEventListener('load', () => {
    let filename = document.getElementById('filename');

    filename.addEventListener('change', uploadImage);

    layers = document.getElementById('layers');

    background = document.getElementById('background');;
    background.width = WORKSPACE_WIDTH;
    background.height = WORKSPACE_HEIGHT;
    background.style.left = WORKSPACE_LEFT + 'px';
    background.style.top = WORKSPACE_TOP + 'px';

    ctxBackground = background.getContext('2d');
    ctxBackground.rect(0, 0, background.width, background.height);
    ctxBackground.stroke();

    for (let i = 0; i < WORKSPACE_WIDTH / 10; i++) {
        for (let j = 0; j < WORKSPACE_HEIGHT / 10; j++) {
            if (i % 2 === 0 && j % 2 === 0 || i % 2 === 1 && j % 2 === 1) {
                ctxBackground.fillStyle = '#999999';
            } else {
                ctxBackground.fillStyle = '#666666';
            }

            ctxBackground.fillRect(i * 10, j * 10, 10, 10);
        }
    }

    selection = document.getElementById('selection');
    selection.width = WORKSPACE_WIDTH;
    selection.height = WORKSPACE_HEIGHT;
    selection.style.left = WORKSPACE_LEFT + 'px';
    selection.style.top = WORKSPACE_TOP + 'px';

    ctxSelection = selection.getContext('2d');
    ctxSelection.translate(0.5, 0.5);

    selectedArea = { x1: WORKSPACE_LEFT, y1: WORKSPACE_TOP, x2: selection.width + WORKSPACE_TOP, y2: selection.height + WORKSPACE_LEFT };

    selection.addEventListener('mousedown', mouseDown);
});

function mouseDown(event) {
    if (event.button === 0) {
        switch (tool) {
            case 'select rectangle':
                selectRectangle(event);
                break;
            
            case 'move':
                move(event);
                break;
        }
    }
}

function move(event) {
    // doesn't work
    let layer = layers.childNodes[selectedLayer];
    let data = layer.getContext('2d').getImageData(0, 0, layer.width, layer.height).data;

    for (let i = 0; i < data.length; i += 4) {
        for (let j = 0; j < 4; j++) {
            if (i / 4 <= layer.height) {
                data[i + j] = 0;
            } else {
                data[i + j] = undefined;
            }
        }
    }
}

function selectRectangle(event) {
    selectedArea.x1 = event.clientX;
    selectedArea.y1 = event.clientY;

    selection.addEventListener('mousemove', drawSelection);

    selection.addEventListener('mouseup', () => {
        selection.removeEventListener('mousemove', drawSelection);
    });
}

function drawSelection(event) {
    selectedArea.x2 = event.clientX;
    selectedArea.y2 = event.clientY;

    ctxSelection.beginPath();
    ctxSelection.clearRect(0, 0, selection.width, selection.height);
    ctxSelection.rect(selectedArea.x1 - WORKSPACE_LEFT, selectedArea.y1 - WORKSPACE_TOP, selectedArea.x2 - selectedArea.x1, selectedArea.y2 - selectedArea.y1);
    ctxSelection.setLineDash([5, 5]);
    ctxSelection.lineWidth = 1;
    ctxSelection.strokeStyle = '#000000';
    ctxSelection.stroke();

    ctxSelection.beginPath();
    ctxSelection.rect(selectedArea.x1 - WORKSPACE_LEFT, selectedArea.y1 - WORKSPACE_TOP, selectedArea.x2 - selectedArea.x1, selectedArea.y2 - selectedArea.y1);
    ctxSelection.setLineDash([0, 5, 5, 0]);
    ctxSelection.strokeStyle = '#ffffff';
    ctxSelection.stroke();
}

function uploadImage(event) {
    let fileExtension = event.target.value.split('.').pop().toLowerCase();
    let supportedFileExtensions = ['jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'jfi', 'png'];
    let fileIsSupported = false;

    for (let extension of supportedFileExtensions) {
        if (fileExtension === extension) {
            fileIsSupported = true;
        }
    }

    if (fileIsSupported) {
        let layer = createNewLayer();
        let img = new Image();

        img.src = URL.createObjectURL(event.target.files[0]);

        img.addEventListener('load', () => {
            layer.getContext('2d').drawImage(img, 0, 0);
        });
    } else if (fileExtension !== '') {
        alert('File format is not supported!');
        event.target.value = "";
    }
}

function createNewLayer() {
    let layer = document.createElement('canvas');

    layer.width = background.width;
    layer.height = background.height;
    layer.style.left = WORKSPACE_LEFT +'px';
    layer.style.top = WORKSPACE_TOP +'px';
    
    layers.appendChild(layer);

    selectedLayer = layers.childNodes.length - 1;

    return layer;
}