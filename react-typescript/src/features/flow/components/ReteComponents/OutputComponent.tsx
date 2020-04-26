import Rete from 'rete';

import { OutputNode } from '../ReteNodes';
import { InputManager, TextInput } from '../ReteControls';
import { KEY, makeKey, removeSuffix, tags, Inputs, elmSocket } from '../../constants';
import { obj, capitalise } from '../../../../utils';

export default class OutputComponent extends Rete.Component {
	constructor() {
		super('HTML Output');
		(this.data as any).component = OutputNode;
	}

	builder(node: any) {
		const headContentMKey = makeKey.head('MANAGER');
		const bodyContentMKey = makeKey.body('MANAGER');
		const headContentManager = new InputManager(this.editor, headContentMKey, node);
		const bodyContentManager = new InputManager(this.editor, bodyContentMKey, node);
		const addInputs = (managerKey: string, title: string, socket: any, readonly: boolean = false) => {
			node.data[managerKey].forEach((inputKey: string) => {
				const input = new Rete.Input(inputKey, title, socket);
				input.addControl(new TextInput(this.editor, inputKey, node, readonly));
				node.addInput(input);
			});
		};

		node.addControl(headContentManager);
		node.addControl(bodyContentManager);

		addInputs(headContentMKey, 'Element', elmSocket, true);
		addInputs(bodyContentMKey, 'Element', elmSocket);

		return node;
	}

	async worker(node: any, inputs: Inputs) {
		const html = document.createElement('html');
		const head = document.createElement('head');
		const body = document.createElement('body');
		const thisNode = this.editor?.nodes.find(n => n.id === node.id)!;
		const setAttributes = (el: HTMLElement, attrs: { name: string, value: string }[]) => {
			attrs.forEach(attr => attr.name.length && el.setAttribute(attr.name, attr.value));
		};
		const buildTree = (parent: any | string): HTMLElement | Text => {
			if (typeof parent === 'string') {
				return document.createTextNode(parent);
			}

			const el = document.createElement(parent.name);

			setAttributes(el, parent[makeKey.io(KEY.ATTRIBUTE)]);
			parent[makeKey.io(KEY.CONTENT)].forEach((content: any) => el.append(buildTree(content)));
			return el;
		};
		const handleError = (err: any) => {
			//	TODO: handle errors
		};
		const syncInputs = (opts: {
			managerKey: string,
			readonly?: boolean,
			afterSync?: (socketName: string) => boolean | void
		}) => {
			const { managerKey, readonly, afterSync } = opts;
			const then = (socketName: string) => afterSync ? afterSync(socketName) || true : true;

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
				const control = new TextInput(this.editor, socketName, node, !!readonly);

				newInput.addControl(control);
				thisNode.addInput(newInput);
				thisNode.update();

				return then(socketName);
			});
		};

		syncInputs({
			managerKey: makeKey.head('MANAGER'),
			readonly: true,
			afterSync: socketName => {
				//	sockets can receive multiple inputs
				//	here only the first one is retrieved
				const input = inputs[socketName] && inputs[socketName][0];

				if (!input) {
					return console.warn('The <head> element receives empty input.');
				}

				const name = input.name;

				if (!tags.allowedInHead.includes(name)) {
					return console.warn(`<${name}> element is not allowed inside the <head> element.`);
				}

				const contents = input[makeKey.io(KEY.CONTENT)];

				if (contents.some((content: any) => typeof content !== 'string')) {
					return console.warn('Elements inside the <head> element can not have nested elements.');
				}

				const el = document.createElement(name);
				const attributes = input[makeKey.io(KEY.ATTRIBUTE)];
				const textContent = contents.map((content: string) => document.createTextNode(content));

				setAttributes(el, attributes);
				el.append(...textContent);
				head.append(el);
			}
		});

		syncInputs({
			managerKey: makeKey.body('MANAGER'),
			afterSync: socketName => {
				//	fetch input data via socket
				const input = inputs[socketName];
				//	prioritise input data, fallback to node data
				const root = (input && input[0]) || node.data[socketName];

				//	build and append HTML elements
				try { body.append(buildTree(root)) }
				catch (err) { handleError(err) }
			}
		});

		html.append(head, body);
		node.data.html = html;
	}
}