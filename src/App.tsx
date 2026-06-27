import SplashCursor from './SplashCursor';
import './App.css';

const App = () => {
  return (
    <div className="App">
      <SplashCursor />
      <div className="overlay">
        <svg width="100%" height="100%">
          <defs>
            <mask id="textCutout">
              <rect width="100%" height="100%" fill="white" />
              <text x="50%" y="28%" fill="black" textAnchor="middle">
                Learn
              </text>
              <text x="50%" y="52%" fill="black" textAnchor="middle">
                Innovate
              </text>
              <text x="50%" y="76%" fill="black" textAnchor="middle">
                Lead
              </text>
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="black" mask="url(#textCutout)" />
        </svg>
      </div>
    </div>
  );
};

export default App;
