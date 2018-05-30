let
  togglePadding = 3, toggleDuration = 120, lineWidth = 6,
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

  style(sections, { padding: '50px' });
  style(nodeTitles.slice(1), { position: 'absolute' });
  style(nodeDetails.slice(1), { position: 'absolute' });
  
  nodeTitles.forEach(nt => nt.className = 'nodeTitles');
  nodeDetails.forEach(nd => nd.className = 'nodeDetails');
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
  document.body.style.overflowX = landscape ? 'auto' : 'hidden';
  document.body.style.overflowY = landscape ? 'hidden' : 'auto';

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
    padding_top: '20px',
    position: landscape ? 'absolute' : 'initial',
    width: landscape ? `${head.offsetWidth - 100}px` : 'auto',
    bottom: landscape ? `${window.innerHeight - headNode.offsetTop + 20}px` : 'auto',
  });

  style([nodeDetails[0]], {
    position: landscape ? 'absolute' : 'initial',
    width: landscape ? `${nodeTitles[0].offsetWidth}px` : 'auto',
    top: landscape ? `${headNode.offsetTop + headNode.offsetHeight + 10}px` : 'auto',
  });

  // style content of each section
  for (let i = 1; i < sections.length; i++) {
    const j = i - 1;
    
    style([sections[i]], {
      padding: landscape ? '50px' : '80px 50px',
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
      text_align: landscape ? 'center' : i % 2 ? 'right' : 'left',
      width: landscape ? `${sections[i].offsetWidth - 100}px` : `${window.innerWidth / 2 - nodes[i].offsetWidth / 2 - 100}px`,
      left: landscape ? 'auto' : i % 2 ? 'auto' : `${nodes[i].offsetLeft + nodes[i].offsetWidth + 50}px`,
      top: landscape ? `${nodes[i].offsetTop + nodes[i].offsetHeight + 30}px` : 'auto',
    });

    style([nodeDetails[i]], {
      text_align: landscape ? 'center' : i % 2 ? 'right' : 'left',
      width: `${nodeTitles[i].offsetWidth}px`,
      top: `${nodeTitles[i].offsetTop + nodeTitles[i].offsetHeight}px`,
      left: `${nodeTitles[i].offsetLeft}px`,
    });

    style([icons[j]], {
      top: landscape ? `${nodes[i].offsetTop - icons[j].offsetHeight - 30}px` : `${nodes[i].offsetTop - (icons[j].offsetHeight - nodes[i].offsetHeight) / 2}px`,
      left: landscape ? `${sections[i].offsetWidth / 4}px` : `${nodes[i].offsetLeft + (i % 2 ? 1 : -1) * ((i % 2 ? nodes[i].offsetWidth : icons[j].offsetWidth) + 50)}px`,
    });

    // add line
    let line = sections[i].querySelectorAll('.lines');
    
    if (!line.length) {
      line = document.createElement('div');
      line.className = 'lines';
      sections[i].appendChild(line);
    }
    else {
      line = line[0];
    }
    
    style([line], {
      width: landscape ? `${(sections[j].offsetWidth - nodes[j].offsetWidth) / 2 + (sections[i].offsetWidth - nodes[i].offsetWidth) / 2  - 40}px` : `${lineWidth}px`,
      height: landscape ? `${lineWidth}px` : `${nodes[i].offsetTop - nodes[j].offsetTop - nodes[j].offsetHeight - 40}px`,
      left: landscape ? `${20 - nodes[j].offsetLeft}px` : `${window.innerWidth / 2 - lineWidth / 2}px`,
      top: landscape ? `${nodes[i].offsetTop + (nodes[i].offsetHeight / 2) - lineWidth / 2}px` : `${nodes[j].offsetTop + nodes[j].offsetHeight + 20}px`,
    });
  }
  
  style([tail], {
    position: landscape ? 'absolute' : 'initial',
    left: landscape ? `${sections[sections.length - 1].getBoundingClientRect().right}px` : 'auto',
    top: landscape ? '0' : 'auto',
    width: landscape ? `${Math.max(0, window.innerWidth - sections[sections.length - 1].getBoundingClientRect().right)}px` : '100%',
    height: landscape ? '100%' : `${window.innerHeight - sections[sections.length - 1].getBoundingClientRect().bottom}px`,
  });
}

window.onload = () => {
  toggle.onclick = updateToggle;
  sections = Array.from(document.querySelectorAll('.sections'));
  icons = Array.from(document.querySelectorAll('.icons'));
  nodes = Array.from(document.querySelectorAll('.nodes'));
  nodeTitles = Array.from(document.querySelectorAll('.sections > h2'));
  nodeDetails = Array.from(document.querySelectorAll('.sections > p'));
  initStyle();
  updateMode();
};

window.onresize = updateMode;

function style(elem, declarations) {
  Object.keys(declarations).forEach(d => {
    elem.forEach(e => {
      if (declarations[d]) e.style[d.replace(/_/g, '-')] = declarations[d];
    });
  });
}

function spaceBetween(e1, e2, axis = 0) {       // axis: 0 is horizontal, 1 is vertical
  const pos1 = [e1.offsetLeft, e1.offsetTop],
      pos2 = [e2.offsetLeft, e2.offsetTop],
      size1 = [e1.offsetWidth, e1.offsetHeight],
      size2 = [e2.offsetWidth, e2.offsetHeight];
  return Math.max(Math.max(pos1[axis], pos2[axis]) - Math.min(pos1[axis], pos2[axis]) - (pos1[axis] <= pos2[axis] ? size1[axis] : size2[axis]), 0);
}