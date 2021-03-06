"use strict";

const config = {
		triggers: {
			on: {
				name: 'virtual_holiday_on',
			},
			off: {
				name: 'virtual_holiday_off',
			}
		},
		conditions: {
			onoff: {
				name: 'virtual_holiday',
			}
		},
		actions: {
			on: {
				name: 'virtual_holiday_action_on',
				type: 'onoff'
			},
			off: {
				name: 'virtual_holiday_action_off',
				type: 'onoff'
			}
		},
		logger: {
		}
	};
	const Mode = require('../../general/drivers/mode.js');
	const driver = new Mode(config);

	module.exports = Object.assign(
		{},
		driver.getExports(), 
		{ init: (devices, callback) => driver.init(devices, callback) }
	);
