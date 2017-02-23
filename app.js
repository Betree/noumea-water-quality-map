(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = null;
    hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("components/Legend.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Legend = function (_React$Component) {
  _inherits(Legend, _React$Component);

  function Legend(props) {
    _classCallCheck(this, Legend);

    var _this = _possibleConstructorReturn(this, (Legend.__proto__ || Object.getPrototypeOf(Legend)).call(this, props));

    _this.state = { isExpanded: props.isExpanded };
    return _this;
  }

  _createClass(Legend, [{
    key: "toggleExpanded",
    value: function toggleExpanded() {
      this.setState({ isExpanded: !this.state.isExpanded });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var legend = this.props.legend;
      var isExpanded = this.state.isExpanded;

      return _react2.default.createElement(
        "div",
        { id: "legend", className: isExpanded ? 'expanded' : '' },
        _react2.default.createElement(
          "button",
          { className: "button expand-button", onClick: function onClick() {
              return _this2.toggleExpanded();
            } },
          isExpanded ? '-' : 'Légende'
        ),
        Object.entries(legend).map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
              value = _ref2[0],
              color = _ref2[1];

          return _react2.default.createElement(
            "div",
            { className: "legend-entry", key: value },
            _react2.default.createElement("div", { className: "color-block", style: { backgroundColor: color } }),
            _react2.default.createElement(
              "span",
              { className: "legend-value" },
              value
            )
          );
        })
      );
    }
  }]);

  return Legend;
}(_react2.default.Component);

exports.default = Legend;

});

require.register("components/MonthSlider.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

var MonthSlider = function (_React$Component) {
  _inherits(MonthSlider, _React$Component);

  function MonthSlider(props) {
    _classCallCheck(this, MonthSlider);

    var _this = _possibleConstructorReturn(this, (MonthSlider.__proto__ || Object.getPrototypeOf(MonthSlider)).call(this, props));

    _this.onChange = _this.onChange.bind(_this);

    _this.input = null;
    _this.state = { currentValue: _this.props.defaultIndex };
    return _this;
  }

  _createClass(MonthSlider, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement('input', { type: 'range', defaultValue: this.props.currentValue,
          min: '0', max: this.props.values.length - 1,
          onChange: this.onChange,
          ref: function ref(_ref) {
            return _this2.input = _ref;
          }
        }),
        _react2.default.createElement(
          'span',
          { className: 'title is-5' },
          this.indexToDateString(this.state.currentValue)
        )
      );
    }
  }, {
    key: 'indexToDateString',
    value: function indexToDateString(idx) {
      if (!this.props.values) return '';
      if (idx === -1) idx = this.props.values.length - 1;
      var date = new Date(this.props.values[idx]);
      return MONTHS[date.getMonth()] + ' ' + date.getFullYear();
    }
  }, {
    key: 'onChange',
    value: function onChange() {
      this.setState({ currentValue: this.input.value });
      var _props = this.props,
          handleChange = _props.handleChange,
          values = _props.values;

      if (handleChange) handleChange(values[this.input.value]);
    }
  }]);

  return MonthSlider;
}(_react2.default.Component);

exports.default = MonthSlider;


MonthSlider.defaultProps = {
  defaultIndex: 0,
  values: [],
  handleChange: null
};

});

