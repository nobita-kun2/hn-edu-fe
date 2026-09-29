import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import { LoadingIndicator } from "../../components/common/LoadingIndicator";
import { DocumentList } from "../../components/common/DocumentList";
import { Modal } from "../../components/common/Modal";
import { useToast } from "../../hooks/useToast";
import { useConfirm } from "../../hooks/useConfirm";
import { classService } from "../../services/classService";
import { scheduleService } from "../../services/scheduleService";
import type { ClassEntity, LevelType, Schedule } from "../../types/class.types";
import { formatCurrency, formatDate, formatTime } from "../../utils/format";

const LEVEL_LABEL: Record<LevelType, string> = {
  YLE: "YLE (Trẻ em)",
  SCHOOL: "Ôn thi phổ thông",
  CERTIFICATE: "Luyện chứng chỉ",
};

const LEVEL_BADGE_CLASS: Record<LevelType, string> = {
  YLE: "level-badge--yle",
  SCHOOL: "level-badge--school",
  CERTIFICATE: "level-badge--certificate",
};

function getErrorMessage(err: unknown, fallback: string): string {
  return isAxiosError(err)
    ? ((err.response?.data as { message?: string } | undefined)?.message ?? fallback)
    : fallback;
}

export function StudentClassesPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [myClasses, setMyClasses] = useState<ClassEntity[]>([]);
  const [openClasses, setOpenClasses] = useState<ClassEntity[]>([]);
  const [upcoming, setUpcoming] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<number | null>(null);
  const [docsScheduleId, setDocsScheduleId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [mine, all, schedules] = await Promise.all([
        classService.getMyClasses(),
        classService.getClasses(),
        scheduleService.getUpcoming(),
      ]);
      const myIds = new Set(mine.map((c) => c.id));
      setMyClasses(mine);
      setOpenClasses(all.filter((c) => c.status === "ACTIVE" && !myIds.has(c.id)));
      setUpcoming(schedules);
    } catch (err) {
      setLoadError(getErrorMessage(err, "Không tải được dữ liệu lớp học. Vui lòng thử lại."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleEnroll(id: number) {
    setActionError(null);
    setPendingActionId(id);
    try {
      await classService.enroll(id);
      await loadData();
      showToast("Đã đăng ký lớp học thành công.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Đăng ký lớp thất bại. Vui lòng thử lại."));
    } finally {
      setPendingActionId(null);
    }
  }

  async function handleDrop(id: number) {
    const ok = await confirm({
      message: "Huỷ đăng ký lớp học này? Bạn có thể phải đăng ký lại nếu lớp còn chỗ trống.",
      confirmText: "Huỷ đăng ký",
      danger: true,
    });
    if (!ok) return;
    setActionError(null);
    setPendingActionId(id);
    try {
      await classService.drop(id);
      await loadData();
      showToast("Đã huỷ đăng ký lớp học.");
    } catch (err) {
      setActionError(getErrorMessage(err, "Huỷ đăng ký thất bại. Vui lòng thử lại."));
    } finally {
      setPendingActionId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="admin-page">
        <h1>Lớp học của tôi</h1>
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Lớp học của tôi</h1>

      {loadError && (
        <div className="form-error" role="alert">
          {loadError}
        </div>
      )}
      {actionError && (
        <div className="form-error" role="alert">
          {actionError}
        </div>
      )}

      <section className="admin-card">
        <h2>Lớp đã đăng ký ({myClasses.length})</h2>
        {myClasses.length === 0 ? (
          <p className="admin-hint">Bạn chưa đăng ký lớp học nào.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--aligned">
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Tên lớp</th>
                  <th>Phân loại</th>
                  <th>Gia sư</th>
                  <th>Học phí</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {myClasses.map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.name}</td>
                    <td>
                      <span className={`level-badge ${LEVEL_BADGE_CLASS[cls.levelType]}`}>
                        {cls.levelDetail || LEVEL_LABEL[cls.levelType]}
                      </span>
                    </td>
                    <td>{cls.tutorName ?? "—"}</td>
                    <td className="num">{formatCurrency(cls.tuitionFee)}</td>
                    <td>
                      <span
                        className={`status-badge ${cls.status === "ACTIVE" ? "status-badge--success" : "status-badge--danger"}`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        {cls.status === "ACTIVE" ? "Đang mở" : "Đã đóng"}
                      </span>
                    </td>
                    <td>
                      {cls.status === "ACTIVE" && (
                        <div className="admin-actions">
                          <Link to={`/student/classes/${cls.id}/quizzes`} className="admin-btn admin-btn--neutral">
                            Quiz
                          </Link>
                          <Link
                            to={`/student/classes/${cls.id}/materials`}
                            className="admin-btn admin-btn--neutral"
                          >
                            Học liệu
                          </Link>
                          <button
                            type="button"
                            className="admin-btn admin-btn--danger"
                            disabled={pendingActionId === cls.id}
                            onClick={() => handleDrop(cls.id)}
                          >
                            Huỷ đăng ký
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2>Lớp đang mở đăng ký ({openClasses.length})</h2>
        {openClasses.length === 0 ? (
          <p className="admin-hint">Hiện không có lớp nào đang mở đăng ký.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--aligned">
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Tên lớp</th>
                  <th>Phân loại</th>
                  <th>Gia sư</th>
                  <th>Học phí</th>
                  <th>Sĩ số</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {openClasses.map((cls) => {
                  const isFull = cls.currentStudents >= cls.maxStudents;
                  return (
                    <tr key={cls.id}>
                      <td>{cls.name}</td>
                      <td>
                        <span className={`level-badge ${LEVEL_BADGE_CLASS[cls.levelType]}`}>
                          {cls.levelDetail || LEVEL_LABEL[cls.levelType]}
                        </span>
                      </td>
                      <td>{cls.tutorName ?? "—"}</td>
                      <td className="num">{formatCurrency(cls.tuitionFee)}</td>
                      <td className="num">
                        {cls.currentStudents}/{cls.maxStudents}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn admin-btn--primary"
                          disabled={pendingActionId === cls.id || isFull}
                          onClick={() => handleEnroll(cls.id)}
                        >
                          {isFull ? "Đã đầy" : "Đăng ký"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-card">
        <h2>Lịch học sắp tới ({upcoming.length})</h2>
        {upcoming.length === 0 ? (
          <p className="admin-hint">Không có buổi học nào sắp tới.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-table--aligned">
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Lớp</th>
                  <th>Ngày học</th>
                  <th colSpan={3}>Giờ học</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((s) => (
                  <tr key={s.id}>
                    <td>{s.className ?? `Lớp #${s.classId}`}</td>
                    <td>{formatDate(s.sessionDate)}</td>
                    <td colSpan={3} className="num">
                      {formatTime(s.startTime)} - {formatTime(s.endTime)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn--neutral"
                        onClick={() => setDocsScheduleId(s.id)}
                      >
                        Học liệu
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {docsScheduleId !== null && (
        <Modal title="Học liệu buổi học" onClose={() => setDocsScheduleId(null)}>
          <DocumentList scheduleId={docsScheduleId} canManage={false} />
        </Modal>
      )}
    </div>
  );
}
