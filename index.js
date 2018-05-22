const http = require('http');

var Service, Characteristic, HomebridgeAPI;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  HomebridgeAPI = homebridge;
  homebridge.registerAccessory("homebridge-gpio-toggle", "GpioToggle", GpioToggle);
}

function GpioToggle(log, config) {
  this.log = log;
  this.name = config.name;
  this.pin = config.pin;
  this.api = config.api;
  this.length = config.length;
  this._service = new Service.Switch(this.name);
  
  this._service.getCharacteristic(Characteristic.On)
    .on('set', this._setOn.bind(this));
}

GpioToggle.prototype.getServices = function() {
  return [this._service];
}

GpioToggle.prototype._setOn = function(on, callback) {
  // An object of options to indicate where to post to
  this.log("Toggling switch on momentarily!");
  var request_opts = {
      host: this.api,
      port: '8080',
      path: '/api/gpio/' + this.pin,
      method: 'PATCH',
      headers: {
          'Content-Type': 'text/plain',
          'Content-Length': Buffer.byteLength(this.length)
      }
  };

  // Set up the request
  var request = http.request(request_opts, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        this._service.setCharacteristic(Characteristic.On, false);
    });
  });

  // post the data
  request.write(this.length);
  request.end();

  callback();
}
