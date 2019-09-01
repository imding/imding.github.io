import '../styles/tooltip.scss';

const { el, newEl } = require('./Handy');

export interface Tooltip {
    tool: HTMLElement,
    heading: string,
    tip: string 
}

export interface TooltipConfig {
    placement?: 'left' | 'right' | 'top' | 'bottom',
    distance?: number,
    dim?: Array<HTMLElement>
}

export default function Tooltip(targets: Array<Tooltip>, cfg: TooltipConfig) {
    let tipContainer: HTMLElement, heading: HTMLElement, body: HTMLElement;
    
    cfg = Object.assign({ dim: [] }, cfg);

    targets.forEach((target: Tooltip) => {
        const [tool, tipHeadingText, tipText] = Object.values(target);
        const attachTooltip = () => {
            if (!tipContainer) {
                tipContainer = el(document.body).addNew('div', { id: 'tippie' });
                heading = newEl('h4', { className: 'tipHeading' });
                body = newEl('div', { className: 'tip' });

                cfg.dim.forEach(element => element.classList.toggle('dim'));
                tipContainer.append(heading, body);
            }

            heading.textContent = tipHeadingText.toUpperCase();
            body.textContent = tipText;

            const { left, top, width } = tool.getBoundingClientRect();
            const containerPosition = {
                left: `${left - tipContainer.offsetWidth - 5}px`,
                top: `${top}px`,
            };

            if (cfg.placement === 'right') {
                containerPosition.left = `${left + width + (cfg.distance || 5) }px`;
            }

            el(tipContainer).setStyle(containerPosition);
        };
        const removeTooltip = (ev: MouseEvent) => {
            const intoSibling = ev.relatedTarget === tool.nextElementSibling || ev.relatedTarget === tool.previousElementSibling;

            if (!intoSibling) {
                cfg.dim.forEach(element => element.classList.toggle('dim'));
                tipContainer.parentNode.removeChild(tipContainer);
                tipContainer = null;
            }
        };

        tool.addEventListener('mouseenter', attachTooltip);
        tool.addEventListener('mouseout', removeTooltip);
    });
}