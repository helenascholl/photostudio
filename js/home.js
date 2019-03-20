window.addEventListener('load', () => {
    resize();
    window.addEventListener('resize', resize);
});

function resize() {
    let background = document.getElementById('background');
    let backgroundImage = document.getElementById('backgroundImage');

    if (backgroundImage.width < innerWidth) {
        background.style.backgroundSize = `${innerWidth}px ${innerHeight / backgroundImage.width * backgroundImage.height}px`;
        //background.style.backgroundSize = `${innerWidth}px auto`;
    } else if (backgroundImage.height < innerHeight) {
        background.style.backgroundSize = `${innerWidth / backgroundImage.height * backgroundImage.width}px ${innerHeight}px`;
        //background.style.backgroundSize = `auto ${innerHeight}px`;
    } else {
        background.style.backgroundSize = `${innerWidth}px ${innerHeight}px`;
    }
    
    background.style.backgroundPositionX = (backgroundImage.width - innerWidth) / -2 + 'px';
    background.style.backgroundPositionY = (backgroundImage.height - innerHeight) / -2 + 'px';
}