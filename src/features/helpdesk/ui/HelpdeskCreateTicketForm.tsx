import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Input } from "../../../shared/ui/Input";

const schema = z.object({
  subject: z.string().min(3, "Минимум 3 символа"),
  message: z.string().min(5, "Минимум 5 символов"),
});

export type HelpdeskCreateTicketFormValues = z.infer<typeof schema>;

type HelpdeskCreateTicketFormProps = {
  loading?: boolean;
  onSubmit: (values: HelpdeskCreateTicketFormValues) => Promise<void>;
};

export function HelpdeskCreateTicketForm({
  loading = false,
  onSubmit,
}: HelpdeskCreateTicketFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HelpdeskCreateTicketFormValues>({
    resolver: zodResolver(schema),
  });

  const submit = async (values: HelpdeskCreateTicketFormValues) => {
    await onSubmit(values);
    reset();
  };

  return (
    <Card className="p-5">
      <div className="text-lg font-semibold text-custom-text">
        Новый тикет
      </div>
      <div className="mt-1 text-sm text-custom-text-muted">
        Кратко опишите тему обращения и добавьте первое сообщение.
      </div>

      <form className="mt-5 space-y-4" onSubmit={(event) => void handleSubmit(submit)(event)}>
        <Input
          label="Тема"
          placeholder="Например: проблема с доставкой"
          {...register("subject")}
          error={errors.subject?.message}
        />

        <label className="block">
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Сообщение
          </div>
          <textarea
            rows={5}
            placeholder="Опишите ситуацию подробнее..."
            className="w-full resize-none rounded-2xl border border-custom-border bg-custom-surface px-4 py-3 text-sm text-custom-text outline-none placeholder:text-custom-text-subtle focus-visible:border-custom-border-strong focus-visible:ring-2 focus-visible:ring-custom-ring/25"
            {...register("message")}
          />
          {errors.message?.message ? (
            <div className="mt-1.5 text-xs font-medium text-custom-danger">
              {errors.message.message}
            </div>
          ) : null}
        </label>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Создаем..." : "Создать тикет"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
