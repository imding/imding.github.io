/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import { connect } from 'react-redux';

import MonacoEditor from 'react-monaco-editor';
import beautify from 'js-beautify';

import { Options } from '../../../../components/Panel';
import CopyButton from './CopyButton';

export interface ICodeViewer {
	tabSize: number,
	htmlString: string,
	showCode: boolean,
}

const viewerHeight = 400;
const headerHeight = 36;
const codeViewerWrapperStyle = css`
	height: ${viewerHeight}px;
	overflow: hidden;
`;
const codeViewerHeaderStyle = css`
	height: ${headerHeight}px;
	padding-right: 10px;
	display: grid;
	grid-template-columns: 1fr min-content;
	align-items: center;
	color: ghostwhite;
	background-color: #333;
`;
const tabContainerStyle = css`
	display: grid;
	grid-template-columns: min-content;
	height: 100%;
`;
const tabStyle = css`
	display: grid;
	place-items: center;
	padding: 0 12px;
	color: gainsboro;
	background-color: #1e1e1e;
	cursor: pointer;
	transition: color 0.1s ease-in-out;
	&:hover {
		color: ghostwhite;
	}
`;
const mapStateToProps = (state: any) => ({
	showCode: state.flowReducer.showCode,
	htmlString: state.flowReducer.htmlString
});
const CodeViewer: React.FC<ICodeViewer> = props => {
	return (props.showCode
		? <div css={codeViewerWrapperStyle}>
			<div css={codeViewerHeaderStyle}>
				<div css={tabContainerStyle}>
					<pre css={tabStyle}>index.html</pre>

				</div>
				<Options>
					<CopyButton />
				</Options>
			</div>
			{props.htmlString
				? <MonacoEditor
					height={`${viewerHeight - headerHeight}px`}
					theme='vs-dark'
					language='html'
					options={{
						readOnly: true,
						wordWrap: 'on',
						smoothScrolling: true,
						scrollBeyondLastLine: false,
						renderFinalNewline: false,
						scrollBeyondLastColumn: 10,
					}}
					editorDidMount={editor => {
						const model = editor.getModel();
						if (model) {
							model.setValue(`${beautify.html(props.htmlString, { 'indent_size': props.tabSize, 'inline': [] })}\n`);
							model.updateOptions({ tabSize: props.tabSize });
						}
					}}
				/>
				: <div />
			}
		</div>
		: <div />
	);
};

export default connect(mapStateToProps)(CodeViewer);