import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { settingsService } from "@arqudrix/domain";
import { IntegrationsForm } from "./integrations-form";

export const metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const settings = await settingsService.getForAdmin({ id: session.user.id, role: session.user.role });
  const canEdit = session.user.role === "SUPER_ADMIN";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm text-slate-500">
          Meta Pixel and Google Ads — changes here take effect on the live site immediately, no
          redeploy needed. {!canEdit && "Read-only — only SUPER_ADMIN can edit these values."}
        </p>
      </div>

      <IntegrationsForm initialValues={settings} canEdit={canEdit} />
    </div>
  );
}
