import React from 'react';
import {
  Grid,
  Statistic,
  Message,
  Button,
  Header,
  Checkbox,
} from 'semantic-ui-react';
import lib from './lib';
import './Snake.css';

const DIFFICULTY = ['EASY', 'MEDIUM', 'HARD'];

const INITIAL_STATE = {
  status: 'playing',
  score: 3,
  snake: lib.getRange(3),
  food: [],
  speed: 200,
  direction: 'Right',
  lastDirection: '',
  difficulty: localStorage.getItem('difficulty') || 'MEDIUM',
  updateSpeedAfterKill: true,
};

class Snake extends React.Component {
  constructor(props) {
    super(props);
    this.size = 45;
    this.minSpeed = 50;
    this.state = {
      ...lib.deepClone(INITIAL_STATE),
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown, false);
    this.startGame();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown, false);
    this.stopGame();
  }

  startTimer = () => {
    this.timerID = setInterval(this.moveSnake, this.state.speed);
    this.setState({
      status: '',
    });
  };

  stopTimer = () => {
    clearInterval(this.timerID);
    this.setState({
      status: 'paused',
    });
  };

  restartTimer = () => {
    this.stopTimer();
    this.startTimer();
  };

  startGame = () => {
    this.spawnFood();
    this.startTimer();
  };

  stopGame = () => {
    this.stopTimer();
    this.setState({
      status: 'lost',
    });
  };

  restartGame = () => {
    this.stopGame();
    this.setState(lib.deepClone(INITIAL_STATE), () => {
      this.startGame();
    });
  };

  moveSnake = () => {
    const [dx, dy] = GameBoard.directions[this.state.direction];
    const head = lib.positionToCoordinates(
      this.state.snake[this.state.snake.length - 1],
      this.size
    );
    const newHead = [head[0] + dy, head[1] + dx];

    if (!this.isMoveValid(newHead)) {
      this.stopGame();

      return;
    }

    this.setState((state, props) => {
      const newSnake = state.snake;

      if (this.willEatFood(newHead)) {
        this.eatFood(newHead);

        this.spawnFood();

        if (this.state.updateSpeedAfterKill) this.updateSpeed();
      } else {
        newSnake.shift();
      }

      newSnake.push(lib.coordinatesToPosition(newHead, this.size));

      return {
        snake: newSnake,
        lastDirection: state.direction,
      };
    });
  };

  isMoveValid = (head) => {
    return (
      !this.state.snake.includes(lib.coordinatesToPosition(head, this.size)) &&
      0 <= head[0] &&
      head[0] < this.size &&
      0 <= head[1] &&
      head[1] < this.size
    );
  };

  willEatFood = (head) => {
    return this.state.food.includes(lib.coordinatesToPosition(head, this.size));
  };

  eatFood = (food) => {
    this.setState((state, props) => {
      const newFood = state.food;

      newFood.splice(newFood.indexOf(food), 1);

      return {
        food: newFood,
      };
    });

    this.updateScore();
  };

  spawnFood = () => {
    while (true) {
      const food = lib.getRandomInt(Math.pow(this.size, 2));

      if (!this.state.snake.includes(food)) {
        this.setState((state, props) => {
          const newFood = state.food;

          newFood.push(food);

          return {
            food: newFood,
          };
        });

        return;
      }
    }
  };

  updateSpeed = (factor = 0.9) => {
    this.setState((state, props) => ({
      speed: Math.max(this.minSpeed, Math.floor(state.speed * factor)),
    }));

    this.restartTimer();
  };

  updateScore = (increment = 1) => {
    if (this.state.difficulty === 'MEDIUM') {
      increment = 3;
    }
    if (this.state.difficulty === 'HARD') {
      increment = 5;
    }
    this.setState((state, props) => ({
      score: state.score + increment,
    }));
  };

  handleKeyDown = (e) => {
    const newDirection = lib.keyToDirection(e.code);

    if (
      !newDirection ||
      newDirection === this.state.direction ||
      (this.state.lastDirection &&
        newDirection === GameBoard.oppositeDirections[this.state.lastDirection])
    ) {
      return;
    }

    this.setState({
      direction: newDirection,
    });
  };

  setDifficulty = (level) => {
    let speed = 100;
    if (level === 'EASY') speed = 300;
    if (level === 'MEDIUM') speed = 200;
    this.setState({ difficulty: level, speed }, () => {
      localStorage.setItem('difficulty', level);
    });
  };

  doSpeedUpdates = (e, data) =>
    this.setState({ updateSpeedAfterKill: data.checked });

  render() {
    console.log(this.state);
    return (
      <div className={'game'}>
        <Grid columns={2} divided centered>
          <Grid.Row>
            <Grid.Column width={10}>
              <GameBoard
                size={this.size}
                snake={this.state.snake}
                food={this.state.food}
              />
            </Grid.Column>
            <Grid.Column width={6}>
              <Grid.Row
                style={{ marginBottom: 20, paddingBottom: 20 }}
                divided
                columns={2}
              >
                <Grid.Column>
                  <Statistic size="small" color="red">
                    <Statistic.Label>Score</Statistic.Label>
                    <Statistic.Value>{this.state.score}</Statistic.Value>
                  </Statistic>
                </Grid.Column>
                <Grid.Column>
                  <Header as="h4">Difficulty:</Header>
                  <Button.Group basic>
                    {DIFFICULTY.map((diff) => (
                      <Button
                        onClick={() => this.setDifficulty(diff)}
                        content={diff}
                        icon={this.state.difficulty === diff ? 'check' : null}
                        active={this.state.difficulty === diff}
                        key={diff}
                        disabled={this.state.status !== 'lost'}
                      />
                    ))}
                  </Button.Group>
                </Grid.Column>
              </Grid.Row>
              <Checkbox
                toggle
                checked={this.state.updateSpeedAfterKill}
                label="Increase speed gradually"
                onChange={this.doSpeedUpdates}
                disabled={this.state.status !== 'lost'}
              />
              <div />
              {this.state.status === 'lost' && (
                <>
                  <Message negative>
                    <Message.Header>
                      You lost! Want to try again?
                    </Message.Header>
                  </Message>
                  <Button onClick={this.restartGame}>Play again</Button>
                </>
              )}
              <>
                {this.state.status === 'paused' && (
                  <Button onClick={this.startTimer}>Resume game</Button>
                )}
                {this.state.status === '' && (
                  <Button onClick={this.stopTimer}>Pause game</Button>
                )}
              </>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

class GameBoard extends React.Component {
  static directions = {
    Up: [0, -1],
    Right: [1, 0],
    Down: [0, 1],
    Left: [-1, 0],
  };

  static oppositeDirections = {
    Up: 'Down',
    Right: 'Left',
    Down: 'Up',
    Left: 'Right',
  };

  handleCellState = (coordinates) => {
    const position = lib.coordinatesToPosition(coordinates, this.props.size);

    if (this.props.snake.includes(position)) {
      return 'snake';
    }

    if (this.props.food.includes(position)) {
      return 'food';
    }

    return '';
  };

  render() {
    return (
      <div className="grid">
        {lib.getRange(this.props.size).map((value, index) => (
          <Row
            key={index}
            index={index}
            size={this.props.size}
            handleCellState={this.handleCellState}
          />
        ))}
      </div>
    );
  }
}

function Row(props) {
  return (
    <div className="row">
      {lib.getRange(props.size).map((value, index) => (
        <Cell
          key={index}
          index={index}
          size={props.size}
          coordinates={[props.index, index]}
          handleCellState={props.handleCellState}
        />
      ))}
    </div>
  );
}

function Cell(props) {
  return <div className={`cell ${props.handleCellState(props.coordinates)}`} />;
}

export default Snake;
