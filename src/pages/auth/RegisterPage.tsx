import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Card } from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { Button } from "../../shared/ui/Button";
import { useRegisterMutation } from "../../features/auth/authApi";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { authActions } from "../../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const schema = z.object({
  fullName: z.string().min(2, "Введите имя"),
  email: z.string().email("Введите корректный email"),
  password: z.string().min(6, "Минимум 6 символов"),
});
type Form = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const token = useAppSelector((s) => s.auth.accessToken);
  useEffect(() => {
    if (token) navigate("/products");
  }, [token, navigate]);

  const onSubmit = async (data: Form) => {
    try {
      const res = await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      }).unwrap();

      dispatch(authActions.setToken(res.accessToken));
      toast.success("Аккаунт создан");
      navigate("/products");
    } catch {
      toast.error("Не удалось зарегистрироваться (возможно email уже занят)");
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6 sm:p-7">
        <h1 className="text-xl font-semibold text-custom-text">Регистрация</h1>
        <p className="mt-1 text-sm text-custom-text-muted">
          Создайте аккаунт клиента, чтобы оформлять заказы.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Имя"
            placeholder="Иван Иванов"
            {...register("fullName")}
            error={errors.fullName?.message}
          />

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
            {isLoading ? "Создаём..." : "Создать аккаунт"}
          </Button>

          <div className="text-center text-sm text-custom-text-muted">
            Уже есть аккаунт?{" "}
            <Link
              to="/login"
              className="font-medium text-custom-primary transition-colors hover:text-custom-primary-hover hover:underline"
            >
              Войти
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
