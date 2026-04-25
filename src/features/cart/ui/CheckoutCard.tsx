import { Controller, useForm } from "react-hook-form";
import {
  AddressSuggestions,
  type DaDataAddress,
  type DaDataSuggestion,
} from "react-dadata";
import "react-dadata/dist/react-dadata.css";
import type { CreateOrderDto } from "../../orders/types";
import { Card } from "../../../shared/ui/Card";
import { formatPrice } from "../../../shared/lib/format";
import { Button } from "../../../shared/ui/Button";
import "../../../index.css";

type CheckoutFormValues = {
  address: string;
  addressSuggestion?: DaDataSuggestion<DaDataAddress>;
};

type CheckoutCardProps = {
  total: number;
  totalQuantity: number;
  disabled: boolean;
  disabledReason?: string | null;
  isSubmitting?: boolean;
  onSubmit: (data: CreateOrderDto) => Promise<void>;
  dadataToken: string;
};

export function CheckoutCard({
  total,
  totalQuantity,
  disabled,
  disabledReason,
  isSubmitting = false,
  onSubmit,
  dadataToken,
}: CheckoutCardProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      address: "",
      addressSuggestion: undefined,
    },
  });

  const submit = async (values: CheckoutFormValues) => {
    await onSubmit({
      address: values.address,
      items: [],
    });
  };

  const buttonLabel = isSubmitting
    ? "Оформляем заказ..."
    : disabledReason
      ? "Проверьте условия заказа"
      : "Оформить заказ";

  return (
    <Card className="h-fit p-5 lg:sticky lg:top-24">
      <div className="text-lg font-semibold text-custom-text">Оформление заказа</div>

      <div className="mt-1 text-sm text-custom-text-muted">
        Укажите адрес доставки, проверьте состав и завершите покупку в один шаг.
      </div>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(submit)}>
        <label className="block">
          <div className="mb-1.5 text-sm font-medium text-custom-text-muted">
            Адрес доставки
          </div>

          <Controller
            control={control}
            name="address"
            rules={{
              required: "Укажите адрес доставки",
            }}
            render={({ field }) => (
              <AddressSuggestions
                token={dadataToken}
                value={undefined}
                onChange={(suggestion) => {
                  const nextAddress = suggestion?.unrestricted_value ?? "";
                  field.onChange(nextAddress);
                  setValue("addressSuggestion", suggestion);
                }}
                inputProps={{
                  className: `w-full rounded-2xl border bg-custom-surface px-4 py-2.5 text-sm text-custom-text outline-none placeholder:text-custom-text-subtle ${
                    errors.address
                      ? "border-custom-danger focus-visible:ring-2 focus-visible:ring-custom-danger/25"
                      : "border-custom-border focus-visible:border-custom-border-strong focus-visible:ring-2 focus-visible:ring-custom-ring/25"
                  }`,
                  value: field.value,
                  placeholder: "Начните вводить адрес",
                }}
                suggestionsClassName="absolute left-0 right-0 top-[calc(100%+8px)] z-50 m-0 list-none overflow-hidden rounded-[18px] border-custom-border bg-custom-surface-elevated p-4 text-left shadow-md"
              />
            )}
          />

          {errors.address?.message ? (
            <div className="mt-1.5 text-xs font-medium text-custom-danger">
              {errors.address.message}
            </div>
          ) : (
            <div className="mt-1.5 text-xs text-custom-text-subtle">
              Подсказки помогут быстрее выбрать точный адрес.
            </div>
          )}
        </label>

        <div className="rounded-2xl border border-custom-border bg-custom-surface-soft p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-custom-text-muted">Товаров</span>
            <span className="font-semibold text-custom-text">{totalQuantity}</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-custom-text-muted">Доставка</span>
            <span className="font-semibold text-custom-text">Уточняется</span>
          </div>

          <div className="mt-3 border-t border-custom-border pt-3">
            <div className="flex items-center justify-between">
              <span className="text-custom-text-muted">Итого</span>
              <span className="text-base font-semibold text-custom-text">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>

        {disabledReason ? (
          <div className="rounded-2xl border border-custom-warning/20 bg-custom-warning-soft px-4 py-3 text-sm text-custom-warning">
            {disabledReason}
          </div>
        ) : (
          <div className="rounded-2xl border border-custom-border bg-custom-surface-soft px-4 py-3 text-sm text-custom-text-muted">
            После оформления заказ появится в разделе "Мои заказы", а его статус
            начнет обновляться автоматически.
          </div>
        )}

        <Button className="w-full" disabled={disabled}>
          {buttonLabel}
        </Button>
      </form>
    </Card>
  );
}