require.register("components/NavMenu.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SHARING_ENCODED = "https%3A%2F%2Fgoo.gl%2FJLV7jz%20Une%20map%20de%20la%20qualit%C3%A9%20de%20l%27eau%20des%20plages%20pour%20Noum%C3%A9a%20%F0%9F%87%B3%F0%9F%87%A8%F0%9F%90%99%F0%9F%90%AC%F0%9F%8F%8A";

var NavMenu = function (_React$Component) {
  _inherits(NavMenu, _React$Component);

  function NavMenu() {
    _classCallCheck(this, NavMenu);

    return _possibleConstructorReturn(this, (NavMenu.__proto__ || Object.getPrototypeOf(NavMenu)).apply(this, arguments));
  }

  _createClass(NavMenu, [{
    key: "get_page_name_from_href",
    value: function get_page_name_from_href(href) {
      var splitHref = href.split('/');
      return splitHref[splitHref.length - 1];
    }
  }, {
    key: "get_active_link",
    value: function get_active_link(href, name) {
      // Must be used only on a website without subdomains
      var activePage = this.get_page_name_from_href(document.location.toString());
      var linkPage = this.get_page_name_from_href(href);
      var isActive = activePage == linkPage ? ' is-active' : '';
      return _react2.default.createElement(
        "a",
        { href: href, className: "nav-item " + isActive },
        name
      );
    }
  }, {
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "nav",
        { id: "main-nav", className: "nav" },
        _react2.default.createElement(
          "div",
          { className: "nav-left" },
          _react2.default.createElement(
            "a",
            { className: "nav-item" },
            "Noum\xE9a - Qualit\xE9 de l'eau des plages"
          )
        ),
        _react2.default.createElement(
          "span",
          { className: "nav-toggle" },
          _react2.default.createElement("span", null),
          _react2.default.createElement("span", null),
          _react2.default.createElement("span", null)
        ),
        _react2.default.createElement(
          "div",
          { className: "nav-center nav-menu" },
          this.get_active_link("index.html", "Map"),
          this.get_active_link("about.html", "A propos")
        ),
        _react2.default.createElement(
          "div",
          { className: "nav-right nav-menu" },
          _react2.default.createElement(
            "span",
            { className: "nav-item" },
            _react2.default.createElement(
              "a",
              { className: "button is-small",
                href: "https://twitter.com/intent/tweet?text=" + SHARING_ENCODED },
              _react2.default.createElement(
                "span",
                { className: "icon is-small" },
                _react2.default.createElement("i", { className: "fa fa-twitter" })
              ),
              _react2.default.createElement(
                "span",
                null,
                "Tweet"
              )
            ),
            _react2.default.createElement(
              "a",
              { className: "button is-small", href: "https://www.facebook.com/sharer/sharer.php?u=https%3A//goo.gl/JLV7jz" },
              _react2.default.createElement(
                "span",
                { className: "icon is-small" },
                _react2.default.createElement("i", { className: "fa fa-facebook" })
              ),
              _react2.default.createElement(
                "span",
                null,
                "Share"
              )
            ),
            _react2.default.createElement(
              "a",
              { className: "button is-small", href: "https://github.com/Betree/noumea-water-quality-map" },
              _react2.default.createElement(
                "span",
                { className: "icon is-small" },
                _react2.default.createElement("i", { className: "fa fa-github" })
              ),
              _react2.default.createElement(
                "span",
                null,
                "Fork"
              )
            )
          )
        )
      );
    }
  }]);

  return NavMenu;
}(_react2.default.Component);

exports.default = NavMenu;

});

