'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _nodeCache = require('node-cache');

var _nodeCache2 = _interopRequireDefault(_nodeCache);

var _wechatSign = require('./utils/wechatSign');

var _wechatSign2 = _interopRequireDefault(_wechatSign);

var _replaceTpl = require('./utils/replaceTpl');

var _replaceTpl2 = _interopRequireDefault(_replaceTpl);

var _wechat = require('../config/wechat.json');

var _wechat2 = _interopRequireDefault(_wechat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Wechat = function () {
  function Wechat() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Wechat);

    this.tokenApiTemplate = config.tokenApiTemplate || _wechat2.default.tokenApiTemplate;
    this.ticketApiTemplate = config.ticketApiTemplate || _wechat2.default.ticketApiTemplate;
    this.templateVariablePattern = config.templateVariablePattern;
    this.tokenApi = (0, _replaceTpl2.default)({
      template: this.tokenApiTemplate,
      data: config,
      pattern: this.templateVariablePattern
    });
    this.ticketApi = null;
    this.cacheExpiresInSeconds = config.cacheExpiresInSeconds || 7200;
    this.cache = new _nodeCache2.default();
  }

  _createClass(Wechat, [{
    key: 'getAccessToken',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var access_token, opts, data, tokenExpiresInSeconds, expires_in_ms, expires_in, token;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                access_token = this.cache.get('accessToken');

                if (!(refresh || !access_token)) {
                  _context.next = 11;
                  break;
                }

                opts = { uri: this.tokenApi, json: true };
                _context.next = 5;
                return (0, _requestPromise2.default)(opts);

              case 5:
                data = _context.sent;

                if (!data.errcode) {
                  _context.next = 8;
                  break;
                }

                throw 'wechat sever response error';

              case 8:
                access_token = data.access_token;
                tokenExpiresInSeconds = this.cacheExpiresInSeconds || data.expires_in;

                this.cache.set('accessToken', access_token, tokenExpiresInSeconds);

              case 11:
                expires_in_ms = this.cache.getTtl('accessToken') - new Date();
                expires_in = expires_in_ms / 1000;
                token = { access_token: access_token, expires_in: expires_in };
                return _context.abrupt('return', token);

              case 15:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getAccessToken() {
        return _ref.apply(this, arguments);
      }

      return getAccessToken;
    }()
  }, {
    key: 'getTicket',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var refresh = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var ticket, token, opts, data, ticketExpiresInSeconds, expires_in_ms, expires_in, jsapi_ticket;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                ticket = this.cache.get('jsapiTicket');

                if (!(refresh || !ticket)) {
                  _context2.next = 15;
                  break;
                }

                _context2.next = 4;
                return this.getAccessToken();

              case 4:
                token = _context2.sent;

                this.ticketApi = (0, _replaceTpl2.default)({
                  template: this.ticketApiTemplate,
                  data: { access_token: token.access_token },
                  pattern: this.templateVariablePattern
                });
                opts = { uri: this.ticketApi, json: true };
                _context2.next = 9;
                return (0, _requestPromise2.default)(opts);

              case 9:
                data = _context2.sent;

                if (!data.errcode) {
                  _context2.next = 12;
                  break;
                }

                throw 'wechat sever response error';

              case 12:
                ticket = data.ticket;
                ticketExpiresInSeconds = token.expires_in;

                this.cache.set('jsapiTicket', ticket, ticketExpiresInSeconds);

              case 15:
                expires_in_ms = this.cache.getTtl('jsapiTicket') - new Date();
                expires_in = expires_in_ms / 1000;
                jsapi_ticket = { ticket: ticket, expires_in: expires_in };
                return _context2.abrupt('return', jsapi_ticket);

              case 19:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getTicket() {
        return _ref2.apply(this, arguments);
      }

      return getTicket;
    }()
  }, {
    key: 'sign',
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(url) {
        var jsapi_ticket, ticket;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _context3.next = 2;
                return this.getTicket();

              case 2:
                jsapi_ticket = _context3.sent;
                ticket = jsapi_ticket.ticket;
                return _context3.abrupt('return', (0, _wechatSign2.default)(ticket, url));

              case 5:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function sign(_x4) {
        return _ref3.apply(this, arguments);
      }

      return sign;
    }()
  }]);

  return Wechat;
}();

exports.default = Wechat;