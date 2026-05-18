import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { genai, GEMINI_FLASH } from "@/lib/gemini";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, businessSummary, industry, companyName } = await req.json() as {
    url: string;
    businessSummary: string;
    industry?: string;
    companyName?: string;
  };

  const prompt = `You are a competitive intelligence analyst. Based on this company's profile, identify their top 6-8 direct competitors.

Company: ${companyName ?? "Unknown"}
Website: ${url}
Business: ${businessSummary}
Industry: ${industry ?? "Technology"}

Return ONLY valid JSON (no markdown):
{
  "competitors": [
    {
      "name": "Company Name",
      "domain": "domain.com",
      "description": "One sentence on why they compete with this company",
      "tier": "direct" | "adjacent"
    }
  ]
}

Rules:
- Include only real companies with active websites
- domain should be just the domain (no https://, no trailing slash)
- Prioritize direct competitors (same ICP, similar product) over adjacent ones
- Return 6-8 competitors total`;

  try {
    const result = await genai.models.generateContent({
      model: GEMINI_FLASH,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.2, maxOutputTokens: 1024 },
    });

    const raw = result.text ?? "";
    const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
    const parsed = JSON.parse(cleaned) as {
      competitors: Array<{ name: string; domain: string; description: string; tier: string }>;
    };

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      competitors: [
        { name: "Could not auto-discover", domain: "example.com", description: "Please add competitors manually", tier: "direct" },
      ],
    });
  }
}
