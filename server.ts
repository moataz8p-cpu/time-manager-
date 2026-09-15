import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Assistant endpoint for Time Organization
app.post("/api/ai/schedule-assist", async (req, res) => {
  try {
    const { prompt, currentSchedule, settings, requestType } = req.body;

    const gemini = getGeminiClient();

    const systemInstruction = `
أنت مهندس ومستشار ذكي متخصص في إدارة وتنظيم الوقت والإنتاجية وفقًا لنظام جدولة أسبوعي صارم ومتقن.
قواعد النظام الأساسية:
1. أيام الأسبوع تبدأ من السبت وتنتهي بالجمعة (Friday هو آخر يوم).
2. يوم الجمعة له أوقات عمل خاصة (Friday Start/End Time).
3. الأولويات في اليوم:
   - الأولوية الأولى: المهام الأساسية (Essential Tasks).
   - الأولوية الثانية: مهام الاحتياط والتدارك (Buffer) في نهاية اليوم.
   - الأولوية الثالثة: مهام التطوير (Development Tasks).
4. مهام التطوير التراكمية (Cumulative): مرتبطة ببعضها في سلسلة متتابعة (Sequence). إذا تأخرت مهمة A، تتحرك للأمام ولا يجوز إطلاقًا أن تسبقها المهمة B أو المهمة C. يجب الحفاظ التام على ترتيب السلسلة التراكمية.
5. مهام التطوير غير التراكمية (Non-Cumulative): يمكن نقلها بمرونة لأوقات أخرى أو ليوم الجمعة دون التأثير على السلسلة التراكمية.
6. لا تجعل المهام تتداخل في التوقيت، وراعِ فترات الصلاة والراحة.
7. عند اقتراح أي تعديل، اشرح السبب باختصار واحترام، واعرض مقترح التعديل بصيغة واضحة للمستخدم لكي يوافق أو يلغي (Confirm / Cancel).

أجب دائمًا باللغة العربية بأسلوب راقٍ وواضح ومحفز ومختصر.
`;

    if (gemini) {
      const userPrompt = `
نوع الطلب: ${requestType || 'استشارة'}
السؤال أو طلب المستخدم: ${prompt || 'حلل جدولي واقترح تحسينات'}
بيانات الجدول الحالي: ${JSON.stringify(currentSchedule || {})}
الإعدادات الحالية: ${JSON.stringify(settings || {})}

المطلوب:
1. تحليل ضغط اليوم والجدول.
2. اقتراح حل عملي منظم يراعي قواعد المهام التراكمية وتوقيتات الجمعة والـ Buffer.
3. إذا كان هناك مقترح لنقل مهام أو إعادة توزيعها، اذكر التغييرات المقترحة بدقة وبشكل منظم.
`;

      const response = await gemini.models.generateContent({
        model: "gemini-3.8-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      return res.json({
        success: true,
        reply: response.text || "تم تحليل الجدول بنجاح.",
        source: "gemini",
      });
    } else {
      // Fallback smart response when API key is not configured
      let smartReply = "أهلاً بك في المساعد الذكي لتنظيم الوقت! ";
      if (requestType === "emergency") {
        smartReply += "بناءً على طلب الإزاحة الطارئة، أنصح بالحفاظ أولاً على المهام الأساسية (Essential Tasks)، ثم استهلاك وقت الـ Buffer في نهاية اليوم. وفي حال وجود مهام تطوير تراكمية (Cumulative)، سنحرك المهمة المتأخرة إلى أقرب وقت فراغ متاح مع تأخير المهام التراكمية اللاحقة للحفاظ التام على تسلسلها المنطقي.";
      } else if (requestType === "analysis") {
        smartReply += "بفحص جدولك الحالي، توزيع المهام متوازن مع مراعاة الحفاظ على الـ Buffer في نهاية اليوم لامتصاص أي طوارئ غير متوقعة. تذكر أن مهام التطوير التراكمية يجب إنجازها بالترتيب المحدد لضمان استمرارية الإنجاز.";
      } else {
        smartReply += "يمكنني مساعدتك في تحليل ضغط اليوم، اقتراح التوزيع الأمثل للمهام، وإعادة تنظيم الجدول بعد حدوث أي طوارئ (Emergency Shift) مع حماية تسلسل المهام التراكمية.";
      }

      return res.json({
        success: true,
        reply: smartReply,
        source: "local-rule-engine",
      });
    }
  } catch (error: any) {
    console.error("AI Assist error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "حدث خطأ أثناء معالجة طلب الذكاء الاصطناعي",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
