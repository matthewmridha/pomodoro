import React from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';

///// CONSTANTS & VARIABLES /////

const defaultBreakTime = "5";
const defaultSessionTime = "25";
const defaultTimerLabel = "Session";
const stopped = "stopped";
const running = "running";
const paused = "paused";

      
let countdown;
let secondsLeft;

/* 
Takes argument of total seconds and converts
to mm:ss format for clock display.
*/

const timefy = ( sec ) => {
    let minutes = ( "00" + ( Math.floor( sec / 60 )).toString()).slice( -2 );
    let seconds = ( "00" + ( Math.floor( sec % 60 )).toString()).slice( -2 );
    return ( minutes + ":" + seconds )
};

///// COMPONENTS /////

/*
Pomodromo App 
*/

class App extends React.Component {
  constructor( props ) {
    super( props );
    this.state = {
      breakTime : defaultBreakTime,
      sessionTime : defaultSessionTime,
      timerLabel : defaultTimerLabel,
      status : stopped,
      timeLeft : "",
      break : false,
    };
    
    this.handleIncrement = this.handleIncrement.bind( this );
    this.handleDecrement = this.handleDecrement.bind( this );
    this.handleStartStop = this.handleStartStop.bind( this );
    this.tick = this.tick.bind( this );
    this.handleReset = this.handleReset.bind( this )
    this.alarm = this.alarm.bind( this );
    this.rollover = this.rollover.bind( this );
  };

  UNSAFE_componentWillMount(){
    if( this.state.status === "stopped" ){
      this.setState( state => {
        return {
          timeLeft : String( timefy( this.state.sessionTime * 60 ))
        }
      })
        //this.state.timeLeft = String( timefy( this.state.sessionTime * 60 ));
      };
  };
  
  alarm = () => {
    let audio = document.getElementById("beep")
    audio.play()
    setTimeout( () => {
      audio.pause();
      audio.currentTime = 0.0;
    }, 2900)
  };

  rollover = () => {
    if( !this.state.break ){
        let newTime = parseInt( this.state.breakTime ) * 60;
        let displayNewTime = timefy( newTime );
        this.setState( state => {
          return {
            break : true,
            timeLeft : displayNewTime,
          }
        });
        this.tick( newTime );
      }
      else{
        let newTime = parseInt( this.state.sessionTime ) * 60;
        let displayNewTime = timefy( newTime );
        this.setState( state => {
          return {
            break : false,
            timeLeft : displayNewTime,
          }
        });
        this.tick( newTime );
      };
  };
  
  tick = ( seconds ) => {
  const now = Date.now();
  const then = now + seconds * 1000;
  
  countdown = setInterval( () => {
    secondsLeft = Math.round(( then - Date.now() ) / 1000 );
    if( secondsLeft < 0 ){
      clearInterval( countdown );
      this.alarm();
      setTimeout( this.rollover, 2900);
    }
    else{
      let result = String( timefy( secondsLeft ));
      document.title = result;
      this.setState( state => {
        return { 
          timeLeft : result,
        }
      });
    };  
  }, 1000);
 };
  
