/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useRef } from 'react';
import { MdEdit } from 'react-icons/md';
import { PulseLoader } from 'react-spinners';
import ContentEditable from 'react-contenteditable';
import { insertTextAtCursor } from '../../../utils';

export interface ITitle {
	text: string,
	graphTitle?: string,
	editable?: boolean,
	sync?: (text: string) => any
}

const Title: React.FC<ITitle> = props => {
	const { text, editable, graphTitle, sync } = props;
	const title = useRef(graphTitle || text);
	const cls = {
		titleWrapper: css`
			display: grid;
			grid-auto-flow: column;
			grid-gap: 2px;
			place-items: center;
		`,
		title: css`
			color: gold;
			font-style: italic;
			padding: 4px 8px;
			border-radius: 5px;
			outline: none;
			white-space: nowrap;
			cursor: ${editable ? 'pointer' : 'auto'}; 
			transition: background-color 0.1s ease-in-out;
			&:hover {
				background-color: ${editable ? 'rgba(0, 0, 0, 0.2)' : 'unset'};
			}
			&:focus {
				background-color: rgba(0, 0, 0, 0.4);
				cursor: text;
			}
		`,
	};

	console.log('render: <Title>', !!title.current);

	return (
		title.current
			? <div css={cls.titleWrapper}>
				{editable && <MdEdit color='gray' />}
				<ContentEditable
					className='editable'
					tagName='h4'
					html={title.current}
					disabled={!editable}
					onKeyDown={evt => {
						if (evt.key !== 'Enter') return;
						evt.preventDefault();
						evt.stopPropagation();
					}}
					onPaste={evt => {
						const clipboardData: DataTransfer = evt.nativeEvent.clipboardData!;
						const text = clipboardData.getData('Text');
						evt.preventDefault();
						evt.stopPropagation();
						insertTextAtCursor(text);
					}}
					onChange={evt => {
						if (evt.target.value.trim().length === 0) {
							evt.target.value = title.current;
						}
						else title.current = evt.target.value.trim();
						sync && sync(title.current);
					}}
					onBlur={evt => {
						const cleanValue = evt.target.textContent?.trim() as string;
						
						if (cleanValue !== title.current) {
							evt.target.innerText = (cleanValue.length && cleanValue) || title.current;
							title.current = evt.target.innerText;
						}
					}}
					css={cls.title}
				/>
			</div>
			: <PulseLoader size={6} color='gold' />
	);
};

export default React.memo(Title);
