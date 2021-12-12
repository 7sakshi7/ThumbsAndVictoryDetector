// Steps for Hand Pose Detection
// 1. Install dependencies 
// 2. Import dependencies 
// 3. Setup webcam and canvas 
// 4. Define references to those 
// 5. Load handpose 
// 6. Detect function 
// 7. Drawing utilities 
// 8. Draw functions 

// Steps for Gesture Detector
// 1. Install finger pose (npm install finger pose)
// 2. Add Use State
// 3. Import emojis and finger pose (import * as fp from "fingerpose")
// 4. Update detect function for gesture handling
// 5. Set up hook and emoji object
// 6. Add emoji display to the screen

import React, { useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";
import Webcam from "react-webcam";
import "./App.css";
import { drawHand } from "./utilities";

// importing images 
import victory from './victory.png';
import thumbsUp from './thumbs_up.png';


function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [emoji, setEmoji] = useState(null)
  const images = { thumbsUp: thumbsUp, victory: victory };

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    // Check data is available
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make Detections
      const hand = await net.estimateHands(video);
      console.log(hand);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
        ]);

        const gesture = await GE.estimate(hand[0].landmarks, 4);
        console.log(gesture);

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map((prediction) => prediction.score);
          console.log(confidence);
          const maxConfidence = confidence[0] > confidence[1] ? confidence[0] : confidence[1];
          // const maxConfidence = confidence.indexOf(
          //   Math.max.apply(null, confidence));

          console.log(maxConfidence);
          const nameOfGesture = gesture.gestures.filter((prediction) => {
            if (prediction.score === maxConfidence)
              return prediction.name;
          });

          if (nameOfGesture[0] !== undefined) {
            const {name,score} = nameOfGesture[0];
            console.log(nameOfGesture[0]["name"]);
            setEmoji(nameOfGesture[0]["name"]);
            // console.log(emoji);
          }
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        />
      </header>
    </div>
  );
}

export default App;