  handleStartStop(){
    clearInterval( countdown )
    if( this.state.status === stopped ){
      this.setState( state => {
        return {
          status : running,
        }
      })
      let seconds = parseInt( this.state.sessionTime ) * 60;
      this.tick( seconds );
    }
    else if( this.state.status === running ){
      this.setState( state => {
        return { 
          status : paused,
        }
      })
    }
    else if( this.state.status === paused){
      this.setState( state => {
        return { 
          status : running,
        }
      })
      let seconds = secondsLeft;
      this.tick(seconds);
    }
  };
  handleIncrement = e => {
    const data = e.target.getAttribute( "data-type" );
    if ( data === "break" ) {
      let inputTime = parseInt(this.state.breakTime);
      if( inputTime < 60 ){
        let outputTime = String( inputTime + 1 );
        this.setState( state => {
          return {
            breakTime: outputTime,
          };
        });
      }
    } else if ( data === "session" ) {
      let inputTime = parseInt(this.state.sessionTime);
      let outputTime = inputTime + 1;
      if( inputTime < 60 ){
        if(this.state.status === stopped){
          this.setState(state => {
          return {
            sessionTime: outputTime,
            timeLeft: String( timefy( outputTime * 60 ))
          };
        });
        }
        else{
          this.setState(state => {
          return {
            sessionTime: outputTime,
          };
        });
        }
        
        
      }
    }
  };
  handleDecrement = e => {
    const data = e.target.getAttribute("data-type");
    if ( data === "break" ) {
      let inputTime = parseInt( this.state.breakTime );
      if( inputTime > 1 ){
        let outputTime = String( inputTime - 1 );
        this.setState(state => {
          return {
            breakTime: outputTime,
          };
        });
      }
    } else if ( data === "session" ) {
      let inputTime = parseInt( this.state.sessionTime );
      if( inputTime > 1 ){
        let outputTime = String( inputTime - 1 );
        if( this.state.status === stopped ){
          this.setState(state => {
          return {
            sessionTime: outputTime,
            timeLeft: String( timefy( outputTime * 60 ))
          };
        });
        }else {
          this.setState(state => {
          return {
            sessionTime: outputTime,
          };
        });
        }
        
      }
    }
  };
  handleReset = () => {
    clearInterval(countdown);
    this.setState( state => {
      return {
        sessionTime : defaultSessionTime,
        breakTime : defaultBreakTime,
        timerLabel : defaultTimerLabel,
        status : stopped,
        timeLeft : String( timefy( defaultSessionTime * 60 )),
        break : false,
      }
    })
  };

  render() {
    
    return (
      <div className="pomodoro">
        <div className="setupWrapper">
          <Break 
            handleIncrement={ this.handleIncrement }
            handleDecrement={ this.handleDecrement }
            breakLength={ this.state.breakTime }
          />
          <Session
            handleIncrement={ this.handleIncrement }
            handleDecrement={ this.handleDecrement }
            sessionLength={ this.state.sessionTime }
          />
        </div>
        <Timer 
          status={ this.state.break }
          timeLeft={ this.state.timeLeft }
        />
        <Controls
          handleStartStop={ this.handleStartStop }
          handleReset={ this.handleReset }
        />
        <Audio />
      </div>
    );
  }
};

const Break = props => {
  return (
    <div className="adjust break">
      <h3 id="break-label">Break</h3>
      <div id="break-increment" 
        className="hexagon" 
        onClick={props.handleIncrement}>
          <i 
            data-type="break" 
            className="fa fa-arrow-up" />
      </div>
      <div 
        className="setTimeDisplay hexagon" 
        id="break-length">{props.breakLength}
      </div>
      <div id="break-decrement" 
        className="hexagon" 
        onClick={props.handleDecrement}>
        <i 
          data-type="break" 
          className="fa fa-arrow-down" 
        />
      </div>
      </div>
  );
};

const Session = ( props ) => {
  return(
    <div className="adjust session">
      <div id="session-increment" className="hexagon" onClick={props.handleIncrement}>
        <i data-type="session" className="fa fa-arrow-up" />
      </div>
      <div className="setTimeDisplay hexagon" id="session-length">{props.sessionLength}</div>
      <div id="session-decrement" className="hexagon" onClick={props.handleDecrement}>
        <i data-type="session" className="fa fa-arrow-down" />
      </div>
        <h3 id="session-label">Session</h3>
      </div>
    
  )
};

const Timer = (props) => {
    return (
      <div className="timer">
        <div id="timer-label">{ props.status === true ? "Break" : "Session" }</div>
        <div id="time-left">{ props.timeLeft }</div>
      </div>
    )
};

const Controls = ( props ) => {
  return (
    <div className="controls">
      <button
        className="control-button"
        id="start_stop" 
        onClick={ props.handleStartStop }>
          <i className="fa fa-play" aria-hidden="true" sr-only="play"></i>
          <i className="fa fa-pause" aria-hidden="true" sr-only="pause"></i>
      </button>
      <button 
        className="control-button"
        id="reset"
        onClick={ props.handleReset }>
          <i className="fa fa-refresh" aria-hidden="true" sr-only="reset"></i>
      </button>
    </div>
  )
};

const Audio = () => {
  return (
    <div>
      <audio 
        id="beep"
        src="http://soundbible.com/mp3/analog-watch-alarm_daniel-simion.mp3"/>
    </div>
  )
};


export default App;