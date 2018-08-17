let graph;

window.onload = init;

function init() {
    workspace.style.width = '500px';
    workspace.style.height = '500px';
    
    graph = new Graph(workspace);
}