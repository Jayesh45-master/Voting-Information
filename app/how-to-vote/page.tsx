"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Step = {
  _id: string;
  stepNumber: number;
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  isGuideline: boolean;
};

export default function HowToVoteWizard() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSteps() {
      try {
        const res = await fetch('/api/steps');
        if (res.ok) {
          const data = await res.json();
          // Filter to show only actual steps in the wizard, guidelines at the end if desired
          // For now, let's just sort them by stepNumber
          setSteps(data.sort((a: Step, b: Step) => a.stepNumber - b.stepNumber));
        }
      } catch (error) {
        console.error('Error fetching steps', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSteps();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading instructions... / निर्देश लोड हो रहे हैं...</div>;
  if (steps.length === 0) return <div style={{ textAlign: 'center', padding: '4rem' }}>No steps found.</div>;

  const currentStep = steps[currentStepIndex];

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - 200px)', padding: '2rem 1rem 0' }}>
      <div className="wizard-container">
        <div className="wizard-header">
          <h2>How to Vote / मतदान कैसे करें</h2>
          <span className="wizard-step-indicator">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
        </div>

        <div className="wizard-content">
          <div className="bilingual-text">
            <h3 className="en">{currentStep.title}</h3>
            <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border-color)' }} />
            <div className="hi">{currentStep.titleHi}</div>
          </div>
          
          <div className="bilingual-text" style={{ marginTop: '2rem' }}>
            <p className="en">{currentStep.description}</p>
            <hr style={{ margin: '0.5rem 0', borderColor: 'var(--border-color)' }} />
            <p className="hi">{currentStep.descriptionHi}</p>
          </div>
        </div>

        <div className="wizard-actions">
          {currentStepIndex > 0 && (
            <button 
              className="btn btn-outline" 
              onClick={goPrev}
            >
              Previous / पिछला
            </button>
          )}
          {/* Spacer to push Next button to right when Previous is hidden */}
          {currentStepIndex === 0 && <span />}
          
          {currentStepIndex < steps.length - 1 ? (
            <button className="btn btn-primary" onClick={goNext}>
              Next / अगला
            </button>
          ) : (
            <Link href="/" className="btn btn-primary">
              Finish / समाप्त
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
