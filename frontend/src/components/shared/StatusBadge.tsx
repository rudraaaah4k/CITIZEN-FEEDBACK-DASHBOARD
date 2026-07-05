import { Badge } from '../ui/Badge';
import { statusColors, priorityColors, sentimentColors, formatStatus } from '../../lib/utils';

export const StatusBadge = ({ status }: { status: string }) => (
  <Badge className={statusColors[status]}>{formatStatus(status)}</Badge>
);

export const PriorityBadge = ({ priority }: { priority: string }) => (
  <Badge className={priorityColors[priority]}>{priority}</Badge>
);

export const SentimentBadge = ({ sentiment }: { sentiment: string }) => (
  <Badge className={sentimentColors[sentiment]}>{sentiment}</Badge>
);
