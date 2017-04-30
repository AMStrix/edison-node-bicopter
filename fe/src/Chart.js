import React from 'react';
import styled from 'styled-components';
import { SmoothieChart, TimeSeries } from 'smoothie';

const COLOR = {
    X: '#dd0000',
    Y: '#00dd00',
    Z: '#0000dd',
};

const ChartStyle = styled.div`
    font-family: arial;
`;
class Chart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showX: true,
            showY: true,
            showZ: true,
        };
    }
    componentDidMount() {
        this.smoothieChart = new SmoothieChart({
            labels: {
                fillStyle: '#cccccc'
            },
            grid:{
                fillStyle: 'transparent',
                strokeStyle: '#cccccc',
                verticalSections: 2
            }
        });
        this.smoothieChart.streamTo(this.chartElement, this.props.delay);
        this.ts = {
            x: new TimeSeries(),
            y: new TimeSeries(),
            z: new TimeSeries()
        }
        this.updateTimeSeries();
    }
    updateTimeSeries() {
        this.smoothieChart[(this.state.showX?'add':'remove')+'TimeSeries'](this.ts.x, { strokeStyle: COLOR.X });
        this.smoothieChart[(this.state.showY?'add':'remove')+'TimeSeries'](this.ts.y, { strokeStyle: COLOR.Y });
        this.smoothieChart[(this.state.showZ?'add':'remove')+'TimeSeries'](this.ts.z, { strokeStyle: COLOR.Z });
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(props) {
        if (props && props.vector) {
            this.ts.x.append(new Date().getTime(), props.vector.x);
            this.ts.y.append(new Date().getTime(), props.vector.y);
            this.ts.z.append(new Date().getTime(), props.vector.z);
        }
    }
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }
    render() {
        return (
            <ChartStyle>
                <div>
                    { this.props.label + ' '}
                    <AxisToggleBtn color={COLOR.X} active={this.state.showX} onClick={() => {
                        console.log('x', this.state.showX);
                        this.setState({ showX: !this.state.showX });
                    }}>x</AxisToggleBtn>
                    <AxisToggleBtn color={COLOR.Y} active={this.state.showY} onClick={() => {
                        this.setState({ showY: !this.state.showY });
                    }}>y</AxisToggleBtn>
                    <AxisToggleBtn color={COLOR.Z} active={this.state.showZ} onClick={() => {
                        this.setState({ showZ: !this.state.showZ });
                    }}>z</AxisToggleBtn>
                </div>
                <canvas width={400} height={100} ref={ x => this.chartElement = x } />
            </ChartStyle>
        );
    }
}

const AxisToggleBtn = styled.button`
    background: ${ p => p.active ? p.color : '#cccccc' };
    color: white;
    line-height: 10px;
    font-size: 8px;
    padding: 0px !important;
    margin-right: 2px;
    width: 10px;
    height: 10px;
`;

export default Chart;