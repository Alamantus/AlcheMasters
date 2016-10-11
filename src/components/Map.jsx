import React from 'react';

import i2i from 'iframe2image';
import Compass from '../../node_modules/compass.js/lib/compass.js';

export class Map extends React.Component {
	constructor(props) {
		super(props);
	}

  componentDidMount () {
    // Set up the canvas dimensions
    let canvas = this.refs.mapCanvas,
        context = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;

    // Grab the iframe
    let iframe = this.refs.gMapIframe;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        let iframeSrc = `//www.google.com/maps/embed/v1/view?key=AIzaSyDMD3ATue_NX0g_rBFd9thBReLaGfhp2Fk&center=${position.coords.latitude},${position.coords.longitude}&zoom=19`;
        console.log(iframeSrc);

        iframe.src = iframeSrc;
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }

    // Get the image
    i2i.iframe2image(iframe, function (err, img) {
      // If there is an error, log it
      if (err) { return console.error(err); }

      // Otherwise, add the image to the canvas
      context.drawImage(img, 0, 0);
    });
  }

	render() {
    return (
      <div>

        <canvas id='mapCanvas' ref='mapCanvas'></canvas>

        <iframe id='gMapIframe' ref='gMapIframe'
          width='800'
          height='800'
          frameBorder='0'
          src='' />
  			
      </div>
		);
	}
}
