addEventListener('load', () => {
    let img = new Image();
    let file = document.getElementById('file');

    file.addEventListener('change', () => {
        img.src = document.getElementById('file').value;

        img.addEventListener('load', () => {
            let canvas = document.getElementById('canvas');
            let ctx = canvas.getContext('2d');
    
            ctx.drawImage(img, 0, 0);
        });
    });
});