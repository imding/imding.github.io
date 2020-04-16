import Rete from 'rete';
// import { ConnectionData } from 'rete/types/core/data';

import { MyNode, ElementNode, HTMLNode } from './CustomNodes';
import {
	NumControl,
	TextContentControl,
	ElementPicker,
	ControlManager,
	AttributeControl,
	// AttributeControl
} from './NodeControls';

import { KEY, key, getKey } from '../constants';
import { capitalise } from '../../../utils';

type Inputs = {
	[key: string]: any[]
};

const numSocket = new Rete.Socket('Number');
const elmSocket = new Rete.Socket('Element');
const attrSocket = new Rete.Socket('Attribute');


export class HTMLComponent extends Rete.Component {
	constructor() {
		super('HTML Output');
		(this.data as any).component = HTMLNode;
	}

	builder(node: any) {
		const inp1 = new Rete.Input(key.head(1), 'Element', elmSocket);
		const inp2 = new Rete.Input(key.body(1), 'Element', elmSocket);
		const inp3 = new Rete.Input(key.body(2), 'Element', elmSocket);

		return node.addInput(inp1).addInput(inp2).addInput(inp3);
	}

	worker(node: any, inputs: Inputs) {
		const html = document.createElement('html');
		const head = document.createElement('head');
		const body = document.createElement('body');
		const details = Object.entries(inputs).reduce((acc: any, entry: any) => {
			const [key, connections] = entry;

			connections.forEach((connection: any) => acc[getKey(key)].push(connection));
			return acc;
		}, { [KEY.HEAD]: [], [KEY.BODY]: [] });
		const buildTree = (parent: any): HTMLElement => {
			const el = document.createElement(parent.name);

			//	TODO: handle attributes here
			parent.attrs.forEach((attr: any) => {
				if (attr.name.length) {
					el.setAttribute(attr.name, attr.value);
				}
			});

			parent.contents.forEach((content: any) => {
				if (typeof content === 'string') {
					el.append(document.createTextNode(content))
				}
				else el.append(buildTree(content));
			});

			return el;
		};

		details[KEY.HEAD].forEach((content: HTMLElement) => head.append(content));
		details[KEY.BODY].forEach((content: any) => body.append(buildTree(content)));
		html.append(head, body);

		node.data.html = html;
	}
}

export class ElementComponent extends Rete.Component {
	constructor() {
		super('Element');
		(this.data as any).component = ElementNode;
	}

	builder(node: any) {
		const elmPicker = new ElementPicker(this.editor, KEY.ELEMENT, node);
		const attributeManager = new ControlManager(this.editor, key.attr('MANAGER'), node);
		const contentManager = new ControlManager(this.editor, key.content('MANAGER'), node);
		const inpAttr = new Rete.Input(key.attr(1), 'Attributes', attrSocket);
		const inpContent = new Rete.Input(key.content(1), 'Content', elmSocket);
		const out = new Rete.Output(KEY.ELEMENT, 'Element', elmSocket);

		inpAttr.addControl(new AttributeControl(this.editor, key.attr(1), node));
		inpContent.addControl(new TextContentControl(this.editor, key.content(1), node));

		return node
			.addControl(elmPicker)
			.addControl(attributeManager)
			.addControl(contentManager)
			.addInput(inpAttr)
			.addInput(inpContent)
			.addOutput(out);
	}

