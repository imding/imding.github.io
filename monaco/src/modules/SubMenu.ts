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
                if ((host.firstElementChild as HTMLElement).innerText === iconName) return;

                const { tipHeading, tip, handler } = item;
                const button = newEl('div');
                const icon = newEl('i', { className: 'material-icons', innerText: iconName });

                button.append(icon);
                subMenuContainer.append(button);
                
                button.onclick = (ev: MouseEvent) => {
                    button.removeTooltip(ev);
                    removeSubMenu();
                    handler();
                };
                
                tipsData.push({ tool: button, heading: tipHeading, tip });
            });

            Tooltip(tipsData, cfg);
        };
        const removeSubMenu = () => {
            el(subMenuContainer).setStyle({ opacity: 0 });
            subMenuContainer.addEventListener('transitionend', () => document.body.removeChild(event.target as HTMLElement));
            subMenuContainer = null;
        };

        host.addEventListener('click', () => subMenuContainer ? removeSubMenu() : attachSubMenu());

        // host.addEventListener('mouseout', () => {
        //     if (subMenuContainer) removeSubMenu();
        // });
    });
}