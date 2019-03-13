const WORKSPACE_WIDTH = innerWidth - 80;
const WORKSPACE_HEIGHT = innerHeight - 80;
const WORKSPACE_LEFT = 40;
const WORKSPACE_TOP = 40;
let background;
let ctxBackground;
let selectedArea;
let selection;
let ctxSelection;
let layers;
let selectedLayer = null;
let tool = 'select';

addEventListener('load', init);

function init() {
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
    selection.addEventListener('mousedown', mouseDown);

    ctxSelection = selection.getContext('2d');
    ctxSelection.translate(0.5, 0.5);

    selectedArea = { x1: WORKSPACE_LEFT, y1: WORKSPACE_TOP, x2: selection.width + WORKSPACE_TOP, y2: selection.height + WORKSPACE_LEFT };

    for (let element of document.getElementsByClassName('tool')) {
        element.addEventListener('click', () => {
            tool = element.id;
        });
    }

    window.removeEventListener('load', init);
}

function mouseDown(event) {
    if (event.button === 0) {
        switch (tool) {
            case 'select':
                select(event);
                break;

            case 'select_rectangle':
                selectRectangle(event);
                break;
            
            case 'move':
                move(event);
                break;

            case 'fill':
                fill();
                break;
        }
    }
}

function fill() {
    if (selectedLayer !== null) {

    }
}

function select(event) {
    let maxZIndex = '0';

    for (let layer of layers.childNodes) {
        let layerLeft = WORKSPACE_LEFT + parseInt(layer.style.left);
        let layerTop = WORKSPACE_TOP + parseInt(layer.style.top);

        if (event.clientX >= layerLeft && event.clientX <= layerLeft + layer.width && event.clientY >= layerTop && event.clientY <= layerTop + layer.height && parseInt(maxZIndex) < parseInt(layer.style.zIndex)) {
            maxZIndex = layer.style.zIndex;
        }
    }

    for (let layer of layers.childNodes) {
        if (maxZIndex === layer.style.zIndex) {
            drawBorder(parseInt(layer.style.left) - WORKSPACE_LEFT, parseInt(layer.style.top) - WORKSPACE_TOP, layer.width, layer.height);
            selectedLayer = layer;
        } else {

        }
    }
}

function move(event) {
    let originalPosition = {
        x: event.clientX,
        y: event.clientY
    }

    let moveLayer = (event) => {
        if (selectedLayer =! null) {
            selectedLayer.style.left = parseInt(selectedLayer.style.left) + event.clientX - originalPosition.x + 'px';
            selectedLayer.style.top = parseInt(selectedLayer.style.top) + event.clientY - originalPosition.y + 'px';

            drawBorder(parseInt(selectedLayer.style.left) - WORKSPACE_LEFT, parseInt(selectedLayer.style.top) - WORKSPACE_TOP, selectedLayer.width, selectedLayer.height);

            originalPosition.x = event.clientX;
            originalPosition.y = event.clientY;
        }
    };

    let removeMouseMove = () => {
        window.removeEventListener('mousemove', moveLayer);
        window.removeEventListener('mouseup', removeMouseMove);
    }

    window.addEventListener('mousemove', moveLayer);
    window.addEventListener('mouseup', removeMouseMove);
}

function selectRectangle(event) {
    selectedLayer = null;

    let drawSelection = (event) => {
        if (event.clientX < WORKSPACE_LEFT) {
            selectedArea.x2 = WORKSPACE_LEFT;
        } else if (event.clientX > WORKSPACE_LEFT + WORKSPACE_WIDTH) {
            selectedArea.x2 = WORKSPACE_LEFT + WORKSPACE_WIDTH - 0.5;
        } else {
            selectedArea.x2 = event.clientX;
        }
    
        if (event.clientY < WORKSPACE_TOP) {
            selectedArea.y2 = WORKSPACE_TOP;
        } else if (event.clientY > WORKSPACE_TOP + WORKSPACE_HEIGHT) {
            selectedArea.y2 = WORKSPACE_TOP + WORKSPACE_HEIGHT - 0.5;
        } else {
            selectedArea.y2 = event.clientY;
        }
    
        drawBorder(selectedArea.x1 - WORKSPACE_LEFT, selectedArea.y1 - WORKSPACE_TOP, selectedArea.x2 - selectedArea.x1, selectedArea.y2 - selectedArea.y1);
    };

    let removeMouseMove = () => {
        window.removeEventListener('mousemove', drawSelection);
        window.removeEventListener('mouseup', removeMouseMove);
    };

    selectedArea.x1 = event.clientX;
    selectedArea.y1 = event.clientY;

    window.addEventListener('mousemove', drawSelection);
    window.addEventListener('mouseup', removeMouseMove);
}

function drawBorder(x, y, width, height) {
    ctxSelection.beginPath();
    ctxSelection.clearRect(-0.5, -0.5, selection.width, selection.height);
    ctxSelection.rect(x, y, width, height);
    ctxSelection.setLineDash([5, 5]);
    ctxSelection.lineWidth = 1;
    ctxSelection.strokeStyle = '#000000';
    ctxSelection.stroke();

    ctxSelection.beginPath();
    ctxSelection.rect(x, y, width, height);
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
        let img = new Image();

        img.src = URL.createObjectURL(event.target.files[0]);

        img.addEventListener('load', () => {
            let layer = createNewLayer(img.width, img.height);
            let ctxLayer = layer.getContext('2d');
            
            ctxLayer.drawImage(img, 0, 0);
        });
    } else if (fileExtension !== '') {
        alert('File format is not supported!');
        event.target.value = '';
    }
}

function createNewLayer(width, height) {
    let layer = document.createElement('canvas');
    let zIndex = document.getElementById('layers').childNodes.length + 1;

    layer.width = width;
    layer.height = height;
    layer.style.left = WORKSPACE_LEFT + (WORKSPACE_WIDTH - width) / 2 + 'px';
    layer.style.top = WORKSPACE_TOP + (WORKSPACE_HEIGHT - height) / 2 + 'px';
    layer.style.zIndex = zIndex;

    selection.style.zIndex = zIndex + 1;
    
    layers.appendChild(layer);

    selectedArea.x1 = parseInt(layer.style.left) - WORKSPACE_LEFT;
    selectedArea.y1 = parseInt(layer.style.left) - WORKSPACE_TOP;
    selectedArea.x2 = selectedArea.x1 + layer.width;
    selectedArea.y2 = selectedArea.y1 + layer.height;

    drawBorder(selectedArea.x1, selectedArea.y1, layer.width, layer.height);

    selectedLayer = layer;

    return layer;
}