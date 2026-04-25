import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import type {
  HelpdeskTicketDto,
  HelpdeskTicketMessageDto,
  HelpdeskUnreadCount,
} from "../../features/helpdesk/types";
import type {
  OrderChatMessageDto,
  OrderChatUnreadCount,
} from "../../features/orders/types";
import { API_URL } from "./constants";

type VoidListener = () => void;
type OrderMessageListener = (message: OrderChatMessageDto) => void;
type HelpdeskMessageListener = (message: HelpdeskTicketMessageDto) => void;
type HelpdeskTicketListener = (ticket: HelpdeskTicketDto) => void;
type HelpdeskUnreadCountListener = (payload: HelpdeskUnreadCount) => void;
type OrderChatUnreadCountListener = (payload: OrderChatUnreadCount) => void;

class ChatHubService {
  private connection: HubConnection | null = null;
  private startPromise: Promise<void> | null = null;
  private joinedOrderChats = new Set<number>();
  private joinedHelpdeskTickets = new Set<number>();
  private reconnectedListeners = new Set<VoidListener>();
  private orderMessageListeners = new Set<OrderMessageListener>();
  private helpdeskMessageListeners = new Set<HelpdeskMessageListener>();
  private helpdeskTicketCreatedListeners = new Set<HelpdeskTicketListener>();
  private helpdeskTicketUpdatedListeners = new Set<HelpdeskTicketListener>();
  private helpdeskUnreadCountUpdatedListeners =
    new Set<HelpdeskUnreadCountListener>();
  private orderChatUnreadCountUpdatedListeners =
    new Set<OrderChatUnreadCountListener>();

  private createConnection() {
    const connection = new HubConnectionBuilder()
      .withUrl(`${API_URL}/hubs/chat`, {
        accessTokenFactory: () => localStorage.getItem("accessToken") ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("OrderMessageReceived", (message: OrderChatMessageDto) => {
      this.orderMessageListeners.forEach((listener) => listener(message));
    });

    connection.on(
      "OrderChatUnreadCountUpdated",
      (payload: OrderChatUnreadCount) => {
        this.orderChatUnreadCountUpdatedListeners.forEach((listener) =>
          listener({
            unreadOrders: payload?.unreadOrders ?? 0,
            unreadMessages: payload?.unreadMessages ?? 0,
          }),
        );
      },
    );

    connection.on(
      "HelpdeskMessageReceived",
      (message: HelpdeskTicketMessageDto) => {
        this.helpdeskMessageListeners.forEach((listener) => listener(message));
      },
    );

    connection.on("HelpdeskTicketCreated", (ticket: HelpdeskTicketDto) => {
      this.helpdeskTicketCreatedListeners.forEach((listener) => listener(ticket));
    });

    connection.on("HelpdeskTicketUpdated", (ticket: HelpdeskTicketDto) => {
      this.helpdeskTicketUpdatedListeners.forEach((listener) => listener(ticket));
    });

    connection.on(
      "HelpdeskUnreadCountUpdated",
      (payload: HelpdeskUnreadCount) => {
        this.helpdeskUnreadCountUpdatedListeners.forEach((listener) =>
          listener({
            unreadTickets: payload?.unreadTickets ?? 0,
            unreadMessages: payload?.unreadMessages ?? 0,
          }),
        );
      },
    );

    connection.onreconnected(() => {
      void this.rejoinActiveRooms();
      this.reconnectedListeners.forEach((listener) => listener());
    });

    this.connection = connection;
    return connection;
  }

  private async rejoinActiveRooms() {
    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    await Promise.all([
      ...Array.from(this.joinedOrderChats).map((orderId) =>
        this.connection!.invoke("JoinOrderChat", orderId),
      ),
      ...Array.from(this.joinedHelpdeskTickets).map((ticketId) =>
        this.connection!.invoke("JoinHelpdeskTicket", ticketId),
      ),
    ]);
  }

  async ensureConnected() {
    const connection = this.connection ?? this.createConnection();

    if (connection.state === HubConnectionState.Connected) return connection;
    if (this.startPromise) {
      await this.startPromise;
      return connection;
    }

    this.startPromise = connection
      .start()
      .catch((error) => {
        this.connection = null;
        throw error;
      })
      .finally(() => {
        this.startPromise = null;
      });

    await this.startPromise;
    return connection;
  }

  async joinOrderChat(orderId: number) {
    this.joinedOrderChats.add(orderId);
    const connection = await this.ensureConnected();
    await connection.invoke("JoinOrderChat", orderId);
  }

  async leaveOrderChat(orderId: number) {
    this.joinedOrderChats.delete(orderId);

    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    await this.connection.invoke("LeaveOrderChat", orderId);
  }

  async joinHelpdeskTicket(ticketId: number) {
    this.joinedHelpdeskTickets.add(ticketId);
    const connection = await this.ensureConnected();
    await connection.invoke("JoinHelpdeskTicket", ticketId);
  }

  async leaveHelpdeskTicket(ticketId: number) {
    this.joinedHelpdeskTickets.delete(ticketId);

    if (!this.connection || this.connection.state !== HubConnectionState.Connected) {
      return;
    }

    await this.connection.invoke("LeaveHelpdeskTicket", ticketId);
  }

  async sendOrderMessage(orderId: number, message: string) {
    const connection = await this.ensureConnected();
    await connection.invoke("SendOrderMessage", orderId, message);
  }

  async sendHelpdeskMessage(ticketId: number, message: string) {
    const connection = await this.ensureConnected();
    await connection.invoke("SendHelpdeskMessage", ticketId, message);
  }

  onReconnected(listener: VoidListener) {
    this.reconnectedListeners.add(listener);
    return () => {
      this.reconnectedListeners.delete(listener);
    };
  }

  onOrderMessage(listener: OrderMessageListener) {
    this.orderMessageListeners.add(listener);
    return () => {
      this.orderMessageListeners.delete(listener);
    };
  }

  onOrderChatUnreadCountUpdated(listener: OrderChatUnreadCountListener) {
    this.orderChatUnreadCountUpdatedListeners.add(listener);
    return () => {
      this.orderChatUnreadCountUpdatedListeners.delete(listener);
    };
  }

  onHelpdeskMessage(listener: HelpdeskMessageListener) {
    this.helpdeskMessageListeners.add(listener);
    return () => {
      this.helpdeskMessageListeners.delete(listener);
    };
  }

  onHelpdeskTicketCreated(listener: HelpdeskTicketListener) {
    this.helpdeskTicketCreatedListeners.add(listener);
    return () => {
      this.helpdeskTicketCreatedListeners.delete(listener);
    };
  }

  onHelpdeskTicketUpdated(listener: HelpdeskTicketListener) {
    this.helpdeskTicketUpdatedListeners.add(listener);
    return () => {
      this.helpdeskTicketUpdatedListeners.delete(listener);
    };
  }

  onHelpdeskUnreadCountUpdated(listener: HelpdeskUnreadCountListener) {
    this.helpdeskUnreadCountUpdatedListeners.add(listener);
    return () => {
      this.helpdeskUnreadCountUpdatedListeners.delete(listener);
    };
  }
}

export const chatHubService = new ChatHubService();
