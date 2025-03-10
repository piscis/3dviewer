'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodashObjectMerge = require('lodash/object/merge');

var _lodashObjectMerge2 = _interopRequireDefault(_lodashObjectMerge);

var _lodashCollectionSample = require('lodash/collection/sample');

var _lodashCollectionSample2 = _interopRequireDefault(_lodashCollectionSample);

var _lodashMathRound = require('lodash/math/round');

var _lodashMathRound2 = _interopRequireDefault(_lodashMathRound);

var _OrbitControls = require('./OrbitControls');

var _OrbitControls2 = _interopRequireDefault(_OrbitControls);

var _tweenJs = require('tween.js');

var _tweenJs2 = _interopRequireDefault(_tweenJs);

var ModelControls = (function () {
  function ModelControls(container, camera, group) {
    var config = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

    _classCallCheck(this, ModelControls);

    this.container = container;
    this.camera = camera;
    this.group = group;

    this._animations = [];
    this._zoomTween = null;

    this._startUpAnimations = [{
      easing: _tweenJs2['default'].Easing.Quintic.Out,
      to: { x: 5 * 360 + 45 },
      time: 3500
    }, {
      easing: _tweenJs2['default'].Easing.Exponential.InOut,
      to: { x: 3 * 360 + 45 },
      time: 2500
    }, {
      easing: _tweenJs2['default'].Easing.Elastic.Out,
      to: { x: 3 * 360 + 45 },
      time: 5500
    }, {
      easing: _tweenJs2['default'].Easing.Circular.In,
      to: { x: 4 * 360 + 45 },
      time: 2500
    }, {
      easing: _tweenJs2['default'].Easing.Quintic.InOut,
      to: { x: 3 * 360 + 45 },
      time: 2500
    }, {
      easing: _tweenJs2['default'].Easing.Exponential.Out,
      to: { x: 4 * 360 + 45 },
      time: 2800
    }];

    // Default configuration params
    this.controlsConfigDefault = {

      startupAnimation: true,

      targetRotationX: 0,
      targetRotationOnMouseDownX: 0,

      targetRotationY: 0,
      targetRotationOnMouseDownY: 0,

      mouseX: 0,
      mouseXOnMouseDown: 0,

      mouseY: 0,
      mouseYOnMouseDown: 0,

      clientHalfX: this.container.clientWidth / 2,
      clientHalfY: this.container.clientHeight / 2,

      finalRotationY: null,

      currentRotationX: 0,
      currentRotationY: 0,

      zoom: false
    };

    this.controlsConfig = (0, _lodashObjectMerge2['default'])({}, this.controlsConfigDefault, config);

    this._init();

    if (this.controlsConfig.startupAnimation === true) {
      this._createStartUpAnimation();
    } else {
      this.group.rotation.y = this.controlsConfig.currentRotationY;
      this.group.rotation.x = this.controlsConfig.currentRotationX;
    }
  }

  _createClass(ModelControls, [{
    key: 'update',
    value: function update(time) {
      var group = this.group;

      // Do tweening
      if (this.controlsConfig.startupAnimation === true) {
        _tweenJs2['default'].update(time);
      }

      if (group) {

        var cfg = this.controlsConfig;

        group.rotation.y += (0, _lodashMathRound2['default'])((cfg.targetRotationX - group.rotation.y) * 0.1, 2);

        // vertical rotation
        cfg.finalRotationY = (0, _lodashMathRound2['default'])(cfg.targetRotationY - group.rotation.x, 2);
        group.rotation.x += (0, _lodashMathRound2['default'])(cfg.finalRotationY * 0.05, 2);

        this.controlsConfig.currentRotationX = group.rotation.x;
        this.controlsConfig.currentRotationY = group.rotation.y;
      }
    }
  }, {
    key: 'zoomIn',
    value: function zoomIn() {
      var scale = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];

      _tweenJs2['default'].remove(this._zoomTween);

      var cam = this.camera;
      var dollyScale = Math.pow(0.95, scale);
      var minZoom = this.controls.minZoom;
      var maxZoom = this.controls.maxZoom;
      var zoomLvl = Math.max(minZoom, Math.min(maxZoom, cam.zoom / dollyScale));

      this._dollyZoom(zoomLvl);
    }
  }, {
    key: 'zoomOut',
    value: function zoomOut() {
      var scale = arguments.length <= 0 || arguments[0] === undefined ? 2 : arguments[0];

      _tweenJs2['default'].remove(this._zoomTween);

      var cam = this.camera;
      var dollyScale = Math.pow(0.95, scale);
      var minZoom = this.controls.minZoom;
      var maxZoom = this.controls.maxZoom;
      var zoomLvl = Math.max(minZoom, Math.min(maxZoom, cam.zoom * dollyScale));

      this._dollyZoom(zoomLvl);
    }
  }, {
    key: '_dollyZoom',
    value: function _dollyZoom(zoomLvl) {

      var cam = this.camera;
      var tween = new _tweenJs2['default'].Tween({ zoom: cam.zoom });
      tween.to({ zoom: zoomLvl }, 300);
      tween.onUpdate(function () {
        cam.zoom = this.zoom;
        cam.updateProjectionMatrix();
      });
      tween.start();

      this._zoomTween = tween;
      return tween;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._removeEventListener();

      // Remove orbit control
      if (this.controls) {
        this.controls.dispose();
      }

      this._clearAnimations();
      this._animations = [];
    }
  }, {
    key: '_clearAnimations',
    value: function _clearAnimations() {

      if (this._animations && this._animations.length > 0) {

        while (this._animations.length > 0) {
          _tweenJs2['default'].remove(this._animations.pop());
        }
      }

      _tweenJs2['default'].remove(this._zoomTween);
    }
  }, {
    key: '_createStartUpAnimation',
    value: function _createStartUpAnimation() {
      var _controlsConfig = this.controlsConfig;
      var targetRotationY = _controlsConfig.targetRotationY;
      var targetRotationX = _controlsConfig.targetRotationX;

      var self = this;

      var coords = {
        x: targetRotationX / Math.PI * 180,
        y: targetRotationY / Math.PI * 180
      };

      this._clearAnimations();

      var anim = (0, _lodashCollectionSample2['default'])(this._startUpAnimations);

      var tween1 = new _tweenJs2['default'].Tween(coords).easing(anim.easing).to(anim.to, anim.time).onUpdate(function () {
        self.controlsConfig.targetRotationX = this.x * Math.PI / 180;
      }).start();

      this._animations.push(tween1);

      var tween2 = new _tweenJs2['default'].Tween(coords).easing(_tweenJs2['default'].Easing.Exponential.Out).to({ y: 45 }, 1500).onUpdate(function () {
        self.controlsConfig.targetRotationY = this.y * Math.PI / 180;
      }).start();

      this._animations.push(tween2);
    }
  }, {
    key: '_init',
    value: function _init() {

      // Clean registered event listener
      this._removeEventListener();
      // this.controlsConfig = merge({}, this.controlsConfigDefault);
      this._setupListener();

      // Delecate to orbit controls
      var controls = new _OrbitControls2['default'](this.camera, this.container);

      controls.enableKeys = false;
      controls.enableRotate = false;
      controls.enablePan = false;
      controls.enableDamping = false;
      controls.enableZoom = this.controlsConfig.zoom;

      var bb = new THREE.Box3();
      bb.setFromObject(this.group);
      bb.center(controls.target);

      this.controls = controls;
    }
  }, {
    key: '_setupListener',
    value: function _setupListener() {
      var _this = this;

      var container = this.container;

      // Add resize listener
      this._resizeListener = function (evt) {
        _this._onWindowResize(evt);
      };
      window.addEventListener('resize', this._resizeListener, false);

      // Controls
      this._mouseDownListener = function (e) {
        _this._onMouseDown(e);
      };
      this._mouseMoveListener = function (e) {
        _this._onMouseMove(e);
      };
      this._mouseUpListener = function (e) {
        _this._onMouseUp(e);
      };
      this._mouseOutListener = function (e) {
        _this._onMouseOut(e);
      };
      this._touchStartListener = function (e) {
        _this._onTouchStart(e);
      };
      this._touchEndListener = function (e) {
        _this._onTouchEnd(e);
      };
      this._touchMoveListener = function (e) {
        _this._onTouchMove(e);
      };

      // Mouse / Touch events
      container.addEventListener('mousedown', this._mouseDownListener, false);
      container.addEventListener('touchstart', this._touchStartListener, false);
      container.addEventListener('touchmove', this._touchMoveListener, false);
    }
  }, {
    key: '_removeEventListener',
    value: function _removeEventListener() {

      var container = this.container;

      // Remove resize listener
      window.removeEventListener('resize', this._resizeListener, false);
      this._resizeListener = null;

      // Remove model spinning controls
      container.removeEventListener('mouseup', this._mouseUpListener, false);
      container.removeEventListener('mousemove', this._mouseMoveListener, false);
      container.removeEventListener('mousedown', this._mouseDownListener, false);
      container.removeEventListener('touchstart', this._touchStartListener, false);
      container.removeEventListener('touchmove', this._touchMoveListener, false);
    }
  }, {
    key: '_onWindowResize',
    value: function _onWindowResize() {
      var _this2 = this;

      ['controlsConfig', 'controlsConfigDefault'].forEach(function (key) {

        if (_this2.hasOwnProperty(key)) {
          _this2[key].clientHalfX = _this2.container.clientWidth / 2;
          _this2[key].clientHalfY = _this2.container.clientHeight / 2;
        }
      });
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(evt) {

      evt.preventDefault();

      var container = this.container;
      var cfg = this.controlsConfig;

      if (container) {
        var clientX = evt.clientX;
        var clientY = evt.clientY;

        this._clearAnimations();

        container.addEventListener('mousemove', this._mouseMoveListener, false);
        container.addEventListener('mouseup', this._mouseUpListener, false);
        container.addEventListener('mouseout', this._mouseOutListener, false);

        cfg.mouseXOnMouseDown = clientX - cfg.clientHalfX;
        cfg.targetRotationOnMouseDownX = cfg.targetRotationX;

        cfg.mouseYOnMouseDown = clientY - cfg.clientHalfY;
        cfg.targetRotationOnMouseDownY = cfg.targetRotationY;
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(evt) {

      if (evt) {

        var cfg = this.controlsConfig;

        cfg.mouseX = evt.clientX - cfg.clientHalfX;
        cfg.mouseY = evt.clientY - cfg.clientHalfY;

        cfg.targetRotationY = cfg.targetRotationOnMouseDownY + (cfg.mouseY - cfg.mouseYOnMouseDown) * 0.02;
        cfg.targetRotationX = cfg.targetRotationOnMouseDownX + (cfg.mouseX - cfg.mouseXOnMouseDown) * 0.02;
      }
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp() {
      var container = this.container;

      if (container) {
        container.removeEventListener('mousemove', this._mouseMoveListener, false);
        container.removeEventListener('mouseup', this._mouseUpListener, false);
        container.removeEventListener('mouseout', this._mouseOutListener, false);
      }
    }
  }, {
    key: '_onMouseOut',
    value: function _onMouseOut() {
      var container = this.container;

      if (container) {
        container.removeEventListener('mousemove', this._mouseMoveListener, false);
        container.removeEventListener('mouseup', this._mouseUpListener, false);
        container.removeEventListener('mouseout', this._mouseOutListener, false);
      }
    }
  }, {
    key: '_onTouchStart',
    value: function _onTouchStart() {
      var evt = arguments.length <= 0 || arguments[0] === undefined ? { touches: [] } : arguments[0];

      var touches = evt.touches;
      var cfg = this.controlsConfig;

      if (touches.length === 1) {

        evt.preventDefault();
        var _touches$0 = touches[0];
        var pageX = _touches$0.pageX;
        var pageY = _touches$0.pageY;

        cfg.mouseXOnMouseDown = pageX - cfg.clientHalfX;
        cfg.targetRotationOnMouseDownX = cfg.targetRotationX;

        cfg.mouseYOnMouseDown = pageY - cfg.clientHalfY;
        cfg.targetRotationOnMouseDownY = cfg.targetRotationY;
      }
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd() {
      var evt = arguments.length <= 0 || arguments[0] === undefined ? { touches: [] } : arguments[0];

      var touches = evt.touches;
      var cfg = this.controlsConfig;

      if (touches.length === 1) {

        evt.preventDefault();

        var _touches$02 = touches[0];
        var pageX = _touches$02.pageX;
        var pageY = _touches$02.pageY;

        cfg.mouseX = pageX - cfg.clientHalfX;
        cfg.targetRotationX = cfg.targetRotationOnMouseDownX + (cfg.mouseX - cfg.mouseXOnMouseDown) * 0.05;

        cfg.mouseY = pageY - cfg.clientHalfY;
        cfg.targetRotationY = cfg.targetRotationOnMouseDownY + (cfg.mouseY - cfg.mouseYOnMouseDown) * 0.05;
      }
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove() {
      var evt = arguments.length <= 0 || arguments[0] === undefined ? { touches: [] } : arguments[0];

      var touches = evt.touches;
      var cfg = this.controlsConfig;

      if (touches.length === 1) {

        evt.preventDefault();
        var _touches$03 = touches[0];
        var pageX = _touches$03.pageX;
        var pageY = _touches$03.pageY;

        cfg.mouseX = pageX - cfg.clientHalfX;
        cfg.targetRotationX = cfg.targetRotationOnMouseDownX + (cfg.mouseX - cfg.mouseXOnMouseDown) * 0.05;

        cfg.mouseY = pageY - cfg.clientHalfY;
        cfg.targetRotationY = cfg.targetRotationOnMouseDownY + (cfg.mouseY - cfg.mouseYOnMouseDown) * 0.05;
      }
    }
  }, {
    key: 'zoom',
    set: function set(val) {
      this.controls.enableZoom = val;
      this.controlsConfig.zoom = val;
    },
    get: function get() {
      return this.controlsConfig;
    }
  }]);

  return ModelControls;
})();

exports['default'] = ModelControls;
module.exports = exports['default'];