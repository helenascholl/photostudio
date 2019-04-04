window.addEventListener('load', removeLoad);

function removeLoad() {
    let load = document.getElementById('load');

    load.style.opacity = 0;
    document.getElementById('content').style.opacity = 1;

    setTimeout(() => {
        document.getElementById('body').removeChild(load);
    }, 1000);

    window.removeEventListener('load', removeLoad);
}

/*
html:
<div id="load">
    <div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>
*/