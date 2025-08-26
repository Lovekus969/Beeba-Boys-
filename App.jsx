import React, { useState, useEffect } from "react";
import SplashScreen from "./components/SplashScreen";
import InteractiveGlobe from "./components/InteractiveGlobe";

function App() {
  const [showGlobe, setShowGlobe] = useState(false);

  useEffect(() => {
    // After 4 seconds, switch from splash to globe
    const timer = setTimeout(() => {
      setShowGlobe(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {showGlobe ? <InteractiveGlobe /> : <SplashScreen />}
    </div>
  );
}

export default App;
