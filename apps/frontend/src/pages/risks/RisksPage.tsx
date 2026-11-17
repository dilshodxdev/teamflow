import React, { useState, useEffect, useMemo } from "react";
import { RequestState } from "../../components/ui/RequestState";
import { Risk, Project, Member, RiskInputDTO, RiskStatus } from "../../types";
import { risksService } from "../../services/risks";
import { projectsService } from "../../services/projects";
import { membersService } from "../../services/members";
import { usePermissions } from "../../hooks/usePermissions";
import { calculateRiskLevel } from "../../utils/formatters";
import { Avatar } from "../../components/ui/Avatar";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Button } from "../../components/ui/Button";

export const RisksPage: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formProjectId, setFormProjectId] = useState("");
  const [formAssigneeId, setFormAssigneeId] = useState<string | null>(null);
  const [formProb, setFormProb] = useState<number>(3);
  const [formImpact, setFormImpact] = useState<number>(3);
  const [formMitigation, setFormMitigation] = useState("");
  const [formStatus, setFormStatus] = useState<RiskStatus>("active");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm
  const [deleteRiskId, setDeleteRiskId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { canCreateRisk, canEditRisk, canDeleteRisk } = usePermissions();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rList, pList, mList] = await Promise.all([
        risksService.getRisks(),
        projectsService.getProjects(),
        membersService.getMembers(),
      ]);
      setRisks(rList);
      setProjects(pList);
      setMembers(mList);
      if (pList.length > 0 && !formProjectId) {
        setFormProjectId(pList[0].id);
      }
    } catch (err: any) {
      setError(err.message || "Risklarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  const memberMap = useMemo(() => {
    const map = new Map<string, Member>();
    members.forEach((m) => map.set(m.id, m));
    return map;
  }, [members]);

  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      const matchesProject =
        !selectedProjectId || r.projectId === selectedProjectId;
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.mitigation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesProject && matchesSearch;
    });
  }, [risks, selectedProjectId, searchQuery]);

  // Insight counts
  const highRisks = filteredRisks.filter((r) => r.level === "high").length;
  const mediumRisks = filteredRisks.filter((r) => r.level === "medium").length;
  const lowRisks = filteredRisks.filter((r) => r.level === "low").length;

  // Live modal score calculation
  const calculatedModalScore = formProb * formImpact;
  const calculatedModalLevel = calculateRiskLevel(calculatedModalScore);

  const handleOpenCreateModal = () => {
    setEditingRisk(null);
    setFormTitle("");
    setFormProjectId(selectedProjectId || (projects[0] ? projects[0].id : ""));
    setFormAssigneeId(members[0] ? members[0].id : null);
    setFormProb(3);
    setFormImpact(3);
    setFormMitigation("");
    setFormStatus("active");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (risk: Risk) => {
    setEditingRisk(risk);
    setFormTitle(risk.title);
    setFormProjectId(risk.projectId);
    setFormAssigneeId(risk.assigneeId);
    setFormProb(risk.probability);
    setFormImpact(risk.impact);
    setFormMitigation(risk.mitigation);
    setFormStatus(risk.status);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError("Risk nomini kiriting");
      return;
    }
    if (!formProjectId) {
      setFormError("Loyihani tanlang");
      return;
    }

    const dto: RiskInputDTO = {
      title: formTitle.trim(),
      projectId: formProjectId,
      assigneeId: formAssigneeId || null,
      probability: formProb,
      impact: formImpact,
      mitigation: formMitigation.trim(),
      status: formStatus,
    };

    setSubmitting(true);
    try {
      if (editingRisk) {
        await risksService.updateRisk(editingRisk.id, dto);
      } else {
        await risksService.createRisk(dto);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Riskni saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteRiskId) return;
    setDeleting(true);
    try {
      await risksService.deleteRisk(deleteRiskId);
      setDeleteRiskId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Riskni o‘chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-space-lg">
      <RequestState loading={loading} error={error} onRetry={loadData} />
      {/* Header Context & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-[22px] shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)]">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-sm">
            <span className="p-2 rounded-xl bg-surface-container text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">
                warning
              </span>
            </span>
            <h1 className="font-display-md text-display-md text-on-surface tracking-tight">
              Risklar
            </h1>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant pl-1">
            Loyihalar xavf-xatarlari va bartaraf etish rejalari
          </p>
        </div>

        <div className="flex items-center gap-space-md self-start md:self-auto flex-wrap">
          {/* Project filter dropdown */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-surface-container-low px-4 py-2 rounded-xl text-on-surface font-body-sm text-body-sm outline-none cursor-pointer pr-8 appearance-none"
            >
              <option value="">Barcha loyihalar</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-outline text-[16px] absolute right-2.5 top-2.5 pointer-events-none">
              expand_more
            </span>
          </div>

          {canCreateRisk && (
            <button
              onClick={handleOpenCreateModal}
              className="group flex items-center gap-space-xs px-space-lg py-space-sm rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-[0_8px_20px_-4px_rgba(105,69,255,0.45)] hover:shadow-[0_12px_24px_-4px_rgba(105,69,255,0.6)] hover:bg-primary transition-all duration-200 active:scale-95 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover:rotate-90">
                add
              </span>
              <span>Yangi risk</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Metric Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-gutter">
        {/* Yuqori Risklar */}
        <div className="flex items-center justify-between p-space-lg bg-surface-container-lowest rounded-[22px] shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] transition-all hover:-translate-y-0.5">
          <div className="flex flex-col gap-1">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Kritik xavf
            </span>
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Yuqori risklar
            </span>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span className="font-display-lg text-display-lg text-error font-extrabold">
                {highRisks}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                ta loyihada
              </span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-error-container text-error flex items-center justify-center shadow-[0_8px_18px_-4px_rgba(186,26,26,0.25)]">
            <span className="material-symbols-outlined text-[28px]">error</span>
          </div>
        </div>

        {/* O'rta Risklar */}
        <div className="flex items-center justify-between p-space-lg bg-surface-container-lowest rounded-[22px] shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] transition-all hover:-translate-y-0.5">
          <div className="flex flex-col gap-1">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Nazorat talab
            </span>
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              O‘rta risklar
            </span>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span className="font-display-lg text-display-lg text-secondary font-extrabold">
                {mediumRisks}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                ta ehtimoliy
              </span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-on-secondary-fixed-variant flex items-center justify-center shadow-[0_8px_18px_-4px_rgba(166,127,253,0.35)]">
            <span className="material-symbols-outlined text-[28px]">
              warning_amber
            </span>
          </div>
        </div>

        {/* Past Risklar */}
        <div className="flex items-center justify-between p-space-lg bg-surface-container-lowest rounded-[22px] shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] transition-all hover:-translate-y-0.5">
          <div className="flex flex-col gap-1">
            <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Minimal xavf
            </span>
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              Past risklar
            </span>
            <div className="flex items-baseline gap-space-xs mt-1">
              <span className="font-display-lg text-display-lg text-tertiary font-extrabold">
                {lowRisks}
              </span>
              <span className="font-body-md text-body-md text-on-surface-variant">
                ta rejalashtirilgan
              </span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed-variant flex items-center justify-center shadow-[0_8px_18px_-4px_rgba(74,225,118,0.35)]">
            <span className="material-symbols-outlined text-[28px]">
              task_alt
            </span>
          </div>
        </div>
      </div>

      {/* Risk Matrix Visual Ribbon */}
      <div className="bg-surface-container-lowest p-space-lg rounded-[22px] shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
            Matritsa ko‘rsatkichi
          </span>
          <span className="font-headline-md text-headline-md text-on-surface font-bold">
            Ballar shkalasi (Ehtimollik × Ta’sir)
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-space-md">
          <div className="flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed-dim" />
            <span className="font-label-md text-label-md text-on-surface">
              1–5: Past ball
            </span>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-container" />
            <span className="font-label-md text-label-md text-on-surface">
              6–12: O‘rta ball
            </span>
          </div>
          <div className="flex items-center gap-space-xs bg-surface-container-low px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-error" />
            <span className="font-label-md text-label-md text-on-surface">
              13–25: Yuqori ball
            </span>
          </div>
        </div>
      </div>

      {/* Main Content — Clean Risk Register Table */}
      <div className="bg-surface-container-lowest rounded-[24px] shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] overflow-hidden">
        {/* Table Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-lg gap-space-sm bg-surface-container-lowest border-b border-surface-container-high/40">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              Ro‘yxatdagi risklar
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container font-label-md text-label-md text-primary font-semibold">
              {filteredRisks.length} ta yozuv
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Qidiruv..."
                className="bg-surface-container-low text-on-surface placeholder:text-outline text-body-sm font-body-sm rounded-xl pl-9 pr-3 py-2 outline-none focus:bg-surface-container transition-all w-48 sm:w-60"
              />
            </div>
          </div>
        </div>

        {/* Table Canvas */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left min-w-[840px]">
            <thead>
              <tr className="bg-surface-container-low/70 text-on-surface-variant font-label-lg text-label-lg">
                <th className="py-space-md px-space-lg font-semibold">
                  Risk nomi
                </th>
                <th className="py-space-md px-space-md font-semibold">
                  Loyiha
                </th>
                <th className="py-space-md px-space-sm text-center font-semibold">
                  Ehtimollik
                </th>
                <th className="py-space-md px-space-sm text-center font-semibold">
                  Ta’sir
                </th>
                <th className="py-space-md px-space-md font-semibold">
                  Risk darajasi
                </th>
                <th className="py-space-md px-space-md font-semibold">
                  Mas’ul
                </th>
                <th className="py-space-md px-space-md font-semibold">Holat</th>
                <th className="py-space-md px-space-lg text-right font-semibold">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/30 font-body-md text-body-md text-on-surface">
              {filteredRisks.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-12 text-center text-on-surface-variant"
                  >
                    Hech qanday risk topilmadi.
                  </td>
                </tr>
              ) : (
                filteredRisks.map((risk) => {
                  const project = projectMap.get(risk.projectId);
                  const assignee = risk.assigneeId
                    ? memberMap.get(risk.assigneeId)
                    : null;

                  const levelPillStyles =
                    risk.level === "high"
                      ? "bg-error-container text-error"
                      : risk.level === "medium"
                        ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                        : "bg-tertiary-fixed text-on-tertiary-fixed-variant";

                  const dotColor =
                    risk.level === "high"
                      ? "bg-error"
                      : risk.level === "medium"
                        ? "bg-secondary"
                        : "bg-tertiary";

                  const statusPillStyles =
                    risk.status === "active"
                      ? "bg-error-container/60 text-on-error-container"
                      : risk.status === "monitoring"
                        ? "bg-secondary-container/30 text-on-secondary-container"
                        : "bg-tertiary-fixed/30 text-tertiary";

                  const statusLabel =
                    risk.status === "active"
                      ? "Faol"
                      : risk.status === "monitoring"
                        ? "Nazoratda"
                        : "Bartaraf etilgan";

                  const levelLabel =
                    risk.level === "high"
                      ? "Yuqori"
                      : risk.level === "medium"
                        ? "O‘rta"
                        : "Past";

                  return (
                    <tr
                      key={risk.id}
                      className="hover:bg-surface-container-low/60 transition-colors group"
                    >
                      <td className="py-4 px-space-lg">
                        <div className="flex flex-col min-w-0">
                          <span className="font-headline-md text-[14px] text-on-surface font-semibold group-hover:text-primary transition-colors">
                            {risk.title}
                          </span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant line-clamp-1">
                            {risk.mitigation ||
                              "Bartaraf etish rejasi ko‘rsatilmagan"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-space-md">
                        <span className="px-3 py-1 rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm whitespace-nowrap">
                          {project ? project.name : "Loyiha"}
                        </span>
                      </td>
                      <td className="py-4 px-space-sm text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container font-label-md text-label-md font-bold text-on-surface">
                          {risk.probability}
                        </span>
                      </td>
                      <td className="py-4 px-space-sm text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-surface-container font-label-md text-label-md font-bold text-on-surface">
                          {risk.impact}
                        </span>
                      </td>
                      <td className="py-4 px-space-md">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-label-md text-label-md shadow-sm ${levelPillStyles}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                          />
                          <span>
                            {risk.score} • {levelLabel}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-space-md">
                        <div className="flex items-center gap-space-xs">
                          <Avatar
                            name={assignee?.fullName || "TF"}
                            size="sm"
                            colorScheme="primary"
                          />
                          <span className="font-body-md text-body-md text-on-surface whitespace-nowrap">
                            {assignee?.fullName || "Tayinlanmagan"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-space-md">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-sm text-label-sm ${statusPillStyles}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${dotColor}`}
                          />
                          <span>{statusLabel}</span>
                        </span>
                      </td>
                      <td className="py-4 px-space-lg text-right">
                        <div className="inline-flex items-center gap-1">
                          {canEditRisk && (
                            <button
                              onClick={() => handleOpenEditModal(risk)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-all"
                              title="Tahrirlash"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                edit
                              </span>
                            </button>
                          )}
                          {canDeleteRisk && (
                            <button
                              onClick={() => setDeleteRiskId(risk.id)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-all"
                              title="O'chirish"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Risk Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRisk ? "Riskni tahrirlash" : "Yangi risk qo‘shish"}
        description="Loyiha xavfini aniqlang, ehtimollik va ta’sir ko‘rsatkichlarini baholang"
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
              htmlFor="riskTitle"
              className="font-label-lg text-label-lg text-on-surface font-semibold"
            >
              Risk nomi *
            </label>
            <input
              id="riskTitle"
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Masalan: To‘lov shlyuzi API kechikishi"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:bg-surface-container transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="riskProject"
                className="font-label-lg text-label-lg text-on-surface font-semibold"
              >
                Loyiha *
              </label>
              <div className="relative">
                <select
                  id="riskProject"
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md outline-none focus:bg-surface-container transition-all appearance-none cursor-pointer pr-10"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-outline text-[18px] absolute right-3 top-2.5 pointer-events-none">
                  unfold_more
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="riskAssignee"
                className="font-label-lg text-label-lg text-on-surface font-semibold"
              >
                Mas’ul xodim
              </label>
              <div className="relative">
                <select
                  id="riskAssignee"
                  value={formAssigneeId || ""}
                  onChange={(e) => setFormAssigneeId(e.target.value || null)}
                  className="w-full px-3 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md outline-none focus:bg-surface-container transition-all appearance-none cursor-pointer pr-10"
                >
                  <option value="">Tayinlanmagan</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.role})
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined text-outline text-[18px] absolute right-3 top-2.5 pointer-events-none">
                  unfold_more
                </span>
              </div>
            </div>
          </div>

          {/* Ehtimollik & Ta'sir (1-5) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md bg-surface-container-low p-space-md rounded-2xl">
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="probRange"
                  className="font-label-lg text-label-lg text-on-surface font-semibold"
                >
                  Ehtimollik (1–5)
                </label>
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  {formProb}
                </span>
              </div>
              <input
                id="probRange"
                type="range"
                min={1}
                max={5}
                value={formProb}
                onChange={(e) => setFormProb(Number(e.target.value))}
                className="w-full accent-primary-container cursor-pointer"
              />
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                1: Juda past — 5: Juda yuqori
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="impactRange"
                  className="font-label-lg text-label-lg text-on-surface font-semibold"
                >
                  Ta’sir (1–5)
                </label>
                <span className="font-headline-md text-headline-md text-secondary font-bold">
                  {formImpact}
                </span>
              </div>
              <input
                id="impactRange"
                type="range"
                min={1}
                max={5}
                value={formImpact}
                onChange={(e) => setFormImpact(Number(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                1: Kam ta’sir — 5: Kritik to‘xtatish
              </span>
            </div>
          </div>

          {/* Calculated Score Preview */}
          <div className="flex items-center justify-between px-space-md py-2.5 rounded-xl bg-surface-container">
            <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
              Hisoblangan risk darajasi:
            </span>
            <div
              className={`px-3 py-1 rounded-full font-label-md text-label-md font-semibold ${
                calculatedModalLevel === "high"
                  ? "bg-error-container text-error"
                  : calculatedModalLevel === "medium"
                    ? "bg-secondary-fixed text-on-secondary-fixed-variant"
                    : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
              }`}
            >
              {calculatedModalScore} •{" "}
              {calculatedModalLevel === "high"
                ? "Yuqori risk"
                : calculatedModalLevel === "medium"
                  ? "O‘rta risk"
                  : "Past risk"}
            </div>
          </div>

          {/* Bartaraf etish rejasi */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="riskMitigation"
              className="font-label-lg text-label-lg text-on-surface font-semibold"
            >
              Bartaraf etish rejasi
            </label>
            <textarea
              id="riskMitigation"
              rows={3}
              value={formMitigation}
              onChange={(e) => setFormMitigation(e.target.value)}
              placeholder="Ushbu risk vujudga kelganda qilinadigan harakatlar ketma-ketligi..."
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-body-md text-body-md outline-none focus:bg-surface-container transition-all resize-none"
            />
          </div>

          {/* Holat */}
          <div className="flex flex-col gap-1.5">
            <label className="font-label-lg text-label-lg text-on-surface font-semibold">
              Boshlang‘ich holat
            </label>
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all ${
                  formStatus === "active"
                    ? "bg-surface-container text-primary font-semibold ring-2 ring-primary"
                    : "bg-surface-container-low text-on-surface"
                }`}
              >
                <input
                  type="radio"
                  name="risk_status"
                  value="active"
                  checked={formStatus === "active"}
                  onChange={() => setFormStatus("active")}
                  className="sr-only"
                />
                <span className="font-label-md text-label-md">Faol</span>
              </label>

              <label
                className={`flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all ${
                  formStatus === "monitoring"
                    ? "bg-surface-container text-primary font-semibold ring-2 ring-primary"
                    : "bg-surface-container-low text-on-surface"
                }`}
              >
                <input
                  type="radio"
                  name="risk_status"
                  value="monitoring"
                  checked={formStatus === "monitoring"}
                  onChange={() => setFormStatus("monitoring")}
                  className="sr-only"
                />
                <span className="font-label-md text-label-md">Nazoratda</span>
              </label>

              <label
                className={`flex items-center justify-center p-2 rounded-xl cursor-pointer transition-all ${
                  formStatus === "resolved"
                    ? "bg-surface-container text-primary font-semibold ring-2 ring-primary"
                    : "bg-surface-container-low text-on-surface"
                }`}
              >
                <input
                  type="radio"
                  name="risk_status"
                  value="resolved"
                  checked={formStatus === "resolved"}
                  onChange={() => setFormStatus("resolved")}
                  className="sr-only"
                />
                <span className="font-label-md text-label-md">
                  Bartaraf etilgan
                </span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-space-sm pt-space-xs mt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-space-lg py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg transition-all"
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
        isOpen={Boolean(deleteRiskId)}
        onClose={() => setDeleteRiskId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Riskni o‘chirish"
        message="Haqiqatan ham ushbu risk yozuvini o‘chirmoqchimisiz?"
      />
    </div>
  );
};
