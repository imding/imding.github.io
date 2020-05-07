/** @jsx jsx */
import React from 'react';
import { jsx, css, SerializedStyles } from '@emotion/core';
import cuid from 'cuid';

import Title, { ITitle } from './Header/Title';
import Button, { IButton } from './Header/Button';

export interface IPanel {
	header: { height: number },
	name: string,
	title: ITitle,
	// content?: IContent,
	options?: IButton[],
	/** use @emotion/core
	 * @example style: css`property: value;`
	 * @see https://emotion.sh/docs/css-prop
	 */
	style?: SerializedStyles,
	css?: never,
	width?: string,
	height?: string,
	onMount?: (arg?: any) => any,
};

const Panel: React.FC<IPanel> = props => {
	const headerHeight = props.header.height || 42;
	const cls = {
		panel: css`
			width: calc(100% - 10px);
			height: calc(100% - 10px);
			position: relative;
			left: 5px;
			top: 5px;
			overflow: hidden;
		`,
		header: css`
			height: ${headerHeight}px;
			padding: 0 10px;
			border-radius: 6px 6px 0 0;
			display: grid;
			grid-auto-flow: column;
			place-items: center;
			justify-content: space-between;
			background-color: #444;
			color: ghostwhite;
		`,
		name: css`
			opacity: 0.6;
			cursor: default;
			user-select: none;
		`,
		options: css`
			display: grid;
			grid-auto-flow: column;
			grid-gap: 7px;
		`,
		content: css`
			position: relative;
			min-width: 300px;
			height: calc(100% - ${headerHeight}px);
			border: 1px solid silver;
			border-radius: 0 0 6px 6px;
		`
	};
	const HeaderOptions = () => <div css={cls.options}>
		{(props.options || []).map((cfg: IButton) => {
			const hydrant = {
				size: props.header.height,
				key: `${cfg.icon.name}-${cuid.slug()}`
			};
			return <Button {...Object.assign(cfg, hydrant)} />
		})}
	</div>;

	console.log('render: <Panel>');

	return (
		<div css={props.style}>
			<div css={cls.panel}>
				<div css={cls.header}>
					<h5 css={cls.name}>{props.name}</h5>
					<Title {...props.title} />
					<HeaderOptions />
				</div>
				<div css={cls.content}>
					{props.children}
				</div>
			</div>
		</div>
	);
};

export default React.memo(Panel);