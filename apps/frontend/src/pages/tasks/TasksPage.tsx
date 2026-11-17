import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Task,
  Project,
  Member,
  TaskInputDTO,
  TaskPriority,
  TaskStatus,
} from "../../types";
import { tasksService } from "../../services/tasks";
import { projectsService } from "../../services/projects";
import { membersService } from "../../services/members";
import { usePermissions } from "../../hooks/usePermissions";
import { formatUzbekDate, getTodayDateString } from "../../utils/date";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Avatar } from "../../components/ui/Avatar";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Button } from "../../components/ui/Button";
import { RequestState } from "../../components/ui/RequestState";

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & URL project filtering
  const [searchParams, setSearchParams] = useSearchParams();
  const urlProjectId = searchParams.get("projectId") || "";
  const [selectedProjectId, setSelectedProjectId] =
    useState<string>(urlProjectId);
  const [searchQuery, setSearchQuery] = useState("");

  // Task Modal (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formProjectId, setFormProjectId] = useState("");
  const [formAssigneeId, setFormAssigneeId] = useState<string | null>(null);
  const [formStartDate, setFormStartDate] = useState(getTodayDateString());
  const [formDueDate, setFormDueDate] = useState(getTodayDateString());
  const [formPriority, setFormPriority] = useState<TaskPriority>("medium");
  const [formStatus, setFormStatus] = useState<TaskStatus>("todo");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    user,
    isManager,
    isMember,
    canCreateTask,
    canDeleteTask,
    canEditTask,
  } = usePermissions();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pList, mList, tList] = await Promise.all([
        projectsService.getProjects(),
        membersService.getMembers(),
        tasksService.getTasks(),
      ]);
      setProjects(pList);
      setMembers(mList);
      setTasks(tList);
      if (urlProjectId && !formProjectId) {
        setFormProjectId(urlProjectId);
      } else if (pList.length > 0 && !formProjectId) {
        setFormProjectId(pList[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Vazifalarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSelectedProjectId(urlProjectId);
  }, [urlProjectId]);

  const handleProjectFilterChange = (id: string) => {
    setSelectedProjectId(id);
    if (id) {
      setSearchParams({ projectId: id });
    } else {
      setSearchParams({});
    }
  };

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

  // Filter tasks by selected project and search query
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesProject =
        !selectedProjectId || t.projectId === selectedProjectId;
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProject && matchesSearch;
    });
  }, [tasks, selectedProjectId, searchQuery]);

  // Columns for Kanban
  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const inProgressTasks = filteredTasks.filter(
    (t) => t.status === "in_progress",
  );
  const doneTasks = filteredTasks.filter((t) => t.status === "done");

  // Quick ribbon counts
  const totalInFilter = filteredTasks.length;
  const inProgressCount = inProgressTasks.length;
  const doneCount = doneTasks.length;

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormTitle("");
    setFormDesc("");
    setFormProjectId(selectedProjectId || (projects[0] ? projects[0].id : ""));
    // If user is a member, assign to themselves automatically
    setFormAssigneeId(isMember ? user?.memberId || null : null);
    setFormStartDate(getTodayDateString());
    setFormDueDate(getTodayDateString());
    setFormPriority("medium");
    setFormStatus("todo");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormProjectId(task.projectId);
    setFormAssigneeId(task.assigneeId);
    setFormStartDate(task.startDate);
    setFormDueDate(task.dueDate);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (!canEditTask(task)) {
      alert(
        "Siz faqat o‘zingizga biriktirilgan vazifalar holatini o‘zgartirishingiz mumkin.",
      );
      return;
    }
    try {
      await tasksService.updateTask(task.id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)),
      );
    } catch (err: any) {
      alert(err.message || "Holatni yangilashda xatolik yuz berdi");
    }
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError("Vazifa nomini kiriting");
      return;
    }
    if (!formProjectId) {
      setFormError("Loyihani tanlang");
      return;
    }
    if (!formStartDate || !formDueDate) {
      setFormError("Boshlanish va tugash sanasini kiriting");
      return;
    }
    if (formStartDate > formDueDate) {
      setFormError(
        "Boshlanish sanasi tugash sanasidan keyin bo‘lishi mumkin emas",
      );
      return;
    }

    // Member constraint: cannot assign to others
    let targetAssignee = formAssigneeId;
    if (isMember) {
      targetAssignee = user?.memberId || null;
    }

    const dto: TaskInputDTO = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      projectId: formProjectId,
      assigneeId: targetAssignee || null,
      startDate: formStartDate,
      dueDate: formDueDate,
      priority: formPriority,
      status: formStatus,
    };

    setSubmitting(true);
    try {
      if (editingTask) {
        await tasksService.updateTask(editingTask.id, dto);
      } else {
        await tasksService.createTask(dto);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Vazifani saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTaskId) return;
    setDeleting(true);
    try {
      await tasksService.deleteTask(deleteTaskId);
      setDeleteTaskId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Vazifani o‘chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <RequestState loading={loading} error={error} onRetry={loadData} />
      {/* Top Header Area with Filters & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)]">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Vazifalar
            </h1>
            <span className="px-space-sm py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-primary font-semibold">
              {totalInFilter} ta vazifa
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Loyihalar bo‘yicha vazifalarni boshqarish va taqsimlash
          </p>
        </div>

        <div className="flex min-w-0 max-w-full items-center gap-space-sm flex-wrap">
          {/* Project Selector Pill Dropdown */}
          <div className="relative inline-flex min-w-0 max-w-full items-center bg-surface-container-low hover:bg-surface-container transition-colors rounded-xl px-space-md py-space-sm gap-space-sm shadow-sm">
            <span className="material-symbols-outlined text-[18px] text-primary">
              folder_open
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="font-label-sm text-[10px] text-on-surface-variant uppercase font-semibold">
                Loyiha
              </span>
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectFilterChange(e.target.value)}
                className="min-w-0 max-w-full bg-transparent font-label-lg text-label-lg text-on-surface font-semibold outline-none cursor-pointer pr-4 appearance-none"
              >
                <option value="">Barcha loyihalar</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px] ml-space-xs pointer-events-none">
              expand_more
            </span>
          </div>

          {/* Quick Search Bar */}
          <div className="flex items-center bg-surface-container-low rounded-xl px-space-md py-space-sm gap-space-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidirish..."
              className="bg-transparent font-body-sm text-body-sm text-on-surface focus:outline-none w-28 lg:w-40 placeholder:text-outline"
            />
          </div>

          {/* Primary Action: + Yangi vazifa */}
          {canCreateTask && (
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-space-xs bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg px-space-lg py-space-md rounded-xl transition-all shadow-[0_8px_18px_-4px_rgba(105,69,255,0.4)] active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>Yangi vazifa</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Quick Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-[0_4px_12px_rgba(17,21,45,0.02)] flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">
                assignment_late
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Kutayotgan ishlar
              </span>
              <p className="font-headline-md text-headline-md text-on-surface">
                {todoTasks.length} ta vazifa
              </p>
            </div>
          </div>
          <span className="font-label-sm text-label-sm text-secondary bg-surface-container px-space-sm py-1 rounded-full font-medium">
            Rejada
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-[0_4px_12px_rgba(17,21,45,0.02)] flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-fixed-dim">
              <span className="material-symbols-outlined text-[20px]">
                timelapse
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Jarayon tezligi
              </span>
              <p className="font-headline-md text-headline-md text-on-surface">
                {inProgressCount} ta faol
              </p>
            </div>
          </div>
          <span className="font-label-sm text-label-sm text-primary font-semibold bg-surface-container-high px-space-sm py-1 rounded-full">
            Faol ish
          </span>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-[0_4px_12px_rgba(17,21,45,0.02)] flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-[20px]">
                verified
              </span>
            </div>
            <div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Yakunlanganlar
              </span>
              <p className="font-headline-md text-headline-md text-on-surface">
                {doneCount} ta tayyor
              </p>
            </div>
          </div>
          <span className="font-label-sm text-label-sm text-tertiary font-semibold bg-tertiary-fixed/30 px-space-sm py-1 rounded-full">
            Tayyor
          </span>
        </div>
      </div>

      {/* 3-Column Kanban Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-start">
        {/* Column 1: Rejalashtirilgan */}
        <KanbanColumn
          title="Rejalashtirilgan"
          dotClass="bg-secondary"
          tasks={todoTasks}
          memberMap={memberMap}
          projectMap={projectMap}
          canEditTask={canEditTask}
          canDeleteTask={canDeleteTask}
          onStatusChange={handleStatusChange}
          onEdit={handleOpenEditModal}
          onDelete={(id) => setDeleteTaskId(id)}
        />

        {/* Column 2: Jarayonda */}
        <KanbanColumn
          title="Jarayonda"
          dotClass="bg-primary"
          tasks={inProgressTasks}
          memberMap={memberMap}
          projectMap={projectMap}
          canEditTask={canEditTask}
          canDeleteTask={canDeleteTask}
          onStatusChange={handleStatusChange}
          onEdit={handleOpenEditModal}
          onDelete={(id) => setDeleteTaskId(id)}
        />

        {/* Column 3: Bajarilgan */}
        <KanbanColumn
          title="Bajarilgan"
          dotClass="bg-tertiary"
          tasks={doneTasks}
          memberMap={memberMap}
          projectMap={projectMap}
          canEditTask={canEditTask}
          canDeleteTask={canDeleteTask}
          onStatusChange={handleStatusChange}
          onEdit={handleOpenEditModal}
          onDelete={(id) => setDeleteTaskId(id)}
        />
      </div>

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? "Vazifani tahrirlash" : "Yangi vazifa qo‘shish"}
        description="Loyiha rejasiga yangi topshiriq va mas'ul a'zoni biriktiring"
      >
        <form
          onSubmit={handleSubmitModal}
          className="flex flex-col gap-space-md"
        >
          {formError && (
            <div className="p-3 rounded-xl bg-error-container text-error text-label-md flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              <span>{formError}</span>
            </div>
          )}

          {/* Vazifa nomi */}
          <div className="flex flex-col gap-space-xs">
            <label
              htmlFor="taskTitle"
              className="font-label-lg text-label-lg text-on-surface"
            >
              Vazifa nomi *
            </label>
            <input
              id="taskTitle"
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Masalan: Bosh sahifa prototipini tasdiqlash"
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
            />
          </div>

          {/* Tavsif */}
          <div className="flex flex-col gap-space-xs">
            <label
              htmlFor="taskDesc"
              className="font-label-lg text-label-lg text-on-surface"
            >
              Tavsif
            </label>
            <textarea
              id="taskDesc"
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Vazifa haqida batafsil ma'lumot va kutilayotgan natijalar..."
              className="w-full bg-surface-container-low focus:bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all resize-none"
            />
          </div>

          {/* Row: Loyiha & Mas'ul */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <label
                htmlFor="taskProject"
                className="font-label-lg text-label-lg text-on-surface"
              >
                Loyiha *
              </label>
              <div className="relative">
                <select
                  id="taskProject"
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-xl appearance-none outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer pr-10"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-outline absolute right-3 top-2.5 pointer-events-none text-[18px]">
                  unfold_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <label
                htmlFor="taskAssignee"
                className="font-label-lg text-label-lg text-on-surface"
              >
                Mas’ul shaxs
              </label>
              <div className="relative">
                <select
                  id="taskAssignee"
                  value={formAssigneeId || ""}
                  disabled={!isManager}
                  onChange={(e) => setFormAssigneeId(e.target.value || null)}
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-xl appearance-none outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer pr-10 disabled:opacity-75"
                >
                  <option value="">Tayinlanmagan</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.role})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-outline absolute right-3 top-2.5 pointer-events-none text-[18px]">
                  unfold_more
                </span>
              </div>
              {!isManager && (
                <span className="font-label-sm text-[11px] text-outline">
                  A’zo faqat o‘ziga biriktirilgan vazifani boshqara oladi
                </span>
              )}
            </div>
          </div>

          {/* Row: Boshlanish va Tugash sanasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <label
                htmlFor="taskStartDate"
                className="font-label-lg text-label-lg text-on-surface"
              >
                Boshlanish sanasi *
              </label>
              <input
                id="taskStartDate"
                type="date"
                required
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-space-xs">
              <label
                htmlFor="taskDueDate"
                className="font-label-lg text-label-lg text-on-surface"
              >
                Tugash sanasi *
              </label>
              <input
                id="taskDueDate"
                type="date"
                required
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
          </div>

          {/* Row: Ustuvorlik & Holat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <label
                htmlFor="taskPriority"
                className="font-label-lg text-label-lg text-on-surface"
              >
                Ustuvorlik
              </label>
              <div className="relative">
                <select
                  id="taskPriority"
                  value={formPriority}
                  onChange={(e) =>
                    setFormPriority(e.target.value as TaskPriority)
                  }
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-xl appearance-none outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer pr-10"
                >
                  <option value="low">Past</option>
                  <option value="medium">O‘rta</option>
                  <option value="high">Yuqori</option>
                </select>
                <span className="material-symbols-outlined text-outline absolute right-3 top-2.5 pointer-events-none text-[18px]">
                  unfold_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <label
                htmlFor="taskStatus"
                className="font-label-lg text-label-lg text-on-surface"
              >
                Holat
              </label>
              <div className="relative">
                <select
                  id="taskStatus"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TaskStatus)}
                  className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md px-space-md py-space-sm rounded-xl appearance-none outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer pr-10"
                >
                  <option value="todo">Rejalashtirilgan</option>
                  <option value="in_progress">Jarayonda</option>
                  <option value="done">Bajarilgan</option>
                </select>
                <span className="material-symbols-outlined text-outline absolute right-3 top-2.5 pointer-events-none text-[18px]">
                  unfold_more
                </span>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-space-sm pt-space-md">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-space-lg py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Bekor qilish
            </button>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon="check"
            >
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTaskId)}
        onClose={() => setDeleteTaskId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Vazifani o‘chirish"
        message="Haqiqatan ham ushbu vazifani o‘chirmoqchimisiz?"
      />
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  dotClass: string;
  tasks: Task[];
  memberMap: Map<string, Member>;
  projectMap: Map<string, Project>;
  canEditTask: (task: Task) => boolean;
  canDeleteTask: boolean;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  dotClass,
  tasks,
  memberMap,
  projectMap,
  canEditTask,
  canDeleteTask,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex flex-col gap-space-md bg-surface-container-low/60 p-space-md rounded-2xl min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between px-space-xs py-space-xs">
        <div className="flex items-center gap-space-sm">
          <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
          <h2 className="font-headline-md text-headline-md text-on-surface">
            {title}
          </h2>
          <span className="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center font-label-sm text-label-sm font-semibold">
            {tasks.length}
          </span>
        </div>
        <span className="material-symbols-outlined text-[18px] text-outline">
          drag_indicator
        </span>
      </div>

      {/* Column Cards */}
      <div className="flex flex-col gap-space-md">
        {tasks.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-outline-variant text-center text-on-surface-variant font-body-sm text-body-sm">
            Vazifalar yo‘q
          </div>
        ) : (
          tasks.map((task) => {
            const assignee = task.assigneeId
              ? memberMap.get(task.assigneeId)
              : null;
            const project = projectMap.get(task.projectId);
            const editable = canEditTask(task);

            return (
              <div
                key={task.id}
                className="bg-surface-container-lowest p-space-lg rounded-xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.03),0_4px_12px_0_rgba(17,21,45,0.02)] hover:shadow-md transition-all flex flex-col gap-space-md group"
              >
                {/* Header row: Project tag & Priority badge & actions */}
                <div className="flex items-start justify-between gap-space-sm">
                  <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-[11px] font-semibold truncate max-w-[140px]">
                    {project ? project.name : "Loyiha"}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <StatusBadge
                      type={
                        task.priority === "high"
                          ? "priority-high"
                          : task.priority === "medium"
                            ? "priority-medium"
                            : "priority-low"
                      }
                    />
                    {editable && (
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors"
                        title="Tahrirlash"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          edit
                        </span>
                      </button>
                    )}
                    {canDeleteTask && (
                      <button
                        onClick={() => onDelete(task.id)}
                        className="p-1 rounded text-outline hover:text-error hover:bg-error-container transition-colors"
                        title="O'chirish"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <div className="flex flex-col gap-space-xs">
                  <h3 className="font-label-lg text-label-lg text-on-surface group-hover:text-primary transition-colors">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Metadata & Assignee */}
                <div className="flex items-center justify-between pt-space-xs border-t border-surface-container-high/30">
                  <div className="flex items-center gap-space-xs">
                    <Avatar
                      name={assignee?.fullName || "TF"}
                      size="xs"
                      colorScheme="secondary"
                    />
                    <span className="font-label-sm text-label-sm text-on-surface font-medium truncate max-w-[100px]">
                      {assignee?.fullName || "Tayinlanmagan"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[15px] text-outline">
                      calendar_today
                    </span>
                    <span>{formatUzbekDate(task.dueDate, false)}</span>
                  </div>
                </div>

                {/* Status Dropdown Bar */}
                <div className="pt-space-xs">
                  <div className="relative w-full">
                    <select
                      value={task.status}
                      disabled={!editable}
                      onChange={(e) =>
                        onStatusChange(task, e.target.value as TaskStatus)
                      }
                      className="w-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-label-sm text-label-sm py-1.5 px-space-sm rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-colors disabled:cursor-not-allowed"
                    >
                      <option value="todo">Rejalashtirilgan ▾</option>
                      <option value="in_progress">Jarayonda ▾</option>
                      <option value="done">Bajarilgan ▾</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
