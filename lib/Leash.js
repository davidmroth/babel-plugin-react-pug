'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _pugLexer = require('pug-lexer');

var _pugLexer2 = _interopRequireDefault(_pugLexer);

var _pugParser = require('pug-parser');

var _pugParser2 = _interopRequireDefault(_pugParser);

var _pugLoad = require('pug-load');

var _pugLoad2 = _interopRequireDefault(_pugLoad);

var _pugLinker = require('pug-linker');

var _pugLinker2 = _interopRequireDefault(_pugLinker);

var _NodeBuilder = require('./NodeBuilder');

var _NodeBuilder2 = _interopRequireDefault(_NodeBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var START_TABS_REGEX = /^[\t]{1,}/g;
var START_SPACES_REGEX = /^[ ]{1,}/g;

var ERROR_MSGS = {
  NO_AST_NODES: 'No AST node(s) could be generated from the provided pug template',
  NO_AST_EXISTS: 'An AST could not be generated from the provided pug template'
};

/**
 * @class Leash
 */

var Leash = function () {

  /**
   * @function
   * Hook up the ast and interpolations required
   * @params { Array } template - Sections of the pug template
   * @params { Array } interpolations - The interpolations
   * @return { Object } AST of react function calls
   */
  function Leash(template) {
    var interpolations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

    _classCallCheck(this, Leash);

    this.interpolations = interpolations;
    this.ast = this.getAST(this.manipulateTemplate(template));
  }

  /**
   * @function
   * Initialise converting the Pug AST into the react function
   * call AST
   * @return { Object } AST of react function calls
   */


  _createClass(Leash, [{
    key: 'initialise',
    value: function initialise() {
      var rootNode = void 0;
      var astExists = this.ast !== undefined;

      if (astExists && Array.isArray(this.ast.nodes)) {
        rootNode = this.ast.nodes[0];
      } else {
        throw new Error([ERROR_MSGS.NO_AST_NODES, ERROR_MSGS.NO_AST_EXISTS][astExists ? 0 : 1]);
      }

      return new _NodeBuilder2.default(rootNode, this.interpolations);
    }

    /**
     * @function
     * Get the AST of the pug template
     * @params { String } template - String representation of
     * the pug template containing placeholder values
     * @returns { Object } The react function call AST
     */

  }, {
    key: 'getAST',
    value: function getAST(template) {
      var loadedAST = _pugLoad2.default.string(template, {
        filename: 'component.pug',
        lex: _pugLexer2.default,
        parse: _pugParser2.default,
        resolve: function resolve(filename, source, options) {
          return _pugLoad2.default.resolve(filename, source, options);
        }
      });

      return (0, _pugLinker2.default)(loadedAST);
    }

    /**
     * @function
     * Manipulate the pug template
     * @params { Array } template - Array of template sections
     * @returns { String } The pug template
     */

  }, {
    key: 'manipulateTemplate',
    value: function manipulateTemplate(template) {
      return this.templateWhitespace(this.templatePlaceholder(template));
    }

    /**
     * @function
     * Format the template depending on whether it contains
     * tabs or spaces. This allows for the user to align
     * the template with the pug function
     * @params { String } Pug template string
     * @returns { String } Formatted pug template string
     */

  }, {
    key: 'templateWhitespace',
    value: function templateWhitespace(template) {
      var lines = template.split('\n');
      var rootLine = lines.filter(function (line) {
        return line.length > 0;
      })[0];
      var hasTabs = rootLine.match(START_TABS_REGEX);
      var hasSpaces = rootLine.match(START_SPACES_REGEX);

      if (!hasTabs && !hasSpaces) {
        return template;
      }

      var spacesArr = [];

      if (Array.isArray(hasTabs)) {
        spacesArr = hasTabs[0];
      } else if (Array.isArray(hasSpaces)) {
        spacesArr = hasSpaces[0];
      }

      var tpl = lines.map(function (line) {
        return line.slice(spacesArr.length);
      }).join('\n');

      return tpl;
    }

    /**
     * @function
     * Loop through the template sections, adding placeholders
     * for the projected interpolations
     * @params { Array<Object> } template - Array of template sections
     * @returns { String } The string representation of the
     * pug template containing placeholder values
     */

  }, {
    key: 'templatePlaceholder',
    value: function templatePlaceholder(template) {
      var _this = this;

      return template.map(function (section, index) {
        var hasValue = _this.interpolations[index] !== undefined;

        var placeholder = hasValue ? '/~' + index + '~/' : '';

        return `${section.value.raw}${placeholder}`;
      }).join('');
    }
  }]);

  return Leash;
}();

exports.default = Leash;
module.exports = exports['default'];