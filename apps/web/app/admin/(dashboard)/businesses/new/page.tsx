import { BusinessForm } from "../business-form";

export const metadata = { title: "Add Business" };

export default function NewBusinessPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Add a New Business / Product</h1>
      <BusinessForm mode="create" />
    </div>
  );
}
