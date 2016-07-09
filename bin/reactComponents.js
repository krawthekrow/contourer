'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CanvasDisplayPane = function (_React$Component) {
    _inherits(CanvasDisplayPane, _React$Component);

    function CanvasDisplayPane() {
        _classCallCheck(this, CanvasDisplayPane);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(CanvasDisplayPane).apply(this, arguments));
    }

    _createClass(CanvasDisplayPane, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if ('onMountCallback' in this.props) {
                var canvas = ReactDOM.findDOMNode(this);
                this.props.onMountCallback(canvas);
            }
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            if ('onDismountCallback' in this.props) {
                this.props.onDismountCallback();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement('canvas', { width: this.props.dims.width, height: this.props.dims.height, style: { width: '100%' } });
        }
    }]);

    return CanvasDisplayPane;
}(React.Component);

;
CanvasDisplayPane.propTypes = {
    dims: React.PropTypes.instanceOf(Dimensions).isRequired,
    onMountCallback: React.PropTypes.func
};

var DrawFunctionSelectorButton = function (_React$Component2) {
    _inherits(DrawFunctionSelectorButton, _React$Component2);

    function DrawFunctionSelectorButton() {
        _classCallCheck(this, DrawFunctionSelectorButton);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(DrawFunctionSelectorButton).apply(this, arguments));
    }

    _createClass(DrawFunctionSelectorButton, [{
        key: 'render',
        value: function render() {
            var _this3 = this;

            return React.createElement(
                'button',
                { type: 'button', className: 'list-group-item' + (this.props.selected ? ' active' : ''), onClick: function onClick() {
                        _this3.props.onClick(_this3.props.funcName);
                    } },
                this.props.displayName
            );
        }
    }]);

    return DrawFunctionSelectorButton;
}(React.Component);

;

var DrawFunctionSelector = function (_React$Component3) {
    _inherits(DrawFunctionSelector, _React$Component3);

    function DrawFunctionSelector(props) {
        _classCallCheck(this, DrawFunctionSelector);

        var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(DrawFunctionSelector).call(this, props));

        _this4.state = {
            selectedFunc: DrawFunctionSelector.DEFAULT_FUNC
        };
        _this4.handleClick = _this4.handleClick.bind(_this4);
        return _this4;
    }

    _createClass(DrawFunctionSelector, [{
        key: 'render',
        value: function render() {
            var _this5 = this;

            return React.createElement(
                'div',
                { className: 'list-group' },
                Object.keys(DemoFunctions.functions).map(function (func) {
                    return React.createElement(DrawFunctionSelectorButton, { displayName: DemoFunctions.functions[func].displayName, key: func, funcName: func, selected: func == _this5.state.selectedFunc, onClick: _this5.handleClick });
                })
            );
        }
    }, {
        key: 'handleClick',
        value: function handleClick(funcName) {
            this.setState({
                selectedFunc: funcName
            });
            this.props.onSelect(funcName);
        }
    }]);

    return DrawFunctionSelector;
}(React.Component);

;
DrawFunctionSelector.DEFAULT_FUNC = 'attractRepel';

var AceEditor = function (_React$Component4) {
    _inherits(AceEditor, _React$Component4);

    function AceEditor() {
        _classCallCheck(this, AceEditor);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AceEditor).apply(this, arguments));
    }

    _createClass(AceEditor, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            var editorDiv = ReactDOM.findDOMNode(this);
            this.editor = ace.edit(editorDiv);
            this.editor.setTheme('ace/theme/monokai');
            this.editor.getSession().setUseWorker(false);
            this.editor.getSession().setMode('ace/mode/glsl');
            this.editor.$blockScrolling = Infinity;
            this.editor.setFontSize(18);
            this.editor.setOptions({
                maxLines: Infinity
            });
            this.editor.getSession().setUseWrapMode(true);
        }
    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.editor.destroy();
        }
    }, {
        key: 'setValue',
        value: function setValue(newContents) {
            this.editor.setValue(newContents);
            this.editor.clearSelection();
        }
    }, {
        key: 'getValue',
        value: function getValue() {
            return this.editor.getSession().getValue();
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement('div', { style: { height: this.props.height.toString() + 'px' } });
        }
    }]);

    return AceEditor;
}(React.Component);

;

