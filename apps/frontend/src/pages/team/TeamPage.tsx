import React, { useState, useEffect, useMemo } from "react";
import { RequestState } from "../../components/ui/RequestState";
import { Member, Task, MemberInputDTO } from "../../types";
import { membersService } from "../../services/members";
import { tasksService } from "../../services/tasks";
import { usePermissions } from "../../hooks/usePermissions";
import { Avatar } from "../../components/ui/Avatar";
import { Modal } from "../../components/ui/Modal";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Button } from "../../components/ui/Button";

export const TeamPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState("Frontend Developer");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm
  const [deleteMemberId, setDeleteMemberId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { canCreateMember, canEditMember, canDeleteMember } = usePermissions();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mList, tList] = await Promise.all([
        membersService.getMembers(),
        tasksService.getTasks(),
      ]);
      setMembers(mList);
      setTasks(tList);
    } catch (err: any) {
      setError(err.message || "Jamoa ma’lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute metrics per member
  const memberStats = useMemo(() => {
    const map = new Map<
      string,
      { assigned: number; done: number; percentage: number }
    >();
    members.forEach((m) => {
      const assignedTasks = tasks.filter((t) => t.assigneeId === m.id);
      const doneTasks = assignedTasks.filter((t) => t.status === "done");
      const assigned = assignedTasks.length;
      const done = doneTasks.length;
      const percentage =
        assigned === 0 ? 0 : Math.round((done / assigned) * 100);
      map.set(m.id, { assigned, done, percentage });
    });
    return map;
  }, [members, tasks]);

  // Overall Team summary metrics
  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter((t) => t.status === "done").length;
  const averageWorkload =
    totalTasks === 0 ? 0 : Math.round((totalCompleted / totalTasks) * 100);

  const handleOpenCreateModal = () => {
    setEditingMember(null);
    setFormName("");
    setFormEmail("");
    setFormRole("Frontend Developer");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setFormName(member.fullName);
    setFormEmail(member.email);
    setFormRole(member.role);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formEmail.trim() || !formRole.trim()) {
      setFormError("Barcha maydonlarni to‘ldiring");
      return;
    }

    const dto: MemberInputDTO = {
      fullName: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      role: formRole.trim(),
    };

    setSubmitting(true);
    try {
      if (editingMember) {
        await membersService.updateMember(editingMember.id, dto);
      } else {
        await membersService.createMember(dto);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "A’zoni saqlashda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteMemberId) return;
    setDeleting(true);
    try {
      await membersService.deleteMember(deleteMemberId);
      setDeleteMemberId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "A’zoni o‘chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-space-2xl gap-space-lg">
      <RequestState loading={loading} error={error} onRetry={loadData} />
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">
            Jamoa
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
            Kichik jamoa a‘zolari, rollar va vazifalar yuklamasi
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <div className="flex items-center bg-surface-container-lowest px-space-md py-space-xs rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-outline text-[20px] mr-space-xs">
              groups
            </span>
            <span className="font-label-lg text-label-lg text-on-surface">
              {members.length} faol a‘zo
            </span>
          </div>

          {canCreateMember && (
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-space-xs bg-primary-container text-on-primary-container px-space-lg py-space-sm rounded-xl font-label-lg text-label-lg shadow-md hover:opacity-90 active:scale-95 transition-all"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>+ A‘zo qo‘shish</span>
            </button>
          )}
        </div>
      </div>

      {/* Team Overview Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              checklist
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Jami topshiriqlar
            </span>
            <span className="font-display-md text-display-md text-on-surface mt-space-xs leading-none font-bold">
              {totalTasks}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed/40 flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              task_alt
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Bajarilgan ishlar
            </span>
            <span className="font-display-md text-display-md text-on-surface mt-space-xs leading-none font-bold">
              {totalCompleted}
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[24px]">speed</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              O‘rtacha yuklama
            </span>
            <span className="font-display-md text-display-md text-on-surface mt-space-xs leading-none font-bold">
              {averageWorkload}%
            </span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
            <span className="material-symbols-outlined text-[24px]">
              diversity_3
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              Jamoa quvvati
            </span>
            <span className="font-display-md text-display-md text-on-surface mt-space-xs leading-none font-bold">
              {members.length} mutaxassis
            </span>
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="flex flex-col gap-space-md">
        {members.map((member, idx) => {
          const stats = memberStats.get(member.id) || {
            assigned: 0,
            done: 0,
            percentage: 0,
          };
          const colorSchemes: (
            "primary" | "secondary" | "tertiary" | "amber" | "sky"
          )[] = ["primary", "secondary", "tertiary", "sky", "amber"];
          const colorScheme = colorSchemes[idx % colorSchemes.length];

          return (
            <div
              key={member.id}
              className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-[0_10px_30px_-5px_rgba(105,69,255,0.04),0_4px_12px_0_rgba(17,21,45,0.02)] transition-all hover:shadow-[0_14px_35px_-4px_rgba(105,69,255,0.08)]"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
                {/* Member Identity */}
                <div className="flex items-center gap-space-md min-w-[280px]">
                  <div className="relative shrink-0">
                    <Avatar
                      name={member.fullName}
                      size="xl"
                      colorScheme={colorScheme}
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-tertiary-fixed-dim rounded-full ring-2 ring-surface-container-lowest" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-space-sm flex-wrap">
                      <span className="font-headline-md text-headline-md text-on-surface font-semibold truncate">
                        {member.fullName}
                      </span>
                      <span className="px-space-sm py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container text-primary font-semibold">
                        {member.role}
                      </span>
                    </div>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 truncate">
                      {member.email}
                    </span>
                  </div>
                </div>

                {/* Metrics: Assigned, Done, Percentage */}
                <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-space-lg flex-1 max-w-xl">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Biriktirilgan
                    </span>
                    <span className="font-label-lg text-label-lg text-on-surface mt-0.5 font-semibold">
                      {stats.assigned} ta vazifa
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      Bajarilgan
                    </span>
                    <span className="font-label-lg text-label-lg text-tertiary mt-0.5 font-semibold">
                      {stats.done} ta bajarilgan
                    </span>
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface">
                      <span className="text-on-surface-variant">Jarayon</span>
                      <span className="font-bold text-primary">
                        {stats.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-container rounded-full transition-all duration-500"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions: Edit & Delete (Manager only) */}
                <div className="flex items-center gap-space-xs self-end lg:self-center shrink-0">
                  {canEditMember && (
                    <button
                      onClick={() => handleOpenEditModal(member)}
                      className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                      title="Tahrirlash"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        edit
                      </span>
                    </button>
                  )}
                  {canDeleteMember && member.accessRole !== "manager" && (
                    <button
                      onClick={() => setDeleteMemberId(member.id)}
                      className="p-space-xs rounded-lg text-outline hover:bg-error-container hover:text-error transition-colors"
                      title="O'chirish"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        delete
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingMember
            ? "Jamoa a‘zosini tahrirlash"
            : "Yangi jamoa a‘zosini qo‘shish"
        }
        description="Jamoaning yangi a’zosi va uning loyihadagi rolini kiriting"
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

          <div className="flex flex-col gap-space-xs">
            <label
              htmlFor="memberName"
              className="font-label-lg text-label-lg text-on-surface"
            >
              Ism va familiya *
            </label>
            <input
              id="memberName"
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Masalan: Rustam Ahmedov"
              className="w-full bg-surface-container-low text-on-surface px-space-md py-space-sm rounded-xl font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-outline"
            />
          </div>

          <div className="flex flex-col gap-space-xs">
            <label
              htmlFor="memberEmail"
              className="font-label-lg text-label-lg text-on-surface"
            >
              Email *
            </label>
            <input
              id="memberEmail"
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="rustam@teamflow.uz"
              className="w-full bg-surface-container-low text-on-surface px-space-md py-space-sm rounded-xl font-body-md text-body-md focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-outline"
            />
          </div>

          <div className="flex flex-col gap-space-xs">
            <label
              htmlFor="memberRole"
              className="font-label-lg text-label-lg text-on-surface"
            >
              Rol *
            </label>
            <div className="relative">
              <select
                id="memberRole"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full bg-surface-container-low text-on-surface px-space-md py-space-sm rounded-xl font-body-md text-body-md appearance-none focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer pr-10"
              >
                <option value="Project Manager">Project Manager</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
              <span className="material-symbols-outlined text-outline text-[20px] absolute right-space-md top-1/2 -translate-y-1/2 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-space-sm pt-space-md">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-space-lg py-space-sm rounded-xl font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
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
        isOpen={Boolean(deleteMemberId)}
        onClose={() => setDeleteMemberId(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Jamoa a‘zosini o‘chirish"
        message="Haqiqatan ham ushbu a‘zoni jamoa ro‘yxatidan o‘chirmoqchimisiz? A‘zoga biriktirilgan vazifalar va risklar mas’ulsiz qoladi."
      />
    </div>
  );
};
