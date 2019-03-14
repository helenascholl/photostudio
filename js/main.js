'use strict';

const WORKSPACE_WIDTH = innerWidth - 80;
const WORKSPACE_HEIGHT = innerHeight - 80;
const WORKSPACE_LEFT = 40;
const WORKSPACE_TOP = 40;
let background;
let ctxBackground;
let selectedArea = [];
let selection;
let ctxSelection;
let layers;
let selectedLayer = null;
let tool = 'select_layer';
let selectedColor = '#ffffff';

window.addEventListener('load', init);

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

    selectedArea = [WORKSPACE_LEFT, WORKSPACE_TOP, background.width + WORKSPACE_TOP, background.height + WORKSPACE_LEFT];

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
        }
    }
}

function freeSelect(event) {
    let addCoordinates = (event) => {
        selectedArea.push({x: event.clientX - WORKSPACE_LEFT, y: event.clientY - WORKSPACE_TOP});
        ctxSelection.lineTo(selectedArea[selectedArea.length - 1].x, selectedArea[selectedArea.length - 1].y);

        ctxSelection.lineWidth = 2.5;
        ctxSelection.strokeStyle = '#000000';
        ctxSelection.stroke();

        ctxSelection.lineWidth = 1.5;
        ctxSelection.strokeStyle = '#ffffff';
        ctxSelection.stroke();

        ctxSelection.lineWidth = 1;
    };

    let removeMouseMove = () => {
        drawSelectedArea();

        window.removeEventListener('mousemove', addCoordinates);
        window.removeEventListener('mouseup', removeMouseMove);
    }

    selectedArea = [{x: event.clientX - WORKSPACE_LEFT, y: event.clientY - WORKSPACE_TOP}];

    ctxSelection.beginPath();
    ctxSelection.moveTo(selectedArea[0].x, selectedArea[0].y);

    window.addEventListener('mousemove', addCoordinates);
    window.addEventListener('mouseup', removeMouseMove);
}

function fill(event) {
    if (selectedLayer !== null) {
        let maxZIndex = '0';

        for (let layer of layers.childNodes) {
            if (event.clientX >= parseFloat(layer.style.left) && event.clientX <= parseFloat(layer.style.left) + layer.width && event.clientY >= parseFloat(layer.style.top) && event.clientY <= parseFloat(layer.style.top) + layer.height && parseFloat(maxZIndex) < parseFloat(layer.style.zIndex)) {
                maxZIndex = layer.style.zIndex;
            }
        }

        if (selectedLayer.style.zIndex === maxZIndex) {
            let ctx = selectedLayer.getContext('2d');
            let left = parseFloat(selectedLayer.style.left) - WORKSPACE_LEFT;
            let top = parseFloat(selectedLayer.style.top) - WORKSPACE_TOP;
            
            ctx.beginPath();
            ctx.moveTo(selectedArea[0].x - left, selectedArea[0].y - top);

            for (let coordinates of selectedArea) {
                ctx.lineTo(coordinates.x - left, coordinates.y - top);
            }

            ctx.lineTo(selectedArea[0].x - left, selectedArea[0].y - top);
            
            ctx.fillStyle = selectedColor;
            ctx.fill();
        }
    }
}

function selectLayer(event) {
    let maxZIndex = '0';

    for (let layer of layers.childNodes) {
        if (event.clientX >= parseFloat(layer.style.left) && event.clientX <= parseFloat(layer.style.left) + layer.width && event.clientY >= parseFloat(layer.style.top) && event.clientY <= parseFloat(layer.style.top) + layer.height && parseFloat(maxZIndex) < parseFloat(layer.style.zIndex)) {
            maxZIndex = layer.style.zIndex;
        }
    }

    for (let layer of layers.childNodes) {
        if (maxZIndex === layer.style.zIndex) {
            let layerLeft = parseFloat(layer.style.left) - WORKSPACE_LEFT;
            let layerTop = parseFloat(layer.style.top) - WORKSPACE_TOP;

            selectedArea = [{x: layerLeft, y: layerTop}, {x: layerLeft + layer.width, y: layerTop}, {x: layerLeft + layer.width, y: layerTop + layer.height}, {x: layerLeft, y: layerTop + layer.height}];
            drawSelectedArea();
            //drawBorder(parseFloat(layer.style.left) - WORKSPACE_LEFT, parseFloat(layer.style.top) - WORKSPACE_TOP, layer.width, layer.height);
            selectedLayer = layer;
        } else {

        }
    }
}