	worker(node: any, inputs: Inputs, outputs: any) {
		const element = node.data[KEY.ELEMENT];

		if (!element) return console.warn('Missing element name.');

		const thisNode = this.editor?.nodes.find(n => n.id === node.id)!;
		// const managers = [
		// 	node.data[key.attr('MANAGER')],
		// 	node.data[key.content('MANAGER')]
		// ];
		const addInputControl = (socketName: string) => {
			if (node.data.hasOwnProperty(socketName)) return;

			const key = getKey(socketName);
			const label = capitalise(key);
			const socket = key === KEY.ATTRIBUTE ? attrSocket : elmSocket;
			const newInput = new Rete.Input(socketName, label, socket);
			const control = key === KEY.ATTRIBUTE ? AttributeControl : TextContentControl;

			newInput.addControl(new control(this.editor, socketName, node));
			thisNode.addInput(newInput);
			thisNode.update();
		};

		node.data[key.attr('MANAGER')].forEach(addInputControl);
		node.data[key.content('MANAGER')].forEach(addInputControl);

		// managers.forEach(manager => {
		// 	manager.forEach((socketName: string) => {
		// 		if (node.data.hasOwnProperty(socketName)) return;

		// 		const newInput = new Rete.Input(socketName, 'Content', elmSocket);

		// 		newInput.addControl(new TextContentControl(this.editor, socketName, node));
		// 		thisNode.addInput(newInput);
		// 		thisNode.update();
		// 	});
		// });

		const details = Object.entries(inputs).reduce((acc: any, entry: any) => {
			const [key, input] = entry;
			const inputType = getKey(key);

			if (input.length) acc[inputType].push(input[0]);
			else acc[inputType].push(node.data[key]);
			return acc;
		}, { [KEY.ATTRIBUTE]: [], [KEY.CONTENT]: [] });

		outputs[KEY.ELEMENT] = {
			name: node.data[KEY.ELEMENT],
			attrs: details[KEY.ATTRIBUTE],
			contents: details[KEY.CONTENT]
		};

		if (node.id === 8) {
			console.warn(`== ${node.name} ==`);
			console.log(outputs.ELEMENT);
		}
		// console.log(details);
		// console.log(inputs, outputs);

		// const isFull = Object.entries(inputs)
		// 	.filter(([key, _]) => key.startsWith(KEY.CONTENT))
		// 	.every(([_, values]) => values.length);

		// if (isFull) {
		// 	const thisNode = this.editor?.nodes.find(n => n.id === node.id)!;
		// 	const inputNumber = details.CONTENT.length + 1;
		// 	const newInput = new Rete.Input(key.content(inputNumber), 'Content', elmSocket);

		// 	newInput.addControl(new TextContentControl(this.editor, key.text(inputNumber), node));
		// 	thisNode.addInput(newInput);
		// 	thisNode.update();
		// }
	}
}

export class NumComponent extends Rete.Component {
	constructor() {
		super('Number');
	}

	builder(node: any) {
		const ctrl = new NumControl(this.editor, 'num', node);
		const out1 = new Rete.Output('num', 'Number', numSocket);

		return node.addControl(ctrl).addOutput(out1);
	}

	worker(node: any, inputs: any, outputs: any) {
		outputs['num'] = node.data.num;
	}
}


export class AddComponent extends Rete.Component {
	constructor() {
		super('Add');
		(this.data as any).component = MyNode; // optional
	}

	builder(node: any) {
		const inp1 = new Rete.Input('num1', 'Number', numSocket);
		const inp2 = new Rete.Input('num2', 'Number2', numSocket);
		const out = new Rete.Output('num', 'Number', numSocket);

		inp1.addControl(new NumControl(this.editor, 'num1', node));
		inp2.addControl(new NumControl(this.editor, 'num2', node));

		return node
			.addInput(inp1)
			.addInput(inp2)
			.addControl(new NumControl(this.editor, 'preview', node, true))
			.addOutput(out);
	}

	worker(node: any, inputs: Inputs, outputs: any) {
		const sum = Object.entries(inputs).reduce((acc, input) => {
			const [key, val] = input;
			return acc + (val.length ? val[0] : node.data[key]);
		}, 0);

		const thisNode = this.editor!.nodes.find(n => n.id === node.id)!;
		const preview = thisNode.controls.get('preview')!;

		(preview as any).setValue(sum);

		outputs['num'] = sum;


		// const isFull = Object.values(inputs).every(input => input.length);

		// if (isFull) {
		// 	const newInput = new Rete.Input('num3', 'Number', numSocket);

		// 	thisNode.addInput(newInput).addControl(new NumControl(this.editor, 'preview', node, true));
		// 	thisNode.update();

		// }
	}
}


