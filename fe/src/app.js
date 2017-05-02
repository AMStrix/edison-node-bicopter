import React from 'react';
import { render } from 'react-dom';
import styled from 'styled-components';
import Chart from './Chart';
import Visual from './Visual';

const DELAY = 500;
const SOCKET = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
};
const SOCKET_URL = 'ws://edison-beta.local:88/';

function event(key, data) {
    console.log('event ', key, data);
    if (key === 'startFlight') {
        window._socket.send('start');
    }
    if (key === 'stopFlight') {
        window._socket.send('stop');
    }
    if (key === 'measureBias') {
        window._socket.send('set.flight.measureBias');
    }
    if (key === 'calibrateEsc') {
        window._socket.send('set.flight.calibrateEsc');
    }
}

const RootStyle = styled.div`
    button { outline: none; border: none; padding: 2px; }
    button:hover { cursor: pointer; }
    button:active { opacity: 0.7; }
    font-family: arial;
    font-size: 10px;
`;
class Root extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socketReadyState: SOCKET.CLOSED,
            isSocketConnected: false,
            socketReconnectAttempt: 0,
            socketError: null,
            socketUrl: SOCKET_URL,
            status: null,
        };
        this.interval = null;
        this.socket = null;
        this.lastSocketConnectAttempt = null;
    }
    openSocket() {
        this.lastSocketConnectAttempt = Date.now();
        this.socket = new WebSocket(SOCKET_URL);
        window._socket = this.socket;
        this.socket.addEventListener('open', x => {
            this.setState({socketReconnectAttempt: 0, socketError: null})
        });
        this.socket.addEventListener('close', x => {
            this.socket = null;
            window._socket = null;
        });
        this.socket.addEventListener('error', x => {
            if (this.socket.readyState === SOCKET.CLOSED) {
                this.setState({ socketError: 'socket closed due to error' });
                this.socket = null;
                window._socket = null;
            } else {
                this.setState({ socketError: `socket error` });
            }
        });
        this.socket.addEventListener('message', m => {
            this.setState({ status: JSON.parse(m.data) });
        });
    }
    componentDidMount() {
        this.openSocket();
        setInterval(() => {
            if (this.socket && this.socket.readyState === SOCKET.OPEN ) {
                this.socket.send('status');
            } else if (!this.socket && Date.now() - this.lastSocketConnectAttempt > 5000) {
                this.setState({ socketReconnectAttempt: this.state.socketReconnectAttempt + 1});
                this.openSocket();
            }
            if (this.socket) {
                this.setState({
                    socketReadyState: this.socket.readyState,
                    isSocketConnected: this.socket.readyState === SOCKET.OPEN,
                });
            }
        }, DELAY);
    }
    componentWillUnmount() {
        clearInterval(interval);
    }
    render() {
        return (
            <RootStyle><Dashboard {...this.state} /></RootStyle>
        );
    }
}

const Dashboard = p =>
<div>
    <SocketStatus {...p} />
    { p.isSocketConnected &&
        <div>
            <FlightControl {...p.status}
                onStartFlight={isStart => event(isStart?'startFlight':'stopFlight')}
                onMeasureBias={() => event('measureBias')}
                onCalibrateEsc={() => event('calibrateEsc')}
            />
            <Chart {...(p.status && p.status.ndof.gyro)} min={-100} max={100} label='gyro' delay={DELAY} />
            <Chart {...(p.status && p.status.ndof.acc)} min={-1} max={1} label='acc' delay={DELAY} />
            <Chart {...(p.status && p.status.ndof.mag)} min={-1} max={1} label='mag' delay={DELAY} />
            <Visual {...(p.status)} delay={DELAY} />

                <VectorInfo {...(p.status && p.status.ndof.gyro)} label="gyro" />
                <VectorInfo {...(p.status && { vector: {
                    x: p.status.bias.gyro.x.bias,
                    y: p.status.bias.gyro.y.bias,
                    z: p.status.bias.gyro.z.bias
                }})} label="gyro bias" />
                &nbsp;
                <VectorInfo {...(p.status && p.status.ndof.acc)} label="acc" />
                <VectorInfo {...(p.status && { vector: {
                    x: p.status.bias.acc.x.bias,
                    y: p.status.bias.acc.y.bias,
                    z: p.status.bias.acc.z.bias
                }})} label="acc bias" />
                &nbsp;
                <VectorInfo {...(p.status && p.status.ndof.mag)} label="mag" />
                <VectorInfo {...(p.status && { vector: {
                    x: p.status.bias.mag.x.bias,
                    y: p.status.bias.mag.y.bias,
                    z: p.status.bias.mag.z.bias
                }})} label="mag bias" />

            <FilterInfo {...(p.status && p.status.filter)} />
        </div>
    }
</div>;

function fmtNumFixed(n) {
    return n && n.toFixed(3) || '0.000';
}
const VectorInfoStyled = styled.div`
    display: inline-block;
    padding-right: 12px;
`;
const VectorInfo = p =>
<VectorInfoStyled>
    <div>{ p.label }</div>
    { p.vector && <div>
        <div>x {' ' + fmtNumFixed(p.vector.x)}</div>
        <div>y {' ' + fmtNumFixed(p.vector.y)}</div>
        <div>z {' ' + fmtNumFixed(p.vector.z)}</div>
    </div>}
</VectorInfoStyled>;

const FilterInfo = p =>
<div>
    <div>
        Filter Info
        min: { ' ' + p.tickDiffMin + ', '}
        avg: { ' ' + fmtNumFixed(p.runningTickDiffAvg) + ', '}
        max: { ' ' + p.tickDiffMax }
    </div>
</div>

const StatusBox = styled.div`
    display: inline-block;
    width: 10px;
    height: 10px;
    background: ${p => p.status == 'on' ? 'green' : '#ccc'};
`;
const SocketStatusStyled = styled.div`
    color: gray;
    & span {
        color: red;
    }
`;
const SocketStatus = p =>
<SocketStatusStyled>
    <StatusBox status={p.isSocketConnected?'on':'off'} />
    {' ' + p.socketUrl}
    { p.socketReconnectAttempt && ` (reconnecting, attempt ${p.socketReconnectAttempt})` || '' }
    { p.socketError && <span>{' ' + p.socketError}</span> }
    { ' DELAY: ' + DELAY }
</SocketStatusStyled>;

const FlightControlStyled = styled.div`
    margin: 4px 0 4px 0;
    & .startBtn {
        background: ${ p => p.running ? 'green' : '#cccccc' }
    }
    & .measureBiasBtn {
        background: ${ p => p.isMeasureBias ? 'red' : '#cccccc' }
    }
    & .calibrateEscBtn {
        background: ${ p => p.throttle && p.throttle.left == 1 ? 'red' : '#cccccc' }
    }
`;
const FlightControl = p =>
<FlightControlStyled {...p}>
    <button className="startBtn" onClick={() => p.onStartFlight(!p.running)} >
        { p.running ? 'stop' : 'start' }
    </button>
    &nbsp; flight loop
    &nbsp;&nbsp;
    { p.running &&
        <button className="measureBiasBtn" onClick={p.onMeasureBias} >
            { p.isMeasureBias ? 'measuring bias...' :  'measure bias' }
        </button>
    }
    &nbsp;&nbsp;
    { p.running &&
        <button className="calibrateEscBtn" onClick={p.onCalibrateEsc} >
            calibrate esc (toggle throttle max) [{ p.throttle.left + '/' + p.throttle.right }]
        </button>
    }
</FlightControlStyled>;



render( <Root/>, document.querySelector('#app') );