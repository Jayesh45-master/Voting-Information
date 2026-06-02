"use client";

import { useEffect, useState } from 'react';
import { LucideIcon, UserCheck, Edit, MapPin, Inbox } from 'lucide-react';

type Step = {
  _id: string;
  stepNumber: number;
  title: string;
  description: string;
  icon: string;
};

// Map string icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  'user-check': UserCheck,
  'edit': Edit,
  'map-pin': MapPin,
  'inbox': Inbox,
};

export default function VotingSteps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSteps() {
      try {
        const res = await fetch('/api/steps');
        if (res.ok) {
          const data = await res.json();
          setSteps(data);
        }
      } catch (error) {
        console.error('Error fetching steps', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSteps();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading steps...</div>;
  if (steps.length === 0) return null;

  return (
    <div className="steps-grid">
      {steps.map((step) => {
        const IconComponent = iconMap[step.icon] || UserCheck; // fallback icon

        return (
          <div key={step._id} className="card step-card">
            <div className="step-number">{step.stepNumber}</div>
            <div className="step-icon">
              <IconComponent size={48} />
            </div>
            <h3>{step.title}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{step.description}</p>
          </div>
        );
      })}
    </div>
  );
}
