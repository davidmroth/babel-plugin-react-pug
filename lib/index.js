'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return {
    visitor: {
      ReturnStatement(path) {
        path.traverse({
          TaggedTemplateExpression(path) {
            var node = path.node;

            /* istanbul ignore else */

            if (node.tag.name === METHOD_IDENTIFIER) {
              var _node$quasi = node.quasi,
                  quasis = _node$quasi.quasis,
                  expressions = _node$quasi.expressions;


              path.replaceWith(new _Leash2.default(quasis, expressions).initialise());
            }
          }
        });
      }
    }
  };
};

var _Leash = require('./Leash');

var _Leash2 = _interopRequireDefault(_Leash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var METHOD_IDENTIFIER = 'pug';

module.exports = exports['default'];