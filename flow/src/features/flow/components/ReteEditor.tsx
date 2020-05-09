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

// import { updateOutput } from '../actions';
import { defaultGraphJson } from '../constants';

// export interface IReteEditor {
// 	// sync: (json: any) => any,
// 	// resolveGraph: (arg: any) => any,
// 	updateOutput: (arg: any) => any
// };

// const mapDispatchToProps = (dispatch: any) => ({
// 	// resolveGraph: (graphJson: any) => dispatch(resolveGraph(graphJson)),
// 	updateOutput: (htmlString: any) => dispatch(updateOutput(htmlString))
// });

interface IReteEditor {
	useJson?: (...arg: any) => any,
	useHtml?: (...arg: any) => any
}

const ReteEditor: React.FC<IReteEditor> = props => {
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
					//	stringify and parse json to strip field values incompatible with firestore
					// props.resolveGraph(JSON.parse(JSON.stringify(json)));
					// props.sync && props.sync(JSON.parse(JSON.stringify(json)));
					props.useHtml && props.useHtml((outputNode.data.html as HTMLElement).outerHTML);
					props.useJson && props.useJson(JSON.parse(JSON.stringify(json)));
					
				}
			});
		});

		editor.fromJSON(defaultGraphJson);
		editor.trigger("process");
		editor.view.resize();
		AreaPlugin.zoomAt(editor);
	};

	return <div ref={ref => ref && createEditor(ref)} />;
};

// export default connect(null, mapDispatchToProps)(React.memo(ReteEditor));
export default ReteEditor;