import Rete from 'rete';

import { ElementNode } from '../ReteNodes';
import {
	InputManager,
	ElementInput,
	AttributeInput,
	TextInput
} from '../ReteControls';

import { KEY, makeKey, removeSuffix, Inputs, elmSocket, attrSocket } from '../../constants';
import { obj, capitalise } from '../../../../utils';

export default class ElementComponent extends Rete.Component {
	constructor() {
		super('Element');
		(this.data as any).component = ElementNode;
	}

	builder(node: any) {
		const attrMKey = makeKey.attr('MANAGER');
		const contentMKey = makeKey.content('MANAGER');
		const elementInput = new ElementInput(this.editor, KEY.ELEMENT, node);
		const attributeManager = new InputManager(this.editor, attrMKey, node);
		const contentManager = new InputManager(this.editor, contentMKey, node);
		const addInputs = (key: string, title: string, socket: any, control?: any) => {
			node.data[key].forEach((inputKey: string) => {
				const input = new Rete.Input(inputKey, title, socket);
				if (control) input.addControl(new control(this.editor, inputKey, node));
				node.addInput(input);
			});
		};

		node.addControl(elementInput)
			.addControl(attributeManager)
			.addControl(contentManager);

		addInputs(attrMKey, 'Attribute', attrSocket, AttributeInput);
		addInputs(contentMKey, 'Element', elmSocket, TextInput);

		const out = new Rete.Output(KEY.ELEMENT, 'Element', elmSocket);

		return node.addOutput(out);
	}

	async worker(node: any, inputs: Inputs, outputs: any) {
		const elementName = node.data[KEY.ELEMENT];

		if (!elementName) return console.warn('Missing element name.');

		const thisNode = this.editor?.nodes.find(n => n.id === node.id)!;
		const syncInputs = (opts: {
			managerKey: string,
			control?: any,
			readonly?: boolean,
			afterSync?: (socketName: string) => boolean | void
		}) => {
			const { managerKey, control, readonly, afterSync } = opts;
			const then = (socketName: string) => (afterSync && afterSync(socketName)) || true;

			node.data[managerKey] = node.data[managerKey].filter((socketName: string) => {
				if (obj(node.data).hasKey(socketName)) {
					//	input has been deleted
					if (node.data[socketName] === null) {
						const inp = thisNode.inputs.get(socketName);

						if (inp) {
							inp.connections.forEach(conn => this.editor?.removeConnection(conn));
							thisNode.removeInput(inp);
							thisNode.update();
							delete node.data[socketName];
						}
						else console.warn(`Input was deleted from manager but was not found on ${node.name}(id: ${node.id}).`);

						//	indicate input is trash
						return false;
					}
					//	no sync needed
					return then(socketName);
				};

				const key = removeSuffix(socketName);
				const label = capitalise(key);
				const newInput = new Rete.Input(socketName, label, elmSocket);

				newInput.addControl(new (control || TextInput)(this.editor, socketName, node, !!readonly));
				thisNode.addInput(newInput);
				thisNode.update();

				return then(socketName);
			});
		};
		const afterSync = (socketName: string) =>  {
			const input = inputs[socketName] && inputs[socketName][0];
			const dataType = makeKey.io(removeSuffix(socketName));
			const outputData = input || node.data[socketName];
			outputs[KEY.ELEMENT][dataType].push(outputData);
		};

		outputs[KEY.ELEMENT] = {
			name: node.data[KEY.ELEMENT],
			attributes: [],
			contents: []
		};

		syncInputs({ managerKey: makeKey.attr('MANAGER'), control: AttributeInput, afterSync });
		syncInputs({ managerKey: makeKey.content('MANAGER'), afterSync });
	}
}