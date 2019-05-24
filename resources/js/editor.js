'use strict';

const WORKSPACE_WIDTH = innerWidth / 100 * 82;
const WORKSPACE_HEIGHT = innerHeight / 100 * 95;
const WORKSPACE_LEFT = innerWidth / 100 * 3;
const WORKSPACE_TOP = innerHeight / 100 * 5;
const SUPPORTED_FILE_EXTENSIONS = [
    'jpg',
    'jpeg',
    'jpe',
    'jif',
    'jfif',
    'jfi',
    'png'
];
let selection;
let ctxSelection;
let layers;
let selectedArea = [];
let selectedLayer = null;
let tool = 'select_layer';
let selectedColor = '#ffffff';
let layerCounter = 0;

window.addEventListener('load', init);

function init() {
    selection = document.getElementById('selection');
    layers = document.getElementById('layers');
    ctxSelection = selection.getContext('2d');

    selection.width = WORKSPACE_WIDTH;
    selection.height = WORKSPACE_HEIGHT;

    // resize

    for (let element of document.getElementsByClassName('tool')) {
        element.addEventListener('click', () => {
            tool = element.id;
        });
    }

    document.getElementById('back').addEventListener('click', () => {
        document.getElementById('load').style.opacity = 1;

        setTimeout(() => {
            window.open('../', '_self');
        }, 500);
    });
    document.getElementById('filename').addEventListener('change', uploadImage);
    selection.addEventListener('mousedown', mouseDown);

    window.removeEventListener('load', init);

    document.getElementById('load').style.opacity = 0;
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
        let x;
        let y;

        if (event.clientX < WORKSPACE_LEFT) {
            x = 0;
        } else if (event.clientX > WORKSPACE_LEFT + WORKSPACE_WIDTH) {
            x = WORKSPACE_WIDTH;
        } else {
            x = event.clientX - WORKSPACE_LEFT;
        }
    
        if (event.clientY < WORKSPACE_TOP) {
            y = 0;
        } else if (event.clientY > WORKSPACE_TOP + WORKSPACE_HEIGHT) {
            y = WORKSPACE_HEIGHT;
        } else {
            y = event.clientY - WORKSPACE_TOP;
        }

        selectedArea.push({x, y});
        ctxSelection.lineTo(x, y);

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

    selectedArea = [{
            x: event.clientX - WORKSPACE_LEFT,
            y: event.clientY - WORKSPACE_TOP
        }];

    ctxSelection.beginPath();
    ctxSelection.moveTo(selectedArea[0].x, selectedArea[0].y);

    window.addEventListener('mousemove', addCoordinates);
    window.addEventListener('mouseup', removeMouseMove);
}

