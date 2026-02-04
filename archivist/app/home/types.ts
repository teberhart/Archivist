export type ShelfPulseStatus = "logged-out" | "ready" | "empty" | "error";

export type ShelfPulseData = {
  status: ShelfPulseStatus;
  totalItems: number;
  itemsAddedLast7Days: number;
  mostActiveShelfName: string | null;
  mostActiveShelfCount: number;
};
