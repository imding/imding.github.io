window.onload = () => {
    btnRemove.onclick = () => {
        document.querySelectorAll('link[rel=stylesheet]').forEach(element => {
            element.parentNode.removeChild(element);
        });
    };
};