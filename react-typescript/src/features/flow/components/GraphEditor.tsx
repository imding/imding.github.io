import React from 'react';
import { connect } from 'react-redux';

import Rete from 'rete';
import { NodeData } from 'rete/types/core/data';
import ReactRenderPlugin from 'rete-react-render-plugin';
import ConnectionPlugin from 'rete-connection-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import AreaPlugin from 'rete-area-plugin';
import ModulePlugin from 'rete-module-plugin';

import cuid from 'cuid';
import moment from 'moment';

import * as componentList from './ReteComponents';

import { resolveGraphAction, updateOutputAction } from '../actions';
import { editorJson } from '../constants';


type Props = {
	resolveGraph: (arg: any) => any,
	updateOutput: (arg: any) => any
};

const mapDispatchToProps = (dispatch: any) => ({
	resolveGraph: (nodes: any) => dispatch(resolveGraphAction(nodes)),
	updateOutput: (data: any) => dispatch(updateOutputAction(data))
});

const GraphEditor = (props: Props) => {
	const createEditor = (container: HTMLDivElement) => {
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
					const srcdoc = (outputNode.data.html as HTMLElement).outerHTML;

					props.resolveGraph(json.nodes);
					props.updateOutput({
						id: cuid(),
						timestamp: moment().format('MMMM Do, h:mm:ss a'),
						srcdoc
					});

					console.log(json);
				}
			});
		});

		editor.fromJSON(JSON.parse(editorJson));
		editor.view.resize();
		editor.trigger("process");
		AreaPlugin.zoomAt(editor, editor.nodes);
	}

	return <div
		id='graph-editor'
		style={{
			width: 'calc(100% - 640px)',
			height: '100%',
			position: 'absolute',
			left: '0',
			top: '0'
		}}
	>
		<div ref={ref => ref && createEditor(ref)} />
	</div>
};

export default connect(null, mapDispatchToProps)(GraphEditor);