var ContourerApp = function (_React$Component5) {
    _inherits(ContourerApp, _React$Component5);

    function ContourerApp(props) {
        _classCallCheck(this, ContourerApp);

        var _this7 = _possibleConstructorReturn(this, Object.getPrototypeOf(ContourerApp).call(this, props));

        _this7.animationManager = new ContourerAnimationManager(_this7.props.manager);
        _this7.state = {
            isAnimated: false,
            isAnimating: false,
            currentFrame: 0,
            numFrames: 0,
            isAnimatedSelectState: false,
            numFramesInputVal: '0',
            shaderCompileError: ''
        };
        _this7.useCanvas = _this7.useCanvas.bind(_this7);
        _this7.setDrawFunc = _this7.setDrawFunc.bind(_this7);
        _this7.onDrawFuncSelect = _this7.onDrawFuncSelect.bind(_this7);
        _this7.redraw = _this7.redraw.bind(_this7);
        _this7.changeZoomAndRedraw = _this7.changeZoomAndRedraw.bind(_this7);
        _this7.changeContourSpacingAndRedraw = _this7.changeContourSpacingAndRedraw.bind(_this7);
        _this7.translateAndRedraw = _this7.translateAndRedraw.bind(_this7);
        _this7.handlePlotClick = _this7.handlePlotClick.bind(_this7);
        return _this7;
    }

    _createClass(ContourerApp, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.onDrawFuncSelect(DrawFunctionSelector.DEFAULT_FUNC);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this8 = this;

            var CANVAS_DIMS = new Dimensions(640, 480);
            return React.createElement(
                'div',
                _defineProperty({ className: 'container' }, 'className', 'col-lg-12'),
                React.createElement(
                    'div',
                    { className: 'page-header' },
                    React.createElement(
                        'h1',
                        null,
                        'Contourer'
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'well' },
                    React.createElement(
                        'p',
                        null,
                        React.createElement(
                            'b',
                            null,
                            'Drag'
                        ),
                        ' to move the graph, ',
                        React.createElement(
                            'b',
                            null,
                            'scroll'
                        ),
                        ' to zoom, and ',
                        React.createElement(
                            'b',
                            null,
                            'Ctrl + scroll'
                        ),
                        ' to change the contour density.',
                        React.createElement('br', null),
                        'Or, if you\'re on mobile, use the ',
                        React.createElement(
                            'b',
                            null,
                            'buttons'
                        ),
                        '.'
                    ),
                    React.createElement(
                        'p',
                        null,
                        'Modify ',
                        React.createElement(
                            'b',
                            null,
                            React.createElement(
                                'a',
                                { href: '#', onClick: function onClick(ev) {
                                        _this8.numFramesInput.focus();
                                        ev.preventDefault();
                                    } },
                                'Frames'
                            )
                        ),
                        ' (number of frames), then click ',
                        React.createElement(
                            'b',
                            null,
                            'Plot'
                        ),
                        ' to change the animation speed.',
                        React.createElement('br', null),
                        'Or use the ',
                        React.createElement(
                            'b',
                            null,
                            'slider'
                        ),
                        ' to explore the animation in more detail.'
                    ),
                    React.createElement(
                        'p',
                        null,
                        'Plot your own functions with the ',
                        React.createElement(
                            'b',
                            null,
                            'code editors'
                        ),
                        ' below.'
                    ),
                    React.createElement(
                        'p',
                        null,
                        'Just enjoy the pretty animations, or ',
                        React.createElement(
                            'b',
                            null,
                            React.createElement(
                                'a',
                                { href: 'https://github.com/krawthekrow/contourer' },
                                'click here'
                            )
                        ),
                        ' to learn more.'
                    ),
                    React.createElement(
                        'p',
                        null,
                        React.createElement(
                            'b',
                            null,
                            'Note: This app uses WebGL, so it needs a sufficiently modern browser and GPU to work.'
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-3' },
                        React.createElement(DrawFunctionSelector, { onSelect: this.onDrawFuncSelect })
                    ),
                    React.createElement(
                        'div',
                        { className: 'col-sm-9' },
                        React.createElement(
                            'div',
                            { className: 'row' },
                            React.createElement(
                                'div',
                                { className: 'col-xs-8' },
                                React.createElement(
                                    'div',
                                    { role: 'toolbar' },
                                    React.createElement(
                                        'div',
                                        { className: 'btn-group', role: 'group' },
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: 'btn btn-default', onClick: function onClick(e) {
                                                    _this8.changeZoomAndRedraw(1);
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-zoom-in' })
                                        ),
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: 'btn btn-default', onClick: function onClick(e) {
                                                    _this8.changeZoomAndRedraw(-1);
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-zoom-out' })
                                        ),
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: 'btn btn-default', onClick: function onClick(e) {
                                                    _this8.changeContourSpacingAndRedraw(-1);
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-plus' })
                                        ),
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: 'btn btn-default', onClick: function onClick(e) {
                                                    _this8.changeContourSpacingAndRedraw(1);
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-minus' })
                                        ),
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: 'btn btn-default', onClick: function onClick(e) {
                                                    _this8.translateAndRedraw(new Vector(1, 0));
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-arrow-left' })
                                        ),
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: 'btn btn-default', onClick: function onClick(e) {
                                                    _this8.translateAndRedraw(new Vector(0, 1));
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-arrow-up' })
                                        ),
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: 'btn btn-default', onClick: function onClick(e) {
                                                    _this8.translateAndRedraw(new Vector(0, -1));
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-arrow-down' })
                                        ),
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: 'btn btn-default', onClick: function onClick(e) {
                                                    _this8.translateAndRedraw(new Vector(-1, 0));
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-arrow-right' })
                                        ),
                                        !this.state.isAnimated || !this.state.isAnimating ? React.createElement(
                                            'button',
                                            { type: 'button', className: classNames('btn', 'btn-default', { disabled: !this.state.isAnimated }), onClick: function onClick(e) {
                                                    if (_this8.state.isAnimated && !_this8.state.isAnimating) {
                                                        _this8.animationManager.start(_this8.state.currentFrame, function (currentFrame) {
                                                            _this8.setState({
                                                                currentFrame: currentFrame
                                                            });
                                                        });
                                                        _this8.setState({
                                                            isAnimating: true
                                                        });
                                                    }
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-play' })
                                        ) : React.createElement(
                                            'button',
                                            { type: 'button', className: classNames('btn', 'btn-default', { disabled: !this.state.isAnimated }), onClick: function onClick(e) {
                                                    if (_this8.state.isAnimated && _this8.state.isAnimating) {
                                                        _this8.animationManager.stop(function () {
                                                            _this8.setState({
                                                                isAnimating: false
                                                            });
                                                        });
                                                    }
                                                } },
                                            React.createElement('span', { className: 'glyphicon glyphicon-pause' })
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-4' },
                                this.state.isAnimated ? React.createElement('input', { type: 'range', min: '0', max: (this.state.numFrames - 1).toString(), value: this.state.currentFrame, style: { marginTop: '5px' }, onChange: function onChange(e) {
                                        _this8.setState({
                                            currentFrame: parseInt(e.target.value)
                                        });
                                        if (_this8.state.isAnimating) {
                                            _this8.animationManager.stop(function () {
                                                _this8.setState({
                                                    isAnimating: false
                                                });
                                                _this8.props.manager.drawContours(_this8.state.currentFrame / _this8.state.numFrames);
                                            });
                                        } else {
                                            _this8.props.manager.drawContours(_this8.state.currentFrame / _this8.state.numFrames);
                                        }
                                    } }) : null
                            )
                        ),
                        React.createElement(
                            'div',
                            { style: { marginTop: '10px' } },
                            React.createElement(CanvasDisplayPane, { dims: CANVAS_DIMS, onMountCallback: function onMountCallback(canvas) {
                                    _this8.useCanvas(canvas);
                                }, onDismountCallback: function onDismountCallback() {
                                    _this8.props.manager.destroyContext();
                                } })
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-12' },
                        React.createElement(
                            'h1',
                            null,
                            'Plot Function'
                        ),
                        React.createElement(
                            'div',
                            { className: 'row' },
                            React.createElement(
                                'div',
                                { className: 'col-xs-9' },
                                React.createElement(
                                    'div',
                                    { className: 'form-inline' },
                                    React.createElement(
                                        'div',
                                        { className: 'btn-group', style: { marginRight: '10px' }, role: 'group' },
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: classNames('btn', this.state.isAnimatedSelectState ? 'btn-default' : 'btn-primary', { 'active': !this.state.isAnimatedSelectState }), onClick: function onClick(e) {
                                                    _this8.setState({ isAnimatedSelectState: false });
                                                } },
                                            'Graph'
                                        ),
                                        React.createElement(
                                            'button',
                                            { type: 'button', className: classNames('btn', this.state.isAnimatedSelectState ? 'btn-primary' : 'btn-default', { 'active': this.state.isAnimatedSelectState }), onClick: function onClick(e) {
                                                    _this8.setState({ isAnimatedSelectState: true });
                                                } },
                                            'Animation'
                                        )
                                    ),
                                    React.createElement(
                                        'div',
                                        { className: classNames('form-group', { 'has-error': this.isNumFramesInputInvalid() }), style: { display: 'inline-block', marginBottom: 0, verticalAlign: 'middle' } },
                                        React.createElement(
                                            'div',
                                            { className: 'input-group' },
                                            React.createElement(
                                                'span',
                                                { className: 'input-group-addon' },
                                                'Frames'
                                            ),
                                            React.createElement('input', { type: 'text', className: 'form-control', value: this.state.numFramesInputVal, disabled: !this.state.isAnimatedSelectState, ref: function ref(input) {
                                                    _this8.numFramesInput = input;
                                                }, onChange: function onChange(e) {
                                                    _this8.setState({ numFramesInputVal: e.target.value });
                                                }, style: { width: '60px' } })
                                        ),
                                        React.createElement(
                                            'div',
                                            { className: 'help-block', style: { display: this.isNumFramesInputInvalid() ? 'inline-block' : 'none', marginLeft: '10px' } },
                                            'Must be an integer'
                                        )
                                    )
                                )
                            ),
                            React.createElement(
                                'div',
                                { className: 'col-xs-3' },
                                React.createElement(
                                    'button',
                                    { type: 'button', className: 'btn btn-success btn-block pull-right', style: { width: '80px' }, disabled: this.isNumFramesInputInvalid(), ref: function ref(button) {
                                            _this8.plotButton = button;
                                        }, onClick: this.handlePlotClick },
                                    'Plot'
                                )
                            )
                        ),
                        this.state.shaderCompileError == '' ? null : React.createElement(
                            'div',
                            { className: 'has-error' },
                            React.createElement(
                                'div',
                                { className: 'help-block' },
                                React.createElement(
                                    'p',
                                    null,
                                    'Your code failed to compile with the following error:'
                                ),
                                React.createElement(
                                    'p',
                                    null,
                                    this.state.shaderCompileError.trim().split('\n').map(function (line, index) {
                                        return React.createElement(
                                            'span',
                                            { key: index },
                                            line,
                                            React.createElement('br', null)
                                        );
                                    })
                                ),
                                this.state.shaderCompileError.indexOf('wrong operand types') != -1 ? React.createElement(
                                    'p',
                                    null,
                                    React.createElement(
                                        'b',
                                        null,
                                        'Note that GLSL ES does not implicitly cast ints to floats. Write numbers like "23" as "23.0".'
                                    )
                                ) : null,
                                this.state.shaderCompileError.indexOf('gl_FragData') != -1 ? React.createElement(
                                    'p',
                                    null,
                                    React.createElement(
                                        'b',
                                        null,
                                        'Did you forget a semicolon on the last line?'
                                    )
                                ) : null,
                                React.createElement(
                                    'p',
                                    null,
                                    'View the console to see the full generated WebGL shader code.'
                                )
                            )
                        ),
                        React.createElement(
                            'div',
                            { style: { marginTop: '10px' } },
                            React.createElement(AceEditor, { height: '200', key: 'drawFuncEditor', ref: function ref(editor) {
                                    _this8.drawFuncEditor = editor;
                                } })
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'row' },
                    React.createElement(
                        'div',
                        { className: 'col-sm-12' },
                        React.createElement(
                            'h1',
                            null,
                            'Library Functions'
                        ),
                        React.createElement(
                            'div',
                            { style: { marginBottom: '10px' } },
                            React.createElement(AceEditor, { height: '200', key: 'includeSrcEditor', ref: function ref(editor) {
                                    _this8.includeSrcEditor = editor;
                                } })
                        )
                    )
                )
            );
        }
    }, {
        key: 'useCanvas',
        value: function useCanvas(canvas) {
            var _this9 = this;

            var dragManager = new DragManager(canvas, function (dragVec) {
                _this9.props.manager.viewport.translate(dragVec);
                _this9.redraw();
            }, function (ev) {
                return true;
            });

            canvas.addEventListener('wheel', function (ev) {
                if (ev.ctrlKey) {
                    _this9.changeContourSpacingAndRedraw(getScrollDir(ev));
                } else {
                    _this9.props.manager.changeZoom(-getScrollDir(ev), getCanvasMousePos(canvas, ev));
                    _this9.redraw();
                }
                ev.preventDefault();
            });

            this.props.manager.useCanvas(canvas);
        }
    }, {
        key: 'isNumFramesInputInvalid',
        value: function isNumFramesInputInvalid() {
            return this.state.isAnimatedSelectState && this.state.numFramesInputVal.split('').some(function (c) {
                return c.charCodeAt() < '0'.charCodeAt() || c.charCodeAt() > '9'.charCodeAt();
            });
        }
    }, {
        key: 'handlePlotClick',
        value: function handlePlotClick(e) {
            this.setDrawFunc(this.drawFuncEditor.getValue(), this.includeSrcEditor.getValue(), this.state.isAnimatedSelectState, this.state.isAnimatedSelectState ? parseInt(this.state.numFramesInputVal) : 0);
        }
    }, {
        key: 'redraw',
        value: function redraw() {
            if (this.state.isAnimated) {
                this.props.manager.drawContours(this.state.currentFrame / this.state.numFrames);
            } else {
                this.props.manager.drawContours();
            }
        }
    }, {
        key: 'changeZoomAndRedraw',
        value: function changeZoomAndRedraw(changeAmount) {
            this.props.manager.changeZoom(changeAmount);
            this.redraw();
        }
    }, {
        key: 'changeContourSpacingAndRedraw',
        value: function changeContourSpacingAndRedraw(changeAmount) {
            this.props.manager.changeContourSpacing(changeAmount);
            this.redraw();
        }
    }, {
        key: 'translateAndRedraw',
        value: function translateAndRedraw(translateAmount) {
            this.props.manager.translate(translateAmount.multiply(50.0));
            this.redraw();
        }
    }, {
        key: 'setDrawFunc',
        value: function setDrawFunc(drawFunc, includeSrc) {
            var _this10 = this;

            var isAnimated = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
            var numFrames = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

            try {
                this.props.manager.changeDrawFunc(drawFunc, includeSrc, isAnimated);
            } catch (err) {
                this.setState({
                    shaderCompileError: err
                });
                return;
            }

            if (isAnimated && numFrames == 0) {
                numFrames = 1;
            }

            this.setState({
                isAnimated: isAnimated,
                isAnimating: isAnimated,
                currentFrame: 0,
                numFrames: numFrames,
                isAnimatedSelectState: isAnimated,
                numFramesInputVal: numFrames.toString(),
                shaderCompileError: ''
            });
            this.animationManager.numFrames = numFrames;
            if (isAnimated) {
                this.animationManager.stop(function () {
                    _this10.animationManager.start(0, function (currentFrame) {
                        _this10.setState({
                            currentFrame: currentFrame
                        });
                    });
                });
            } else {
                this.animationManager.stop(function () {
                    _this10.props.manager.drawContours();
                });
            }
        }
    }, {
        key: 'onDrawFuncSelect',
        value: function onDrawFuncSelect(func) {
            var selectedFunc = DemoFunctions.functions[func];
            this.drawFuncEditor.setValue(selectedFunc.drawFunc.trim());
            this.includeSrcEditor.setValue(selectedFunc.includeSrc.trim());
            if (selectedFunc.isAnimated) {
                this.setDrawFunc(selectedFunc.drawFunc, selectedFunc.includeSrc, selectedFunc.isAnimated, selectedFunc.numFrames);
            } else {
                this.setDrawFunc(selectedFunc.drawFunc, selectedFunc.includeSrc);
            }
        }
    }]);

    return ContourerApp;
}(React.Component);

;

function initRender(manager) {
    var container = document.getElementById('indexContainer');
    ReactDOM.render(React.createElement(ContourerApp, { manager: manager }), container);
    document.getElementById('github-ribbon').innerHTML = '<a href="https://github.com/krawthekrow/contourer"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png"></a>';
}