function fill(event) {
    if (selectedLayer !== null) {
        let maxZIndex = '0';

        for (let layer of layers.childNodes) {
            if (event.clientX >= parseFloat(layer.style.left)
            && event.clientX <= parseFloat(layer.style.left) + layer.width
            && event.clientY >= parseFloat(layer.style.top)
            && event.clientY <= parseFloat(layer.style.top) + layer.height
            && parseFloat(maxZIndex) < parseFloat(layer.style.zIndex)) {
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
        if (event.clientX >= parseFloat(layer.style.left)
        && event.clientX <= parseFloat(layer.style.left) + layer.width
        && event.clientY >= parseFloat(layer.style.top)
        && event.clientY <= parseFloat(layer.style.top) + layer.height
        && parseFloat(maxZIndex) < parseFloat(layer.style.zIndex)) {
            maxZIndex = layer.style.zIndex;
        }
    }

    for (let layer of layers.childNodes) {
        if (maxZIndex === layer.style.zIndex) {
            let layerLeft = parseFloat(layer.style.left) - WORKSPACE_LEFT;
            let layerTop = parseFloat(layer.style.top) - WORKSPACE_TOP;

            selectedArea = [
                {
                    x: layerLeft,
                    y: layerTop
                }, {
                    x: layerLeft + layer.width,
                    y: layerTop
                }, {
                    x: layerLeft + layer.width,
                    y: layerTop + layer.height
                }, {
                    x: layerLeft,
                    y: layerTop + layer.height
                }
            ];
            drawSelectedArea();

            selectedLayer = layer;
        }
    }
}

function move(event) {
    let originalPosition = {
        x: event.clientX,
        y: event.clientY
    };

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

        selectedArea = [
            {
                x: layerLeft,
                y: layerTop
            }, {
                x: layerLeft + selectedLayer.width,
                y: layerTop
            }, {
                x: layerLeft + selectedLayer.width,
                y: layerTop + selectedLayer.height
            }, {
                x: layerLeft,
                y: layerTop + selectedLayer.height
            }
        ];
        drawSelectedArea();
    };

    let removeMouseMove = () => {
        window.removeEventListener('mousemove', moveLayer);
        window.removeEventListener('mouseup', removeMouseMove);
    }

    if (selectedLayer !== null
        && event.clientX >= parseFloat(selectedLayer.style.left)
        && event.clientX <= parseFloat(selectedLayer.style.left) + selectedLayer.width
        && event.clientY >= parseFloat(selectedLayer.style.top)
        && event.clientY <= parseFloat(selectedLayer.style.top) + selectedLayer.height) {
        window.addEventListener('mousemove', moveLayer);
        window.addEventListener('mouseup', removeMouseMove);
    }
}

function selectRectangle(event) {
    let drawSelection = (eventMouseMove) => {
        let x;
        let y;

        if (eventMouseMove.clientX < WORKSPACE_LEFT) {
            x = 0;
        } else if (eventMouseMove.clientX > WORKSPACE_LEFT + WORKSPACE_WIDTH) {
            x = WORKSPACE_WIDTH;
        } else {
            x = eventMouseMove.clientX - WORKSPACE_LEFT;
        }
    
        if (eventMouseMove.clientY < WORKSPACE_TOP) {
            y = 0;
        } else if (eventMouseMove.clientY > WORKSPACE_TOP + WORKSPACE_HEIGHT) {
            y = WORKSPACE_HEIGHT;
        } else {
            y = eventMouseMove.clientY - WORKSPACE_TOP;
        }

        selectedArea = [
            {
                x: event.clientX - WORKSPACE_LEFT,
                y: event.clientY - WORKSPACE_TOP
            }, {
                x,
                y: event.clientY - WORKSPACE_TOP
            }, {
                x,
                y
            }, {
                x: event.clientX - WORKSPACE_LEFT,
                y
            }
        ];
        drawSelectedArea();
    };

    let removeMouseMove = () => {
        window.removeEventListener('mousemove', drawSelection);
        window.removeEventListener('mouseup', removeMouseMove);
    };

    window.addEventListener('mousemove', drawSelection);
    window.addEventListener('mouseup', removeMouseMove);
}

function drawSelectedArea() {
    if (selectedArea != []) {
        ctxSelection.beginPath();
        ctxSelection.clearRect(0, 0, selection.width, selection.height);
        ctxSelection.moveTo(selectedArea[0].x + WORKSPACE_LEFT, selectedArea[0].y + WORKSPACE_TOP);
        ctxSelection.setLineDash([5, 5]);
        ctxSelection.strokeStyle = '#000000';

        for (let coordinates of selectedArea) {
            ctxSelection.lineTo(coordinates.x + WORKSPACE_LEFT, coordinates.y + WORKSPACE_TOP);
        }

        ctxSelection.lineTo(selectedArea[0].x + WORKSPACE_LEFT, selectedArea[0].y + WORKSPACE_TOP);
        ctxSelection.stroke();

        ctxSelection.beginPath();
        ctxSelection.moveTo(selectedArea[0].x + WORKSPACE_LEFT, selectedArea[0].y + WORKSPACE_TOP);
        ctxSelection.setLineDash([0, 5, 5, 0]);
        ctxSelection.strokeStyle = '#ffffff';

        for (let coordinates of selectedArea) {
            ctxSelection.lineTo(coordinates.x + WORKSPACE_LEFT, coordinates.y + WORKSPACE_TOP);
        }

        ctxSelection.lineTo(selectedArea[0].x + WORKSPACE_LEFT, selectedArea[0].y + WORKSPACE_TOP);
        ctxSelection.stroke();

        ctxSelection.setLineDash([]);
    }
}

function uploadImage(event) {
    let fileExtension = event.target.value.split('.').pop().toLowerCase();
    let fileIsSupported = false;

    for (let extension of SUPPORTED_FILE_EXTENSIONS) {
        if (fileExtension === extension) {
            fileIsSupported = true;
        }
    }

    if (fileIsSupported) {
        let img = new Image();

        img.src = URL.createObjectURL(event.target.files[0]);

        img.addEventListener('load', () => {
            createNewLayer(img.width, img.height).getContext('2d').drawImage(img, 0, 0);
        });
    } else if (fileExtension !== '') {
        alert('File format is not supported!');
    }

    event.target.value = '';
}

function createNewLayer(width, height) {
    let layer = document.createElement('canvas');
    let zIndex = document.getElementById('layers').childNodes.length;
    let layerDivs = document.getElementById('layerDivs');
    let layerDiv = document.createElement('div');

    layer.width = width;
    layer.height = height;
    layer.style.left = 0;
    layer.style.top = 0;
    layer.style.zIndex = zIndex;
    layer.id = `layer${layerCounter}`;

    selection.style.zIndex = zIndex + 1;
    document.getElementById('load').style.zIndex = zIndex + 2;
    
    layers.appendChild(layer);

    selectedArea = [
        {
            x: parseFloat(layer.style.left) - WORKSPACE_LEFT,
            y: parseFloat(layer.style.top) - WORKSPACE_TOP
        }, {
            x: parseFloat(layer.style.left) - WORKSPACE_LEFT + layer.width,
            y: parseFloat(layer.style.top) - WORKSPACE_TOP
        }, {
            x: parseFloat(layer.style.left) - WORKSPACE_LEFT + layer.width,
            y: parseFloat(layer.style.top) - WORKSPACE_TOP + layer.height
        }, {
            x: parseFloat(layer.style.left) - WORKSPACE_LEFT,
            y: parseFloat(layer.style.top) - WORKSPACE_TOP + layer.height
        }
    ];

    for (let div of layerDivs.childNodes) {
        div.style.backgroundColor = 'transparent';
    }

    layerDiv.textContent = `Layer #${layerCounter}`;
    layerDiv.id = `layer${layerCounter++}Div`;
    layerDiv.style.backgroundColor = 'white';

    layerDiv.addEventListener('click', (event) => {
        let newSelectedLayer = document.getElementById(layerDiv.id.replace('Div', ''));

        for (let div of layerDivs.childNodes) {
            div.style.backgroundColor = 'transparent';
        }

        event.target.style.backgroundColor = 'white';

        selectedLayer = newSelectedLayer;

        selectedArea = [
            {
                x: parseFloat(newSelectedLayer.style.left) - WORKSPACE_LEFT,
                y: parseFloat(newSelectedLayer.style.top) - WORKSPACE_TOP
            }, {
                x: parseFloat(newSelectedLayer.style.left) - WORKSPACE_LEFT + newSelectedLayer.width,
                y: parseFloat(newSelectedLayer.style.top) - WORKSPACE_TOP
            }, {
                x: parseFloat(newSelectedLayer.style.left) - WORKSPACE_LEFT + newSelectedLayer.width,
                y: parseFloat(newSelectedLayer.style.top) - WORKSPACE_TOP + newSelectedLayer.height
            }, {
                x: parseFloat(newSelectedLayer.style.left) - WORKSPACE_LEFT,
                y: parseFloat(newSelectedLayer.style.top) - WORKSPACE_TOP + newSelectedLayer.height
            }
        ];

        drawSelectedArea();
    });

    layerDivs.appendChild(layerDiv);

    drawSelectedArea();

    selectedLayer = layer;

    return layer;
}
