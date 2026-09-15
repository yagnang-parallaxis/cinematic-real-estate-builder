import { ClonePreviewProvider } from "../lib/clone-context";
import { getCloneConfig } from "../lib/load-clone";
import { HomeSite } from "./HomeSite";
import { PreviewBridge } from "./PreviewBridge";
import { ThemeStyleTag } from "./ThemeStyleTag";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ loader?: string; clone?: string; preview?: string }>;
}) {
  const params = await searchParams;
  const config = await getCloneConfig(params.clone);

  return (
    <>
      <ThemeStyleTag theme={config.theme} />
      <ClonePreviewProvider serverConfig={config}>
        {params.preview === "1" ? <PreviewBridge /> : null}
        <HomeSite serverConfig={config} />
      </ClonePreviewProvider>
    </>
  );
}
