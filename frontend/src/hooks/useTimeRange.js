import { useMemo, useState } from "react";
import { diffDaysInclusive, isFullSingleMonth, todayStr, parseISO } from "../utils/dateUtils"; 

export function useTimeRange(defaultMonthsBack = 1) {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - defaultMonthsBack);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  });
  const [to, setTo] = useState(() => todayStr()); 

  const days = useMemo(() => (!from || !to ? 1 : diffDaysInclusive(from, to)), [from, to]);
  const periodLabel = useMemo(
    () => (!from || !to ? "" : isFullSingleMonth(from, to) ? "1T" : `${days} ngày`),
    [from, to, days]
  );

  return { from, to, setFrom, setTo, days, periodLabel };
}