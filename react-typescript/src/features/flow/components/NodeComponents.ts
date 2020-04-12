import Rete from 'rete';
import { NumControl, TextContentControl, ElementControl, AttributeControl } from './NodeControls';
import { MyNode, ElementNode, HTMLNode } from './CustomNodes';

const numSocket = new Rete.Socket('Number');
const elmSocket = new Rete.Socket('HTML Element');
const attrSocket = new Rete.Socket('Attribute');

type Inputs = {
	[key: string]: any[]
};

export class HTMLComponent extends Rete.Component {
	constructor() {
		super('HTML Output');
		(this.data as any).component = HTMLNode;
	}

	builder(node: any) {
		const inp1 = new Rete.Input('head::1', '', elmSocket);
		const inp2 = new Rete.Input('body::1', '', elmSocket);

		return node.addInput(inp1).addInput(inp2);
	}

	worker(node: any, inputs: Inputs) {
		const html = document.createElement('html');
		const head = document.createElement('head');
		const body = document.createElement('body');
		const { headContents, bodyContents } = Object.entries(inputs).reduce((acc: any, entry: any) => {
			const [key, connections] = entry;
			
			if (connections.length) {
				const newKey = `${key.split('::').shift()}Contents`;
				connections.forEach((connection: any) => acc[newKey].push(connection));
			}

			return acc;
		}, { headContents: [], bodyContents: [] });

		headContents.forEach((content: HTMLElement) => head.append(content));
		bodyContents.forEach((content: HTMLElement) => body.append(content));
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
		const ctrl = new ElementControl(this.editor, 'element', node);
		const inp1 = new Rete.Input('attr::1', 'Attributes', attrSocket);
		const inp2 = new Rete.Input('content::1', 'Content', elmSocket);
		const out1 = new Rete.Output('element', 'Element', elmSocket);

		inp2.addControl(new TextContentControl(this.editor, 'text', node));

		return node
			.addControl(ctrl)
			.addInput(inp1)
			.addInput(inp2)
			.addOutput(out1);
	}

	worker(node: any, inputs: any, outputs: any) {
		outputs['element'] = node.data.element;
		console.log(node);
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
		
		const thisNode = this.editor!.nodes!.find(n => n.id === node.id)!;
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