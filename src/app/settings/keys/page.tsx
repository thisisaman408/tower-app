import { KeysClient } from "./KeysClient";

export const metadata = {
  title: "API Keys — Tower",
};

export default function SettingsKeysPage() {
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;
  return <KeysClient hasGeminiKey={hasGeminiKey} />;
}
