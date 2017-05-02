import React from 'react';
import styled from 'styled-components';

class Visual extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        this.updateCanvas();
    }
    updateCanvas() {
        let ctx = this.canvas.getContext('2d');
        let w = this.canvas.width, h = this.canvas.height;
        if (this.props.ndof) {
            let acc = this.props.ndof.acc.vector;
            // left down when acc.y = 1
            // nose down when x-
            let ly = (h * 0.5) + h * acc.y * 1; // roll
            let ry = (h * 0.5) + h * acc.y * -1; // roll
            let yAdj = acc.x * (h/2); // pitch
            ctx.fillStyle = '#9aefff';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#a5652a';
            ctx.beginPath();
            ctx.moveTo(-1, ly + yAdj);
            ctx.lineTo(w+1, ry + yAdj);
            ctx.lineTo(w+1, ry + yAdj + h);
            ctx.lineTo(-1, ly + yAdj + h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#cccccc';
            ctx.fillRect(2, 2, 8, 50);
            ctx.fillRect(w - 2 - 8, 2, 8, 50);
            ctx.fillStyle = '#55ff55';
            ctx.fillRect(3, 2 + 48 - (48 * this.props.throttle.left), 6, 48 * this.props.throttle.left);
            ctx.fillRect(w - 1 - 8, 2 + 48 - (48 * this.props.throttle.right), 6, 48 * this.props.throttle.right);
        }
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(props) {
        this.updateCanvas();
    }
    shouldComponentUpdate(nextProps, nextState) {
        return true;
    }
    render() {
        return (
            <div style={{display: 'inline-block', paddingRight: '12px'}}>
                <div>visual</div>
                <canvas width={100} height={100} ref={c => this.canvas = c} />
            </div>
        );
    }
}

export default Visual;