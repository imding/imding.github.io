
import { IconType } from 'react-icons/lib/cjs';

export interface IButton {
	/** Use icons from the "react-icons" library
	 * @see https://react-icons.github.io/
	 */
	icon: IconType,
	title: string,
	/** The size of the returned `<Icon>` will be `Math.max(size - 10, 20)`
	 ** Padding is specified in `iconCfg` of `ToolbarAction`
	 */
	size?: number,

	/** If provided, the returned `<Icon>` will toggle between `icon` and `toggle` when clicked
	 ** Use icons from the "react-icons" library
	 * @see https://react-icons.github.io/
	 */
	toggle?: IconType,
	enabled?: boolean,
	color?: string,
	hoverColor?: string,
	activeColor?: string,
	handler?: (...arg: any) => any,
	[key: string]: any
}