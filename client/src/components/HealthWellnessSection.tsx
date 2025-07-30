import ComprehensiveHealthWellnessSection from "./ComprehensiveHealthWellnessSection";

interface HealthWellnessSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function HealthWellnessSection({ selectedDate, isReadOnly = false }: HealthWellnessSectionProps) {
  return <ComprehensiveHealthWellnessSection selectedDate={selectedDate} isReadOnly={isReadOnly} />;
}