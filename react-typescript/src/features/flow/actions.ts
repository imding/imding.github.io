

export const resolveGraphAction = (nodes: any) => ({
	type: 'flow/RESOLVE_GRAPH',
	payload: nodes
});

export const updateOutputAction = (update: { id: string, timestamp: string, srcdoc: string }) => ({
	type: 'flow/UPDATE_OUTPUT',
	payload: update
});