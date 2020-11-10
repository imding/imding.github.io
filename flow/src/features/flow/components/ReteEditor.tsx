/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import React from 'react';
import { connect } from 'react-redux';

import Rete from 'rete';
import { NodeData } from 'rete/types/core/data';
import ReactRenderPlugin from 'rete-react-render-plugin';
import ConnectionPlugin from 'rete-connection-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import AreaPlugin from 'rete-area-plugin';
// import ModulePlugin from 'rete-module-plugin';

import * as componentList from './ReteComponents';

import { defaultGraphJson } from '../constants';
import { PulseLoader } from 'react-spinners';
import { IFetchGraph } from '../actions';

interface IReteEditor {
	useJson?: (...arg: any) => any,
	useHtml?: (...arg: any) => any,
	fetchState?: IFetchGraph,
	graphKey?: any,
	// graphBrowser?: any,
}

const loaderWrapper = css`
	width: 100%;
	height: 100%;
	display: grid;
	place-items: center;
`;
const loaderStyle = css`
	background-color: rgba(0, 0, 0, 0.6);
	padding: 14px 15px 8px;
    border-radius: 20px;
`;
const mapStateToProps = (state: any) => ({
	// graphBrowser: state.flowReducer.graphBrowser,
	fetchState: state.flowReducer.fetchState,
});
const ReteEditor: React.FC<IReteEditor> = props => {
	const { isFetching, jsonResponse } = props.fetchState || {};
	const createEditor = (container: HTMLDivElement, json: any) => {
		const editor = new Rete.NodeEditor('flow@0.1.0', container);
		const engine = new Rete.Engine('flow@0.1.0');
		const components = Object.values(componentList).map(component => new component());

		components.forEach(component => {
			editor.register(component);
			engine.register(component);
		});

		editor.use(ConnectionPlugin);
		editor.use(ReactRenderPlugin);
		editor.use(ContextMenuPlugin);

		editor.on([
			'process',
			'nodecreated',
			'noderemoved',
			'connectioncreated',
			'connectionremoved'
		], async () => {
			await engine.abort();

			const json = editor.toJSON();
			const outputNode = Object.values(json.nodes).find(node => node.name === 'HTML Output') as NodeData;

			await engine.process(json).then(res => {
				if (res === 'success' && outputNode) {
					props.useHtml && props.useHtml((outputNode.data.html as HTMLElement).outerHTML);
					//	stringify and parse json to strip field values incompatible with firestore
					props.useJson && props.useJson(JSON.parse(JSON.stringify(json)));

				}
			});
		});

		editor.fromJSON(isFetching === false ? json : defaultGraphJson);
		editor.trigger("process");
		editor.view.resize();
		AreaPlugin.zoomAt(editor);
	};

	console.log('render: <ReteEditor>');

	return isFetching
		? <div css={loaderWrapper}>
			<div css={loaderStyle}>
				<PulseLoader color='gold' margin={10} />
			</div>
		</div>
		: <div ref={ref => ref && createEditor(ref, jsonResponse)} />;
};

export default connect(mapStateToProps)(ReteEditor);