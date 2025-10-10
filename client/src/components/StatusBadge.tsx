import { Badge } from "@/components/ui/badge";
import { ORDER_STATES } from "@/lib/authUtils";

interface StatusBadgeProps {
  status: keyof typeof ORDER_STATES;
  size?: "sm" | "default";
}

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const stateInfo = ORDER_STATES[status] || { label: status, color: 'status-created' };
  
  return (
    <Badge 
      className={`bg-${stateInfo.color} text-white border-0`}
      data-testid={`badge-status-${status}`}
    >
      {stateInfo.label}
    </Badge>
  );
}
