let
  togglePadding = 3, toggleDuration = 120,
  landscape, toggleTransit,
  sections = [];

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

  style(sections, {
    padding: '50px',
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
  style([head], {
    width: landscape ? '200px' : '100%',
    
  });
}

window.onload = function () {
  toggle.onclick = updateToggle;
  sections = Array.from(document.getElementsByClassName('sections'));
  initStyle();
  updateMode();
};

function style(elem, declarations) {
  Object.keys(declarations).forEach(d => {
    elem.forEach(e => {
      if (declarations[d]) e.style[d.replace(/_/g, '-'.toLowerCase())] = declarations[d];
    });
  });
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createDescription(node) {

  const index = nodes.indexOf(node);

  const textContainer = document.createElement('div');

  textContainer.style.position = 'absolute';
  textContainer.style.height = '80px';
  textContainer.style.width = '300px';
  textContainer.style.textAlign = 'center';

  const nodeMiddle = node.offsetTop + node.offsetHeight / 2;
  textContainer.style.top = nodeMiddle - 40 + 'px';

  if (index % 2 === 0) { // For even indices
    textContainer.style.left = node.offsetLeft + (node.offsetWidth / 2) + 80 + 'px';
  } else { // For odd indices
    textContainer.style.left = node.offsetLeft + (node.offsetWidth / 2) - 80 - 300 + 'px';
  }

  const header = document.createElement('h1');
  header.style.fontFamily = 'arial';
  header.style.fontSize = '18px';
  header.textContent = node.children[0].textContent;

  const description = document.createElement('p');
  description.style.fontFamily = 'arial';
  description.style.fontSize = '10px';
  description.textContent = node.children[2].textContent;

  textContainer.appendChild(header);
  textContainer.appendChild(description);

  document.getElementsByTagName('body')[0].appendChild(textContainer);


}

function createIcon(node) {

  const index = nodes.indexOf(node);
  console.log(index);

  const icon = document.createElement('div');

  icon.style.position = 'absolute';
  icon.style.height = '80px';
  icon.style.width = '80px';

  const nodeMiddle = node.offsetTop + node.offsetHeight / 2;
  icon.style.top = nodeMiddle - 40 + 'px';

  if (index % 2 === 0) {
    icon.style.left = node.offsetLeft + (node.offsetWidth / 2) - 265 + 'px';
  } else {
    icon.style.left = node.offsetLeft + (node.offsetWidth / 2) + 185 + 'px';
  }

  const iconImage = document.createElement('img');

  iconImage.src = node.children[1].src;
  iconImage.style.height = '80px';
  iconImage.style.width = '80px';

  icon.appendChild(iconImage);
  document.getElementsByTagName('body')[0].appendChild(icon);


}

function initLine() {
  const line = document.getElementById('line');

  line.id = 'line';
  line.style.position = 'absolute';
  line.style.width = '10px';

  line.style.left = (window.innerWidth - 10) / 2 + 'px';
  line.style.zIndex = '-1';

  const lineStart = nodes[0].offsetTop + (nodes[0].offsetHeight / 2);
  const lastNode = nodes[nodes.length - 1];

  line.style.top = lineStart + 'px';
  line.style.height = lastNode.offsetTop + (lastNode.offsetHeight / 2) - lineStart + 'px';


}

function initBackgroundColors() {

  for (var i = 0; i < nodes.length; i++) {

    const currentNodeCenter = nodes[i].offsetTop + nodes[i].offsetHeight / 2;

    if (i === 0) {

      const nextNodeCenter = nodes[i + 1].offsetTop + nodes[i + 1].offsetHeight / 2;
      const nextDiff = nextNodeCenter - currentNodeCenter;

      const end = currentNodeCenter + nextDiff / 2;

      const imageBackground = document.createElement('div');
      imageBackground.style.position = 'absolute';
      imageBackground.style.width = '100%';
      imageBackground.style.height = end;
      imageBackground.style.zIndex = -3;

      const image = document.createElement('img');
      console.log(nodes[i].children);
      image.src = nodes[i].children[3].src; // From the kid's input
      image.style.width = '100%';
      image.style.height = end;

      imageBackground.appendChild(image);

      document.getElementsByTagName('body')[0].appendChild(imageBackground);

      nodes[i].innerHTML = '';
      continue;
    }


    const previousNodeCenter = nodes[i - 1].offsetTop + nodes[i - 1].offsetHeight / 2;

    const prevDiff = currentNodeCenter - previousNodeCenter;

    const start = previousNodeCenter + prevDiff / 2;

    // Creating background color sections
    if (i !== 0 && i !== nodes.length - 1) {
      const nextNodeCenter = nodes[i + 1].offsetTop + nodes[i + 1].offsetHeight / 2;

      const nextDiff = nextNodeCenter - currentNodeCenter;

      const end = currentNodeCenter + nextDiff / 2;

      const colorBackground = document.createElement('div');
      colorBackground.style.position = 'absolute';
      colorBackground.style.width = '100%';
      colorBackground.style.height = end - start + 'px';
      colorBackground.style.top = start + 'px';
      colorBackground.style.backgroundColor = getRandomColor();
      colorBackground.style.zIndex = -2;

      document.getElementsByTagName('body')[0].appendChild(colorBackground);

    } else if (i === nodes.length - 1) {

      const colorBackground = document.createElement('div');
      colorBackground.style.position = 'absolute';
      colorBackground.style.width = '100%';
      colorBackground.style.height = prevDiff + 'px';

      colorBackground.style.top = start + 'px';
      colorBackground.style.backgroundColor = getRandomColor();
      colorBackground.style.zIndex = -2;

      document.getElementsByTagName('body')[0].appendChild(colorBackground);


    }

    nodes[i].innerHTML = '';

  }

}



