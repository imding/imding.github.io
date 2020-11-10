/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import React from 'react';
import { Panel, IPanel, Header } from '../../../components/Panel';
import { IHeader, Title, Options } from '../../../components/Panel/Header';
import { ITitle } from '../../../components/Panel/Header/Title';

const panelCfg: IPanel = {
	style: css`
		position: absolute;
		top: 0;
		right: 0;
		width: 645px;
		height: 100%;
		padding-left: 0;
	`
};
const headerCfg: IHeader = {
	name: '',
	height: 38,
};
const titleCfg: ITitle = {
	text: {
		default: 'Output Viewer'
	}
};
const contentStyle = css`
	height: calc(100% - 38px);
	border: solid silver;
	border-width: 0 1px 1px 1px;
	border-radius: 0 0 6px 6px;
	overflow: hidden;
`;

const GraphOutput: React.FC = props => {
	return (
		<Panel {...panelCfg}>
			<Header {...headerCfg}>
				<Title {...titleCfg} />
				<Options>
					
				</Options>
			</Header>
			<div css={contentStyle}>

			</div>
		</Panel>
	);
};

export default GraphOutput;