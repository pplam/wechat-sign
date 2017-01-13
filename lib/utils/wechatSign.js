'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _jssha = require('jssha');

var _jssha2 = _interopRequireDefault(_jssha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createNonceStr = function createNonceStr() {
  return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function createTimestamp() {
  var timestamp = parseInt(new Date().getTime() / 1000, 10);
  return String(timestamp);
};

var raw = function raw(args) {
  var keys = Object.keys(args).sort();
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var key in newArgs) {
    if (newArgs.hasOwnProperty(key)) string += '&' + key + '=' + newArgs[key];
  }
  string = string.substr(1);
  return string;
};

var sign = function sign(ticket, url) {
  var ret = {
    jsapi_ticket: ticket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: url
  };
  var string = raw(ret);
  var shaObj = new _jssha2.default(string, 'TEXT');
  ret.signature = shaObj.getHash('SHA-1', 'HEX');

  return ret;
};

exports.default = sign;