import { Link, useParams } from "react-router-dom";
import { Card } from "../../shared/ui/Card";
import { HelpdeskTicketDetails } from "../../features/helpdesk/ui/HelpdeskTicketDetails";

export function HelpdeskTicketDetailsPage() {
  const { id } = useParams();
  const ticketId = Number(id);

  if (!Number.isFinite(ticketId) || ticketId <= 0) {
    return (
      <Card className="border-custom-danger/30 bg-custom-danger-soft p-6">
        <div className="text-sm font-medium text-custom-danger">
          Неверный идентификатор тикета.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-sm text-custom-text-muted">
        <Link
          to=".."
          relative="path"
          className="font-medium text-custom-primary transition-colors hover:text-custom-primary-hover hover:underline"
        >
          Назад к списку тикетов
        </Link>
      </div>

      <HelpdeskTicketDetails key={ticketId} ticketId={ticketId} />
    </div>
  );
}
