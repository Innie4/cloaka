import { PageFrame } from "@/components/layout/page-frame";
import { TeamConsole } from "@/components/team/team-console";

export default function TeamPage() {
  return (
    <PageFrame
      eyebrow="Team"
      title="Permissions should feel legible to non-technical operators."
      description="Owners, admins, and viewers now live behind a working team screen with role changes, invite flows, and visible security posture."
    >
      <TeamConsole />
    </PageFrame>
  );
}
