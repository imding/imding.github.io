import React from 'react';
import { connect } from 'react-redux';

import Rete from 'rete';
import ReactRenderPlugin from 'rete-react-render-plugin';
import ConnectionPlugin from 'rete-connection-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import AreaPlugin from 'rete-area-plugin';

import moment from 'moment';

import { AddComponent } from './NodeComponents';

import { resolveGraphAction, updateOutputAction } from '../actions';
import { makeSource } from '../../../utils';


type Props = {
	resolveGraph: (arg: any) => any,
	updateOutput: (arg: any) => any
};

const mapDispatchToProps = (dispatch: any) => ({
	resolveGraph: (nodes: any) => dispatch(resolveGraphAction(nodes)),
	updateOutput: (srcdoc: string) => dispatch(updateOutputAction(srcdoc))
});

const GraphEditor = (props: Props) => {
	const createEditor = (container: HTMLDivElement) => {
		const editor = new Rete.NodeEditor('flow@0.1.0', container);
		const engine = new Rete.Engine('flow@0.1.0');
		const components = [new AddComponent()];

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
		], async evt => {
			await engine.abort();

			const json = editor.toJSON();

			await engine.process(json).then(res => {
				if (res === 'success') {
					props.resolveGraph(json.nodes);
					props.updateOutput(makeSource('', `Updated at ${moment().format('MMMM Do, h:mm:ss a')}`));
				}
				else {
					console.warn('Graphy failed to resolve.');
				}
			});
		});

		editor.view.resize();
		editor.trigger("process");
		AreaPlugin.zoomAt(editor, editor.nodes);
	}

	return <div id='graph-editor' ref={ref => ref && createEditor(ref)} />;
};

export default connect(null, mapDispatchToProps)(GraphEditor);
