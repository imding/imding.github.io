let
  togglePadding = 3, toggleDuration = 120,
  landscape, toggleTransit,
  sections = [], icons = [], nodes = [], nodeTitles = [], nodeDetails = [];

function initStyle() {
  style([toggle], {
    position: 'absolute',
    top: '10px',
    left: '10px',
    height: '30px',
    width: '130px',
    padding: `${togglePadding}px`,
    border: '1px solid rgba(0, 0, 0, 0.5)',
    border_radius: '15px',
    background_color: 'wheat',
    box_shadow: 'inset 0 0 4px rgba(0, 0, 0, 0.4)',
    cursor: 'pointer',
  });

  style([toggleSwitch], {
    position: 'relative',
    left: '0',
    padding: '3px',
    height: '22px',
    width: '100px',
    color: 'slategrey',
    border_radius: '11px',
    background: 'white',
    box_shadow: '0 1px 8px black',
    transition: `all ${toggleDuration / 1000}s ease-out`,
    font_family: 'monospace',
    font_weight: 'bold',
    text_align: 'center',
  });
}

function updateToggle() {
  if (!toggleTransit) {
    toggleTransit = true;
    setTimeout(() => toggleTransit = false, toggleDuration);

    landscape = !landscape;
    toggleSwitch.style.left = toggleSwitch.offsetLeft > 3 ? '0' : `${toggle.clientWidth - toggleSwitch.clientWidth - togglePadding * 2}px`;
    toggleSwitch.style.color = 'white';

    setTimeout(() => {
      toggleSwitch.textContent = landscape ? 'HORIZONTAL' : 'VERTICAL';
      toggleSwitch.style.color = 'slategrey';
    }, toggleDuration / 2);

    updateMode();
  }
}

function updateMode() {
  style([document.body], {
    background_size: landscape ? 'auto 100%' : '100%',
    background_position: landscape ? 'center' : 'initial',
  });

  style([head], {
    padding: landscape ? '50px' : '80px 25% 50px 25%',
    width: landscape ? `${headNode.offsetWidth * 3}px` : '100%',
    height: landscape ? `${window.innerHeight - head.offsetTop}px` : 'initial',
  });

  style([headNode], {
    position: landscape ? 'absolute' : 'initial',
    top: landscape ? `${((window.innerHeight - banner.offsetHeight) / 2) - (headNode.offsetHeight / 2) + banner.offsetHeight}px` : 'auto',
    left: landscape ? `${(head.offsetWidth / 2) - (headNode.offsetWidth / 2)}px` : 'auto',
  });

  style([nodeTitles[0]], {
    position: landscape ? 'absolute' : 'initial',
    width: landscape ? `${head.offsetWidth - 100}px` : 'auto',
    bottom: landscape ? `${window.innerHeight - headNode.offsetTop + 10}px` : 'auto',
  });

  style([nodeDetails[0]], {
    position: landscape ? 'absolute' : 'initial',
    width: landscape ? `${nodeTitles[0].offsetWidth}px` : 'auto',
    top: landscape ? `${headNode.offsetTop + headNode.offsetHeight + 10}px` : 'auto',
  });

  for (let i = 1; i < sections.length; i++) {
    const j = i - 1;
    
    style([sections[i]], {
      padding: landscape ? '50px' : '50px 25%',
      position: landscape ? 'absolute' : 'initial',
      width: landscape ? `${icons[j].offsetWidth * 2}px` : '100%',
      height: landscape ? '100%' : 'auto',
      top: landscape ? '0' : 'auto',
      left: landscape ? `${sections[j].offsetLeft + sections[j].offsetWidth}px` : 'auto',
      background_color: i % 2 ? 'slategrey' : 'darkslategrey',
    });
    
    style([nodes[i]], {
      position: landscape ? 'absolute' : 'initial',
      top: landscape ? (i > 1 ? `${nodes[j].offsetTop}px` : `${headNode.offsetTop + (headNode.offsetHeight - nodes[i].offsetHeight) / 2}px`) : 'auto',
      left: landscape ? `${sections[i].offsetWidth / 2 - nodes[i].offsetWidth / 2}px` : 'auto',
    });

    style([nodeTitles[i]], {
      position: 'absolute',
      width: landscape ? `${sections[i].offsetWidth - 100}px` : `${sections[i].offsetWidth * 0.5}px`,
      bottom: landscape ? `${window.innerHeight - headNode.offsetTop + 10}px` : 'auto',
    });
  }
}

window.onload = function () {
  toggle.onclick = updateToggle;
  sections = document.querySelectorAll('.sections');
  icons = document.querySelectorAll('.icons');
  nodes = document.querySelectorAll('.nodes');
  nodeTitles = document.querySelectorAll('.sections > h2');
  nodeDetails = document.querySelectorAll('.sections > p');
  initStyle();
  updateMode();
};

function style(elem, declarations) {
  Object.keys(declarations).forEach(d => {
    elem.forEach(e => {
      if (declarations[d]) e.style[d.replace(/_/g, '-')] = declarations[d];
    });
  });
}