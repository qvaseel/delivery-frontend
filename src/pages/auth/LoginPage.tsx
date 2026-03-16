import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Card } from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { useLoginMutation, useMeQuery } from "../../features/auth/authApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { authActions } from "../../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const schema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});

type Form = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const token = useAppSelector((s) => s.auth.accessToken);
  const me = useAppSelector((s) => s.auth.me);

  const { data: meData } = useMeQuery(undefined, {
    skip: !token,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      const res = await login(data).unwrap();
      dispatch(authActions.setToken(res.accessToken));
      toast.success("Вход выполнен");
    } catch {
      toast.error("Неверный логин или пароль");
    }
  };

  useEffect(() => {
    if (meData) {
      dispatch(authActions.setMe(meData));
    }
  }, [meData, dispatch]);

  useEffect(() => {
    if (!me) return;

    if (me.roles.includes("Customer")) {
      navigate("/products", { replace: true });
    } else if (me.roles.includes("Courier")) {
      navigate("/courier/orders", { replace: true });
    } else if (me.roles.includes("Manager") || me.roles.includes("Admin")) {
      navigate("/admin/orders", { replace: true });
    }
  }, [me, navigate]);

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6 sm:p-7">
        <h1 className="text-xl font-semibold text-custom-text">Вход</h1>
        <p className="mt-1 text-sm text-custom-text-muted">
          Войдите, чтобы оформлять заказы и управлять корзиной.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password?.message}
          />

          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Входим..." : "Войти"}
          </Button>

          <div className="text-center text-sm text-custom-text-muted">
            Нет аккаунта?{" "}
            <Link
              to="/register"
              className="font-medium text-custom-primary transition-colors hover:text-custom-primary-hover hover:underline"
            >
              Регистрация
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
