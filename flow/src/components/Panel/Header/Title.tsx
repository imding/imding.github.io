
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React from 'react';
import ContentEditable from 'react-contenteditable';
import { MdEdit } from 'react-icons/md';
import { PulseLoader } from 'react-spinners';
import { insertTextAtCursor } from '../../../utils';

export interface ITitle {
	text: {
		default: string,
		state?: string
	},
	onEdit?: (text: string) => void,
	[key: string]: any
}

export const Title: React.FC<ITitle> = props => {
	const { text, onEdit } = props;
	const title = (text.state && props[text.state]) || text.default;
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
			cursor: ${onEdit ? 'pointer' : 'auto'}; 
			transition: background-color 0.1s ease-in-out;
			&:hover {
				background-color: ${onEdit ? 'rgba(0, 0, 0, 0.2)' : 'unset'};
			}
			&:focus {
				background-color: rgba(0, 0, 0, 0.4);
				cursor: text;
			}
		`,
	};

	console.log(`render: <Title> "${title}"`);

	return (
		title
			? <div css={cls.titleWrapper}>
				{onEdit && <MdEdit color='white' opacity='0.3' />}
				<ContentEditable
					className='editable'
					tagName='h4'
					html={title}
					disabled={!onEdit}
					onKeyDown={evt => {
						if (evt.key !== 'Enter') return;
						evt.preventDefault();
						evt.stopPropagation();
					}}
					onPaste={evt => {
						if (!onEdit) return;
						const clipboardData: DataTransfer = evt.nativeEvent.clipboardData!;
						const text = clipboardData.getData('Text');
						evt.preventDefault();
						evt.stopPropagation();
						insertTextAtCursor(text);
					}}
					onChange={() => { }}
					onBlur={evt => {
						if (!onEdit) return;

						const input = evt.target;
						const cleanValue = input.textContent?.trim() as string;

						if (cleanValue === text.default) return;

						input.textContent = (cleanValue.length && cleanValue) || text.default;
						onEdit && onEdit(input.textContent)
					}}
					css={cls.title}
				/>
			</div>
			: <span title='No title text provided'>
				<PulseLoader size={6} color='gold' />
			</span>
	);
};
