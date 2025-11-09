import { useMemo, useState } from "react";

export function useTableFilters(rows) {
  const [hideWatting, setHideWatting] = useState(false);

  const filtered = useMemo(() => {
    if (!hideWatting) return rows;
    return rows.filter(r => r.activeRealtime);
  }, [rows, hideWatting]);

  return { hideWatting, setHideWatting, filtered };
}
