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
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = newArgs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      string += '&' + key + '=' + newArgs[key];
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
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