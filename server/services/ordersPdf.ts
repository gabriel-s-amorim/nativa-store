import PDFDocument from "pdfkit";
import { formatAddressLine } from "@shared/types/address";
import { SITE_NAME, SITE_TAGLINE } from "@shared/const/site";
import {
  formatOrderShortId,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@shared/lib/orderLabels";
import type { AdminOrderDetail } from "@shared/types/order";

const COLORS = {
  forest: "#2D6A4F",
  forestDark: "#1B4332",
  ink: "#1A1A1A",
  muted: "#6B6B6B",
  line: "#D4D4D4",
  soft: "#F4F7F5",
  white: "#FFFFFF",
  accent: "#C4783A",
} as const;

/** A4 em pontos; layout 100% manual (sem auto page-break do PDFKit). */
const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 48,
  footerHeight: 28,
  headerBar: 8,
} as const;

function formatBrl(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function contentWidth(): number {
  return PAGE.width - PAGE.margin * 2;
}

function contentBottom(): number {
  return PAGE.height - PAGE.footerHeight - 12;
}

function absoluteText(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  options: PDFKit.Mixins.TextOptions = {}
): void {
  doc.text(text, x, y, { ...options, lineBreak: false });
}

function drawPageChrome(doc: PDFKit.PDFDocument): void {
  doc.save();
  doc.rect(0, 0, PAGE.width, PAGE.headerBar).fill(COLORS.forest);
  doc
    .rect(0, PAGE.height - PAGE.footerHeight, PAGE.width, PAGE.footerHeight)
    .fill(COLORS.forestDark);
  doc.fillColor(COLORS.white).fontSize(8).font("Helvetica");
  absoluteText(
    doc,
    `${SITE_NAME} · Documento confidencial · Gerado em ${new Intl.DateTimeFormat(
      "pt-BR",
      { dateStyle: "short", timeStyle: "short" }
    ).format(new Date())}`,
    PAGE.margin,
    PAGE.height - 18,
    { width: contentWidth(), align: "left" }
  );
  doc.restore();
}

function beginContent(doc: PDFKit.PDFDocument): number {
  drawPageChrome(doc);
  return PAGE.margin + 16;
}

function ensureY(
  doc: PDFKit.PDFDocument,
  y: number,
  needed: number
): number {
  if (y + needed <= contentBottom()) return y;
  doc.addPage();
  return beginContent(doc);
}

function drawBrandHeader(
  doc: PDFKit.PDFDocument,
  subtitle: string,
  startY: number
): number {
  let y = startY;

  doc.fillColor(COLORS.forestDark).font("Helvetica-Bold").fontSize(22);
  absoluteText(doc, SITE_NAME.toUpperCase(), PAGE.margin, y, {
    width: contentWidth() * 0.58,
  });

  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9);
  absoluteText(doc, SITE_TAGLINE, PAGE.margin, y + 26, {
    width: contentWidth() * 0.58,
  });

  doc.fillColor(COLORS.forest).font("Helvetica-Bold").fontSize(11);
  absoluteText(doc, subtitle, PAGE.margin + contentWidth() * 0.55, y + 4, {
    width: contentWidth() * 0.45,
    align: "right",
  });

  y += 48;
  doc
    .moveTo(PAGE.margin, y)
    .lineTo(PAGE.width - PAGE.margin, y)
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .stroke();

  return y + 16;
}

function drawSectionTitle(
  doc: PDFKit.PDFDocument,
  title: string,
  y: number
): number {
  y = ensureY(doc, y, 36);
  doc.fillColor(COLORS.forestDark).font("Helvetica-Bold").fontSize(11);
  absoluteText(doc, title.toUpperCase(), PAGE.margin, y);
  doc
    .moveTo(PAGE.margin, y + 14)
    .lineTo(PAGE.margin + 72, y + 14)
    .strokeColor(COLORS.accent)
    .lineWidth(1.5)
    .stroke();
  return y + 26;
}

