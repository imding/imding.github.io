declare module 'rete-area-plugin';
declare module 'rete-context-menu-plugin';
declare module 'rete-react-render-plugin';
declare module 'rete-module-plugin';

declare module 'MyModels' {
	export type EditorNodes = {
		id: string;
		nodes: any;
	}
	export type GraphOutput = {
		json: EditorNodes;
	};
}