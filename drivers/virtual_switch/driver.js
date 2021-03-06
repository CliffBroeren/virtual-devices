"use strict";

const config = {};

const Device = require('../../general/drivers/device.js');
const driver = new Device(config);

//a list of devices, with their 'id' as key
//it is generally advisable to keep a list of
//paired and active devices in your driver's memory.
var devices = {};

module.exports = { 
		init: (devices, callback) => driver.init(devices, callback),
		added: (device_data, callback) => driver.added(device_data, callback),
		deleted: (device_data, callback) => driver.deleted(device_data, callback),
		renamed: (device_data, new_name) => driver.renamed(device_data, new_name),
		capabilities: {
			onoff: {},
			button: {},
			windowcoverings_state: {}
		}
	}

module.exports.pair = function( socket ) {
    socket.on('log', function( msg, callback ) {
        console.log(msg);
        callback( null, "ok" );
    });

    socket.on('getIcons', function( data, callback ) {
        console.log("Adding new device");

        var device_data = [
	        getIconNameAndLocation('switch'),
	        getIconNameAndLocation('light'),
	        getIconNameAndLocation('blinds'),
	        getIconNameAndLocation('tv'),
	        getIconNameAndLocation('hifi'),
	        getIconNameAndLocation('alarm'),
	        getIconNameAndLocation('button'),
	    ]

        callback( null, device_data );
    });

    socket.on('disconnect', function(){
        console.log("User aborted pairing, or pairing is finished");
    })
};

// this function is called by Homey when it wants to GET the state, e.g. when the user loads the smartphone interface
// `device_data` is the object as saved during pairing
// `callback` should return the current value in the format callback( err, value )
module.exports.capabilities.onoff.get = function(device_data, callback) {
	
    var switchDevice = Device.getDevice( device_data.id );
    if( switchDevice instanceof Error ) return callback( switchDevice );

    // send the state value to Homey
    callback( null, switchDevice.state );
}

// this function is called by Homey when it wants to SET the state, e.g. when the user presses the button on
// the smartphone
// `device_data` is the object as saved during pairing
// `onoff` is the new value
// `callback` should return the new value in the format callback( err, value )
module.exports.capabilities.onoff.set = function( device_data, onoff, callback ) {

	var switchDevice = Device.setState( device_data.id, 'onoff', onoff );
	if ( switchDevice instanceof Error ) return callback( switchDevice );
//	console.log("Setting " + switchDevice.data.name + " onoff-state to " + onoff)

    // also emit the new value to realtime
    // this produces Insights logs and triggers Flows
    module.exports.realtime( device_data, 'onoff', onoff);

	var state = switchDevice.state;
    var tokens = {"type": "device"};
    Homey.manager('flow').triggerDevice('press', tokens, state, device_data, function (err, result) {
   		if (err) return console.error(err);
	});

    // send the new onoff value to Homey
    callback( null, onoff );
}

//this function is called by Homey when it wants to GET the state, e.g. when the user loads the smartphone interface
//`device_data` is the object as saved during pairing
//`callback` should return the current value in the format callback( err, value )
module.exports.capabilities.windowcoverings_state.get = function(device_data, callback) {

	var switchDevice = Device.getDevice( device_data.id );
	if( switchDevice instanceof Error ) return callback( switchDevice );

	// send the state value to Homey
	callback( null, switchDevice.state );
}

//this function is called by Homey when it wants to SET the state, e.g. when the user presses the button on
//the smartphone
//`device_data` is the object as saved during pairing
//`onoff` is the new value
//`callback` should return the new value in the format callback( err, value )
module.exports.capabilities.windowcoverings_state.set = function( device_data, state, callback ) {

	var switchDevice = Device.setState( device_data.id, 'windowcoverings_state', state );
	if ( switchDevice instanceof Error ) return callback( switchDevice );

	// also emit the new value to realtime
	// this produces Insights logs and triggers Flows
	module.exports.realtime( device_data, 'windowcoverings_state', state);
	 
	// send the new state value to Homey
	callback( null, state );
}


module.exports.capabilities.button.set = function( device_data, onoff, callback ) {
    var buttonDevice = Device.getDevice( device_data.id );
    if( buttonDevice instanceof Error ) return callback( buttonDevice );

    var tokens = {"type": "device"};

    Homey.manager('flow').triggerDevice("press", tokens, true, device_data, function (err, result) {
   		if (err) return console.error(err);
	});

    // also emit the new value to realtime
    // this produces Insights logs and triggers Flows
    module.exports.realtime( device_data, 'button', true);
    
    callback( null, true );
}

function getIconNameAndLocation( name ) {
	return {
		"name": name,
		"location": "../assets/" + name + ".svg"
	}
}
