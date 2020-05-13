
import React from 'react';
import { connect } from 'react-redux';

import { MdCode } from 'react-icons/md';
import { Button, IButton } from '../../../../components/Panel/Header/Button';
import { toggleCodeViewer } from '../../actions';

const mapDispatchToProps = (dispatch: any) => ({
	toggleCodeViewer: (showCode: boolean) => dispatch(toggleCodeViewer(showCode))
});

const CodeToggle: React.FC<any> = props => {
	const cfg: IButton = {
		icon: MdCode,
		toggle: MdCode,
		isToggled: true,
		title: 'Hide The code viewer',
		hoverColor: '#ffeb7f',
		activeColor: 'gold',
		size: 36,
		handler: isToggled => {
			try {
				props.toggleCodeViewer(isToggled);
				return {
					title: `${isToggled ? 'Show' : 'Hide'} the code viewer`,
					color: isToggled ? cfg.activeColor : null
				}
			}
			catch(err) {
				console.warn(err);
			}
		}
	}

	return <Button {...cfg} />
};

export default connect(null, mapDispatchToProps)(React.memo(CodeToggle));