import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';

function Square(props) {
    return <button className="square" onClick={props.onClick}>{props.value}</button>;
}

class Board extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(9).fill(null),
            xNext: true,
        };
    }

    clickHandler(i) {
        const squares = this.state.squares.slice();

        squares[i] = this.state.xNext ? 'X' : 'O';

        this.setState({
            squares: squares,
            xNext: !this.state.xNext,
        });
    }

    renderSquare(i) {
        return <Square value={this.state.squares[i]} onClick={() => this.clickHandler(i)}/>;
    }

    render() {
        const status = `Next player: ${this.state.xNext ? 'X' : 'O'}`;

        return (
            <div>
                <div className="status">{status}</div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'Player Turn',
        };
    }

    render() {
        return (
            <div className="game">
                <div className="game-board">
                    <Board />
                </div>
                <div className="game-info">
                    <div></div>
                    <ol>{/* TODO */}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

class Slides extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return <div id="slides"></div>;
    }
}

// ========================================

ReactDOM.render(
    <Slides />,
    document.getElementById('root')
);