function move(event) {
    let originalPosition = {x: event.clientX, y: event.clientY};

    let moveLayer = (event) => {
        let newLeft = parseFloat(selectedLayer.style.left) + event.clientX - originalPosition.x;
        let newTop = parseFloat(selectedLayer.style.top) + event.clientY - originalPosition.y;
        let layerLeft;
        let layerTop;

        if (newLeft < WORKSPACE_LEFT) {
            selectedLayer.style.left = WORKSPACE_LEFT + 'px';
        } else if (newLeft + selectedLayer.width > WORKSPACE_LEFT + WORKSPACE_WIDTH) {
            selectedLayer.style.left = WORKSPACE_LEFT + WORKSPACE_WIDTH - selectedLayer.width + 'px';
        } else {
            selectedLayer.style.left = newLeft + 'px';
            originalPosition.x = event.clientX;
        }
        
        if (newTop < WORKSPACE_TOP) {
            selectedLayer.style.top = WORKSPACE_TOP + 'px';
        } else if (newTop + selectedLayer.height > WORKSPACE_TOP + WORKSPACE_HEIGHT) {
            selectedLayer.style.top = WORKSPACE_TOP + WORKSPACE_HEIGHT - selectedLayer.height + 'px';
        } else {
            selectedLayer.style.top = newTop + 'px';
            originalPosition.y = event.clientY;
        }

        layerLeft = parseFloat(selectedLayer.style.left) - WORKSPACE_LEFT;
        layerTop = parseFloat(selectedLayer.style.top) - WORKSPACE_TOP;

        selectedArea = [{x: layerLeft, y: layerTop}, {x: layerLeft + selectedLayer.width, y: layerTop}, {x: layerLeft + selectedLayer.width, y: layerTop + selectedLayer.height}, {x: layerLeft, y: layerTop + selectedLayer.height}];
        drawSelectedArea();

        //drawBorder(parseFloat(selectedLayer.style.left) - WORKSPACE_LEFT, parseFloat(selectedLayer.style.top) - WORKSPACE_TOP, selectedLayer.width, selectedLayer.height);
    };

    let removeMouseMove = () => {
        window.removeEventListener('mousemove', moveLayer);
        window.removeEventListener('mouseup', removeMouseMove);
    }

    if (selectedLayer !== null && event.clientX >= parseFloat(selectedLayer.style.left) && event.clientX <= parseFloat(selectedLayer.style.left) + selectedLayer.width && event.clientY >= parseFloat(selectedLayer.style.top) && event.clientY <= parseFloat(selectedLayer.style.top) + selectedLayer.height) {
        window.addEventListener('mousemove', moveLayer);
        window.addEventListener('mouseup', removeMouseMove);
    }
}

function selectRectangle(event) {
    let drawSelection = (eventMouseMove) => {
        let x;
        let y;

        if (eventMouseMove.clientX < WORKSPACE_LEFT) {
            x = WORKSPACE_LEFT;
        } else if (eventMouseMove.clientX > WORKSPACE_LEFT + WORKSPACE_WIDTH) {
            x = WORKSPACE_LEFT + WORKSPACE_WIDTH;
        } else {
            x = eventMouseMove.clientX - WORKSPACE_LEFT;
        }
    
        if (eventMouseMove.clientY < WORKSPACE_TOP) {
            y = WORKSPACE_TOP;
        } else if (eventMouseMove.clientY > WORKSPACE_TOP + WORKSPACE_HEIGHT) {
            y = WORKSPACE_TOP + WORKSPACE_HEIGHT;
        } else {
            y = eventMouseMove.clientY - WORKSPACE_TOP;
        }

        selectedArea = [{x: event.clientX - WORKSPACE_LEFT, y: event.clientY - WORKSPACE_TOP}, {x: x, y: event.clientY - WORKSPACE_TOP}, {x: x, y: y}, {x: event.clientX - WORKSPACE_LEFT, y: y}];
        drawSelectedArea();

        //drawBorder(selectedArea.x1 - WORKSPACE_LEFT, selectedArea.y1 - WORKSPACE_TOP, selectedArea.x2 - selectedArea.x1, selectedArea.y2 - selectedArea.y1);
    };

    let removeMouseMove = () => {
        window.removeEventListener('mousemove', drawSelection);
        window.removeEventListener('mouseup', removeMouseMove);
    };

    /*selectedArea.x1 = event.clientX;
    selectedArea.y1 = event.clientY;*/

    window.addEventListener('mousemove', drawSelection);
    window.addEventListener('mouseup', removeMouseMove);
}

function drawSelectedArea() {
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
    ctxSelection.stroke();

    ctxSelection.setLineDash([]);
}

/*function drawBorder(x, y, width, height) {
    ctxSelection.beginPath();
    ctxSelection.clearRect(0, 0, selection.width, selection.height);
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

    ctxSelection.setLineDash([]);
}*/

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
    }

    event.target.value = '';
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

    selectedArea = [
        {
            x: parseFloat(layer.style.left) - WORKSPACE_LEFT,
            y: parseFloat(layer.style.top) - WORKSPACE_TOP
        },
        {
            x: parseFloat(layer.style.left) - WORKSPACE_LEFT + layer.width,
            y: parseFloat(layer.style.top) - WORKSPACE_TOP
        },
        {
            x: parseFloat(layer.style.left) - WORKSPACE_LEFT + layer.width,
            y: parseFloat(layer.style.top) - WORKSPACE_TOP + layer.height
        },
        {
            x: parseFloat(layer.style.left) - WORKSPACE_LEFT,
            y: parseFloat(layer.style.top) - WORKSPACE_TOP + layer.height
        }
    ];

    drawSelectedArea();

    /*selectedArea.x1 = parseFloat(layer.style.left) - WORKSPACE_LEFT;
    selectedArea.y1 = parseFloat(layer.style.left) - WORKSPACE_TOP;
    selectedArea.x2 = selectedArea.x1 + layer.width;
    selectedArea.y2 = selectedArea.y1 + layer.height;

    drawBorder(selectedArea.x1, selectedArea.y1, layer.width, layer.height);*/

    selectedLayer = layer;

    return layer;
}