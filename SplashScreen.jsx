import React, { useEffect } from "react";
import "./Splash.css"; // move styles here

export default function SplashScreen() {
  useEffect(() => {
    createParticles();
  }, []);

  function createParticles() {
    const particlesContainer = document.getElementById("particles");
    if (!particlesContainer) return;
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;

      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.background = "white";

      particle.style.animationDelay = `${Math.random() * 5}s`;

      particlesContainer.appendChild(particle);
    }
  }

  return (
    <div className="container">
      <div className="text-container">
        <div className="text-half left-half">BEEBA</div>
        <div className="text-half right-half">BOYS</div>
      </div>
      <div className="reveal-text">Beeba Boys</div>
      <div className="particles" id="particles"></div>
      <div className="loading-bar">
        <div className="loading-progress"></div>
      </div>
      <div className="tagline">PREMIUM BARBER EXPERIENCE</div>
    </div>
  );
}
