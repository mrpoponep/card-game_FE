import React from "react";
import TabSwitch from "./TabSwitch";

export default function DashboardHeader({ tab, onChange }) {
  return (
    <div className="dashboard-header">
      <TabSwitch
        tabs={[
          { value: "overview", label: "Tổng quan" },
          { value: "public",   label: "Bản public / Tables" },
        ]}
        value={tab}
        onChange={onChange}
      />
    </div>
  );
}
