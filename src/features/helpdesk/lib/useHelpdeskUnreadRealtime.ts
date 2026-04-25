import { useEffect } from "react";
import { baseApi } from "../../../app/baseApi";
import { useAppDispatch } from "../../../app/hooks";
import { chatHubService } from "../../../shared/lib/chatHub";

type UseHelpdeskUnreadRealtimeOptions = {
  enabled?: boolean;
};

export function useHelpdeskUnreadRealtime({
  enabled = true,
}: UseHelpdeskUnreadRealtimeOptions = {}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;

    void chatHubService.ensureConnected().catch(() => undefined);

    const invalidateUnread = () => {
      dispatch(baseApi.util.invalidateTags(["HelpdeskUnread"]));
    };

    const unsubscribeUnread = chatHubService.onHelpdeskUnreadCountUpdated(
      invalidateUnread,
    );
    const unsubscribeReconnect = chatHubService.onReconnected(invalidateUnread);

    return () => {
      unsubscribeUnread();
      unsubscribeReconnect();
    };
  }, [dispatch, enabled]);
}
