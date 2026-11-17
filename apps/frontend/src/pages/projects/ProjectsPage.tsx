import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Project, Task, ProjectInputDTO } from "../../types";
import { projectsService } from "../../services/projects";
import { tasksService } from "../../services/tasks";
import { usePermissions } from "../../hooks/usePermissions";
import { formatUzbekDate, getTodayDateString } from "../../utils/date";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Button } from "../../components/ui/Button";
import { RequestState } from "../../components/ui/RequestState";

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "in_progress" | "done"
  >("all");

  // Modal Create/Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formStartDate, setFormStartDate] = useState(getTodayDateString());
  const [formDueDate, setFormDueDate] = useState(getTodayDateString());
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { canCreateProject, canEditProject, canDeleteProject } =
    usePermissions();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projList, taskList] = await Promise.all([
        projectsService.getProjects(),
        tasksService.getTasks(),
      ]);
      setProjects(projList);
      setTasks(taskList);
    } catch (err: any) {
      setError(err.message || "Loyihalarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === "all") return true;
      if (statusFilter === "in_progress")
        return p.status === "in_progress" || p.status === "planned";
      if (statusFilter === "done") return p.status === "done";
      return true;
    });
  }, [projects, searchQuery, statusFilter]);

  // Project KPI metrics
  const activeCount = projects.filter((p) => p.status === "in_progress").length;
  const plannedCount = projects.filter((p) => p.status === "planned").length;
  const doneCount = projects.filter((p) => p.status === "done").length;

  const getProjectTaskCounts = (projectId: string) => {
    const pTasks = tasks.filter((t) => t.projectId === projectId);
    const done = pTasks.filter((t) => t.status === "done").length;
    return { total: pTasks.length, done };
  };

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormName("");
    setFormDesc("");
    setFormStartDate(getTodayDateString());
    setFormDueDate(getTodayDateString());
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project: Project) => {
    setEditingProject(project);
    setFormName(project.name);
    setFormDesc(project.description);
    setFormStartDate(project.startDate);
    setFormDueDate(project.dueDate);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim()) {
      setFormError("Loyiha nomini kiriting");
      return;
    }
    if (!formStartDate || !formDueDate) {
      setFormError("Boshlanish va tugash sanasini tanlang");
      return;
    }
    if (formStartDate > formDueDate) {
      setFormError(
        "Boshlanish sanasi tugash sanasidan keyin bo‘lishi mumkin emas",
      );
      return;
    }

    const dto: ProjectInputDTO = {
      name: formName.trim(),
      description: formDesc.trim(),
      startDate: formStartDate,
      dueDate: formDueDate,
    };

    setSubmitting(true);
    try {
      if (editingProject) {
        await projectsService.updateProject(editingProject.id, dto);
      } else {
        await projectsService.createProject(dto);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Loyihani saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await projectsService.deleteProject(deleteConfirmId);
      setDeleteConfirmId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Loyihani o‘chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <RequestState loading={loading} error={error} onRetry={loadData} />
      {/* Top Control Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            Loyihalar
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Faol va rejalashtirilgan jamoa loyihalari
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Loyiha qidirish..."
              className="pl-9 pr-4 py-2 rounded-xl bg-surface-container-lowest text-on-surface font-body-sm text-body-sm shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] focus:outline-none focus:ring-2 focus:ring-primary/20 w-52 sm:w-64 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-surface-container-lowest rounded-xl p-1 shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)]">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all ${
                statusFilter === "all"
                  ? "bg-surface-container text-primary font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all ${
                statusFilter === "in_progress"
                  ? "bg-surface-container text-primary font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Faol
            </button>
            <button
              onClick={() => setStatusFilter("done")}
              className={`px-space-sm py-1 rounded-lg font-label-md text-label-md transition-all ${
                statusFilter === "done"
                  ? "bg-surface-container text-primary font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Yopilgan
            </button>
          </div>

          {/* Action CTA: Yangi loyiha */}
          {canCreateProject && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-space-md py-2.5 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg shadow-[0_8px_18px_-4px_rgba(105,69,255,0.38)] active:scale-95 transition-all duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[19px]">add</span>
              <span>Yangi loyiha</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-xl">
        <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-11 h-11 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">
              layers
            </span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Jami loyihalar
            </p>
            <p className="font-headline-md text-headline-md text-on-surface font-bold">
              {projects.length} ta
            </p>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary-container">
            <span className="material-symbols-outlined text-[22px]">bolt</span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Hozirda faol
            </p>
            <p className="font-headline-md text-headline-md text-on-surface font-bold">
              {activeCount} ta
            </p>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-11 h-11 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[22px]">
              pending_actions
            </span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Rejalashtirilgan
            </p>
            <p className="font-headline-md text-headline-md text-on-surface font-bold">
              {plannedCount} ta
            </p>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-lowest rounded-2xl shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-11 h-11 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined text-[22px]">
              verified
            </span>
          </div>
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Yakunlangan
            </p>
            <p className="font-headline-md text-headline-md text-on-surface font-bold">
              {doneCount} ta
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Card Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-surface-container-lowest p-12 rounded-2xl text-center flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-outline">
            folder_off
          </span>
          <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
            Hech qanday loyiha topilmadi
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Qidiruv so‘zini o‘zgartirib ko‘ring yoki yangi loyiha yarating.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-xl">
          {filteredProjects.map((project) => {
            const counts = getProjectTaskCounts(project.id);
            const isDone = project.status === "done";
            const isPlanned = project.status === "planned";

            return (
              <div
                key={project.id}
                className="group relative bg-surface-container-lowest p-space-xl rounded-[24px] shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] hover:shadow-[0_20px_40px_-10px_rgba(105,69,255,0.1)] transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Status pill & Edit/Delete actions */}
                  <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                    <div className="flex items-center gap-space-sm">
                      {isDone ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full font-label-md text-label-md font-semibold bg-tertiary-fixed text-on-tertiary-fixed-variant shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5" />
                          Yakunlangan
                        </span>
                      ) : isPlanned ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full font-label-md text-label-md font-semibold bg-surface-container text-secondary shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-1.5" />
                          Rejada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full font-label-md text-label-md font-semibold bg-tertiary-fixed text-on-tertiary-fixed-variant shadow-[0_4px_12px_rgba(74,225,118,0.25)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary mr-1.5 animate-pulse" />
                          Faol
                        </span>
                      )}
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                        #{project.id.slice(0, 8)}
                      </span>
                    </div>

                    {/* Permissions aware edit/delete buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {canEditProject && (
                        <button
                          onClick={() => handleOpenEditModal(project)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all"
                          title="Tahrirlash"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            edit
                          </span>
                        </button>
                      )}
                      {canDeleteProject && (
                        <button
                          onClick={() => setDeleteConfirmId(project.id)}
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container transition-all"
                          title="O'chirish"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-[19px]">
                            delete
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2 font-bold group-hover:text-primary transition-colors">
                    {project.name}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-space-lg leading-relaxed">
                    {project.description || "Tavsif berilmagan"}
                  </p>

                  {/* Progress Metrics */}
                  <div className="p-space-md rounded-2xl bg-surface-container-low mb-space-lg">
                    <div className="flex items-center justify-between font-label-md text-label-md mb-2">
                      <span className="text-on-surface font-semibold">
                        Jarayon ko‘rsatkichi
                      </span>
                      <span className="text-primary font-bold">
                        {project.progress}% bajarildi{" "}
                        <span className="text-on-surface-variant font-normal text-label-sm">
                          ({counts.done}/{counts.total} vazifa)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Row: Dates & Link to Tasks */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-space-xs border-t border-surface-container-high/40">
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[17px] text-outline">
                      calendar_today
                    </span>
                    <span>
                      {formatUzbekDate(project.startDate, false)} —{" "}
                      {formatUzbekDate(project.dueDate)}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/tasks?projectId=${project.id}`)}
                    className="flex items-center gap-1 text-primary hover:text-primary-container font-label-md text-label-md font-semibold transition-colors group-hover:translate-x-1 duration-200"
                    type="button"
                  >
                    <span>Vazifalar</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? "Loyihani tahrirlash" : "Yangi loyiha yaratish"}
        description="Loyiha rejasining asosiy parametrlarini kiriting"
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

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="projectName"
              className="font-label-md text-label-md text-on-surface font-semibold"
            >
              Loyiha nomi *
            </label>
            <input
              id="projectName"
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Masalan, B2B Dashboard integratsiyasi"
              className="px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-outline transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="projectDesc"
              className="font-label-md text-label-md text-on-surface font-semibold"
            >
              Tavsif
            </label>
            <textarea
              id="projectDesc"
              rows={3}
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Loyiha maqsadi, kutilayotgan natijalar va qisqacha mazmun..."
              className="px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/25 placeholder:text-outline transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="startDate"
                className="font-label-md text-label-md text-on-surface font-semibold"
              >
                Boshlanish sanasi *
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="dueDate"
                className="font-label-md text-label-md text-on-surface font-semibold"
              >
                Tugash sanasi *
              </label>
              <input
                id="dueDate"
                type="date"
                required
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="w-full px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-space-sm mt-space-sm pt-space-sm">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-space-lg py-2.5 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-label-lg text-label-lg transition-all"
            >
              Bekor qilish
            </button>
            <Button
              type="submit"
              variant="primary-container"
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
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Loyihani o‘chirish"
        message="Haqiqatan ham ushbu loyihani o‘chirmoqchimisiz? Ushbu loyihaga biriktirilgan barcha vazifalar va risklar ham o‘chiriladi."
      />
    </div>
  );
};
