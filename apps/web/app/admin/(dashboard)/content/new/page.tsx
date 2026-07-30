import { ContentForm } from "../content-form";

export const metadata = { title: "New Post" };

export default function NewContentPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Write a New Post</h1>
      <ContentForm mode="create" />
    </div>
  );
}
