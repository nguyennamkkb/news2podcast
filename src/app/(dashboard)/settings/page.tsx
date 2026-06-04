import { LLMProviderForm } from "@/components/settings/llm-provider-form";
import { UsageStats } from "@/components/settings/usage-stats";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid gap-6 max-w-2xl">
        <LLMProviderForm />
        <UsageStats />
      </div>
    </div>
  );
}
