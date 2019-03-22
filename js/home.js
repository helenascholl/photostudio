let background;
let originalCoordinates;

window.addEventListener('load', init);

function init() {
    background = document.getElementById('backgroundImg');
    resize();

    document.getElementById('edit').addEventListener('click', edit);
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
}

function mousemove(event) {
    if (originalCoordinates !== undefined) {
        background.style.marginLeft = parseFloat(background.style.marginLeft) + (event.clientX - originalCoordinates.x) / 80 + 'px';
        background.style.marginTop = parseFloat(background.style.marginTop) + (event.clientY - originalCoordinates.y) / 80 + 'px';
    }
    
    originalCoordinates = {x: event.clientX, y: event.clientY};
}

function edit() {
    let load = document.getElementById('load');

    load.style.zIndex = 3;
    load.style.opacity = 1;

    setTimeout(() => {
        window.open('./editor/index.html', '_self');
    }, 500);
}