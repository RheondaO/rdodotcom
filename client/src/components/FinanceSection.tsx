import ComprehensiveFinanceSection from "./ComprehensiveFinanceSection";

interface FinanceSectionProps {
  selectedDate: Date;
}

export default function FinanceSection({ selectedDate }: FinanceSectionProps) {
  return <ComprehensiveFinanceSection selectedDate={selectedDate} />;
}