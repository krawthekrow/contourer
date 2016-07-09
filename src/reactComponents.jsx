'use strict';

class CanvasDisplayPane extends React.Component{
    componentDidMount(){
        if('onMountCallback' in this.props){
            const canvas = ReactDOM.findDOMNode(this);
            this.props.onMountCallback(canvas);
        }
    }
    componentWillUnmount(){
        if('onDismountCallback' in this.props){
            this.props.onDismountCallback();
        }
    }
    render(){
        return (
            <canvas width={this.props.dims.width} height={this.props.dims.height} style={{width: '100%'}}></canvas>
        );
    }
};
CanvasDisplayPane.propTypes = {
    dims: React.PropTypes.instanceOf(Dimensions).isRequired,
    onMountCallback: React.PropTypes.func
};

class DrawFunctionSelectorButton extends React.Component{
    render(){
        return <button type="button" className={'list-group-item' + (this.props.selected ? ' active' : '')} onClick={() => {this.props.onClick(this.props.funcName);}}>{this.props.displayName}</button>;
    }
};

class DrawFunctionSelector extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            selectedFunc: DrawFunctionSelector.DEFAULT_FUNC
        };
        this.handleClick = this.handleClick.bind(this);
    }
    render(){
        return (
            <div className="list-group">
                {Object.keys(DemoFunctions.functions).map(func =>
                    <DrawFunctionSelectorButton displayName={DemoFunctions.functions[func].displayName} key={func} funcName={func} selected={func == this.state.selectedFunc} onClick={this.handleClick} />
                )}
            </div>
        );
    }
    handleClick(funcName){
        this.setState({
            selectedFunc: funcName
        });
        this.props.onSelect(funcName);
    }
};
DrawFunctionSelector.DEFAULT_FUNC = 'attractRepel';

