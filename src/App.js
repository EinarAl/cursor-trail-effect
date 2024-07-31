import React, { useRef, useEffect } from "react";
import "./App.css";

// Configuration for the canvas and its effects
const canvasSettings = {
  cursorBlur: 40, // Amount of blur applied to cursor effects
  reflectiveBlur: 20, // Additional blur for reflective line
  ratio: 0.1, // Ratio to scale canvas size relative to window size
};

// Coordinates class for storing x, y positions
class Coords {
  constructor(x = null, y = null) {
    this.x = x;
    this.y = y;
  }
}

// Array of colors to shift through (in HSL)
const colors = [
  { hue: 0, saturation: 100, lightness: 50 }, // Red
  { hue: 60, saturation: 100, lightness: 50 }, // Yellow
  { hue: 120, saturation: 100, lightness: 50 }, // Green
  { hue: 180, saturation: 100, lightness: 30 }, // Cyan
  { hue: 240, saturation: 100, lightness: 50 }, // Blue
  { hue: 300, saturation: 100, lightness: 50 }, // Magenta
];

// Function to interpolate between two colors
const interpolateColor = (color1, color2, factor) => {
  return {
    hue: color1.hue + (color2.hue - color1.hue) * factor,
    saturation:
      color1.saturation + (color2.saturation - color1.saturation) * factor,
    lightness:
      color1.lightness + (color2.lightness - color1.lightness) * factor,
  };
};

// Base class for effects
class Effect {
  constructor(x, y, speed, ctx, color) {
    this.position = new Coords(x, y);
    this.size = speed * 4;
    this.minSize = speed * 0.9;
    this.maxSize = 10;
    this.opacity = 1;
    this.ctx = ctx;
    this.animationSpeed = speed / 5;
    this.opacityStep = this.animationSpeed / (this.size - this.minSize) / 2;
    this.color = color;
  }

  // Update size and opacity of the effect
  update() {
    this.size -= this.animationSpeed;
    if (this.size < this.minSize) {
      this.size = this.minSize;
    }
    this.opacity -= this.opacityStep;
  }

  // Draw the effect on the canvas
  draw() {
    if (!this.ctx) return;
    const { hue, saturation, lightness } = this.color;
    const alpha = this.opacity;

    this.ctx.beginPath();
    this.ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    this.ctx.lineWidth = this.size / 30;
    this.ctx.arc(this.position.x, this.position.y, this.size, 0, 3 * Math.PI);
    this.ctx.stroke();
  }
}

// Ripple effect subclass
class Ripple extends Effect {
  constructor(x, y, speed, ctx, color) {
    super(x, y, speed, ctx, color);
    this.size = speed * 2;
    this.maxSize = 35;
    this.animationSpeed = speed / 10;
    this.opacityStep = this.animationSpeed / (this.size - this.minSize) / 1;
  }
}

// Flame effect subclass
class Flame extends Effect {
  constructor(x, y, speed, ctx, color) {
    super(x, y, speed, ctx, color);
    this.size = speed * 2.5;
    this.maxSize = speed * 4;
    this.animationSpeed = speed / 5;
    this.opacityStep = this.animationSpeed / (this.maxSize - this.size) / 2;
  }

  // Update size and opacity for Flame effect
  update() {
    this.size += this.animationSpeed;
    this.opacity -= this.opacityStep;
  }

  // Draw the Flame effect
  draw() {
    if (!this.ctx) return;
    const { hue, saturation, lightness } = this.color;
    const alpha = this.opacity;

    this.ctx.beginPath();
    this.ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    this.ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    this.ctx.fill();
  }
}

// Water ripple effect subclass
class WaterRipple extends Effect {
  constructor(x, y, speed, ctx, color) {
    super(x, y, speed, ctx, color);
    this.size = speed * 2;
    this.maxSize = speed * 20;
    this.animationSpeed = 0.33;
    this.opacityStep = this.animationSpeed / (this.maxSize - this.size) / 1.5;
  }

  // Update size and opacity for WaterRipple effect
  update() {
    this.size += this.animationSpeed;
    this.opacity -= this.opacityStep;
  }

