import { useEffect } from "react";
import { baseApi } from "../../../app/baseApi";
import { useAppDispatch } from "../../../app/hooks";
import { chatHubService } from "../../../shared/lib/chatHub";

type UseOrderChatUnreadRealtimeOptions = {
  enabled?: boolean;
};

export function useOrderChatUnreadRealtime({
  enabled = true,
}: UseOrderChatUnreadRealtimeOptions = {}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!enabled) return;

    void chatHubService.ensureConnected().catch(() => undefined);

    const invalidateUnread = () => {
      dispatch(baseApi.util.invalidateTags(["OrderChatUnread"]));
    };

    const unsubscribeUnread = chatHubService.onOrderChatUnreadCountUpdated(
      invalidateUnread,
    );
    const unsubscribeReconnect = chatHubService.onReconnected(invalidateUnread);

    return () => {
      unsubscribeUnread();
      unsubscribeReconnect();
    };
  }, [dispatch, enabled]);
}
