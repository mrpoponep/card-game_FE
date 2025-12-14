import React, { useState, useEffect } from "react";
import { listAllReports, deleteBannedReport, updateReportVerdict } from "../../api"; 
import "./BannedPlayers.css";

export default function BannedPlayers() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null); // Report đang xem chi tiết
  const [editingId, setEditingId] = useState(null); // Report đang sửa
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    setError("");
    try {
      const data = await listAllReports();
      setReports(data || []);
    } catch (e) {
      setError("Không thể tải danh sách báo cáo");
    }
    setLoading(false);
  }

  async function selectReport(id) {
    if (selected?.report_id === id) {
      setSelected(null);
      return;
    }
    // Ở danh sách này đã có đủ info, không cần fetch lại detail nếu muốn nhanh
    const report = reports.find(r => r.report_id === id);
    setSelected(report);
  }

  async function handleVerdictChange(reportId, newVerdict) {
    if (!window.confirm(`Bạn có chắc muốn đổi trạng thái thành "${newVerdict}"? (User sẽ được tính lại điểm vi phạm ngay lập tức)`)) return;
    
    try {
        await updateReportVerdict(reportId, newVerdict);
        setEditingId(null);
        fetchReports(); // Load lại để thấy violation_count cập nhật
        alert("Cập nhật thành công!");
    } catch (e) {
        alert("Cập nhật thất bại: " + (e.message || "Lỗi server"));
    }
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

  // Render Badge trạng thái AI hoặc Dropdown khi đang sửa
  const renderAiVerdictCell = (report) => {
    // Nếu dòng này đang được sửa -> Hiện Dropdown
    if (editingId === report.report_id) {
        return (
            <select 
                defaultValue={report.ai_verdict} 
                onChange={(e) => handleVerdictChange(report.report_id, e.target.value)}
                className="status-select"
                autoFocus
                onBlur={() => setEditingId(null)} // Click ra ngoài thì hủy sửa
                style={{padding: '4px', borderRadius: '4px', border: '2px solid #3182ce'}}
            >
                <option value="pending">⏳ Chờ xử lý</option>
                <option value="violation_detected">⚠️ Vi phạm</option>
                <option value="clean">✅ Sạch</option>
            </select>
        );
    }

    // Hiển thị Badge bình thường
    if (report.ai_verdict === 'violation_detected') return <span className="badge badge-danger">⚠️ Vi phạm</span>;
    if (report.ai_verdict === 'clean') return <span className="badge badge-success">✅ Không vi phạm</span>;
    if (report.ai_verdict === 'error') return <span className="badge badge-warning">⚠️ Lỗi AI</span>;
    return <span className="badge badge-warning">⏳ Chờ xử lý</span>;
  };

  return (
    <div className="admin-banned-players-page">
      <div className="banned-header">
        <h2>Quản lý Báo cáo & Vi phạm</h2>
        <button className="button button--secondary" onClick={fetchReports}>Làm mới</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <div className="table-container">
        <div className="table-scroll-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{width: 50}}>ID</th>
                <th>Người bị báo cáo</th>
                <th style={{width: 120, textAlign: 'center'}}>Vi phạm (30 ngày)</th>
                <th>Lý do</th>
                <th style={{width: 140, textAlign: 'center'}}>Đánh giá (Sửa)</th>
                <th>Thời gian</th>
                <th style={{width: 140, textAlign: 'center'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <React.Fragment key={r.report_id}>
                  <tr className={selected?.report_id === r.report_id ? "selected-row" : ""}>
                    <td>#{r.report_id}</td>
                    <td style={{fontWeight: 'bold', color: '#dc2626'}}>
                        {r.reported_name || `ID: ${r.reported_id}`}
                    </td>
                    <td style={{textAlign: 'center'}}>
                      <span className={`violation-badge ${r.current_violation_count >= 3 ? 'high' : 'low'}`}>
                        {r.current_violation_count ?? 0}
                      </span>
                    </td>
                    <td className="truncate-cell" title={r.reason}>{r.reason}</td>
                    
                    {/* Cột Đánh giá có chức năng Sửa */}
                    <td style={{textAlign: 'center'}}>
                        {renderAiVerdictCell(r)}
                    </td>

                    <td>{new Date(r.created_at).toLocaleString('vi-VN')}</td>
                    
                    <td style={{textAlign: 'center'}}>
                        <div style={{display: 'flex', gap: 6, justifyContent: 'center'}}>
                            <button 
                              className="button button--secondary button--small"
                              onClick={() => selectReport(r.report_id)}
                            >
                              {selected?.report_id === r.report_id ? 'Đóng' : 'Xem'}
                            </button>

                            {/* Nút Sửa */}
                            <button 
                              className="button button--primary button--small"
                              onClick={() => setEditingId(r.report_id)}
                              title="Sửa đánh giá"
                            >
                              ✏️
                            </button>

                            <button 
                              className="button button--danger button--small"
                              onClick={() => handleDelete(r.report_id)}
                              title="Xóa báo cáo"
                            >
                              🗑️
                            </button>
                        </div>
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