require.register("components/NoumeaWaterQualityMap.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _leaflet = require("leaflet");

var _leaflet2 = _interopRequireDefault(_leaflet);

var _underscore = require("underscore");

var _underscore2 = _interopRequireDefault(_underscore);

var _pegasus = require("@typicode/pegasus");

var _pegasus2 = _interopRequireDefault(_pegasus);

var _color = require("color");

var _color2 = _interopRequireDefault(_color);

var _OsmMap = require("./OsmMap");

var _OsmMap2 = _interopRequireDefault(_OsmMap);

var _Legend = require("./Legend");

var _Legend2 = _interopRequireDefault(_Legend);

var _MonthSlider = require("./MonthSlider");

var _MonthSlider2 = _interopRequireDefault(_MonthSlider);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GEOJSON_FILE = "data/geojson/simple.geojson";
var INITIAL_LOCATION = new _leaflet2.default.LatLng(-22.285, 166.45);
var BOUNDS = [[-22.35, 166.28], [-22.20, 166.61]];
var INITIAL_ZOOM = 14;
var DATE_FORMAT = "";
var POPUP_HISTORY_TABLE_SIZE = 20;

var STATUSES = ["Inconnu", "Bon", "Moyen", "Mauvais", "Nécessite la fermeture de la baignade"];
var STATUS_OUTDATED = STATUSES[0],
    STATUS_GOOD = STATUSES[1],
    STATUS_AVERAGE = STATUSES[2],
    STATUS_BAD = STATUSES[3],
    STATUS_DANGEROUS = STATUSES[4];


var COLORS = {};
COLORS[STATUS_GOOD] = "#00afef", COLORS[STATUS_AVERAGE] = "#00af50", COLORS[STATUS_BAD] = "#e16b09", COLORS[STATUS_DANGEROUS] = "#ff0000", COLORS[STATUS_OUTDATED] = "#333333";

var STATUSES_ICONS = {};
STATUSES_ICONS[STATUS_GOOD] = "images/marker-good.png", STATUSES_ICONS[STATUS_AVERAGE] = "images/marker-average.png", STATUSES_ICONS[STATUS_BAD] = "images/marker-bad.png", STATUSES_ICONS[STATUS_DANGEROUS] = "images/marker-dangerous.png", STATUSES_ICONS[STATUS_OUTDATED] = "images/marker-outdated.png";

var NoumeaWaterQualityMap = function (_React$Component) {
  _inherits(NoumeaWaterQualityMap, _React$Component);

  function NoumeaWaterQualityMap(props) {
    _classCallCheck(this, NoumeaWaterQualityMap);

    // Preload GeoJSON
    var _this = _possibleConstructorReturn(this, (NoumeaWaterQualityMap.__proto__ || Object.getPrototypeOf(NoumeaWaterQualityMap)).call(this, props));

    _this.geoJSONRequest = (0, _pegasus2.default)(GEOJSON_FILE);
    _this.geoJSONRequest.overrideMimeType("application/json");

    _this.data = null;
    _this.selectedDate = new Date();

    _this.state = { dates: [] };
    return _this;
  }

  _createClass(NoumeaWaterQualityMap, [{
    key: "render",
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(_OsmMap2.default, { initialLocation: INITIAL_LOCATION, initialZoom: INITIAL_ZOOM,
          bounds: BOUNDS, minZoom: INITIAL_ZOOM,
          ref: function ref(map) {
            _this2.map = map;
          },
          initialMonth: new Date()
        }),
        _react2.default.createElement(_Legend2.default, { legend: COLORS, isExpanded: true }),
        _react2.default.createElement(
          "div",
          { id: "footer" },
          _react2.default.createElement(
            "div",
            { id: "date-select-slider-container" },
            _react2.default.createElement(_MonthSlider2.default, { values: this.state.dates,
              defaultIndex: this.state.dates.length - 1,
              handleChange: function handleChange(date) {
                return _this2.handleDateChange(date);
              }
            })
          )
        )
      );
    }
  }, {
    key: "handleDateChange",
    value: function handleDateChange(date) {
      this.selectedDate = date;
      this.updateLayers();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this3 = this;

      this.geoJSONRequest.then(function (data, xhr) {
        var pointToLayer = function pointToLayer(pt, pos) {
          return _leaflet2.default.marker(pos, { title: pt.properties.name });
        };
        _this3.map.addGeoJson(data, { pointToLayer: pointToLayer });
        _this3.setState({ dates: _this3.extractGeoJSONData(data) });
        _this3.updateLayers();
      },
      // Error handler
      function (data, xhr) {
        console.log(data);
      });
    }
  }, {
    key: "extractGeoJSONData",
    value: function extractGeoJSONData(data) {
      var _this4 = this;

      // Extract all dates
      var dates = new Set();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data.features[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var feature = _step.value;

          _underscore2.default.each(feature.properties.data, function (d) {
            return dates.add(_this4.getYearMonthDateFromFrDatetimeStr(d.date).getTime());
          });
        }
        // Convert & Sort them
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

      dates = Array.from(dates).sort();
      return _underscore2.default.map(dates, function (d) {
        return new Date(d);
      });
    }
  }, {
    key: "getYearMonthDateFromFrDatetimeStr",
    value: function getYearMonthDateFromFrDatetimeStr(datetimeStr) {
      var _datetimeStr$split = datetimeStr.split(' '),
          _datetimeStr$split2 = _slicedToArray(_datetimeStr$split, 1),
          dateStr = _datetimeStr$split2[0];

      var _dateStr$split = dateStr.split('/'),
          _dateStr$split2 = _slicedToArray(_dateStr$split, 3),
          day = _dateStr$split2[0],
          month = _dateStr$split2[1],
          year = _dateStr$split2[2];

      return new Date(year, month - 1);
    }
  }, {
    key: "updateLayers",
    value: function updateLayers() {
      var _this5 = this;

      this.map.geoJSONLayer.eachLayer(function (layer) {
        if (layer.feature.geometry.type === "Point") _this5.updateMarker(layer);else {
          _this5.updateArea(layer);
        }
      });
    }
  }, {
    key: "updateArea",
    value: function updateArea(area) {
      var _this6 = this;

      var associatedPoints = _underscore2.default.filter(this.map.geoJSONLayer._layers, function (l) {
        var _l$feature = l.feature,
            type = _l$feature.geometry.type,
            name = _l$feature.properties.name;

        return type === "Point" && area.feature.properties.points.includes(name);
      });
      var statuses = _underscore2.default.map(associatedPoints, function (p) {
        var currentData = _this6.getCurrentData(p.feature.properties.data);
        return STATUSES.indexOf(_this6.getQualityStatus(currentData));
      });
      var worstStatusText = STATUSES[_underscore2.default.max(statuses)];
      area.setStyle({
        // Assumes that data is sorted with more recent date at last position
        fillColor: COLORS[worstStatusText],
        fillOpacity: 0.9
      });
    }
  }, {
    key: "updateMarker",
    value: function updateMarker(marker) {
      var properties = marker.feature.properties;

      var currentData = this.getCurrentData(properties.data);
      var status = this.getQualityStatus(currentData);
      var iconUrl = STATUSES_ICONS[status];
      var icon = _leaflet2.default.icon({ iconUrl: iconUrl, iconSize: [25, 41], iconAnchor: [12, 40] });
      marker.setIcon(icon);
      var popupContent = this.generateMarkerPopup(status, currentData, properties);

      var popup;
      if (!marker._popup) {
        popup = marker._popup ? marker._popup : _leaflet2.default.popup({ maxWidth: 450 });
        marker.bindPopup(popup);
      } else {
        popup = marker._popup.setContent(popupContent);
      }
      popup.setContent(popupContent);
      popup.update();
    }
  }, {
    key: "generateMarkerPopup",
    value: function generateMarkerPopup(status, currentData, _ref) {
      var data = _ref.data,
          name = _ref.name;

      if (currentData === null) return "<div class=\"map-popup\"><h4 class=\"point-name\">Point " + name + "</h4>Aucune donn\xE9e pour ce point pour le mois s\xE9lectionn\xE9</div>";
      return "<div class=\"map-popup\">\n      <h4 class=\"point-name\">Point " + name + "</h4>\n      <p>\n        Le <b>" + currentData.date.replace(" ", " à ") + "</b> le niveau de pollution\n        pour ce point \xE9tait <b style=\"color: " + COLORS[status] + ";\">" + status + "</b>.\n      </p>\n      " + this.generateHtmlTableForData(currentData, data) + "\n    </div>";
    }
  }, {
    key: "generateHtmlTableForData",
    value: function generateHtmlTableForData(currentData, allData) {
      var dataIdx = _underscore2.default.findLastIndex(allData, currentData);
      var lines = [];

      for (var i = dataIdx; i > dataIdx - POPUP_HISTORY_TABLE_SIZE && i >= 0; i--) {
        var data = allData[i];
        var escherichiaColiStatus = this.getEscherichiaColiStatus(data.escherichia_coli);
        var intestinalEnterococciStatus = this.getIntestinalEnterococciStatus(data.intestinal_enterococci);
        lines.push("<tr>\n        <td>" + data.date + "</td>\n        <td style=\"color: " + COLORS[escherichiaColiStatus] + ";\">\n          " + data.escherichia_coli + "\n        </td>\n        <td style=\"color: " + COLORS[intestinalEnterococciStatus] + ";\">\n          " + data.intestinal_enterococci + "\n        </td>\n      </tr>");
      }
      return "<table class=\"all-data\">\n      <thead>\n        <th>Date du pr\xE9l\xE8vement</th>\n        <th>Escherichia coli (NPP/100ml)</th>\n        <th>Ent\xE9rocoques intestinaux (NPP/100ml)</th>\n      <thead>\n      <tbody>\n        " + lines.join('') + "\n      </tbody>\n    </table>";
    }
  }, {
    key: "getCurrentData",
    value: function getCurrentData(data) {
      var _this7 = this;

      // Get latest feature data for selected month
      var lastDataForSelectedMonth = _underscore2.default.findLastIndex(data, function (_ref2) {
        var date = _ref2.date;

        var dataYearMonth = _this7.getYearMonthDateFromFrDatetimeStr(date);
        return _this7.isSameMonthOrBefore(dataYearMonth, _this7.selectedDate);
      });
      return lastDataForSelectedMonth === -1 ? null : data[lastDataForSelectedMonth];
    }
  }, {
    key: "isSameMonthOrBefore",
    value: function isSameMonthOrBefore(date1, date2) {
      return date1.getYear() <= date2.getYear() && date1.getMonth() <= date2.getMonth();
    }
  }, {
    key: "getQualityStatus",
    value: function getQualityStatus(data) {
      if (data === null) return STATUS_OUTDATED;
      // Dangerousity threshold as defined by the DASS (french health comitee)
      // Get status for both bacteria, select the worst status
      var escherichiaColiStatus = this.getEscherichiaColiStatus(data.escherichia_coli);
      var intestinalEnterococciStatus = this.getIntestinalEnterococciStatus(data.intestinal_enterococci);

      var worstStatusIdx = Math.max(STATUSES.indexOf(escherichiaColiStatus), STATUSES.indexOf(intestinalEnterococciStatus));
      return STATUSES[worstStatusIdx];
    }
  }, {
    key: "getEscherichiaColiStatus",
    value: function getEscherichiaColiStatus(value) {
      if (value <= 100) return STATUS_GOOD;else if (value <= 1000) return STATUS_AVERAGE;else if (value <= 2000) return STATUS_BAD;else if (value > 2000) return STATUS_DANGEROUS;else return STATUS_OUTDATED;
    }
  }, {
    key: "getIntestinalEnterococciStatus",
    value: function getIntestinalEnterococciStatus(value) {
      if (value <= 100) return STATUS_GOOD;else if (value <= 370) return STATUS_AVERAGE;else if (value > 370) return STATUS_BAD;else return STATUS_OUTDATED;
    }
  }]);

  return NoumeaWaterQualityMap;
}(_react2.default.Component);

