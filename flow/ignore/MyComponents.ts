import Rete from 'rete';

import { MyNode } from './MyNode';
import { NumControl } from './MyControls';


const numSocket = new Rete.Socket('Number');

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

	worker(node: any, inputs: any, outputs: any) {
		var n1 = inputs["num1"].length ? inputs["num1"][0] : node.data.num1;
		var n2 = inputs["num2"].length ? inputs["num2"][0] : node.data.num2;
		var sum = n1 + n2;

		// if (this.editor) {
		// 	const nextNode = this.editor.nodes.find(n => n.id === node.id)!;
		// 	const preview = nextNode.controls.get('preview')!;

			// preview.setValue(sum);
			outputs["num"] = sum;
		// }
	}
}


