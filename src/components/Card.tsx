interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-2xl bg-card p-4 shadow-sm ${className}`} role="region">
      {children}
    </div>
  );
}
