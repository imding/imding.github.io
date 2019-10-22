import '../styles/subMenu.scss';
import Tooltip, { TooltipConfig } from './Tooltip';

const { el, newEl, obj } = require('./Handy');

interface SubMenuButton {
    tipHeading: string,
    tip: string,
    handler: () => any
};

interface SubMenuGroup {
    scrollContainer?: HTMLElement,
    host: HTMLElement,
    items: {
        [iconName: string]: SubMenuButton
    }
}

export default function subMenu(scrollContainer: HTMLElement, groups: Array<SubMenuGroup>, cfg: TooltipConfig) {
    groups.forEach(group => {
        let subMenuContainer: HTMLElement;
        const { host, items } = group;
        const tipsData = [];
        const attachSubMenu = () => {
            subMenuContainer = el(document.body).addNew('div', { className: 'subMenu' });

            el(subMenuContainer).setStyle({
                left: `${host.offsetLeft + host.offsetWidth + 5}px`,
                top: `${host.offsetTop - scrollContainer.scrollTop}px`,
                opacity: 1
            });

            obj(items).forEachEntry((iconName: string, item: SubMenuButton) => {
                const { tipHeading, tip, handler } = item;
                const button = newEl('div');
                const icon = newEl('i', { className: 'material-icons', innerText: iconName });
                const wrapperHandler = (ev: MouseEvent) => {
                    button.removeEventListener('click', wrapperHandler);
                    button.removeTooltip(ev);
                    removeSubMenu();
                    handler();
                };

                button.append(icon);
                subMenuContainer.append(button);
                
                button.addEventListener('click', wrapperHandler);
                
                tipsData.push({ tool: button, heading: tipHeading, tip });
            });

            window.addEventListener('actionPanelScrolled', removeSubMenu);

            Tooltip(tipsData, cfg);
        };
        const removeSubMenu = () => {
            el(subMenuContainer).setStyle({ opacity: 0 });
            window.removeEventListener('actionPanelScrolled', removeSubMenu);
            subMenuContainer.addEventListener('transitionend', () => {
                if ((event as TransitionEvent).propertyName === 'opacity') {
                    document.body.removeChild(event.target as HTMLElement);
                }
            });
            subMenuContainer = null;
        };

        host.addEventListener('click', () => subMenuContainer ? removeSubMenu() : attachSubMenu());
    });
}