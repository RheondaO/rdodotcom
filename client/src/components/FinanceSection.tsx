import ComprehensiveFinanceSection from "./ComprehensiveFinanceSection";

interface FinanceSectionProps {
  selectedDate: Date;
  isReadOnly: boolean;
}

export default function FinanceSection({ selectedDate, isReadOnly }: FinanceSectionProps) {
  return <ComprehensiveFinanceSection selectedDate={selectedDate} isReadOnly={isReadOnly} />;
}