/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { connect } from 'react-redux';

import { makeSource } from '../../../../utils';

export interface IVisualOutput {
	showCode: boolean
	htmlString: string
}

const mapStateToProps = (state: any) => ({
	showCode: state.flowReducer.showCode,
	htmlString: state.flowReducer.htmlString
});
const VisualOutput: React.FC<IVisualOutput> = props => {
	const iframeStyle = css`
		width: 100%;
		height: 100%;
		border: solid silver;
		border-width: 0 1px ${props.showCode ? 0 : 1}px;
		border-radius: ${props.showCode ? 0 : '0 0 6px 6px'};
	`;

	return (
		<iframe
			id='output-viewer'
			title='HTML Output'
			css={iframeStyle}
			srcDoc={props.htmlString || makeSource('', '<h1>Flow</h1>')}
		/>
	);
};

export default connect(mapStateToProps)(VisualOutput);