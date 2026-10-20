import React, { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Check, Sparkles, X } from "lucide-react";

const TOUR_STEPS = [
  {
    stepIndex: 1,
    title: "1. Select Research Dataset or Enter Vitals",
    badge: "Step 1 of 6: Ingestion",
    targetSelector: '[data-tour="dataset-selector"]',
    description: "Start here! Select a verified open research dataset (Synthea EHR, PhysioNet BIDMC PPG, or MIT-BIH ECG) or enter vitals manually. Telemetry, blood pressure, and heart rate will immediately populate the twin.",
    position: "bottom",
  },
  {
    stepIndex: 2,
    title: "2. Explore the Physiological Digital Twin",
    badge: "Step 2 of 6: Simulation",
    targetSelector: '[data-tour="digital-twin"]',
    description: "Observe the live 3D avatar! The twin maps 4 autonomic and cardiovascular nodes (Sinus Node, Autonomic Tone, BP Tone, SpO2). Click any glowing hotspot to inspect physiological pathways.",
    position: "bottom",
  },
  {
    stepIndex: 3,
    title: "3. Document Symptoms for NLP Analysis",
    badge: "Step 3 of 6: Symptoms",
    targetSelector: '[data-tour="complaints-section"]',
    description: "Document clinical symptoms such as chest tightness, headache, or dizziness. The biomedical NLP engine automatically parses medical entities and flags warning signs.",
    position: "top",
  },
  {
    stepIndex: 4,
    title: "4. Review Treatments, Next Checkup & Medicine",
    badge: "Step 4 of 6: Clinical Care",
    targetSelector: '[data-tour="right-column"]',
    description: "This right-side panel displays active treatments, the upcoming clinical checkup calendar ('16 May' next checkup, Dr. Kevin clinic visit, Dr. Kelly Carl telehealth video), and prescribed medications.",
    position: "left",
  },
  {
    stepIndex: 5,
    title: "5. Run Multimodal AI Assessment",
    badge: "Step 5 of 6: Late Fusion",
    targetSelector: '[data-tour="assessment-bar"]',
    description: "Click 'Run Assessment' to execute multimodal late-fusion across all active modalities in < 400ms. It calculates the unified cardiovascular risk score, BP trajectory, and alert flags.",
    position: "top",
  },
  {
    stepIndex: 6,
    title: "6. Deep Signals, Schedule & Medical PDFs",
    badge: "Step 6 of 6: Deep Dive",
    targetSelector: '[data-tour="top-navigation"]',
    description: "Switch tabs anytime without losing session state! Explore MIT-BIH Arrhythmia ML in 'Laboratory', view longitudinal SQLite memory in 'Schedule', or export formal medical PDFs in 'Document'.",
    position: "bottom",
  },
];

export default function GuidedTour({ isOpen, onClose }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const step = TOUR_STEPS[currentStepIndex];

  function updateTargetPosition() {
    if (!isOpen || !step) return;
    const el = document.querySelector(step.targetSelector);
    if (el) {
      // Ensure the target element is smoothly scrolled into the center of the viewport
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      }, 100);
    } else {
      setTargetRect(null);
    }
  }

  useEffect(() => {
    if (isOpen) {
      updateTargetPosition();
      const timer = setTimeout(updateTargetPosition, 250);
      window.addEventListener("resize", updateTargetPosition);
      window.addEventListener("scroll", updateTargetPosition);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", updateTargetPosition);
        window.removeEventListener("scroll", updateTargetPosition);
      };
    }
  }, [isOpen, currentStepIndex]);

  if (!isOpen || !step) return null;

  function handleNext() {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }

  function handlePrev() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  function handleComplete() {
    localStorage.setItem("cardiotwin_tour_completed", "true");
    onClose();
  }

  // Calculate position of the floating tour card
  let cardTop = 150;
  let cardLeft = 40;
  let arrowClass = "arrow-top";

  if (targetRect) {
    if (step.position === "left") {
      cardTop = Math.max(80, targetRect.top + 20);
      if (window.innerWidth > 1150) {
        cardLeft = Math.max(20, targetRect.left - 400);
        arrowClass = "arrow-right";
      } else {
        cardLeft = Math.max(20, Math.min(window.innerWidth - 400, targetRect.left + 20));
        cardTop = Math.max(80, targetRect.top - 240);
        arrowClass = "arrow-bottom";
      }
    } else if (step.position === "bottom") {
      cardTop = targetRect.top + targetRect.height + 16;
      cardLeft = Math.max(20, Math.min(window.innerWidth - 400, targetRect.left + targetRect.width / 2 - 190));
      arrowClass = "arrow-top";
    } else {
      cardTop = Math.max(20, targetRect.top - 240);
      cardLeft = Math.max(20, Math.min(window.innerWidth - 400, targetRect.left + targetRect.width / 2 - 190));
      arrowClass = "arrow-bottom";
    }
  }

  return (
    <div className="tour-overlay-portal">
      {/* Dark backdrop with soft blur */}
      <div className="tour-backdrop" onClick={onClose} />

      {/* Spotlight on target element */}
      {targetRect && (
        <div
          className="tour-spotlight"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        >
          {/* Animated pointer arrow beacon pointing directly to target */}
          <div className="tour-pointing-beacon">
            <span className="tour-beacon-ping" />
            <span className="tour-beacon-dot" />
          </div>
        </div>
      )}

      {/* Floating Guided Tour Card */}
      <div
        className="tour-card animate-fade-in"
        style={{
          position: "absolute",
          top: `${cardTop}px`,
          left: `${cardLeft}px`,
        }}
      >
        {/* Pointer Arrow SVG */}
        <div className={`tour-card-pointer ${arrowClass}`} />

        <div className="tour-card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="badge" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)", fontWeight: "800", fontSize: "11px", padding: "4px 10px", borderRadius: "9999px" }}>
              {step.badge}
            </span>
          </div>
          <button className="tour-close-btn" onClick={onClose} title="Skip tour">
            <X size={15} />
          </button>
        </div>

        <h3 className="tour-title">{step.title}</h3>
        <p className="tour-desc">{step.description}</p>

        {/* Step dots & Navigation buttons */}
        <div className="tour-footer">
          <div className="tour-dots">
            {TOUR_STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`tour-dot ${idx === currentStepIndex ? "active" : ""}`}
                onClick={() => setCurrentStepIndex(idx)}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {currentStepIndex > 0 && (
              <button className="ghost-button" style={{ padding: "6px 12px", fontSize: "12px" }} onClick={handlePrev}>
                <ArrowLeft size={13} /> Back
              </button>
            )}
            <button className="primary-button" style={{ padding: "6px 16px", fontSize: "12px" }} onClick={handleNext}>
              {currentStepIndex === TOUR_STEPS.length - 1 ? (
                <>
                  <Check size={14} /> Get Started
                </>
              ) : (
                <>
                  Next Step <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