class AceEditor extends React.Component{
    componentDidMount(){
        const editorDiv = ReactDOM.findDOMNode(this);
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
    componentWillUnmount(){
        this.editor.destroy();
    }
    setValue(newContents){
        this.editor.setValue(newContents);
        this.editor.clearSelection();
    }
    getValue(){
        return this.editor.getSession().getValue();
    }
    render(){
        return (
            <div style={{height: this.props.height.toString() + 'px'}}>
            </div>
        );
    }
};

class ContourerApp extends React.Component{
    constructor(props){
        super(props);
        this.animationManager = new ContourerAnimationManager(this.props.manager);
        this.state = {
            isAnimated: false,
            isAnimating: false,
            currentFrame: 0,
            numFrames: 0,
            isAnimatedSelectState: false,
            numFramesInputVal: '0',
            shaderCompileError: ''
        };
        this.useCanvas = this.useCanvas.bind(this);
        this.setDrawFunc = this.setDrawFunc.bind(this);
        this.onDrawFuncSelect = this.onDrawFuncSelect.bind(this);
        this.redraw = this.redraw.bind(this);
        this.changeZoomAndRedraw = this.changeZoomAndRedraw.bind(this);
        this.changeContourSpacingAndRedraw = this.changeContourSpacingAndRedraw.bind(this);
        this.translateAndRedraw = this.translateAndRedraw.bind(this);
        this.handlePlotClick = this.handlePlotClick.bind(this);
    }
    componentDidMount(){
        this.onDrawFuncSelect(DrawFunctionSelector.DEFAULT_FUNC);
    }
    render(){
        const CANVAS_DIMS = new Dimensions(640, 480);
        return (
            <div className="container" className="col-lg-12">
                <div className="page-header">
                    <h1>Fun with Contours</h1>
                </div>
                <div className="well">
                    <p>
                        <b>Drag</b> to move the graph, <b>scroll</b> to zoom, and <b>Ctrl + scroll</b> to change the contour density.
                    </p>
                    <p>
                        Modify <b><a href="#" onClick={(ev) => {
                            this.numFramesInput.focus();
                            ev.preventDefault();
                        }}>Frames</a></b> (number of frames), then click <b>Plot</b> to change the animation speed.
                    </p>
                    <p>
                        Use the <b>slider</b> to explore the animation in more detail.
                    </p>
                    <p>
                        Plot your own functions with the <b>text editors</b> below.
                    </p>
                    <p>
                        Just enjoy the pretty animations, or <b><a href="https://github.com/krawthekrow/contourer">click here</a></b> to learn more.
                    </p>
                    <p>
                        <b>Note: This app uses WebGL, so it needs a sufficiently modern browser and GPU to work.</b>
                    </p>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        <DrawFunctionSelector onSelect={this.onDrawFuncSelect}/>
                    </div>
                    <div className="col-sm-9">
                        <div className="row">
                            <div className="col-xs-8">
                                <div role="toolbar">
                                    <div className="btn-group" role="group">
                                        <button type="button" className="btn btn-default" onClick={e => {this.changeZoomAndRedraw(1);}}><span className="glyphicon glyphicon-zoom-in"></span></button>
                                        <button type="button" className="btn btn-default" onClick={e => {this.changeZoomAndRedraw(-1);}}><span className="glyphicon glyphicon-zoom-out"></span></button>
                                        <button type="button" className="btn btn-default" onClick={e => {this.changeContourSpacingAndRedraw(-1);}}><span className="glyphicon glyphicon-plus"></span></button>
                                        <button type="button" className="btn btn-default" onClick={e => {this.changeContourSpacingAndRedraw(1);}}><span className="glyphicon glyphicon-minus"></span></button>
                                        <button type="button" className="btn btn-default" onClick={e => {this.translateAndRedraw(new Vector(1, 0));}}><span className="glyphicon glyphicon-arrow-left"></span></button>
                                        <button type="button" className="btn btn-default" onClick={e => {this.translateAndRedraw(new Vector(0, 1));}}><span className="glyphicon glyphicon-arrow-up"></span></button>
                                        <button type="button" className="btn btn-default" onClick={e => {this.translateAndRedraw(new Vector(0, -1));}}><span className="glyphicon glyphicon-arrow-down"></span></button>
                                        <button type="button" className="btn btn-default" onClick={e => {this.translateAndRedraw(new Vector(-1, 0));}}><span className="glyphicon glyphicon-arrow-right"></span></button>
                                        { (!this.state.isAnimated || !this.state.isAnimating) ?
                                        <button type="button" className={classNames('btn', 'btn-default', {disabled: !this.state.isAnimated})} onClick={e => {
                                            if(this.state.isAnimated && !this.state.isAnimating){
                                                this.animationManager.start(this.state.currentFrame, currentFrame => {
                                                    this.setState({
                                                        currentFrame: currentFrame
                                                    });
                                                });
                                                this.setState({
                                                    isAnimating: true
                                                });
                                            }
                                        }}><span className="glyphicon glyphicon-play"></span></button> :
                                        <button type="button" className={classNames('btn', 'btn-default', {disabled: !this.state.isAnimated})} onClick={e => {
                                            if(this.state.isAnimated && this.state.isAnimating){
                                                this.animationManager.stop(() => {
                                                    this.setState({
                                                        isAnimating: false
                                                    });
                                                });
                                            }
                                        }}><span className="glyphicon glyphicon-pause"></span></button>
                                    }
                                    </div>
                                </div>
                            </div>
                            <div className="col-xs-4">
                                {
                                    this.state.isAnimated ?
                                    <input type="range" min="0" max={(this.state.numFrames - 1).toString()} value={this.state.currentFrame} style={{marginTop: '5px'}} onChange={e => {
                                        this.setState({
                                            currentFrame: parseInt(e.target.value)
                                        });
                                        if(this.state.isAnimating){
                                            this.animationManager.stop(() => {
                                                this.setState({
                                                    isAnimating: false,
                                                });
                                                this.props.manager.drawContours(this.state.currentFrame / this.state.numFrames);
                                            });
                                        }
                                        else{
                                            this.props.manager.drawContours(this.state.currentFrame / this.state.numFrames);
                                        }
                                    }} /> : null
                                }
                            </div>
                        </div>
                        <div style={{marginTop: '10px'}}>
                            <CanvasDisplayPane dims={CANVAS_DIMS} onMountCallback={canvas => {this.useCanvas(canvas);}} onDismountCallback={() => {this.props.manager.destroyContext();}} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h1>Plot Function</h1>
                        <div className="row">
                            <div className="col-xs-9">
                                <div className="form-inline">
                                    <div className="btn-group" style={{marginRight: '10px'}} role="group">
                                        <button type="button" className={classNames('btn', this.state.isAnimatedSelectState ? 'btn-default' : 'btn-primary', {'active': !this.state.isAnimatedSelectState})} onClick={ e => { this.setState({isAnimatedSelectState: false});} }>Graph</button>
                                        <button type="button" className={classNames('btn', this.state.isAnimatedSelectState ? 'btn-primary' : 'btn-default', {'active': this.state.isAnimatedSelectState})} onClick={ e => { this.setState({isAnimatedSelectState: true});} }>Animation</button>
                                    </div>
                                    <div className={classNames('form-group', {'has-error': this.isNumFramesInputInvalid()})} style={{display: 'inline-block', marginBottom: 0, verticalAlign: 'middle'}}>
                                        <div className="input-group">
                                            <span className="input-group-addon">Frames</span>
                                            <input type="text" className="form-control" value={this.state.numFramesInputVal} disabled={!this.state.isAnimatedSelectState} ref={input => {this.numFramesInput = input;}} onChange={e => {this.setState({numFramesInputVal: e.target.value});}} style={{width: '60px'}} />
                                        </div>
                                        <div className="help-block" style={{display: this.isNumFramesInputInvalid() ? 'inline-block' : 'none', marginLeft: '10px'}}>Must be an integer</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xs-3">
                                <button type="button" className="btn btn-success btn-block pull-right" style={{width: '80px'}} disabled={this.isNumFramesInputInvalid()} ref={button => {this.plotButton = button;}} onClick={this.handlePlotClick}>Plot</button>
                            </div>
                        </div>
                        { this.state.shaderCompileError == '' ? null :
                            <div className="has-error">
                                <div className="help-block">
                                    <p>
                                        Your code failed to compile with the following error:
                                    </p>
                                    <p>
                                        { this.state.shaderCompileError.trim().split('\n').map((line, index) => <span key={index}>{line}<br /></span>) }
                                    </p>
                                    { (this.state.shaderCompileError.indexOf('wrong operand types') != -1) ? <p><b>Note that GLSL ES does not implicitly cast ints to floats. Write numbers like "23" as "23.0".</b></p> : null }
                                    { (this.state.shaderCompileError.indexOf('gl_FragData') != -1) ? <p><b>Did you forget a semicolon on the last line?</b></p> : null }
                                <p>
                                    View the console to see the full generated WebGL shader code.
                                </p>
                                </div>
                            </div>
                        }
                        <div style={{marginTop: '10px'}}>
                            <AceEditor height="200" key="drawFuncEditor" ref={ editor => {this.drawFuncEditor = editor;} } />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h1>Library Functions</h1>
                        <div style={{marginBottom: '10px'}}>
                            <AceEditor height="200" key="includeSrcEditor" ref={ editor => {this.includeSrcEditor = editor;} } />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    useCanvas(canvas){
        const dragManager = new DragManager(canvas,
            dragVec => {
                this.props.manager.viewport.translate(dragVec);
                this.redraw();
            },
            ev => true
        );

        canvas.addEventListener('wheel', ev => {
            if(ev.ctrlKey){
                this.changeContourSpacingAndRedraw(getScrollDir(ev));
            }
            else{
                this.props.manager.changeZoom(-getScrollDir(ev), getCanvasMousePos(canvas, ev));
                this.redraw();
            }
            ev.preventDefault();
        });

        this.props.manager.useCanvas(canvas);
    }
    isNumFramesInputInvalid(){
        return this.state.isAnimatedSelectState && this.state.numFramesInputVal.split('').some(c => {
            return c.charCodeAt() < '0'.charCodeAt() || c.charCodeAt() > '9'.charCodeAt();
        });
    }
    handlePlotClick(e){
        this.setDrawFunc(this.drawFuncEditor.getValue(), this.includeSrcEditor.getValue(), this.state.isAnimatedSelectState, this.state.isAnimatedSelectState ? parseInt(this.state.numFramesInputVal) : 0);
    }
    redraw(){
        if(this.state.isAnimated){
            this.props.manager.drawContours(this.state.currentFrame / this.state.numFrames);
        }
        else{
            this.props.manager.drawContours();
        }
    }
    changeZoomAndRedraw(changeAmount){
        this.props.manager.changeZoom(changeAmount);
        this.redraw();
    }
    changeContourSpacingAndRedraw(changeAmount){
        this.props.manager.changeContourSpacing(changeAmount);
        this.redraw();
    }
    translateAndRedraw(translateAmount){
        this.props.manager.translate(translateAmount.multiply(50.0));
        this.redraw();
    }
    setDrawFunc(drawFunc, includeSrc, isAnimated = false, numFrames = 0){
        try{
            this.props.manager.changeDrawFunc(drawFunc, includeSrc, isAnimated);
        }
        catch(err){
            this.setState({
                shaderCompileError: err
            });
            return;
        }

        if(isAnimated && numFrames == 0){
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
        if(isAnimated){
            this.animationManager.stop(() => {
                this.animationManager.start(0, currentFrame => {
                    this.setState({
                        currentFrame: currentFrame
                    });
                });
            });
        }
        else{
            this.animationManager.stop(() => {
                this.props.manager.drawContours();
            });
        }
    }
    onDrawFuncSelect(func){
        const selectedFunc = DemoFunctions.functions[func];
        this.drawFuncEditor.setValue(selectedFunc.drawFunc.trim());
        this.includeSrcEditor.setValue(selectedFunc.includeSrc.trim());
        if(selectedFunc.isAnimated){
            this.setDrawFunc(selectedFunc.drawFunc, selectedFunc.includeSrc, selectedFunc.isAnimated, selectedFunc.numFrames);
        }
        else{
            this.setDrawFunc(selectedFunc.drawFunc, selectedFunc.includeSrc);
        }
    }
};

function initRender(manager){
    const container = document.getElementById('indexContainer');
    ReactDOM.render(
        <ContourerApp manager={manager} />,
        container
    );
    document.getElementById('github-ribbon').innerHTML = '<a href="https://github.com/krawthekrow/contourer"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/365986a132ccd6a44c23a9169022c0b5c890c387/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f7265645f6161303030302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_red_aa0000.png"></a>';
}
