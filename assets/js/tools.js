function selectLayer(event) {
    let maxZIndex = '-1';

    for (let layer of layers.childNodes) {
        if (event.clientX >= parseFloat(layer.style.left)
        && event.clientX <= parseFloat(layer.style.left) + layer.width
        && event.clientY >= parseFloat(layer.style.top) + workspaceTop
        && event.clientY <= parseFloat(layer.style.top) + workspaceTop + layer.height
        && parseFloat(maxZIndex) < parseFloat(layer.style.zIndex)) {
            maxZIndex = layer.style.zIndex;
        }
    }

    for (let layer of layers.childNodes) {
        if (maxZIndex === layer.style.zIndex) {
            let layerLeft = parseFloat(layer.style.left);
            let layerTop = parseFloat(layer.style.top);

            selectedArea = [
                {
                    x: layerLeft - layers.scrollLeft,
                    y: layerTop - layers.scrollTop
                }, {
                    x: layerLeft + layer.width - layers.scrollLeft,
                    y: layerTop - layers.scrollTop
                }, {
                    x: layerLeft + layer.width - layers.scrollLeft,
                    y: layerTop + layer.height - layers.scrollTop
                }, {
                    x: layerLeft - layers.scrollLeft,
                    y: layerTop + layer.height - layers.scrollTop
                }
            ];
            drawSelectedArea();

            selectedLayer = layer;

            for (let layerDiv of document.getElementById('layerDivs').childNodes) {
                layerDiv.style.backgroundColor = 'transparent';
            }

            document.getElementById(`${layer.id}Div`).style.backgroundColor = 'white';
        }
    }
}

