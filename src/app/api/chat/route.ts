import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq } from "drizzle-orm";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `أنتِ مساعدة خدمة عملاء ودودة لمتجر "فيليسيا بيوتي" (Velisia Beauty) المتخصص في منتجات العناية بالبشرة والشعر والتجميل.

مهمتك:
- الرد على استفسارات العملاء بالعربية بأسلوب لطيف ومحترف
- مساعدة العملاء في تتبع طلباتهم باستخدام أداة track_order عندما يعطوك رقم الطلب
- الإجابة عن أسئلة الشحن والإرجاع والمنتجات بناءً على المعلومات التالية:

سياسة الشحن: التوصيل خلال 2-5 أيام عمل داخل المملكة العربية السعودية.
سياسة الإرجاع: يمكن إرجاع المنتجات غير المستخدمة خلال 14 يومًا من الاستلام.
طرق الدفع: بطاقات مدى، فيزا، ماستركارد عبر بوابة الدفع الآمنة.

إذا سأل العميل عن حالة طلبه، اطلب منه رقم الطلب واستخدم أداة track_order.
إذا لم تكن متأكدة من إجابة، لا تخترعي معلومات، بل اقترحي على العميل التواصل مع خدمة العملاء عبر واتساب أو البريد الإلكتروني.
حافظي على ردودك مختصرة ومفيدة.`;

const tools: Anthropic.Tool[] = [
  {
    name: "track_order",
    description: "يبحث عن حالة طلب باستخدام رقم الطلب ويرجع تفاصيله",
    input_schema: {
      type: "object",
      properties: {
        orderNumber: {
          type: "string",
          description: "رقم الطلب الذي أدخله العميل",
        },
      },
      required: ["orderNumber"],
    },
  },
];

async function trackOrder(orderNumber: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber.trim()))
    .limit(1);

  if (!order) {
    return { error: "لم يتم العثور على طلب بهذا الرقم" };
  }

  return {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    status: order.status,
    paymentStatus: order.paymentStatus,
    city: order.city,
    total: order.total,
    createdAt: order.createdAt,
  };
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "الرسائل مطلوبة" }, { status: 400 });
    }

    let conversationMessages: Anthropic.MessageParam[] = messages;

    let response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools,
      messages: conversationMessages,
    });

    while (response.stop_reason === "tool_use") {
      const toolUseBlock = response.content.find(
        (block) => block.type === "tool_use"
      ) as Anthropic.ToolUseBlock | undefined;

      if (!toolUseBlock) break;

      let toolResult;
      if (toolUseBlock.name === "track_order") {
        const input = toolUseBlock.input as { orderNumber: string };
        toolResult = await trackOrder(input.orderNumber);
      }

      conversationMessages = [
        ...conversationMessages,
        { role: "assistant", content: response.content },
        {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUseBlock.id,
              content: JSON.stringify(toolResult),
            },
          ],
        },
      ];

      response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools,
        messages: conversationMessages,
      });
    }

    const textBlock = response.content.find((block) => block.type === "text");
    const replyText =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    return Response.json({ reply: replyText });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}