
import React from 'react';
import { connect } from 'react-redux';

import { MdFolder, MdFolderOpen, MdSave } from 'react-icons/md';
import { Button, IButton } from '../../../../components/Panel/Header/Button';


const mapStateToProps = (state: any) => ({
	graphJson: state.flowReducer.graphJson,
	loginType: state.authReducer.loginType,
});

const SaveButton: React.FC<any> = props => {
	const cfg: IButton = {
		icon: MdSave,
		size: 36,
		enabled: props.loginType === 2,
		title: 'Save this graph',
		handler: () => {
			console.log(props.graphJson)
		}
	};

	return <Button {...cfg}/>
};

export default connect(mapStateToProps)(SaveButton);