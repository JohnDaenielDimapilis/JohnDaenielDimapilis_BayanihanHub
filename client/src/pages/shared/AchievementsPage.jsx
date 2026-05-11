import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useAuth } from "../../hooks/useAuth";
import { useResource } from "../../hooks/useResource";
import { formatDate } from "../../utils/formatDate";
import { sampleAchievements } from "../../utils/mockData";

export default function AchievementsPage() {
  const { user } = useAuth();
  const endpoint = user?.role === "user" ? "/achievements/my-achievements" : "/achievements";
  const { data: achievements, error } = useResource(endpoint, sampleAchievements);

  return (
    <>
      <PageHeader
        eyebrow="Achievement Tracking"
        subtitle="Participation and contribution milestones are recorded for accountability and recognition."
        title="Achievements"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "achievementTitle", label: "Achievement" },
          { key: "achievementType", label: "Type" },
          { key: "description", label: "Description" },
          { key: "earnedDate", label: "Earned Date", render: (row) => formatDate(row.earnedDate) }
        ]}
        rows={achievements}
      />
    </>
  );
}
