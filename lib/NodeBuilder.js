'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _babelTypes = require('babel-types');

var t = _interopRequireWildcard(_babelTypes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INTERPOLATE_REGEX = /\/~[^>]~\//g;
var NUMBER_REGEX = /[^0-9]/g;

/**
 * @class NodeBuilder
 */

var NodeBuilder = function () {

  /**
   * @function
   * Process the ast and hook up the
   * interpolations
   * @params { Object } ast - The ast of the pug template
   * @params { Array } interpolations - Contains the
   * interpolations
   * @params { Array } blocks - Named blocks
   * @returns { Object } The react function call AST
   */
  function NodeBuilder(ast, interpolations) {
    _classCallCheck(this, NodeBuilder);

    this.interpolations = interpolations;

    return this.processNode(ast);
  }

  /**
   * @function
   * Build the react function call node
   * @params { String } tagName - The tag name of the element
   * @params { Array<Object> } attrsArr - Array of element attributes
   * @params { Array|undefined } subNodes - Array of function call ASTs
   * @returns { Object } The react function call node
   */


  _createClass(NodeBuilder, [{
    key: 'buildNode',
    value: function buildNode(tagName, attrsArr, subNodes) {
      var fn = t.memberExpression(t.identifier('React'), t.identifier('createElement'));
      var args = [this.buildTag(tagName), this.buildAttributes(attrsArr)];

      if (Array.isArray(subNodes) && subNodes.length) {
        var subNodeArrays = subNodes.filter(function (node) {
          return Array.isArray(node);
        });

        if (subNodeArrays.length) {
          var _ref;

          subNodes = (_ref = []).concat.apply(_ref, _toConsumableArray(subNodes));
        }

        args = args.concat(subNodes);
      }

      return t.callExpression(fn, args);
    }

    /**
      * @function
     * Convert attribute key into compatible React
     * attribute
     * @params { String } value - The attribute to convert
     * @returns { String } The converted attribute
     */

  }, {
    key: 'convertAttributeKey',
    value: function convertAttributeKey(value) {
      //HACK: Not sure if this is correct, but this is how you fix attributes like, aria-hidden, aria-label, etc...
      if (value.indexOf('-') > -1) {
        value = "\'" + value + "\'";
      }

      switch (value) {
        case 'class':
          return 'className';
        default:
          return value;
      }
    }

    /**
     * @function
     * Determine whether the tag is a component or an element
     * and return the AST node
     * @params { String } tagName - The tag name of the node
     * @returns { Object } The AST node
     */

  }, {
    key: 'buildTag',
    value: function buildTag(tagName) {
      if (tagName.charAt(0) === tagName.charAt(0).toUpperCase()) {
        return t.identifier(tagName);
      }

      return t.stringLiteral(tagName);
    }

    /**
     * Note: Add check for multiple classNames
     * @function
     * Convert the array of element attributes into an object expression
     * containing object properties
     * @params { Array<Object> } attrsArr - Array of element attributes
     * @returns { Object } The object expression or null node
     */

  }, {
    key: 'buildAttributes',
    value: function buildAttributes(attrsArr) {
      var _this = this;

      // Ensure that duplicate attribute definitions are chained if
      // they are strings - otherwise use the interpolated value
      var argsObj = attrsArr.reduce(function (obj, _ref2) {
        var name = _ref2.name,
            val = _ref2.val;

        if (obj.hasOwnProperty(name) && typeof obj[name] === 'string' && typeof val === 'string') {
          obj[name] = `${obj[name].slice(0, -1)} ${val.slice(1)}`;
        } else {
          obj[name] = val;
        }

        return obj;
      }, {});

      var argsArr = Object.keys(argsObj).map(function (key) {
        var attrKey = t.identifier(_this.convertAttributeKey(key));
        var attrVal = _this.interpolate(argsObj[key], t.identifier);

        return t.objectProperty.apply(t, [attrKey].concat(_toConsumableArray(attrVal)));
      });

      return argsArr.length ? t.objectExpression(argsArr) : t.nullLiteral();
    }

    /**
    * @function
    * Recursively iterate over the Pug AST and convert
    * each node into a AST React function call
    * @params { Object } node - The Pug node
    * @returns { Object } The pug node / subnode
    */

  }, {
    key: 'processNode',
    value: function processNode(node) {
      var _processNode = this.processNode.bind(this);
      var _buildNode = this.buildNode.bind(this);

      if (node == null || !node.hasOwnProperty('type')) {
        return null;
      }

      switch (node.type) {
        case 'Block':
        case 'NamedBlock':
          return Array.isArray(node.nodes) ? node.nodes.map(_processNode) : null;

        case 'Text':
          return this.interpolate(node.val, t.stringLiteral);

        case 'Tag':
          var hasNodes = node.block && node.block.nodes.length;
          return _buildNode(node.name, node.attrs, hasNodes ? _processNode(node.block) : null);
      }
    }

    /**
     * @function
     * Check whether there are any placeholders within
     * the value and replace these with specified
     * interpolations
     * @params { String } value - The value of the element
     * @params { Function } type - The type of the AST node
     * @returns { Array } The AST node(s)
     */

  }, {
    key: 'interpolate',
    value: function interpolate(value, type) {
      var _this2 = this;

      var matches = value.match(INTERPOLATE_REGEX);

      if (matches && matches.length) {
        var splitValue = value.split(INTERPOLATE_REGEX);

        return splitValue.reduce(function (arr, value, index) {
          var valueArr = value ? [t.stringLiteral(value)] : [];
          var match = matches[index];

          if (match) {
            var id = match.replace(NUMBER_REGEX, '');
            valueArr.push(_this2.interpolations[parseInt(id)]);
          }

          return arr.concat(valueArr);
        }, []);
      }

      return [type(value)];
    }
  }]);

  return NodeBuilder;
}();

exports.default = NodeBuilder;
module.exports = exports['default'];