const 
    app = {
        set add(el) {
            
        }
    },
    util = {
    css: (el) => {
        const
            cs = window.getComputedStyle(el),
            val = (p) => cs.getPropertyValue(p);

        return {
            get width() {
                return parseFloat(val('width'));
            },

            get height() {
                return parseFloat(val('height'));
            },
        };
    },

    initDoc() {
        document.children[0].style.height = '100%';
        document.body.style.height = '100%';
        document.body.style.margin = '0';
    },

    get vw() {
        return this.css(document.body).width;
    },

    get vh() {
        return this.css(document.body).height;
    }
};

let
    Explorer = document.createElement('div'),
    Inspector = document.createElement('div'),
    Workspace = document.createElement('div'),
    Preview = document.createElement('div'),
    Timeline = document.createElement('div');

function init() {

    util.initDoc();

    
    Explorer.style.width = '250px';
    Explorer.style.height = `${util.vh}px`;
    Explorer.addEventListener('contextmenu', () => {
        event.preventDefault();
        console.log(event.which);
    });
}

window.onload = init;

// ============================= //
// ========== UTILITY ========== //
// ============================= //

