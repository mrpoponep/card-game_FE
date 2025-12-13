// src/pages/admin/BannedPlayers.jsx
import React, { useState, useEffect } from "react";
// Đổi import từ listBannedReports thành listAllReports (API mới)
import { listAllReports, deleteBannedReport } from "../../api"; 
import "./BannedPlayers.css";

export default function BannedPlayers() {
  const [reports, setReports] = useState([]);
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
      // Gọi API lấy từ bảng Report
      const data = await listAllReports();
      setReports(data || []);
    } catch (e) {
      console.error(e);
      setError("Không thể tải danh sách báo cáo");
    }
    setLoading(false);
  }

  async function selectReport(id) {
    if (selected?.report_id === id) {
      setSelected(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getBannedReportById(id);
      setSelected(data);
    } catch (e) {
      alert("Không thể tải chi tiết báo cáo");
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Bạn có chắc muốn xóa báo cáo này?")) return;
    try {
      await deleteBannedReport(id);
      setSelected(null);
      fetchReports();
    } catch (e) {
      alert("Xóa báo cáo thất bại");
    }
  }

  // Render Badge trạng thái AI
  const renderAiVerdict = (verdict) => {
    if (verdict === 'violation_detected') return <span className="badge badge-danger">⚠️ Vi phạm</span>;
    if (verdict === 'clean') return <span className="badge badge-success">✅ Sạch</span>;
    if (verdict === 'error') return <span className="badge badge-warning">⚠️ Lỗi AI</span>;
    return <span className="badge badge-warning">⏳ Chờ xử lý</span>;
  };

  return (
    <div className="admin-banned-players-page">
      <div className="banned-header">
        <h2>Quản lý Báo cáo (Report List)</h2>
        <button className="button button--secondary" onClick={fetchReports}>Làm mới</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <div className="table-scroll-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{width: 50}}>ID</th>
                <th>Người báo cáo</th>
                <th>Người bị báo cáo</th>
                <th style={{width: 100, textAlign: 'center'}}>Vi phạm (Lần)</th>
                <th>Lý do</th>
                <th style={{width: 110, textAlign: 'center'}}>AI Đánh giá</th>
                <th>Thời gian</th>
                <th style={{width: 100}}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <React.Fragment key={r.report_id}>
                  <tr className={selected?.report_id === r.report_id ? "selected-row" : ""}>
                    <td>#{r.report_id}</td>
                    <td>{r.reporter_name || `ID: ${r.reporter_id}`}</td>
                    <td style={{fontWeight: 'bold', color: '#dc2626'}}>
                        {r.reported_name || `ID: ${r.reported_id}`}
                    </td>
                    <td style={{textAlign: 'center'}}>
                      <span className={`violation-badge ${r.current_violation_count >= 3 ? 'high' : 'low'}`}>
                        {r.current_violation_count ?? 0}
                      </span>
                    </td>
                    <td className="truncate-cell" title={r.reason}>{r.reason}</td>
                    <td style={{textAlign: 'center'}}>{renderAiVerdict(r.ai_verdict)}</td>
                    <td>{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                    <td style={{textAlign: 'center'}}>
                        <button 
                          className="button button--secondary button--small"
                          onClick={() => setSelected(selected?.report_id === r.report_id ? null : r)}
                        >
                          {selected?.report_id === r.report_id ? 'Đóng' : 'Xem'}
                        </button>
                    </td>
                  </tr>
                  
                  {/* DETAIL ROW */}
                  {selected?.report_id === r.report_id && (
                    <tr className="detail-row-expanded">
                      <td colSpan={8}>
                        <div className="detail-content">
                          <div className="detail-grid">
                            <div className="detail-column">
                              <h4>📜 Nội dung Chat</h4>
                              <div className="log-box">
                                {selected.chat_history 
                                  ? selected.chat_history 
                                  : <span style={{color:'#999'}}>Không có dữ liệu</span>
                                }
                              </div>
                            </div>
                            <div className="detail-column">
                              <h4>🤖 Phân tích AI</h4>
                              <div className={`log-box ai-box ${selected.ai_verdict === 'violation_detected' ? 'ai-alert' : ''}`}>
                                {selected.ai_analysis 
                                  ? selected.ai_analysis 
                                  : <span style={{color:'#999'}}>Chưa có phân tích</span>
                                }
                              </div>
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
      </div>
    </div>
  );
}