exports.default = NoumeaWaterQualityMap;

});

require.register("components/OsmMap.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _leaflet = require("leaflet");

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MENU_BAR_SIZE = 50;
var MAP_ID = "main-map";
var OSM_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
var OSM_ATTRIB = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';

var OsmMap = function (_React$Component) {
  _inherits(OsmMap, _React$Component);

  function OsmMap(props) {
    _classCallCheck(this, OsmMap);

    var _this = _possibleConstructorReturn(this, (OsmMap.__proto__ || Object.getPrototypeOf(OsmMap)).call(this, props));

    _this.state = { height: 0 };
    return _this;
  }

  _createClass(OsmMap, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      this.resetHeight();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      // Reset map container height on window resize
      window.addEventListener("resize", this.resetHeight.bind(this));

      // Initialize map
      var _props = this.props,
          minZoom = _props.minZoom,
          initialZoom = _props.initialZoom,
          initialLocation = _props.initialLocation,
          bounds = _props.bounds;

      this.map = _leaflet2.default.map(MAP_ID);
      var osm = new _leaflet2.default.TileLayer(OSM_URL, {
        minZoom: minZoom,
        maxZoom: 18,
        attribution: OSM_ATTRIB
      });
      this.map.setView(initialLocation, initialZoom);
      if (bounds != null) this.map.setMaxBounds(bounds);
      this.map.addLayer(osm);
    }
  }, {
    key: "addGeoJson",
    value: function addGeoJson(geoJSON, geoJSONParams) {
      this.geoJSONLayer = _leaflet2.default.geoJSON(geoJSON, geoJSONParams).addTo(this.map);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      window.removeEventListener("resize", this.resetHeight.bind(this));
    }
  }, {
    key: "render",
    value: function render() {
      return _react2.default.createElement("div", { id: MAP_ID, style: { height: this.state.height } });
    }
  }, {
    key: "resetHeight",
    value: function resetHeight() {
      this.setState({ height: window.innerHeight - MENU_BAR_SIZE });
    }
  }]);

  return OsmMap;
}(_react2.default.Component);

exports.default = OsmMap;


OsmMap.defaultProps = {
  initialLocation: new _leaflet2.default.LatLng(0, 0),
  initialZoom: 1,
  bounds: [[-22.33, 166.28], [-22.18, 166.61]],
  geoJSON: null,
  geoJSONParams: {},
  minZoom: 1
};

});

require.register("initialize.jsx", function(exports, require, module) {
"use strict";

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _NavMenu = require("./components/NavMenu");

var _NavMenu2 = _interopRequireDefault(_NavMenu);

var _NoumeaWaterQualityMap = require("./components/NoumeaWaterQualityMap");

var _NoumeaWaterQualityMap2 = _interopRequireDefault(_NoumeaWaterQualityMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_reactDom2.default.render(_react2.default.createElement(_NavMenu2.default, null), document.getElementById('nav-menu'));

_reactDom2.default.render(_react2.default.createElement(_NoumeaWaterQualityMap2.default, null), document.getElementById('map-container'));

});

require.alias("process/browser.js", "process");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map