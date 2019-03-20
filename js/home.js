window.addEventListener('load', () => {
    resize();
    window.addEventListener('resize', resize);
});

function resize() {
    let background = document.getElementById('backgroundImg');

    if (background.width / background.height < innerWidth / innerHeight) {
        background.height = background.height / background.width * innerWidth;
        background.width = innerWidth;
    } else if (background.width / background.height > innerWidth / innerHeight) {
        background.width = background.width / background.height * innerHeight;
        background.height = innerHeight;
    } else {
        background.width = innerWidth;
        background.height = innerHeight;
    }

    background.style.marginLeft = (background.width - innerWidth) / -2 + 'px';
    background.style.marginTop = (background.height - innerHeight) / -2 + 'px';
}