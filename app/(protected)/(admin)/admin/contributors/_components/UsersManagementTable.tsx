"use client";

import type { AdminUser } from "@/interfaces/interfaces";
import { useUserManagement } from "../useUserManagement";
import { StatsCards } from "./StatsCards";
import { UsersTableView } from "./UsersTableView";
import ConfirmModal from "@/components/common/ConfirmModal";

interface UsersManagementTableProps {
  users: AdminUser[];
}

export default function UsersManagementTable({ users }: UsersManagementTableProps) {
  const {
    filter,
    setFilter,
    loading,
    filteredUsers,
    stats,
    handlePromote,
    handleDemote,
    confirmAction,
    handleConfirm,
    handleCancelConfirm,
  } = useUserManagement(users);

  return (
    <>
      <StatsCards 
        stats={stats} 
        filter={filter} 
        onFilterChange={setFilter} 
      />
      
      <UsersTableView
        filteredUsers={filteredUsers}
        filter={filter}
        loading={loading}
        onPromote={handlePromote}
        onDemote={handleDemote}
      />

      <ConfirmModal
        opened={!!confirmAction}
        onClose={handleCancelConfirm}
        onConfirm={handleConfirm}
        title={confirmAction?.type === "promote" ? "Promote User" : "Demote Contributor"}
        message={
          confirmAction?.type === "promote"
            ? `Are you sure you want to promote "${confirmAction.username}" to Contributor?\n\nThis will grant them content creation permissions.`
            : `Are you sure you want to demote "${confirmAction?.username}" to Learner?\n\nThis will revoke their content creation permissions.`
        }
        confirmText={confirmAction?.type === "promote" ? "Promote" : "Demote"}
        confirmColor={confirmAction?.type === "promote" ? "green" : "red"}
        icon={confirmAction?.type === "promote" ? "person_add" : "person_remove"}
        loading={!!loading}
      />
    </>
  );
}
