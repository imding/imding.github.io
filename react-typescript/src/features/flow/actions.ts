

export const resolveGraphAction = (nodes: any) => ({
	type: 'flow/RESOLVE_GRAPH',
	payload: nodes
});

export const updateOutputAction = (srcdoc: string) => ({
	type: 'flow/UPDATE_OUTPUT',
	payload: srcdoc
});