function drawKeyValueGrid(
  doc: PDFKit.PDFDocument,
  rows: Array<[string, string]>,
  startY: number
): number {
  const colWidth = contentWidth() / 2;
  let y = startY;

  for (let i = 0; i < rows.length; i += 2) {
    y = ensureY(doc, y, 36);
    const left = rows[i];
    const right = rows[i + 1];

    for (let index = 0; index < 2; index++) {
      const pair = index === 0 ? left : right;
      if (!pair) continue;
      const x = PAGE.margin + index * colWidth;
      doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8);
      absoluteText(doc, pair[0].toUpperCase(), x, y, { width: colWidth - 12 });
      doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(10);
      absoluteText(doc, pair[1], x, y + 12, { width: colWidth - 12 });
    }

    y += 34;
  }

  return y;
}

function drawItemsTable(
  doc: PDFKit.PDFDocument,
  order: AdminOrderDetail,
  startY: number
): number {
  let y = drawSectionTitle(doc, "Itens do pedido", startY);
  y = ensureY(doc, y, 48);

  const cols = {
    item: PAGE.margin,
    qty: PAGE.margin + 278,
    unit: PAGE.margin + 328,
    total: PAGE.margin + 420,
  };
  const widths = {
    item: 270,
    qty: 40,
    unit: 82,
    total: contentWidth() - 382,
  };

  doc.rect(PAGE.margin, y, contentWidth(), 22).fill(COLORS.soft);
  doc.fillColor(COLORS.forestDark).font("Helvetica-Bold").fontSize(8);
  absoluteText(doc, "PRODUTO", cols.item + 8, y + 7, {
    width: widths.item - 8,
  });
  absoluteText(doc, "QTD", cols.qty, y + 7, {
    width: widths.qty,
    align: "right",
  });
  absoluteText(doc, "UNITÁRIO", cols.unit, y + 7, {
    width: widths.unit,
    align: "right",
  });
  absoluteText(doc, "TOTAL", cols.total, y + 7, {
    width: widths.total - 8,
    align: "right",
  });
  y += 28;

  for (const item of order.items) {
    const variant = [item.size, item.color].filter(Boolean).join(" · ");
    doc.font("Helvetica-Bold").fontSize(9);
    const nameHeight = doc.heightOfString(item.name, {
      width: widths.item - 8,
    });
    const rowHeight = Math.max(28, nameHeight + (variant ? 14 : 0) + 10);
    y = ensureY(doc, y, rowHeight + 4);

    doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(9);
    absoluteText(doc, item.name, cols.item + 8, y, {
      width: widths.item - 8,
    });

    if (variant) {
      doc.fillColor(COLORS.muted).font("Helvetica").fontSize(8);
      absoluteText(doc, variant, cols.item + 8, y + nameHeight + 2, {
        width: widths.item - 8,
      });
    }

    doc.fillColor(COLORS.ink).font("Helvetica").fontSize(9);
    absoluteText(doc, String(item.quantity), cols.qty, y + 2, {
      width: widths.qty,
      align: "right",
    });
    absoluteText(doc, formatBrl(item.price), cols.unit, y + 2, {
      width: widths.unit,
      align: "right",
    });
    doc.font("Helvetica-Bold");
    absoluteText(
      doc,
      formatBrl(item.price * item.quantity),
      cols.total,
      y + 2,
      { width: widths.total - 8, align: "right" }
    );

    y += rowHeight;
    doc
      .moveTo(PAGE.margin, y)
      .lineTo(PAGE.width - PAGE.margin, y)
      .strokeColor(COLORS.line)
      .lineWidth(0.5)
      .stroke();
    y += 6;
  }

  return y;
}

