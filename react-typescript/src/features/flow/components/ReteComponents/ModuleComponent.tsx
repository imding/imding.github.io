import Rete from 'rete';

import { TextInput } from '../ReteControls/';

class ModuleComponent extends Rete.Component {
	module: { nodeType: string };

	constructor() {
		super("Module");
		this.module = {
			nodeType: 'module'
		}
	}

	builder(node) {
		var ctrl = new TextInput(this.editor, 'module', node);
		// ctrl.onChange = () => {
		// 	console.log(this)
		// 	this.updateModuleSockets(node);
		// 	node._alight.scan();
		// }
		return node.addControl(ctrl);
	}

	async worker() { }

	change(node, item) {
		node.data.module = item;
		this.editor.trigger('process');
	}
}

export default ModuleComponent;