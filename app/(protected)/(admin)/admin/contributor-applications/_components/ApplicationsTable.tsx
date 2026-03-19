"use client";

import { Badge, Button, Card, Group, Table, Text, Title } from "@mantine/core";
import AdminEmptyState from "@/components/admin/EmptyState";
import type { AdminContributorApplication } from "@/interfaces/interfaces";
import { getApplicantLabel } from "@/lib/utils/adminContributorApplications";
import { formatDateTime } from "@/lib/utils/formatDate";

interface ApplicationsTableProps {
  applications: AdminContributorApplication[];
  isApproving: boolean;
  isLoadingDetail: boolean;
  isRefreshingList: boolean;
  isRejecting: boolean;
  loadError: string | null;
  onRefresh: () => void;
  onSelect: (applicationPublicId: string) => void;
}

function getStatusColor(status: AdminContributorApplication["status"]) {
  switch (status) {
    case "PENDING":
      return "blue";
    case "APPROVED":
      return "green";
    case "REJECTED":
      return "red";
    default:
      return "gray";
  }
}

export default function ApplicationsTable({
  applications,
  isApproving,
  isLoadingDetail,
  isRefreshingList,
  isRejecting,
  loadError,
  onRefresh,
  onSelect,
}: ApplicationsTableProps) {
  return (
    <Card className="admin-card">
      <Group justify="space-between" align="center" mb="md">
        <Title order={3}>Pending Contributor Applications</Title>
        <Button
          variant="light"
          size="xs"
          onClick={onRefresh}
          loading={isRefreshingList}
          disabled={isLoadingDetail || isApproving || isRejecting}
        >
          Refresh
        </Button>
      </Group>

      {loadError && <Text className="text-sm text-red-400">{loadError}</Text>}

      {!loadError && applications.length === 0 && (
        <AdminEmptyState
          icon="generic"
          title="No pending contributor applications"
          description="New submissions will appear here when learners apply."
        />
      )}

      {!loadError && applications.length > 0 && (
        <Table className="admin-table" highlightOnHover>
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Submitted</th>
              <th>Status</th>
              <th>Application ID</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr
                key={application.publicId}
                className="cursor-pointer"
                onClick={() => onSelect(application.publicId)}
              >
                <td>
                  <Text fw={700}>{getApplicantLabel(application)}</Text>
                </td>
                <td>
                  <Text>{formatDateTime(application.submittedAt)}</Text>
                </td>
                <td>
                  <Badge color={getStatusColor(application.status)} variant="light" radius="xl">
                    {application.status}
                  </Badge>
                </td>
                <td>
                  <Text className="font-mono text-xs">{application.publicId}</Text>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
