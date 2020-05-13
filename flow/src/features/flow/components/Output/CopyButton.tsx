
import React from 'react';
import { connect } from 'react-redux';
import beautify from 'js-beautify';

import { MdContentCopy } from 'react-icons/md';
import { Button, IButton } from '../../../../components/Panel/Header/Button';

export interface ICopyButton {
	htmlString: string
}

const mapStateToProps = (state: any) => ({
	htmlString: state.flowReducer.htmlString
});
const CopyButton: React.FC<ICopyButton> = props => {
	const cfg: IButton = {
		icon: MdContentCopy,
		size: 34,
		title: 'Copy code to clipboard',
		blink: 'gold',
		handler: () => navigator.clipboard.writeText(
			beautify.html(props.htmlString, { 'inline': [] })
		)
	}

	return <Button {...cfg} />
};

export default connect(mapStateToProps)(CopyButton);