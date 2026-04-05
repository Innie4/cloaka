import { PageFrame } from "@/components/layout/page-frame";
import { SettingsConsole } from "@/components/settings/settings-console";

export default function SettingsPage() {
  return (
    <PageFrame
      eyebrow="Settings"
      title="Operational controls should stay understandable even when they affect money."
      description="Manage low-balance alerts, delivery preferences, and two-factor authentication from one place, with direct API-backed controls instead of placeholder cards."
    >
      <SettingsConsole />
    </PageFrame>
  );
}
