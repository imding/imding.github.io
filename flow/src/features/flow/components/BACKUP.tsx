import React from 'react';
import { connect } from 'react-redux';
import MonacoEditor from 'react-monaco-editor';
import beautify from 'js-beautify';

import { makeSource } from '../../../utils';

export interface IGraphOutput {
	htmlString: string
}

const menuHeight = 30;
const SectionHeader = (props: {
	text: string,
	vRef: 'top' | 'bottom'
	vPos: number,
}) => {
	return <div
		style={{
			position: 'absolute',
			[props.vRef]: `${props.vPos}px`,
			width: '100%',
			height: `${menuHeight}px`,
			backgroundColor: '#1a1a1a'
		}}
	>
		<h5 style={{
			color: 'white',
			paddingTop: '5px',
			textAlign: 'center'
		}}>{props.text}</h5>
	</div>
};

const mapStateToProps = (state: any) => ({
	htmlString: state.flowReducer.htmlString
});

const GraphOutput: React.FC<IGraphOutput> = props => {
	const width = 640;
	const codeViewerHeight = width / 16 * 9;
	const tabSize = 2;

	console.log('render: <GraphOutput>')

	return <div
		id='graph-output'
		style={{
			width: `${width}px`,
			height: '100%',
			position: 'absolute',
			right: '0',
			top: '0'
		}}
	>
		<SectionHeader
			text='Output Viewer'
			vRef='top'
			vPos={0}
		/>

		<iframe
			id='output-viewer'
			title='HTML Output'
			style={{
				position: 'absolute',
				top: `${menuHeight}px`,
				width: '100%',
				height: `calc(100% - ${codeViewerHeight}px - ${menuHeight * 2}px)`,
				border: 'none'
			}}
			srcDoc={props.htmlString || makeSource('', '<h1>Flow</h1>')}
		/>

		<SectionHeader
			text='Code Viewer'
			vRef='bottom'
			vPos={codeViewerHeight}
		/>

		<div style={{
			position: 'absolute',
			bottom: '0'
		}}>
			<MonacoEditor
				width={width}
				height={codeViewerHeight}
				theme='vs-dark'
				value={beautify.html(props.htmlString, { 'indent_size': tabSize, 'inline': [] })}
				language='html'
				options={{
					readOnly: true,
					wordWrap: 'on',
					scrollBeyondLastLine: false,
					scrollBeyondLastColumn: 10,
				}}
				editorDidMount={editor => {
					const model = editor.getModel();
					if (model) model.updateOptions({ tabSize });
				}}
			/>
		</div>
	</div>;
};

export default connect(mapStateToProps)(GraphOutput);