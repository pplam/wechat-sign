'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (opts) {
  var template = String(opts.template);
  var data = opts.data;
  var pattern = opts.pattern || /#\{([^}]*)\}/mg;
  var trim = String.trim || function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  };
  return template.replace(pattern, function (value, name) {
    value = data[trim(name)];
    return value === undefined ? '' : value;
  });
};