function drawTotals(
  doc: PDFKit.PDFDocument,
  order: AdminOrderDetail,
  startY: number
): number {
  let y = ensureY(doc, startY, 100);
  const boxWidth = 210;
  const x = PAGE.width - PAGE.margin - boxWidth;
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const rows: Array<[string, string, boolean]> = [
    ["Subtotal", formatBrl(subtotal), false],
  ];
  if (order.discountAmount > 0) {
    rows.push([
      order.couponCode ? `Desconto (${order.couponCode})` : "Desconto",
      `-${formatBrl(order.discountAmount)}`,
      false,
    ]);
  }
  rows.push(["Frete", formatBrl(order.shippingAmount), false]);
  if (order.couponCode && order.discountAmount <= 0) {
    rows.push(["Cupom", order.couponCode, false]);
  }
  rows.push(["Total", formatBrl(order.totalAmount), true]);

  y += 8;
  for (const [label, value, emph] of rows) {
    if (emph) {
      doc.rect(x, y - 4, boxWidth, 26).fill(COLORS.forest);
      doc.fillColor(COLORS.white).font("Helvetica-Bold").fontSize(11);
      absoluteText(doc, label, x + 10, y + 3, { width: 80 });
      absoluteText(doc, value, x + 90, y + 3, {
        width: boxWidth - 100,
        align: "right",
      });
      y += 30;
    } else {
      doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9);
      absoluteText(doc, label, x + 10, y, { width: 80 });
      doc.fillColor(COLORS.ink).font("Helvetica-Bold").fontSize(9);
      absoluteText(doc, value, x + 90, y, {
        width: boxWidth - 100,
        align: "right",
      });
      y += 18;
    }
  }

  return y + 8;
}

function drawOrderDetailPage(
  doc: PDFKit.PDFDocument,
  order: AdminOrderDetail,
  index: number,
  total: number
): void {
  let y = beginContent(doc);
  y = drawBrandHeader(
    doc,
    total === 1 ? "Comprovante do pedido" : `Pedido ${index + 1} de ${total}`,
    y
  );

  doc.fillColor(COLORS.forestDark).font("Helvetica-Bold").fontSize(16);
  absoluteText(doc, `Pedido #${formatOrderShortId(order.id)}`, PAGE.margin, y);

  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(9);
  absoluteText(doc, `ID completo: ${order.id}`, PAGE.margin, y + 20);
  y += 42;

  y = drawKeyValueGrid(
    doc,
    [
      ["Status", ORDER_STATUS_LABELS[order.status]],
      ["Data do pedido", formatDateTime(order.createdAt)],
      ["Pagamento", PAYMENT_METHOD_LABELS[order.paymentMethod]],
      [
        "Status do pagamento",
        PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus,
      ],
      ["Cliente", order.customerName || "Cliente removido"],
      ["E-mail", order.customerEmail || "—"],
      ["Telefone", order.customerPhone || "—"],
      ["Pago em", order.paidAt ? formatDateTime(order.paidAt) : "—"],
    ],
    y
  );

  y = drawSectionTitle(doc, "Entrega", y + 4);
  const shippingLines = [
    order.shippingRecipient?.name
      ? `Destinatário: ${order.shippingRecipient.name}`
      : null,
    order.shippingRecipient?.document
      ? `Documento: ${order.shippingRecipient.document}`
      : null,
    formatAddressLine(order.shippingAddress),
    order.shippingCompany || order.shippingServiceName
      ? `Frete: ${[order.shippingCompany, order.shippingServiceName]
          .filter(Boolean)
          .join(" · ")}`
      : null,
    order.shippingDeliveryDays != null
      ? `Prazo estimado: ${order.shippingDeliveryDays} dia(s)`
      : null,
  ].filter(Boolean) as string[];

  for (const line of shippingLines) {
    y = ensureY(doc, y, 16);
    doc.fillColor(COLORS.ink).font("Helvetica").fontSize(9);
    absoluteText(doc, line, PAGE.margin, y, { width: contentWidth() });
    y += 14;
  }

  y = drawItemsTable(doc, order, y + 10);
  drawTotals(doc, order, y);
}

