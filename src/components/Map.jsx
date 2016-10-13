import React from 'react';

import $ from 'jquery';
import '../../node_modules/compass.js/lib/compass.js';

export class Map extends React.Component {
	constructor(props) {
		super(props);

    this.state = {
      errorMessage: ''
    }

    this.messages = {
      noGeolocation: 'Your device does not support geolocation! Please try playing again on a device that does.',
      noCompass: 'Your device does not support compass facing! Please try playing again on a device that does.',
      needGPS: 'No GPS Signal found. Go outside and get some signal!',
      needMove: 'Hold your phone ahead of you and start walking.'
    }
	}

  get canUseGeolocation() {
    if (navigator.geolocation) {
      return true;
    }
    return false;
  }

  get canUseCompass() {
    let result = true;
    Compass.noSupport(() => result = false);
    return result;
  }

  showErrorMessage() {
    if (this.state.errorMessage !== '') {
      return (
        <div id='compassErrorMessage'>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }
  }

  componentDidMount () {
    if (this.canUseGeolocation) {
      navigator.geolocation.getCurrentPosition((position) => console.log(position));
      
      Compass.needGPS(() => {
        if (this.state.errorMessage !== this.messages.needGPS) {
          this.setState({errorMessage: this.messages.needGPS});
        }
      }).needMove(() => {
        if (this.state.errorMessage !== this.messages.needMove) {
          this.setState({errorMessage: this.messages.needMove});
        }
      }).init((method) => {
        if (method !== false) {
          Compass.watch((heading) => {
            $('#compass').css('transform', 'rotate(' + (heading) + 'deg)');
          });
        } else {
          this.setState({errorMessage: this.messages.noCompass});
        }
      });
    } else {
      this.setState({errorMessage: this.messages.noGeolocation});
    }
  }

	render() {
    return (
      <div id='map'>

        <div id='compassGrid'>
          <div className='grid-row'>
            <div id='top-left' className='cell'></div>
            <div id='top-center' className='cell'></div>
            <div id='top-right' className='cell'></div>
          </div>
          
          <div className='grid-row'>
            <div id='middle-left' className='cell'></div>
            <div id='middle-center' className='cell'>
              <div id='compass'>&#x21E7;</div>
            </div>
            <div id='middle-right' className='cell'></div>
          </div>

          <div className='grid-row'>
            <div id='bottom-left' className='cell'></div>
            <div id='bottom-center' className='cell'></div>
            <div id='bottom-right' className='cell'></div>
          </div>

          {this.showErrorMessage()}

        </div>
  			
      </div>
		);
	}
}
