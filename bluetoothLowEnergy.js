// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var Event = require('org.chromium.common.events');
var exec = require('cordova/exec');
var callbackWithError = require('org.chromium.common.errors').callbackWithError;

var fail = function(callback) {
    return callback && function(msg) {
        callbackWithError(msg, callback);
    };
};

exports.connect = function(deviceAddress, properties, callback) {
    if (typeof properties == 'function') {
        callback = properties;
        properties = {};
    }
    exec(callback, fail(callback), 'ChromeBluetooth', 'connect', [deviceAddress, properties]);
};

exports.disconnect = function(deviceAddress, callback) {
    exec(callback, fail(callback), 'ChromeBluetooth', 'disconnect', [deviceAddress]);
};

exports.getService = function(serviceId, callback) {
    exec(callback, fail(callback), 'ChromeBluetooth', 'getService', [serviceId]);
};

exports.getServices = function(deviceAddress, callback) {
    exec(callback, fail(callback), 'ChromeBluetooth', 'getServices', [deviceAddress]);
};

exports.getCharacteristic = function(characteristicId, callback) {
    var win = callback && function(uuid, service, properties, instanceId, value) {
        var info = {
            uuid: uuid,
            service: service,
            properties: properties,
            instanceId: instanceId,
            value: value
        };
        callback(info);
    };
    exec(win, fail(callback), 'ChromeBluetooth', 'getCharacteristic', [characteristicId]);
};

exports.getCharacteristics = function(serviceId, callback) {
    exec(callback, fail(callback), 'ChromeBluetooth', 'getCharacteristics', [serviceId]);
};

exports.getIncludedServices = function(serviceId, callback) {
    exec(callback, fail(callback), 'ChromeBluetooth', 'getIncludedServices', [serviceId]);
};

exports.getDescriptor = function(descriptorId, callback) {
    var win = callback && function(uuid, characteristic, instanceId, value) {
        var info = {
            uuid: uuid,
            characteristic: characteristic,
            instanceId: instanceId,
            value: value
        };
        callback(info);
    };
    exec(win, fail(callback), 'ChromeBluetooth', 'getDescriptor', [descriptorId]);
};

exports.getDescriptors = function(characteristicId, callback) {
    exec(callback, fail(callback), 'ChromeBluetooth', 'getDescriptors', [characteristicId]);
};

exports.readCharacteristicValue = function(characteristicId, callback) {
    var win = callback && function(uuid, service, properties, instanceId, value) {
        var info = {
            uuid: uuid,
            service: service,
            properties: properties,
            instanceId: instanceId,
            value: value
        };
        callback(info);
    };
    exec(win, fail(callback), 'ChromeBluetooth', 'readCharacteristicValue', [characteristicId]);
};

exports.writeCharacteristicValue = function(characteristicId, value, callback) {
    exec(callback, fail(callback), 'ChromeBluetooth', 'writeCharacteristicValue', [characteristicId, value]);
};

exports.startCharacteristicNotifications = function(characteristicId, properties, callback) {
    if (typeof properties == 'function') {
        callback = properties;
        properties = {};
    }
    exec(callback, fail(callback), 'ChromeBluetooth', 'startCharacteristicNotifications', [characteristicId, properties]);
};

exports.stopCharacteristicNotifications = function(characteristicId, callback) {
    exec(callback, fail(callback), 'ChromeBluetooth', 'stopCharacteristicNotifications', [characteristicId]);
};

exports.readDescriptorValue = function(descriptorId, callback) {
    var win = callback && function(uuid, characteristic, instanceId, value) {
        var info = {
            uuid: uuid,
            characteristic: characteristic,
            instanceId: instanceId,
            value: value
        };
        callback(info);
    };
    exec(win, fail(callback), 'ChromeBluetooth', 'readDescriptorValue', [descriptorId]);
};

exports.writeDescriptorValue = function(descriptorId, value, callback) {
    exec(callback, fail(callback), 'ChromeBluetooth', 'writeDescriptorValue', [descriptorId, value]);
};

exports.onServiceAdded = new Event('onServiceAdded');
exports.onServiceChanged = new Event('onServiceChanged');
exports.onServiceRemoved = new Event('onServiceRemoved');
exports.onCharacteristicValueChanged = new Event('onCharacteristicValueChanged');
exports.onDescriptorValueChanged = new Event('onDescriptorValueChanged');

function registerEvents() {

    var onServiceAddedCallback = function(service) {
        exports.onServiceAdded.fire(service);
    };
    exec(onServiceAddedCallback, null, 'ChromeBluetooth', 'registerServiceAddedEvent', []);

    var onServiceChangedCallback = function(service) {
        exports.onServiceChanged.fire(service);
    };
    exec(onServiceChangedCallback, null, 'ChromeBluetooth', 'registerServiceChangedEvent', []);

    var onServiceRemovedCallback = function(service) {
        exports.onServiceRemoved.fire(service);
    };
    exec(onServiceRemovedCallback, null, 'ChromeBluetooth', 'registerServiceRemovedEvent', []);

    var onCharacteristicValueChangedCallback = function(uuid, service, properties, instanceId, value) {
        var info = {
            uuid: uuid,
            service: service,
            properties: properties,
            instanceId: instanceId,
            value: value
        };
        exports.onCharacteristicValueChanged.fire(info);
    };
    exec(onCharacteristicValueChangedCallback, null, 'ChromeBluetooth', 'registerCharacteristicValueChangedEvent', []);

    var onDescriptorValueChangedCallback = function(uuid, characteristic, instanceId, value) {
        var info = {
            uuid: uuid,
            characteristic: characteristic,
            instanceId: instanceId,
            value: value
        };
        exports.onDescriptorValueChanged.fire(info);
    };
    exec(onDescriptorValueChangedCallback, null, 'ChromeBluetooth', 'registerDescriptorValueChangedEvent', []);
}

require('org.chromium.common.helpers').runAtStartUp(registerEvents);
