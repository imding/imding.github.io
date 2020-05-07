/** @jsx jsx */

import { jsx, css } from '@emotion/core';
import { connect } from 'react-redux';
import { FcGoogle, FcExport, FcPrivacy } from 'react-icons/fc';
import { IconType } from 'react-icons/lib/cjs';

import { toggleLoginView } from '../features/auth/actions';

export interface IDropdownTrigger {
	type: 'image' | 'text',
	src: string,
	size: number,
	margin: number
};
export interface IDropdownOption {
	icon: 'google' | 'anonymous' | 'logout',
	text: string,
	handler: () => any,
}
export interface IDropdown {
	showLogin: boolean,
	trigger: IDropdownTrigger,
	header: string,
	options: IDropdownOption[],
	children?: any,
	toggleLoginView: (showLogin: boolean) => any,
};

const icons = new Map([
	['google', FcGoogle],
	['anonymous', FcPrivacy],
	['logout', FcExport],
]);

const mapStateToProps = (state: any) => {
	const { showLogin } = state.authReducer;
	return { showLogin };
};

const mapDispatchToProps = (dispatch: any) => ({
	toggleLoginView: (showLogin: boolean) => dispatch(toggleLoginView(showLogin))
});

const Dropdown: React.FC<IDropdown> = props => {
	const { trigger, header, options } = props;
	const cls = {
		root: css`
			display: inline-block;
			vertical-align: middle;
		`,
		triggerWrapper: css`
			width: ${trigger.size}px;
			height: ${trigger.size}px;
			cursor: pointer;
		`,
		triggerImage: css`
			width: 100%;
			border-radius: 50%;
		`,
		menuWrapper: css`position: relative;`,
		menu: css`
			border: 1px solid #aaa;
			border-radius: 5px;
			background-color: whitesmoke;
			position: absolute;
			top: ${trigger.margin}px;
			text-align: left;
			overflow: hidden;
			transform: translateX(calc(-50% + ${trigger.size / 2}px));
			white-space: nowrap;
			z-index: 99;
		`,
		header: css`
			color: #444;
			margin: 0;
			padding: 8px 16px;
			background-color: silver;
			text-align: center;
		`,
		options: css`
			padding: 5px 12px 5px 10px;
			background-color: ghostwhite;
			cursor: pointer;
		`,
		optionIcons: css`
			width: 20px;
			height: 20px;
			vertical-align: middle;
		`,
		optionText: css`
			color: gray;
			margin: 0;
			padding-left: 5px;
			display: inline-block;
		`
	};
	const menu = (
		<div css={cls.menu}>
			<h4 css={cls.header}>{header}</h4>
			{options.map((opt: any) => {
				const Icon: IconType = icons.get(opt.icon)!;
				const optHandler = () => {
					props.toggleLoginView(!props.showLogin);
					opt.handler();
				};
				return (
					<div key={opt.icon} css={cls.options} onClick={optHandler}>
						<Icon css={cls.optionIcons} />
						<h5 css={cls.optionText}>{opt.text}</h5>
					</div>
				);
			})}
		</div>
	);

	console.log('render: <Dropdown>', !!props.showLogin);

	return <div css={cls.root}>
		<div onClick={() => props.toggleLoginView(!props.showLogin)} css={cls.triggerWrapper}>
			{trigger.type === 'image'
				? <img alt='trigger' src={trigger.src} css={cls.triggerImage} />
				: <p>unknown trigger type</p>
			}
		</div>
		{props.showLogin && <div css={cls.menuWrapper}>{menu}</div>}
	</div>;
};

export default connect(mapStateToProps, mapDispatchToProps)(Dropdown);
