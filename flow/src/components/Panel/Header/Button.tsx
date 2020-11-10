/** @jsx jsx */
import { jsx, css, SerializedStyles } from '@emotion/core';
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
	isToggled?: boolean,
	enabled?: boolean,
	color?: string,
	hoverColor?: string,
	activeColor?: string,
	handler?: (...arg: any) => any,
	[key: string]: any
}

const disabled = (styles: SerializedStyles) => css`
	${styles};
	color: lightsalmon;
	opacity: 0.4;
	cursor: help;
	&:hover {
		color: lightsalmon;
		opacity: 0.5;
	}
	&:active {
		color: indianred;
		opacity: 0.6
	}
`;

export const Button: React.FC<IButton> = props => {
	const {
		icon: Icon,
		toggle: Toggle,
		enabled,
		title,
		size,
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
			color: ${props.isToggled ? activeColor : (color || 'inherit')};
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

	if (enabled === false) return <Icon css={disabled(iconCfg.css)} />;
	if (!Toggle) return <Icon {...iconCfg} />;

	const Binary = () => {
		const [isToggled, toggleButton] = useState<boolean>(props.isToggled || false);
		const Toggled = isToggled ? Toggle : Icon;

		iconCfg.onClick = () => {
			Object.assign(iconCfg, (handler && handler(!isToggled)) || {});
			toggleButton(!isToggled);
			console.log('isToggled:', isToggled);
		};

		return <Toggled {...iconCfg} />;
	};

	return <Binary />;
};