function selectRectangle(event) {
    let drawSelection = (eventMouseMove) => {
        let x;
        let y;

        if (eventMouseMove.clientX < 0) {
            x = 0;
        } else if (eventMouseMove.clientX > workspaceWidth) {
            x = workspaceWidth;
        } else {
            x = eventMouseMove.clientX;
        }
    
        if (eventMouseMove.clientY < workspaceTop) {
            y = 0;
        } else if (eventMouseMove.clientY > workspaceTop + workspaceHeight) {
            y = workspaceHeight;
        } else {
            y = eventMouseMove.clientY - workspaceTop;
        }

        selectedArea = [
            {
                x: event.clientX,
                y: event.clientY - workspaceTop
            }, {
                x,
                y: event.clientY - workspaceTop
            }, {
                x,
                y
            }, {
                x: event.clientX,
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

function freeSelect(event) {
    let addCoordinates = (event) => {
        let x;
        let y;

        if (event.clientX < 0) {
            x = 0;
        } else if (event.clientX > workspaceWidth) {
            x = workspaceWidth;
        } else {
            x = event.clientX;
        }
    
        if (event.clientY < workspaceTop) {
            y = 0;
        } else if (event.clientY > workspaceTop + workspaceHeight) {
            y = workspaceHeight;
        } else {
            y = event.clientY - workspaceTop;
        }

        selectedArea.push({x, y});
        ctxSelection.lineTo(x, y);

        ctxSelection.lineCap = 'butt';
        ctxSelection.lineJoin = 'butt';

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
        x: event.clientX,
        y: event.clientY - workspaceTop
    }];

    ctxSelection.beginPath();
    ctxSelection.moveTo(selectedArea[0].x, selectedArea[0].y);

    window.addEventListener('mousemove', addCoordinates);
    window.addEventListener('mouseup', removeMouseMove);
}

function move(event) {
    if (selectedLayer
    && event.clientX >= parseFloat(selectedLayer.style.left) - layers.scrollLeft
    && event.clientX <= parseFloat(selectedLayer.style.left) + selectedLayer.width - layers.scrollLeft
    && event.clientY >= parseFloat(selectedLayer.style.top) + workspaceTop - layers.scrollTop
    && event.clientY <= parseFloat(selectedLayer.style.top) + workspaceTop + selectedLayer.height - layers.scrollTop) {
        let originalPosition = {
            x: event.clientX,
            y: event.clientY
        };

        let moveLayer = (event) => {
            let newLeft = parseFloat(selectedLayer.style.left) + event.clientX - originalPosition.x;
            let newTop = parseFloat(selectedLayer.style.top) + event.clientY - originalPosition.y;
            let layerLeft = parseFloat(selectedLayer.style.left);
            let layerTop = parseFloat(selectedLayer.style.top);

            if (newLeft < 0) {
                selectedLayer.style.left = '0px';

                if (event.clientX >= layerLeft) {
                    originalPosition.x = event.clientX;
                }
            } else {
                selectedLayer.style.left = newLeft + 'px';
                originalPosition.x = event.clientX;
            }
            
            if (newTop < 0) {
                selectedLayer.style.top = '0px';

                if (event.clientY >= layerTop + workspaceTop) {
                    originalPosition.y = event.clientY;
                }
            } else {
                selectedLayer.style.top = newTop + 'px';
                originalPosition.y = event.clientY;
            }

            layerLeft = parseFloat(selectedLayer.style.left);
            layerTop = parseFloat(selectedLayer.style.top);

            selectedArea = [
                {
                    x: layerLeft - layers.scrollLeft,
                    y: layerTop - layers.scrollTop
                }, {
                    x: layerLeft + selectedLayer.width - layers.scrollLeft,
                    y: layerTop - layers.scrollTop
                }, {
                    x: layerLeft + selectedLayer.width - layers.scrollLeft,
                    y: layerTop + selectedLayer.height - layers.scrollTop
                }, {
                    x: layerLeft - layers.scrollLeft,
                    y: layerTop + selectedLayer.height - layers.scrollTop
                }
            ];
            drawSelectedArea();
        };

        let removeMouseMove = () => {
            window.removeEventListener('mousemove', moveLayer);
            window.removeEventListener('mouseup', removeMouseMove);
        }


        window.addEventListener('mousemove', moveLayer);
        window.addEventListener('mouseup', removeMouseMove);
    }
}

function fill(event) {
    if (selectedLayer) {
        let maxZIndex = '-1';

        for (let layer of layers.childNodes) {
            if (event.clientX >= parseFloat(layer.style.left) - layers.scrollLeft
            && event.clientX <= parseFloat(layer.style.left) + layer.width - layers.scrollLeft
            && event.clientY >= parseFloat(layer.style.top) + workspaceTop - layers.scrollTop
            && event.clientY <= parseFloat(layer.style.top) + workspaceTop + layer.height - layers.scrollTop
            && parseFloat(maxZIndex) < parseFloat(layer.style.zIndex)) {
                maxZIndex = layer.style.zIndex;
            }
        }

        if (selectedLayer.style.zIndex === maxZIndex && isInSelectedArea(selectedLayer, event.clientX, event.clientY)) {
            let ctx = selectedLayer.getContext('2d');
            let left = parseFloat(selectedLayer.style.left);
            let top = parseFloat(selectedLayer.style.top);
            
            ctx.beginPath();
            ctx.moveTo(selectedArea[0].x - left + layers.scrollLeft, selectedArea[0].y - top + layers.scrollTop);

            for (let coordinates of selectedArea) {
                ctx.lineTo(coordinates.x - left + layers.scrollLeft, coordinates.y - top + layers.scrollTop);
            }

            ctx.lineTo(selectedArea[0].x - left + layers.scrollLeft, selectedArea[0].y - top + layers.scrollTop);
            
            ctx.fillStyle = selectedColor.value;
            ctx.lineCap = 'butt';
            ctx.lineJoin = 'butt';
            ctx.fill();
        }
    }
}

function draw(event) {
    if (selectedLayer) {
        let maxZIndex = '-1';

        for (let layer of layers.childNodes) {
            if (event.clientX >= parseFloat(layer.style.left)
            && event.clientX <= parseFloat(layer.style.left) + layer.width
            && event.clientY >= parseFloat(layer.style.top) + workspaceTop
            && event.clientY <= parseFloat(layer.style.top) + workspaceTop + layer.height
            && parseFloat(maxZIndex) < parseFloat(layer.style.zIndex)) {
                maxZIndex = layer.style.zIndex;
            }
        }

        if (selectedLayer.style.zIndex === maxZIndex && isInSelectedArea(selectedLayer, event.clientX, event.clientY)) {
            let ctx = selectedLayer.getContext('2d');

            ctx.beginPath();
            ctx.moveTo(event.clientX - parseFloat(selectedLayer.style.left) + layers.scrollLeft,
                       event.clientY - parseFloat(selectedLayer.style.top) - workspaceTop) + layers.scrollTop;
            ctx.lineTo(event.clientX - parseFloat(selectedLayer.style.left) + layers.scrollLeft,
                       event.clientY - parseFloat(selectedLayer.style.top) - workspaceTop) + layers.scrollTop;
            ctx.strokeStyle = selectedColor.value;
            ctx.lineWidth = brushDiameter;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();

            let drawOnLayer = (event) => {
                if (isInSelectedArea(selectedLayer, event.clientX, event.clientY)) {
                    ctx.lineTo(event.clientX - parseFloat(selectedLayer.style.left) + layers.scrollLeft,
                            event.clientY - parseFloat(selectedLayer.style.top) - workspaceTop) + layers.scrollTop;
                    ctx.stroke();
                }
            }

            let removeMouseMove = () => {
                window.removeEventListener('mousemove', drawOnLayer);
                window.removeEventListener('mouseup', removeMouseMove);
            }

            window.addEventListener('mousemove', drawOnLayer);
            window.addEventListener('mouseup', removeMouseMove);
        }
    }
}

function isInSelectedArea(canvas, mouseX, mouseY) {
    let pathCanvas = document.createElement('canvas');
    let ctx = pathCanvas.getContext('2d');
    let left = parseFloat(canvas.style.left);
    let top = parseFloat(canvas.style.top);

    mouseX += layers.scrollLeft;
    mouseY += layers.scrollTop;

    if (mouseX < left
    || mouseX > left + canvas.width
    || mouseY < top + workspaceTop
    || mouseY > top + workspaceTop + canvas.height) {
        return false;
    }

    pathCanvas.width = layers.scrollWidth;
    pathCanvas.height = layers.scrollHeight;

    ctx.moveTo(selectedArea[0].x + layers.scrollLeft, selectedArea[0].y + layers.scrollTop);

    for (let coordinates of selectedArea) {
        ctx.lineTo(coordinates.x + layers.scrollLeft, coordinates.y + layers.scrollTop);
    }

    ctx.lineTo(selectedArea[0].x + layers.scrollLeft, selectedArea[0].y + layers.scrollTop);
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-in';

    ctx.drawImage(canvas, left, top);

    if (ctx.getImageData(mouseX, mouseY - workspaceTop, 1, 1).data[3] === 0) {
        return false;
    }

    return true;
}