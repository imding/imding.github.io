import '../styles/tooltip.scss';
import { el, newEl } from '../utils/Handy';

export default function tooltip(...targets) {
    let tipContainer, heading, body;

    targets.forEach(target => {
        const [tool, tipHeadingText, tipText] = Object.values(target);

        tool.addEventListener('mouseenter', () => {
            if (!tipContainer) {
                tipContainer = el(document.body).new('div', { id: 'tippie' });
                heading = newEl('h4', { className: 'tipHeading' });
                body = newEl('div', { className: 'tip' });
                
                el(tipContainer).addChild(heading, body);
                codexContainer.classList.toggle('dim');
            }
            
            heading.textContent = tipHeadingText.toUpperCase();
            body.textContent = tipText;


            el(tipContainer).style({
                left: `${tool.offsetLeft - tipContainer.offsetWidth - 5}px`,
                top: `${tool.offsetTop - pnlActions.scrollTop}px`,
            });
        });

        tool.onmouseout = () => {
            const intoSibling = event.relatedTarget === tool.nextElementSibling || event.relatedTarget === tool.previousElementSibling;

            if (!intoSibling) {
                document.body.removeChild(tipContainer);
                tipContainer = null;
                codexContainer.classList.toggle('dim');
            }
        };
    });
}