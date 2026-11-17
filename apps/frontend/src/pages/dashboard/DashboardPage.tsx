import React, { useState, useEffect, useMemo } from "react";
import { RequestState } from "../../components/ui/RequestState";
import { Project, Task, Member, TaskStatus } from "../../types";
import { projectsService } from "../../services/projects";
import { tasksService } from "../../services/tasks";
import { membersService } from "../../services/members";
import { usePermissions } from "../../hooks/usePermissions";
import {
  getTodayDateString,
  formatUzbekDate,
  isTaskOverdue,
  UZ_MONTHS,
} from "../../utils/date";
import { Avatar } from "../../components/ui/Avatar";

// Visual colors for timeline capsule bars matching Stitch approved gradients
const TIMELINE_PALETTES = [
  {
    bg: "bg-gradient-to-r from-emerald-500 to-green-500 shadow-[0_8px_18px_-4px_rgba(34,197,94,0.35)]",
    ring: "ring-emerald-400",
  },
  {
    bg: "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_8px_18px_-4px_rgba(245,158,11,0.35)]",
    ring: "ring-amber-300",
  },
  {
    bg: "bg-gradient-to-r from-rose-400 to-rose-500 shadow-[0_8px_18px_-4px_rgba(244,63,94,0.35)]",
    ring: "ring-rose-300",
  },
  {
    bg: "bg-gradient-to-r from-sky-400 to-blue-500 shadow-[0_8px_18px_-4px_rgba(14,165,233,0.35)]",
    ring: "ring-sky-300",
  },
  {
    bg: "bg-gradient-to-r from-primary-container via-purple-500 to-secondary-container shadow-[0_8px_18px_-4px_rgba(105,69,255,0.35)]",
    ring: "ring-purple-300",
  },
  {
    bg: "bg-gradient-to-r from-teal-400 to-cyan-500 shadow-[0_8px_18px_-4px_rgba(20,184,166,0.35)]",
    ring: "ring-teal-300",
  },
];

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  const { canEditTask } = usePermissions();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projList, taskList, memberList] = await Promise.all([
        projectsService.getProjects(),
        tasksService.getTasks(),
        membersService.getMembers(),
      ]);
      setProjects(projList);
      setTasks(taskList);
      setMembers(memberList);

      if (projList.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projList[0].id);
      }
      if (taskList.length > 0 && !selectedTaskId) {
        setSelectedTaskId(taskList[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Ma’lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || projects[0],
    [projects, selectedProjectId],
  );

  const filteredTasks = useMemo(() => {
    if (!selectedProjectId) return tasks;
    return tasks.filter((t) => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const memberMap = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  // Overall Statistics calculated from real data
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const overdueTasks = tasks.filter((t) =>
    isTaskOverdue(t.dueDate, t.status),
  ).length;

  // Project progress
  const projectTotalTasks = filteredTasks.length;
  const projectDoneTasks = filteredTasks.filter(
    (t) => t.status === "done",
  ).length;
  const projectProgress =
    projectTotalTasks === 0
      ? 0
      : Math.round((projectDoneTasks / projectTotalTasks) * 100);

  // Dynamic Weekdays calculation based on Tashkent current date
  const todayStr = getTodayDateString();
  const weekDays = useMemo(() => {
    const [tY, tM, tD] = todayStr.split("-").map(Number);
    const baseDate = new Date(Date.UTC(tY, (tM || 1) - 1, tD || 1));
    const dayOfWeek = (baseDate.getUTCDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const mondayTime = baseDate.getTime() - dayOfWeek * 86400000;

    const names = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan", "Yak"];
    return names.map((name, i) => {
      const d = new Date(mondayTime + i * 86400000);
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dateNum = d.getUTCDate();
      const dStr = `${y}-${m}-${String(dateNum).padStart(2, "0")}`;
      return {
        name,
        date: dateNum,
        dateStr: dStr,
        isCurrent: dStr === todayStr,
      };
    });
  }, [todayStr]);

  const timelineTasks = useMemo(
    () =>
      filteredTasks.filter(
        (task) =>
          task.startDate <= weekDays[6].dateStr &&
          task.dueDate >= weekDays[0].dateStr,
      ),
    [filteredTasks, weekDays],
  );
  const selectedTask = useMemo(
    () =>
      timelineTasks.find((task) => task.id === selectedTaskId) ||
      timelineTasks[0] ||
      null,
    [timelineTasks, selectedTaskId],
  );

  // Active column index for the continuous hairline indicator
  const activeColIndex = weekDays.findIndex((w) => w.isCurrent);
  const activeColPosition = activeColIndex >= 0 ? activeColIndex : 2;

  // Persist authorized task workflow status change directly to real backend
  const handleTaskStatusWorkflowChange = async (targetStatus: TaskStatus) => {
    if (!selectedTask) return;
    if (!canEditTask(selectedTask)) {
      alert(
        "Siz faqat o‘zingizga biriktirilgan vazifalar holatini o‘zgartirishingiz mumkin.",
      );
      return;
    }
    setUpdatingStatus(true);
    try {
      await tasksService.updateTask(selectedTask.id, { status: targetStatus });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, status: targetStatus } : t,
        ),
      );
      // Refresh project to update backend computed progress
      const refreshedProjects = await projectsService.getProjects();
      setProjects(refreshedProjects);
    } catch (err: any) {
      alert(err.message || "Holatni yangilashda xatolik yuz berdi");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const currentMonthIndex = parseInt(todayStr.split("-")[1], 10) - 1;
  const currentMonthName = UZ_MONTHS[currentMonthIndex] || "May";
  const currentYear = todayStr.split("-")[0] || "2026";

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <RequestState loading={loading} onRetry={loadData} />
      {/* Top Bar Controls & Overview */}
      <div className="flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex flex-col min-w-0">
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            TeamFlow
          </h1>
          <span className="font-body-md text-body-md text-on-surface-variant">
            Loyiha ko‘rinishi:{" "}
            {selectedProject ? selectedProject.name : "Barchasi"}
          </span>
        </div>

        <div className="flex min-w-0 max-w-full items-center gap-space-md flex-wrap">
          {/* Project Selector */}
          {projects.length > 0 && (
            <div className="relative inline-flex max-w-full min-w-0 items-center bg-surface-container-lowest px-space-md py-2 rounded-full shadow-[0_4px_16px_rgba(105,69,255,0.04)] hover:bg-surface-container-low transition-all">
              <span className="material-symbols-outlined text-[18px] text-primary mr-2">
                folder
              </span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="min-w-0 max-w-full bg-transparent font-label-lg text-label-lg text-on-surface outline-none cursor-pointer pr-4 appearance-none font-semibold"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant pointer-events-none">
                expand_more
              </span>
            </div>
          )}

          {/* Team Avatar Stack */}
          <div className="flex items-center bg-surface-container-lowest px-space-sm py-1.5 rounded-full shadow-[0_4px_16px_rgba(105,69,255,0.04)]">
            <div className="flex -space-x-2 overflow-hidden items-center">
              {members.slice(0, 3).map((m, idx) => (
                <Avatar
                  key={m.id}
                  name={m.fullName}
                  size="md"
                  ring
                  colorScheme={
                    idx === 0 ? "primary" : idx === 1 ? "tertiary" : "secondary"
                  }
                />
              ))}
            </div>
            {members.length > 3 && (
              <span className="ml-2 font-label-md text-label-md text-on-surface-variant pr-1">
                +{members.length - 3}
              </span>
            )}
          </div>

          {/* Month Selector Pill */}
          <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-2 rounded-full shadow-[0_4px_16px_rgba(105,69,255,0.04)] cursor-pointer hover:bg-surface-container-low transition-all">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              calendar_month
            </span>
            <span className="font-label-lg text-label-lg text-on-surface">
              {currentMonthName} {currentYear}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-error-container text-error text-label-md flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="px-3 py-1 bg-surface-container-lowest rounded-lg text-on-surface text-label-sm font-semibold hover:bg-surface-container"
          >
            Qayta urinish
          </button>
        </div>
      )}

      {/* Main 12-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Timeline Grid Area (8 Cols) */}
        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] relative overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center pb-space-md mb-space-sm relative z-10 border-b border-surface-container-high/60">
            {weekDays.map((day) => (
              <div key={day.name} className="flex flex-col items-center">
                {day.isCurrent ? (
                  <div className="bg-surface-container px-3.5 py-1.5 rounded-xl flex flex-col items-center">
                    <span className="font-label-md text-label-md text-primary font-semibold">
                      {day.name}
                    </span>
                    <span className="font-headline-md text-headline-md text-primary font-bold">
                      {day.date}
                    </span>
                  </div>
                ) : (
                  <>
                    <span className="font-label-md text-label-md text-on-surface-variant">
                      {day.name}
                    </span>
                    <span className="font-headline-md text-headline-md text-on-surface mt-0.5">
                      {day.date}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Timeline Matrix & Task Rows */}
          <div className="relative w-full min-h-[420px] py-2">
            {/* Vertical Grid Columns Background */}
            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
              {Array.from({ length: 7 }).map((_, colIdx) => (
                <div
                  key={`col-${colIdx}`}
                  className={`relative flex justify-center ${
                    colIdx % 2 === 1
                      ? "bg-surface-container-low/40"
                      : "bg-transparent"
                  }`}
                >
                  {colIdx === activeColPosition && (
                    <div className="w-[2px] h-full bg-primary/40" />
                  )}
                </div>
              ))}
            </div>

            {/* Horizontal Baseline Tracks */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-4">
              <div className="w-full h-px bg-surface-container-high/60" />
              <div className="w-full h-px bg-surface-container-high/60" />
              <div className="w-full h-px bg-surface-container-high/60" />
              <div className="w-full h-px bg-surface-container-high/60" />
              <div className="w-full h-px bg-surface-container-high/60" />
              <div className="w-full h-px bg-surface-container-high/60" />
            </div>

            {/* Dynamic Milestone Bars rendered from actual tasks */}
            <div className="relative z-10 flex flex-col gap-5 py-2">
              {timelineTasks.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-on-surface-variant gap-2">
                  <span className="material-symbols-outlined text-[36px] text-outline">
                    event_busy
                  </span>
                  <p className="font-body-md text-body-md">
                    Ushbu haftada rejalashtirilgan vazifalar mavjud emas.
                  </p>
                </div>
              ) : (
                timelineTasks.slice(0, 6).map((task, index) => {
                  const palette =
                    TIMELINE_PALETTES[index % TIMELINE_PALETTES.length];
                  const assignee = task.assigneeId
                    ? memberMap.get(task.assigneeId)
                    : null;
                  const isSelected = selectedTask?.id === task.id;

                  const weekStart = Date.parse(
                    weekDays[0].dateStr + "T00:00:00Z",
                  );
                  const start = Math.max(
                    0,
                    (Date.parse(task.startDate + "T00:00:00Z") - weekStart) /
                      86400000,
                  );
                  const end = Math.min(
                    7,
                    (Date.parse(task.dueDate + "T00:00:00Z") - weekStart) /
                      86400000 +
                      1,
                  );

                  return (
                    <button
                      type="button"
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      style={{
                        marginLeft: `${(start / 7) * 100}%`,
                        width: `${((end - start) / 7) * 100}%`,
                      }}
                      className={`h-11 overflow-hidden rounded-full ${palette.bg} flex items-center justify-between px-3.5 text-white cursor-pointer hover:brightness-105 active:scale-[0.99] transition-all ${
                        isSelected
                          ? "ring-4 ring-primary/40 brightness-110"
                          : ""
                      }`}
                      title={`${task.title} (${task.startDate} — ${task.dueDate})`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                          <Avatar
                            name={assignee?.fullName || "TF"}
                            size="sm"
                            ring
                            colorScheme="primary"
                          />
                        </div>
                        <span className="font-label-lg text-label-lg font-semibold tracking-wide truncate">
                          {task.title}
                        </span>
                      </div>
                      <span className="material-symbols-outlined text-[18px] shrink-0">
                        chevron_right
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side Detail Deck (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-space-lg">
          {/* Card 1: Kutilayotgan vazifa (Upcoming Task) */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                Kutilayotgan vazifa
              </h2>
              <span className="material-symbols-outlined text-outline text-[20px]">
                more_horiz
              </span>
            </div>

            {selectedTask ? (
              <>
                {/* Due Date & Task Name Highlight */}
                <div className="flex items-center gap-space-md py-1">
                  <span className="font-display-md text-display-md text-on-surface font-extrabold tracking-tight">
                    {formatUzbekDate(selectedTask.dueDate, false)}
                  </span>
                  <div className="h-8 w-[3px] bg-primary rounded-full" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Tanlangan vazifa
                    </span>
                    <span className="font-headline-md text-headline-md text-on-surface font-bold truncate">
                      {selectedTask.title}
                    </span>
                  </div>
                </div>

                {/* Assignees / Qatnashchilar */}
                <div className="flex flex-col gap-1.5 pt-1">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Mas’ul xodim
                  </span>
                  <div className="flex items-center gap-2 pt-0.5">
                    {selectedTask.assigneeId &&
                    memberMap.get(selectedTask.assigneeId) ? (
                      <>
                        <Avatar
                          name={
                            memberMap.get(selectedTask.assigneeId)!.fullName
                          }
                          size="md"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                            {memberMap.get(selectedTask.assigneeId)!.fullName}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                            {memberMap.get(selectedTask.assigneeId)!.role}
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="font-body-sm text-body-sm text-outline">
                        Mas’ul tayinlanmagan
                      </span>
                    )}
                  </div>
                </div>

                {/* Interactive Workflow Checklist: Rejalashtirilgan -> Jarayonda -> Bajarilgan */}
                <div className="flex flex-col gap-space-sm pt-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Ish bosqichlari (Holatni o‘zgartirish)
                  </span>

                  {/* Stage 1: Rejalashtirilgan */}
                  <label
                    onClick={() => handleTaskStatusWorkflowChange("todo")}
                    className={`flex items-center gap-space-sm p-space-sm rounded-xl cursor-pointer transition-all ${
                      selectedTask.status === "todo" ||
                      selectedTask.status === "in_progress" ||
                      selectedTask.status === "done"
                        ? "bg-surface-container"
                        : "hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="w-5 h-5 rounded bg-primary text-on-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px] font-bold">
                        check
                      </span>
                    </div>
                    <span className="font-label-lg text-label-lg text-on-surface">
                      Rejalashtirilgan
                    </span>
                  </label>

                  {/* Stage 2: Jarayonda */}
                  <label
                    onClick={() =>
                      handleTaskStatusWorkflowChange("in_progress")
                    }
                    className={`flex items-center gap-space-sm p-space-sm rounded-xl cursor-pointer transition-all ${
                      selectedTask.status === "in_progress" ||
                      selectedTask.status === "done"
                        ? "bg-surface-container"
                        : "hover:bg-surface-container-low"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                        selectedTask.status === "in_progress" ||
                        selectedTask.status === "done"
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high"
                      }`}
                    >
                      {(selectedTask.status === "in_progress" ||
                        selectedTask.status === "done") && (
                        <span className="material-symbols-outlined text-[16px] font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <span className="font-label-lg text-label-lg text-on-surface">
                      Jarayonda
                    </span>
                  </label>

                  {/* Stage 3: Bajarilgan */}
                  <label
                    onClick={() => handleTaskStatusWorkflowChange("done")}
                    className={`flex items-center gap-space-sm p-space-sm rounded-xl cursor-pointer transition-all ${
                      selectedTask.status === "done"
                        ? "bg-surface-container"
                        : "hover:bg-surface-container-low"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                        selectedTask.status === "done"
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-high"
                      }`}
                    >
                      {selectedTask.status === "done" && (
                        <span className="material-symbols-outlined text-[16px] font-bold">
                          check
                        </span>
                      )}
                    </div>
                    <span className="font-label-lg text-label-lg text-on-surface">
                      Bajarilgan
                    </span>
                  </label>

                  {updatingStatus && (
                    <span className="font-label-sm text-[11px] text-primary animate-pulse">
                      Holat saqlanmoqda...
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Vazifa mavjud emas
              </p>
            )}
          </div>

          {/* Card 2: Loyiha holati (Project Status) */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex flex-col gap-space-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
              Loyiha holati
            </h2>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-display-lg text-display-lg font-bold text-primary">
                {projectDoneTasks}
              </span>
              <span className="font-display-md text-display-md font-semibold text-outline-variant">
                /{projectTotalTasks}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              Bajarilish: {projectProgress}%
            </span>
            {/* Progress Track Bar */}
            <div className="w-full flex items-center gap-space-sm mt-2">
              <div className="flex-1 h-3 rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${projectProgress}%` }}
                />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                {projectProgress}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metric Summary Row (4 Horizontal Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
        {/* Stat 1: Jami loyiha */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-2xl bg-surface-container text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              layers
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Jami loyiha
            </span>
            <span className="font-display-md text-display-md font-bold text-on-surface">
              {totalProjects}
            </span>
          </div>
        </div>

        {/* Stat 2: Vazifalar */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              check_box
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Vazifalar
            </span>
            <span className="font-display-md text-display-md font-bold text-on-surface">
              {totalTasks}
            </span>
          </div>
        </div>

        {/* Stat 3: Bajarilgan */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">check</span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Bajarilgan
            </span>
            <span className="font-display-md text-display-md font-bold text-on-surface">
              {completedTasks}
            </span>
          </div>
        </div>

        {/* Stat 4: Kechikkan */}
        <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              schedule
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Kechikkan
            </span>
            <span className="font-display-md text-display-md font-bold text-on-surface">
              {overdueTasks}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
