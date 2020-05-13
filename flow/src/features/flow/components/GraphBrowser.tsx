/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';
import GeoPattern from 'geopattern';

import { Panel, Header, IPanel } from './../../../components/Panel';
import { PulseLoader } from 'react-spinners';
import { IGraphMeta, setGraphTitle, setGraphKey, setFetchState, IFetchGraph, toggleGraphBrowser } from '../../../features/flow/actions';
import { IHeader } from '../../../components/Panel/Header';
import { useFirestore } from 'react-redux-firebase';

export interface IGraphBrowser {
	graphBrowser: {
		show: boolean,
		graphs: IGraphMeta[]
	}
}

interface IGraphCard extends IGraphMeta {
	setFetchState: (fetchState: IFetchGraph) => any,
	setGraphKey: (graphKey: string) => any,
	setGraphTitle: (graphtitle: string) => any,
	toggleGraphBrowser: (graphBowser: any) => any
}

const panelCfg: IPanel = {
	style: css`
		position: absolute;
		top: 38px;
		right: 0;
		min-width: 200px;
		z-index: 98;
	`
};
const headerCfg: IHeader = {
	name: 'Graph Browser',
	height: 32,
};
const contentStyle = css`
	display: grid;
	place-content: center;
	padding: 12px 12px 0 12px;
	min-height: 100px;
	max-height: 600px;
	background-color: ghostwhite;
	border: silver solid;
	border-width: 0 1px 1px;
	border-radius: 0 0 6px 6px;
	overflow-y: auto;

	&::-webkit-scrollbar {
		width: 8px;
	}

	&::-webkit-scrollbar-thumb {
		border-style: solid;
		border-width: 12px 4px 12px 0;
		border-color: transparent;
		background-color: rgba(255, 255, 255, 0.2);
		background-clip: content-box;
	}
`;
const cardStyle = css`
	display: grid;
	grid-template-columns: min-content 1fr;
	margin-right: 10px;  
	width: 100%;                                                       
	height: 50px;
	margin-bottom: 12px;
	border-radius: 5px;
	background-color: gainsboro;
	overflow: hidden;
	cursor: pointer;
	white-space: nowrap;
	transition: background-color 0.1s ease-in-out;

	&:hover {
		background-color: lightgray;
	}

	&:active {
		background-color: #ddd;
	}
`;
const iconStyle = css`
	width: 50px;
	height: 50px;
`;
const metaStyles = css`
	display: grid;
	grid-auto-flow: row;
	align-items: center;
	padding: 6px 10px;
	color: #555;

	&:hover {
		color: #222;
	}
`;
const clampString = (str: string, limit: number): string => {
	return str.length > limit ? `${str.slice(0, limit)}...` : str;
};
const svgUrlFromSeed = (seed: string): string => {
	const svg = GeoPattern.generate(seed).toSvg();
	const blob = new Blob([svg], { type: 'image/svg+xml' });
	return URL.createObjectURL(blob);
};
const mapDispatchToCard = (dispatch: any) => ({
	setFetchState: (fetchState: IFetchGraph) => dispatch(setFetchState(fetchState)),
	setGraphKey: (graphTitle: string) => dispatch(setGraphKey(graphTitle)),
	setGraphTitle: (graphTitle: string) => dispatch(setGraphTitle(graphTitle)),
	toggleGraphBrowser: (GraphBrowser: any) => dispatch(toggleGraphBrowser(GraphBrowser))
});
const GraphCard: React.FC<IGraphCard> = props => {
	const firestore = useFirestore();
	const createdDate = (props.created as any).toDate();
	const age = moment(createdDate).fromNow();
	const open = (uid: string) => {
		props.setFetchState({ isFetching: true, jsonResponse: null });
		props.toggleGraphBrowser({ show: false, graphs: null });

		firestore.collection('userContent').doc(uid).get().then(docRef => {
			if (docRef.exists) {
				const { json, title } = docRef.data() as any;

				props.setGraphKey(docRef.id);
				props.setGraphTitle(title);
				props.setFetchState({ isFetching: false, jsonResponse: json });
			}
			else console.log(`"${props.title}" doesn't exist.`);
		}).catch(err => {
			//	TODO: handle error
			console.log(err);
		});
	};

	return (
		<div title={props.title} onClick={() => open(props.uid)} css={cardStyle}>
			<img css={iconStyle} src={svgUrlFromSeed(props.uid)} alt={props.title} />
			<div css={metaStyles}>
				<h4>{clampString(props.title, 30)}</h4>
				<small>{age}</small>
			</div>
		</div>
	);
};

const mapStateToProps = (state: any) => ({
	graphBrowser: state.flowReducer.graphBrowser
});

const GraphBrowser: React.FC<IGraphBrowser> = props => {
	return props.graphBrowser && props.graphBrowser.show
		? <Panel {...panelCfg}>
			<Header {...headerCfg} />
			<div css={contentStyle}>
				{props.graphBrowser && props.graphBrowser.graphs
					? props.graphBrowser.graphs.map((g: IGraphMeta) => {
						const GraphCardWS = connect(null, mapDispatchToCard)(GraphCard);
						return <GraphCardWS {...g} key={g.uid} />;
					})
					: <div css={css`padding-bottom: 12px;`}>
						<PulseLoader color='gold' size={6} />
					</div>
				}
			</div>
		</Panel>
		: <div />;
};

export default connect(mapStateToProps)(GraphBrowser);