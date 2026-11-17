import React, { useState, useEffect, useMemo } from "react";
import { Task, Project, Member } from "../../types";
import { tasksService } from "../../services/tasks";
import { projectsService } from "../../services/projects";
import { membersService } from "../../services/members";
import {
  UZ_MONTHS,
  formatUzbekDate,
  getTodayDateString,
  getDaysInMonth,
  getFirstDayOfWeekMonday,
  isTaskOverdue,
} from "../../utils/date";
import { Modal } from "../../components/ui/Modal";
import { Avatar } from "../../components/ui/Avatar";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { RequestState } from "../../components/ui/RequestState";

export const CalendarPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calendar month/year navigation
  const todayParts = getTodayDateString().split("-").map(Number);
  const [currentYear, setCurrentYear] = useState<number>(todayParts[0]);
  const [currentMonth, setCurrentMonth] = useState<number>(todayParts[1] - 1);

  // Task detail modal
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tList, pList, mList] = await Promise.all([
        tasksService.getTasks(),
        projectsService.getProjects(),
        membersService.getMembers(),
      ]);
      setTasks(tList);
      setProjects(pList);
      setMembers(mList);
    } catch (err: any) {
      setError(err.message || "Kalendar ma’lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const memberMap = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  // Tasks filtered by project
  const filteredTasks = useMemo(() => {
    if (!selectedProjectId) return tasks;
    return tasks.filter((t) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  // Calendar matrix calculation
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const startDayOfWeek = getFirstDayOfWeekMonday(currentYear, currentMonth);
  const prevMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

  // Group tasks by day (YYYY-MM-DD based on dueDate)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    filteredTasks.forEach((t) => {
      const dateKey = t.dueDate;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(t);
    });
    return map;
  }, [filteredTasks]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const [year, month] = getTodayDateString().split("-").map(Number);
    setCurrentYear(year);
    setCurrentMonth(month - 1);
  };

  // Upcoming deadlines sorted by dueDate
  const upcomingDeadlines = useMemo(() => {
    const todayStr = getTodayDateString();
    return [...filteredTasks]
      .filter((t) => t.status !== "done" && t.dueDate >= todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 4);
  }, [filteredTasks]);

  // Stats
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) =>
    isTaskOverdue(t.dueDate, t.status),
  ).length;
  const progressPercent =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const todayStr = getTodayDateString();

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <RequestState loading={loading} error={error} onRetry={loadData} />
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
              Kalendar
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-primary font-label-md text-label-md">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Jonli reja
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Rejalashtirilgan vazifalar va muhim muddatlar taqvimi
          </p>
        </div>

        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-space-sm">
          {/* Month Stepper Pill */}
          <div className="inline-flex max-w-full flex-wrap items-center justify-center p-1 bg-surface-container-lowest rounded-xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)]">
            <button
              onClick={handlePrevMonth}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                chevron_left
              </span>
              <span>Oldingi</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 font-headline-md text-headline-md text-on-surface">
              <span className="material-symbols-outlined text-primary text-[20px]">
                calendar_month
              </span>
              <span>
                {UZ_MONTHS[currentMonth]} {currentYear}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all font-label-md text-label-md"
              type="button"
            >
              <span>Keyingi</span>
              <span className="material-symbols-outlined text-[18px]">
                chevron_right
              </span>
            </button>
          </div>

          {/* Bugun button */}
          <button
            onClick={handleToday}
            className="px-3.5 py-2 rounded-xl bg-surface-container-low text-primary hover:bg-surface-container font-label-lg text-label-lg transition-all shadow-[0_4px_12px_rgba(105,69,255,0.05)]"
            type="button"
          >
            Bugun
          </button>

          {/* Project filter */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="flex items-center gap-space-sm px-3.5 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-label-lg text-label-lg shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] hover:bg-surface-container-low transition-all appearance-none pr-8 cursor-pointer outline-none"
            >
              <option value="">Barcha loyihalar</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-outline text-[16px] absolute right-2.5 top-3 pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Calendar Matrix (8 cols), Right Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Calendar Matrix */}
        <div className="lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-2xl p-space-md lg:p-space-lg shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)]">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 pb-2 text-center border-b border-surface-container-high/60">
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              Dush
            </span>
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              Sesh
            </span>
            <span className="font-label-lg text-label-lg text-primary font-semibold">
              Chor
            </span>
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              Pay
            </span>
            <span className="font-label-lg text-label-lg text-on-surface-variant">
              Jum
            </span>
            <span className="font-label-lg text-label-lg text-outline">
              Shan
            </span>
            <span className="font-label-lg text-label-lg text-outline">
              Yak
            </span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 auto-rows-fr">
            {/* Days from previous month */}
            {Array.from({ length: startDayOfWeek }).map((_, idx) => {
              const dayNum = daysInPrevMonth - startDayOfWeek + idx + 1;
              return (
                <div
                  key={`prev-${idx}`}
                  className="min-h-[105px] p-2 rounded-xl bg-surface-container-low/40 opacity-40 flex flex-col justify-between"
                >
                  <span className="font-label-md text-label-md text-outline">
                    {dayNum}
                  </span>
                </div>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const monthStr = String(currentMonth + 1).padStart(2, "0");
              const dayStr = String(dayNum).padStart(2, "0");
              const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;

              const isCurrentDay = fullDateStr === todayStr;
              const dayTasks = tasksByDate.get(fullDateStr) || [];

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[105px] p-2 rounded-xl transition-all flex flex-col gap-1 ${
                    isCurrentDay
                      ? "bg-surface-container ring-2 ring-primary relative shadow-[0_6px_20px_rgba(80,31,231,0.15)]"
                      : "bg-surface-container-low hover:bg-surface-container"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    {isCurrentDay ? (
                      <span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-label-sm font-bold">
                        {dayNum}
                      </span>
                    ) : (
                      <span className="font-label-md text-label-md text-on-surface">
                        {dayNum}
                      </span>
                    )}
                    {isCurrentDay && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary">
                        Bugun
                      </span>
                    )}
                  </div>

                  {/* Task Pills on this day */}
                  <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => {
                      const isDone = t.status === "done";
                      const isHigh = t.priority === "high";
                      const badgeBg = isDone
                        ? "bg-tertiary text-on-tertiary"
                        : isHigh
                          ? "bg-rose-500 text-white"
                          : "bg-amber-500 text-white";

                      return (
                        <div
                          key={t.id}
                          onClick={() => setDetailTask(t)}
                          className={`w-full py-1 px-2 rounded-full ${badgeBg} text-[10px] font-label-sm truncate shadow-sm flex items-center justify-between cursor-pointer hover:brightness-105 active:scale-95 transition-all`}
                          title={t.title}
                        >
                          <span className="truncate">{t.title}</span>
                          <span className="material-symbols-outlined text-[12px] shrink-0">
                            {isDone
                              ? "check"
                              : isHigh
                                ? "priority_high"
                                : "arrow_forward"}
                          </span>
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <span className="font-label-sm text-[9px] text-primary font-semibold pl-1">
                        +{dayTasks.length - 2} ta yana
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Deck: Upcoming Deadlines & Progress */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Card: Yaqinlashayotgan muddatlar */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  Yaqinlashayotgan muddatlar
                </h2>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {upcomingDeadlines.length} ta faol vazifa belgilangan
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">
                  alarm
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-sm">
              {upcomingDeadlines.length === 0 ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant py-4 text-center">
                  Yaqinlashayotgan muddatlar mavjud emas
                </p>
              ) : (
                upcomingDeadlines.map((t) => {
                  const assignee = t.assigneeId
                    ? memberMap.get(t.assigneeId)
                    : null;
                  const isHigh = t.priority === "high";
                  const isOverdue = isTaskOverdue(t.dueDate, t.status);

                  const cardBg = isOverdue
                    ? "bg-rose-500/10 hover:bg-rose-500/15"
                    : isHigh
                      ? "bg-amber-500/10 hover:bg-amber-500/15"
                      : "bg-sky-500/10 hover:bg-sky-500/15";

                  const badgeBg = isOverdue
                    ? "bg-rose-600"
                    : isHigh
                      ? "bg-amber-500"
                      : "bg-sky-500";

                  return (
                    <div
                      key={t.id}
                      onClick={() => setDetailTask(t)}
                      className={`cursor-pointer p-3.5 rounded-xl ${cardBg} transition-all flex flex-col gap-2 group`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-headline-md text-[14px] text-on-surface font-semibold group-hover:text-primary transition-colors truncate">
                          {t.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full ${badgeBg} text-white font-label-sm text-[11px] whitespace-nowrap shadow-sm`}
                        >
                          {formatUzbekDate(t.dueDate, false)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">
                            {isHigh ? "priority_high" : "flag"}
                          </span>
                          <span>
                            {t.priority === "high"
                              ? "Yuqori ustuvorlik"
                              : t.priority === "medium"
                                ? "O‘rta ustuvorlik"
                                : "Past ustuvorlik"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
                          <Avatar
                            name={assignee?.fullName || "TF"}
                            size="xs"
                            colorScheme="secondary"
                          />
                          <span className="truncate max-w-[90px]">
                            {assignee?.fullName || "Tayinlanmagan"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sprint rivoji */}
            <div className="p-4 rounded-xl bg-surface-container-low flex flex-col gap-space-xs mt-2">
              <div className="flex items-center justify-between text-on-surface">
                <span className="font-label-lg text-label-lg font-semibold">
                  Sprint rivoji
                </span>
                <span className="font-label-lg text-label-lg text-primary font-bold">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Belgilangan {totalTasks} vazifadan {completedTasks} tasi
                yakunlangan
              </span>
            </div>
          </div>

          {/* Sync Status Badge */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">sync</span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                  Taqvim holati
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Jonli rejimda yangilangan
                </span>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim ring-4 ring-tertiary-fixed/30" />
          </div>
        </div>
      </div>

      {/* Bottom Summary Metric Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              layers
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Jami loyiha
            </span>
            <span className="font-display-md text-display-md text-on-surface leading-none font-bold">
              {totalProjects}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              check_box
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Vazifalar
            </span>
            <span className="font-display-md text-display-md text-on-surface leading-none font-bold">
              {totalTasks}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              task_alt
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Bajarilgan
            </span>
            <span className="font-display-md text-display-md text-on-surface leading-none font-bold">
              {completedTasks}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              schedule
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Kechikkan
            </span>
            <span className="font-display-md text-display-md text-on-surface leading-none font-bold">
              {overdueTasks}
            </span>
          </div>
        </div>
      </div>

      {/* Task Detail Modal */}
      {detailTask && (
        <Modal
          isOpen={Boolean(detailTask)}
          onClose={() => setDetailTask(null)}
          title="Vazifa tafsilotlari"
          description="Kalendardan tanlangan topshiriq ma’lumotlari"
        >
          <div className="flex flex-col gap-space-md">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Vazifa nomi:
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mt-0.5">
                {detailTask.title}
              </h3>
            </div>

            {detailTask.description && (
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Tavsif:
                </span>
                <p className="font-body-md text-body-md text-on-surface mt-0.5 bg-surface-container-low p-3 rounded-xl leading-relaxed">
                  {detailTask.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Loyiha:
                </span>
                <p className="font-label-lg text-label-lg text-on-surface mt-0.5">
                  {projectMap.get(detailTask.projectId)?.name || "Loyiha"}
                </p>
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Mas’ul xodim:
                </span>
                <p className="font-label-lg text-label-lg text-on-surface mt-0.5">
                  {detailTask.assigneeId && memberMap.get(detailTask.assigneeId)
                    ? memberMap.get(detailTask.assigneeId)!.fullName
                    : "Tayinlanmagan"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-space-md">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Boshlanish sanasi:
                </span>
                <p className="font-body-md text-body-md text-on-surface mt-0.5">
                  {formatUzbekDate(detailTask.startDate)}
                </p>
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Tugash muddati:
                </span>
                <p className="font-body-md text-body-md text-on-surface mt-0.5">
                  {formatUzbekDate(detailTask.dueDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-space-md pt-2">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                  Ustuvorlik:
                </span>
                <StatusBadge
                  type={
                    detailTask.priority === "high"
                      ? "priority-high"
                      : detailTask.priority === "medium"
                        ? "priority-medium"
                        : "priority-low"
                  }
                />
              </div>
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                  Holat:
                </span>
                <StatusBadge
                  type={
                    detailTask.status === "done"
                      ? "task-done"
                      : detailTask.status === "in_progress"
                        ? "task-in_progress"
                        : "task-todo"
                  }
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