function drawSummaryPage(
  doc: PDFKit.PDFDocument,
  orders: AdminOrderDetail[]
): void {
  let y = beginContent(doc);
  y = drawBrandHeader(doc, "Relatório de pedidos", y);

  doc.fillColor(COLORS.forestDark).font("Helvetica-Bold").fontSize(18);
  absoluteText(doc, "Resumo da seleção", PAGE.margin, y);

  doc.fillColor(COLORS.muted).font("Helvetica").fontSize(10);
  absoluteText(
    doc,
    `${orders.length} pedido(s) · Total consolidado ${formatBrl(
      orders.reduce((sum, order) => sum + order.totalAmount, 0)
    )}`,
    PAGE.margin,
    y + 22,
    { width: contentWidth() }
  );
  y += 48;

  const cols = {
    id: PAGE.margin,
    customer: PAGE.margin + 70,
    date: PAGE.margin + 230,
    payment: PAGE.margin + 320,
    status: PAGE.margin + 400,
    total: PAGE.margin + 460,
  };

  y = ensureY(doc, y, 40);
  doc.rect(PAGE.margin, y, contentWidth(), 22).fill(COLORS.soft);
  doc.fillColor(COLORS.forestDark).font("Helvetica-Bold").fontSize(8);
  absoluteText(doc, "PEDIDO", cols.id + 6, y + 7);
  absoluteText(doc, "CLIENTE", cols.customer, y + 7);
  absoluteText(doc, "DATA", cols.date, y + 7);
  absoluteText(doc, "PAGAMENTO", cols.payment, y + 7);
  absoluteText(doc, "STATUS", cols.status, y + 7);
  absoluteText(doc, "TOTAL", cols.total, y + 7, {
    width: PAGE.width - PAGE.margin - cols.total - 6,
    align: "right",
  });
  y += 28;

  for (const order of orders) {
    y = ensureY(doc, y, 22);
    doc.fillColor(COLORS.ink).font("Helvetica").fontSize(8);
    absoluteText(doc, `#${formatOrderShortId(order.id)}`, cols.id + 6, y, {
      width: 60,
    });
    absoluteText(doc, order.customerName || "—", cols.customer, y, {
      width: 150,
    });
    absoluteText(
      doc,
      new Intl.DateTimeFormat("pt-BR").format(new Date(order.createdAt)),
      cols.date,
      y,
      { width: 80 }
    );
    absoluteText(
      doc,
      PAYMENT_METHOD_LABELS[order.paymentMethod],
      cols.payment,
      y,
      { width: 70 }
    );
    absoluteText(doc, ORDER_STATUS_LABELS[order.status], cols.status, y, {
      width: 55,
    });
    doc.font("Helvetica-Bold");
    absoluteText(doc, formatBrl(order.totalAmount), cols.total, y, {
      width: PAGE.width - PAGE.margin - cols.total - 6,
      align: "right",
    });
    y += 18;
  }

  y += 12;
  doc.fillColor(COLORS.muted).font("Helvetica-Oblique").fontSize(8);
  absoluteText(
    doc,
    "Nas páginas seguintes, cada pedido é detalhado com itens, frete e totais.",
    PAGE.margin,
    y,
    { width: contentWidth() }
  );
}

export async function buildOrdersPdfBuffer(
  orders: AdminOrderDetail[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      // Margens zero: o layout é posicionado manualmente para evitar
      // page-breaks automáticos do PDFKit (causa páginas em branco).
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
      autoFirstPage: true,
      bufferPages: true,
      info: {
        Title: `Pedidos — ${SITE_NAME}`,
        Author: SITE_NAME,
        Subject: "Exportação de pedidos do painel administrativo",
        Creator: `${SITE_NAME} Admin`,
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const includeSummary = orders.length > 1;

    if (includeSummary) {
      drawSummaryPage(doc, orders);
    }

    for (let index = 0; index < orders.length; index++) {
      if (includeSummary || index > 0) {
        doc.addPage();
      }
      drawOrderDetailPage(doc, orders[index], index, orders.length);
    }

    doc.end();
  });
}
