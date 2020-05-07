/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState } from 'react';

import { IconType } from 'react-icons/lib/cjs';

export interface IButton {
	/** Use icons from the "react-icons" library
	 * @see https://react-icons.github.io/
	 */
	icon: IconType,
	title: string,
	/** The size of the returned `<Icon>` will be `Math.max(size - 10, 20)`
	 ** Padding is specified in `iconCfg` of `ToolbarAction`
	 */
	size?: number,

	/** If provided, the returned `<Icon>` will toggle between `icon` and `toggle` when clicked
	 ** Use icons from the "react-icons" library
	 * @see https://react-icons.github.io/
	 */
	toggle?: IconType,
	color?: string,
	hoverColor?: string,
	activeColor?: string,
	handler?: (arg?: any) => any
}

const Button: React.FC<IButton> = props => {
	const {
		icon: Icon,
		toggle: Toggle,
		title, size,
		color,
		hoverColor,
		activeColor,
		handler
	} = props;
	const safeSize = (size || 30) - 10;
	const iconCfg = {
		css: css`
			width: ${safeSize}px;
			height: ${safeSize}px;
			padding: 4px;
			background-color: transparent;
			border-radius: 5px;
			color: ${color || 'inherit'};
			cursor: pointer; 
			transition: all 0.1s ease-in-out;
			&:hover {
				color: ${hoverColor || 'inherit'};
				background-color: rgba(0, 0, 0, 0.3);
			}
			&:active {
				color: ${activeColor || 'inherit'};
				opacity: 0.8;
			}
		`,
		title,
		onClick: handler
	};

	console.log('render: <Button>', Icon.name);

	if (!Toggle) return <Icon {...iconCfg} />;

	const Binary: React.FC = props => {
		const [isToggled, toggleButton] = useState<boolean>(false);
		const Toggled = isToggled ? Toggle : Icon;

		iconCfg.onClick = () => {
			toggleButton(!isToggled);
			console.log('isToggled:', isToggled);
			handler && handler(isToggled);
		};
		
		return <Toggled {...iconCfg} />;
	};

	return <Binary />;
};

export default Button;