  // Draw the WaterRipple effect
  draw() {
    if (!this.ctx) return;
    const { hue, saturation, lightness } = this.color;
    const alpha = this.opacity;

    this.ctx.beginPath();
    this.ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
    this.ctx.lineWidth = 2;
    this.ctx.arc(this.position.x, this.position.y, this.size, 0, 2 * Math.PI);
    this.ctx.stroke();
  }
}

// Reflective Line Effect class
class ReflectiveLineEffect {
  constructor(ctx, speed = 2) {
    this.ctx = ctx;
    this.angle = -45;
    this.speed = speed - 1;
    this.offset = 0;
    this.width = ctx.canvas.width;
    this.height = ctx.canvas.height;
  }

  // Update the line's offset
  update() {
    this.offset += this.speed;
    if (this.offset > this.width + this.height) {
      this.offset = -this.width;
    }
  }

  // Draw the reflective line on the canvas
  draw() {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.strokeStyle = "white";
    this.ctx.lineWidth = 5;
    this.ctx.setLineDash([900, 5]);
    this.ctx.beginPath();

    // Start the line off-screen to make it appear seamless
    this.ctx.moveTo(-this.offset, this.height);
    this.ctx.lineTo(this.width - this.offset, -this.height);

    // Draw the line on the canvas
    this.ctx.stroke();
    this.ctx.restore();
  }
}

