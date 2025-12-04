import React, { useState, useEffect } from "react";
import { listBannedReports, getBannedReportById, deleteBannedReport, getUserViolationCount } from "../../api";
import "./BannedPlayers.css";

export default function BannedPlayers() {
  const [reports, setReports] = useState([]);
  const [violationCounts, setViolationCounts] = useState({});
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    setError("");
    try {
      const data = await listBannedReports({ limit: 50 });
      setReports(data);
      // Lấy violation_count cho từng user (chỉ lấy unique)
      const userIds = Array.from(new Set(data.map(r => r.reported_id)));
      const counts = {};
      await Promise.all(userIds.map(async (uid) => {
        try {
          counts[uid] = await getUserViolationCount(uid);
        } catch {}
      }));
      setViolationCounts(counts);
    } catch (e) {
      setError("Không thể tải danh sách báo cáo");
    }
    setLoading(false);
  }

  async function selectReport(id) {
    setLoading(true);
    setError("");
    try {
      const data = await getBannedReportById(id);
      setSelected(data);
    } catch (e) {
      setError("Không thể tải chi tiết báo cáo");
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc muốn xóa báo cáo này?")) return;
    setLoading(true);
    setError("");
    try {
      await deleteBannedReport(id);
      setSelected(null);
      fetchReports();
    } catch (e) {
      setError("Xóa báo cáo thất bại");
    }
    setLoading(false);
  }

  return (
    <div className="admin-banned-players-page" style={{ padding: 24 }}>
      <h2 style={{textAlign: 'center'}}>Quản lý Banned Player</h2>
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Đang tải...</div>}
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ flex: 1, maxWidth: 1300, margin: '0 auto' }}>
          <h3>Danh sách báo cáo</h3>
          <table className="admin-banned-players-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Users</th>
                <th style={{width: 80, textAlign: 'center'}}>Violation Count</th>
                <th>Reason</th>
                <th>Created At</th>
                <th>Details</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                    <React.Fragment key={r.report_id}>
                      <tr className={selected?.report_id === r.report_id ? "selected-row" : ""}>
                        <td style={{textAlign: 'center'}}>{r.report_id}</td>
                        <td style={{textAlign: 'center'}}>{r.reported_id}</td>
                        <td style={{textAlign: 'center', width: 80}}>{violationCounts[r.reported_id] ?? '-'}</td>
                        <td style={{
                          width: '100%',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-word',
                          maxWidth: 320,
                          display: 'block'
                        }}>{r.reason}</td>
                        <td style={{textAlign: 'center'}}>{r.created_at?.slice(0, 19)}</td>
                        <td style={{textAlign: 'center'}}>
                          <button
                            className="detail-btn"
                            style={{margin: '0 auto', display: 'inline-block'}}
                            onClick={() => selected?.report_id === r.report_id ? setSelected(null) : selectReport(r.report_id)}
                          >
                            {selected?.report_id === r.report_id ? 'Đóng' : 'Xem'}
                          </button>
                        </td>
                        <td style={{textAlign: 'center'}}>
                          <button className="delete-btn" style={{margin: '0 auto', display: 'inline-block'}} onClick={() => handleDelete(r.report_id)}>Xóa</button>
                        </td>
                      </tr>
                      {selected?.report_id === r.report_id && (
                        <tr className="inline-detail-row">
                          <td colSpan={6} className="inline-detail-cell">
                            <div className="inline-detail-box">
                              <div className="admin-banned-players-detail animated-detail">
                                <div className="detail-header">
                                  <h3>Chi tiết báo cáo #{selected.report_id}</h3>
                                </div>
                                <div className="detail-block">
                                  <span className="detail-label">Người bị báo cáo:</span>
                                  <span className="detail-value">{selected.reported_id}</span>
                                </div>
                                <div className="detail-block">
                                  <span className="detail-label">Lý do:</span>
                                  <pre className="detail-pre">{selected.reason}</pre>
                                </div>
                                <div className="detail-block">
                                  <span className="detail-label">Chat history:</span>
                                  <pre className="detail-pre">{selected.chat_history}</pre>
                                </div>
                                {/* Không hiển thị số lần vi phạm nếu API không trả về */}
                                <div className="detail-block">
                                  <span className="detail-label">Ngày tạo:</span>
                                  <span className="detail-value">{selected.created_at}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {/* Đã bỏ box chi tiết bên phải, chỉ giữ chi tiết dưới hàng được chọn */}
      </div>
    </div>
  );
}
