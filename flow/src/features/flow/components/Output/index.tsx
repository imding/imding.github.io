/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import React from 'react';
import { connect } from 'react-redux';

import { Panel, Header, Options, IPanel } from '../../../../components/Panel';
import { IHeader } from '../../../../components/Panel/Header';

import VisualOutput from './VisualOutput';
import CodeViewer from './CodeViewer';
import CodeToggle from './CodeToggle';
import { toggleCodeViewer } from '../../actions';

export interface IGraphOutput {
	toggleCodeViewer: (showCode: boolean) => any
}

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
const headerHeight = 38;
const headerCfg: IHeader = {
	name: 'Output Viewer',
	height: headerHeight,
};
const contentStyle = css`
	display: grid;
	grid-template-rows: 1fr min-content;
	height: calc(100% - ${headerHeight}px);
	border-radius: 0 0 6px 6px;
	overflow: hidden;
`;
const mapDispatchToProps = (dispatch: any) => ({
	toggleCodeViewer: (showCode: boolean) => dispatch(toggleCodeViewer(showCode))
});
const GraphOutput: React.FC<IGraphOutput> = props => {
	props.toggleCodeViewer(true);
	return (
		<Panel {...panelCfg}>
			<Header {...headerCfg}>
				<span />
				<Options>
					<CodeToggle />
				</Options>
			</Header>
			<div css={contentStyle}>
				<VisualOutput />
				<CodeViewer tabSize={2} />
			</div>
		</Panel>
	);
};

export default connect(null, mapDispatchToProps)(GraphOutput);