// Main App component
const App = () => {
  const canvasRef = useRef(null); // Reference to the main canvas element
  const bufferCanvasRef = useRef(null); // Reference to the buffer canvas element
  const ctxRef = useRef(null); // Reference to the main canvas context
  const bufferCtxRef = useRef(null); // Reference to the buffer canvas context
  const ripples = useRef([]); // Array to hold Ripple effect instances
  const flames = useRef([]); // Array to hold Flame effect instances
  const waterRipples = useRef([]); // Array to hold WaterRipple effect instances
  const lastMousePosition = useRef(new Coords()); // Last recorded mouse position
  const lastTimestamp = useRef(Date.now()); // Timestamp of the last update
  const reflectiveLine = useRef(null); // Reference to the ReflectiveLineEffect instance

  useEffect(() => {
    const canvas = canvasRef.current; // Main canvas
    const bufferCanvas = bufferCanvasRef.current; // Buffer canvas
    const ctx = canvas.getContext("2d"); // Main canvas context
    const bufferCtx = bufferCanvas.getContext("2d"); // Buffer canvas context
    ctxRef.current = ctx; // Store context reference for use in event handlers
    bufferCtxRef.current = bufferCtx; // Store buffer context reference
    let animationFrame; // Variable to store current animation frame

    reflectiveLine.current = new ReflectiveLineEffect(bufferCtx);

    // Resize canvas to fit window and maintain ratio
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * canvasSettings.ratio;
      canvas.height = window.innerHeight * canvasSettings.ratio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      bufferCanvas.width = canvas.width;
      bufferCanvas.height = canvas.height;
      bufferCanvas.style.width = canvas.style.width;
      bufferCanvas.style.height = canvas.style.height;
    };

    resizeCanvas(); // Resize canvas initially
    window.addEventListener("resize", resizeCanvas); // Resize canvas on window resize

    // Handle mouse movement on canvas
    const canvasMouseMove = (e) => {
      const currentX = e.clientX * canvasSettings.ratio;
      const currentY = e.clientY * canvasSettings.ratio;

      const timeNow = Date.now();
      const timeDelta = timeNow - lastTimestamp.current;
      lastTimestamp.current = timeNow;

      const distanceX = currentX - lastMousePosition.current.x;
      const distanceY = currentY - lastMousePosition.current.y;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
      const speed = distance / timeDelta;

      lastMousePosition.current = new Coords(currentX, currentY);

      // Create new effects based on mouse movement
      for (let i = 0; i < 10; i++) {
        const colorIndex = Math.floor(Math.random() * colors.length);
        const colorFactor = i / 10;
        const rippleColor = interpolateColor(
          colors[colorIndex],
          colors[(colorIndex + 1) % colors.length],
          colorFactor
        );
        const flameColor = interpolateColor(
          colors[colorIndex],
          colors[(colorIndex + 1) % colors.length],
          colorFactor
        );
        const waterRippleColor = interpolateColor(
          colors[colorIndex],
          colors[(colorIndex + 1) % colors.length],
          colorFactor
        );

        ripples.current.unshift(
          new Ripple(currentX, currentY, speed, ctx, rippleColor)
        );
        flames.current.unshift(
          new Flame(currentX, currentY, speed, ctx, flameColor)
        );
        waterRipples.current.unshift(
          new WaterRipple(currentX, currentY, speed, ctx, waterRippleColor)
        );
      }
    };

    // Animation function to update and draw effects
    const animateEffects = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);

      ripples.current.forEach((ripple, i) => {
        ripple.update();
        ripple.draw();
        if (ripple.opacity <= 0) ripples.current.splice(i, 1);
      });

      flames.current.forEach((flame, i) => {
        flame.update();
        flame.draw();
        if (flame.opacity <= 0) flames.current.splice(i, 1);
      });

      waterRipples.current.forEach((waterRipple, i) => {
        waterRipple.update();
        waterRipple.draw();
        if (waterRipple.opacity <= 0) waterRipples.current.splice(i, 1);
      });

      if (reflectiveLine.current) {
        reflectiveLine.current.update();
        bufferCtx.save();
        bufferCtx.filter = `blur(${canvasSettings.reflectiveBlur}px)`;
        reflectiveLine.current.draw();
        bufferCtx.restore();
      }

      ctx.drawImage(bufferCanvas, 0, 0);

      animationFrame = window.requestAnimationFrame(animateEffects);
    };

    animateEffects(); // Start the animation loop

    canvas.addEventListener("mousemove", canvasMouseMove); // Listen for mouse movements on canvas

    return () => {
      cancelAnimationFrame(animationFrame); // Cancel the animation frame on component unmount
      window.removeEventListener("resize", resizeCanvas); // Remove resize listener
      canvas.removeEventListener("mousemove", canvasMouseMove); // Remove mouse move listener
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <canvas ref={bufferCanvasRef} style={{ display: "none" }} />
        <svg id="svg1" height={"100%"} width={"100%"}>
          <defs>
            <mask id="mask" x="0" y="0" height={"100%"} width={"100%"}>
              <rect x="0" y="0" height={"100%"} width={"100%"} />
              <text x="50%" y="30%" fill="white" textAnchor="middle">
                Learn
              </text>
              <text x="50%" y="55%" fill="white" textAnchor="middle">
                Innovate
              </text>
              <text x="50%" y="80%" fill="white" textAnchor="middle">
                Lead
              </text>
            </mask>
          </defs>
          <rect x="0" y="0" height={"100%"} width={"100%"} />
        </svg>
        <svg
          className="textFillToggle"
          id="svgThree"
          height={"100%"}
          width={"100%"}
        >
          <defs>
            <mask id="mask3" x="0" y="0" z="50" height={"100%"} width={"100%"}>
              <rect x="0" y="0" z="50" height={"100%"} width={"100%"} />
              <text
                className="textFillToggle"
                x="50%"
                y="30%"
                z="50"
                textAnchor="middle"
              >
                Learn
              </text>
              <text
                className="textFillToggle"
                x="49.85%"
                y="54.82%"
                z="50"
                textAnchor="middle"
              >
                Innovate
              </text>
              <text
                className="textFillToggle"
                x="50%"
                y="80%"
                z="50"
                textAnchor="middle"
              >
                Lead
              </text>
            </mask>
          </defs>
          <rect x="0" y="0" z="50" height={"100%"} width={"100%"} />
        </svg>
        <canvas
          ref={canvasRef}
          style={{
            filter: `blur(${canvasSettings.cursorBlur}px)`,
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />
        <svg id="svgTwo" height={"100%"} width={"100%"}>
          <defs>
            <mask id="mask2" x="0" y="0" height={"100%"} width={"100%"}>
              <rect x="0" y="0" height={"100%"} width={"100%"} />
              <text x="50%" y="30%" fill="black" textAnchor="middle">
                Learn
              </text>
              <text x="50%" y="55%" fill="black" textAnchor="middle">
                Innovate
              </text>
              <text x="50%" y="80%" fill="black" textAnchor="middle">
                Lead
              </text>
            </mask>
          </defs>
          <rect x="0" y="0" height={"100%"} width={"100%"} />
        </svg>
      </header>
    </div>
  );
};

export default App;
