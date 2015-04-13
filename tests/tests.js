// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

exports.defineManualTests = function(rootEl, addButton) {

  var devices = {}; /** key is deviceAddress, value is device object */
  var services = {}; /** key is serviceId, value is service object */
  var characteristics = {}; /** key is characteristicId, value is characteristic object */
  var descriptors = {}; /** key is descriptorId, value is descriptor object */

  function abToStr(ab) {
    return String.fromCharCode.apply(null, new Uint8Array(ab));
  }

  function strToAb(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  addButton('Test getAdapter State', function() {
    chrome.bluetooth.getAdapterState(function(adapter) {
      console.log(JSON.stringify(adapter));
    });
  });

  addButton('Add Events Listener', function() {

    chrome.bluetooth.onAdapterStateChanged.addListener(function(adapter) {
      console.log(JSON.stringify(adapter));
    });

    chrome.bluetooth.onDeviceAdded.addListener(function(device) {
      console.log('Device added: ' + device.address);
      devices[device.address] = device;
    });

    chrome.bluetooth.onDeviceChanged.addListener(function(device) {
      console.log('Device changed: ' + device.address);
      devices[device.address] = device;
    });

    chrome.bluetooth.onDeviceRemoved.addListener(function(device) {
      console.log('Device removed: ' + device.address);
      delete devices[device.address];
    });

    chrome.bluetoothLowEnergy.onServiceAdded.addListener(function(service) {
      console.log('Service added: ' + service.instanceId);
      services[service.instanceId] = service;
    });

    chrome.bluetoothLowEnergy.onServiceRemoved.addListener(function(service) {
      console.log('Service removed: ' + service.instanceId);
      delete services[service.instanceId];
    });

    chrome.bluetoothLowEnergy.onServiceChanged.addListener(function(service) {
      console.log('Service changed: ' + service.instanceId);
      services[service.instanceId] = service;
    });

    chrome.bluetoothLowEnergy.onCharacteristicValueChanged.addListener(function(characteristic) {
      console.log('Characteristic changed: ' + characteristic.instanceId);
      characteristics[characteristic.instanceId] = characteristic;
      console.log(JSON.stringify(characteristic));
    });

    chrome.bluetoothLowEnergy.onDescriptorValueChanged.addListener(function(descriptor) {
      console.log('Descriptor changed: ' + descriptor.instanceId);
      descriptor[descriptor.instanceId] = descriptor;
    });
  });

  addButton('Log known devices', function() {
    console.log(JSON.stringify(devices));
  });

  addButton('Log known services', function() {
    console.log(JSON.stringify(services));
  });

  addButton('Log known characteristic', function() {
    console.log(JSON.stringify(characteristics));
  });

  addButton('Log known descriptor', function() {
    console.log(JSON.stringify(descriptors));
  });

  addButton('Start discovering', function() {
    chrome.bluetooth.startDiscovery(function() {
      console.log('start discovery...');
    });
  });

  addButton('Stop discovering', function() {
    chrome.bluetooth.stopDiscovery(function() {
      console.log('stop discovery...');
    });
  });

  addButton('Get all devices', function() {
    chrome.bluetooth.getDevices(function(foundDevices) {
      console.log(JSON.stringify(foundDevices));
      for (var i = 0; i < foundDevices.length; i++) {
        devices[foundDevices[i].address] = foundDevices[i];
      }
    });
  });

  addButton('connect all known devices', function() {
    for (var address in devices) {
      (function(address) {
        chrome.bluetoothLowEnergy.connect(address, function() {
          console.log(address + ' connected');
        });
      })(address);
    }
  });

  // This can force two iOS devices paired with each other.
  addButton('connect all known devices & getServices & getCharacteristics & startNotification', function() {
    for (var address in devices) {
      (function(address) {
        chrome.bluetoothLowEnergy.connect(address, function() {
          console.log(address + ' connected');
          chrome.bluetoothLowEnergy.getServices(address, function(services) {
            console.log('Services for address: ' + address);
            console.log(JSON.stringify(services));
            for (var i = 0; i < services.length; i++) {
              console.log(services[i].instanceId);
              console.log('start get characteristics for service Id: ' + services[i].instanceId);
              chrome.bluetoothLowEnergy.getCharacteristics(services[i].instanceId, function(characteristics) {
                console.log(JSON.stringify(characteristics));
                for (var j = 0; j < characteristics.length; j++) {
                  chrome.bluetoothLowEnergy.startCharacteristicNotifications(characteristics[j].instanceId, function() {});
                }
              });
            }
          });
        });
      })(address);
    }
  });

  addButton('Disconnect all connected device', function() {
    for (var address in devices) {
      if (devices[address].connected) {
        (function(address) {
          chrome.bluetoothLowEnergy.disconnect(address, function() {
            console.log(address + ' disconnected');
          });
        })(address);
      }
    }
  });

  addButton('get services for all devices', function() {
    for (var address in devices) {
      if (devices[address].connected) {
        (function(address) {
          console.log('Start get services for: ' + address);
          chrome.bluetoothLowEnergy.getServices(address, function(services) {
            console.log('Services for address: ' + address);
            console.log(JSON.stringify(services));
          });
        })(address);
      }
    }
  });

  addButton('get all known services by Id', function() {
    for (var serviceId in services) {
      console.log(serviceId);
      chrome.bluetoothLowEnergy.getService(serviceId, function(service) {
        console.log(JSON.stringify(service));
      });
    }
  });

  addButton('get all included services by Id', function() {
    for (var serviceId in services) {
      chrome.bluetoothLowEnergy.getIncludedServices(serviceId, function(includedServices) {
        for (var i = 0; i < includedServices.length; i++) {
          console.log(JSON.stringify(includedServices[i]));
          services[includedServices[i].instanceId] = includedServices[i];
        }
      });
    }
  });

  addButton('get characteristics for known services', function() {
    for (var serviceId in services) {
      (function(serviceId) {
        chrome.bluetoothLowEnergy.getCharacteristics(serviceId, function(foundCharacteristics) {
          console.log('Characteristics for service: ' + serviceId);
          console.log(JSON.stringify(foundCharacteristics));
          for (var i = 0; i < foundCharacteristics.length; i++) {
            characteristics[foundCharacteristics[i].instanceId] = foundCharacteristics[i];
          }
        });
      })(serviceId);
    }
  });

  addButton('get all known characteristics by id', function() {
    for (var characteristicId in characteristics) {
      chrome.bluetoothLowEnergy.getCharacteristic(characteristicId, function(characteristic) {
        console.log(JSON.stringify(characteristic));
        characteristics[characteristic.instanceId] = characteristic;
      });
    }
  });

  addButton('read all known characteristic', function() {
    for (var characteristicId in characteristics) {
      chrome.bluetoothLowEnergy.readCharacteristicValue(characteristicId, function(characteristic) {
        console.log(JSON.stringify(characteristic));
        console.log(abToStr(characteristic.value));
      });
    }
  });

  addButton('write all known characteristic', function() {
    for (var characteristicId in characteristics) {
      (function(characteristicId) {
        chrome.bluetoothLowEnergy.writeCharacteristicValue(characteristicId, strToAb('test: '+ characteristicId), function() {
          console.log('successfully write into: ' + characteristicId);
        });
      })(characteristicId);
    }
  });

  addButton('start notification of all known characteristic', function() {
    for (var characteristicId in characteristics) {
      (function(characteristicId) {
        chrome.bluetoothLowEnergy.startCharacteristicNotifications(characteristicId, function() {
          console.log('successfully set notification on: ' + characteristicId);
        });
      })(characteristicId);
    }
  });

  addButton('stop notification of all known characteristic', function() {
    for (var characteristicId in characteristics) {
      (function(characteristicId) {
        chrome.bluetoothLowEnergy.stopCharacteristicNotifications(characteristicId, function() {
          console.log('successfully set notification off: ' + characteristicId);
        });
      })(characteristicId);
    }
  });

  addButton('get descriptors for known characteristics', function() {
    for (var characteristicId in characteristics) {
      chrome.bluetoothLowEnergy.getDescriptors(characteristicId, function(foundDescriptors) {
        console.log(JSON.stringify(foundDescriptors));
        for (var i = 0; i < foundDescriptors.length; i++) {
          descriptors[foundDescriptors[i].instanceId] = foundDescriptors[i];
        }
      });
    }
  });

  addButton('get known descriptor by Id', function() {
    for (var descriptorId in descriptors) {
      chrome.bluetoothLowEnergy.getDescriptor(descriptorId, function(descriptor) {
        console.log(JSON.stringify(descriptor));
      });
    }
  });

  addButton('read known descriptor by Id', function() {
    for (var descriptorId in descriptors) {
      chrome.bluetoothLowEnergy.readDescriptorValue(descriptorId, function(descriptor) {
        console.log(JSON.stringify(descriptor));
        console.log(abToStr(descriptor.value));
      });
    }
  });

  addButton('write known descriptor by Id', function() {
    for (var descriptorId in descriptors) {
      (function(descriptorId) {
        chrome.bluetoothLowEnergy.writeDescriptorValue(descriptorId, strToAb('test: ' + descriptorId), function() {
          console.log('successfully write into: ' + descriptorId);
        });
      })(descriptorId);
    }
  });

};
