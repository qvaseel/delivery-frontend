import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { useMeQuery } from "../features/auth/authApi";
import { authActions } from "../features/auth/authSlice";
import { useEffect } from "react";

export function AppLayout() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.accessToken);

  const { data: me, refetch } = useMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (!token) {
      dispatch(authActions.setMe(null));
      return;
    }
    refetch();
  }, [token, refetch, dispatch]);

  useEffect(() => {
    if (token && me) dispatch(authActions.setMe(me));
  }, [token, me, dispatch]);

  return (
    <div className="min-h-dvh bg-custom-bg text-custom-text">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
