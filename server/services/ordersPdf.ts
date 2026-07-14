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

const PAGE = {
  margin: 48,
  width: 595.28,
  height: 841.89,
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

function ensureSpace(doc: PDFKit.PDFDocument, needed: number): void {
  if (doc.y + needed > PAGE.height - PAGE.margin - 36) {
    doc.addPage();
    drawPageChrome(doc);
    doc.y = PAGE.margin + 56;
  }
}

function drawPageChrome(doc: PDFKit.PDFDocument): void {
  doc.save();
  doc.rect(0, 0, PAGE.width, 8).fill(COLORS.forest);
  doc.rect(0, PAGE.height - 28, PAGE.width, 28).fill(COLORS.forestDark);
  doc
    .fillColor(COLORS.white)
    .fontSize(8)
    .font("Helvetica")
    .text(
      `${SITE_NAME} · Documento confidencial · Gerado em ${new Intl.DateTimeFormat(
        "pt-BR",
        { dateStyle: "short", timeStyle: "short" }
      ).format(new Date())}`,
      PAGE.margin,
      PAGE.height - 20,
      { width: contentWidth(), align: "left" }
    );
  doc.restore();
}

function drawBrandHeader(
  doc: PDFKit.PDFDocument,
  subtitle: string
): void {
  drawPageChrome(doc);
  doc.y = PAGE.margin + 16;

  doc
    .fillColor(COLORS.forestDark)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(SITE_NAME.toUpperCase(), PAGE.margin, doc.y, {
      width: contentWidth() * 0.62,
    });

  const brandBottom = doc.y;

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(9)
    .text(SITE_TAGLINE, PAGE.margin, brandBottom + 4, {
      width: contentWidth() * 0.62,
    });

  doc
    .fillColor(COLORS.forest)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(subtitle, PAGE.margin + contentWidth() * 0.55, PAGE.margin + 20, {
      width: contentWidth() * 0.45,
      align: "right",
    });

  doc.y = Math.max(doc.y, brandBottom + 28);
  doc
    .moveTo(PAGE.margin, doc.y)
    .lineTo(PAGE.width - PAGE.margin, doc.y)
    .strokeColor(COLORS.line)
    .lineWidth(1)
    .stroke();
  doc.moveDown(1.2);
}

function drawSectionTitle(doc: PDFKit.PDFDocument, title: string): void {
  ensureSpace(doc, 40);
  doc
    .fillColor(COLORS.forestDark)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(title.toUpperCase(), PAGE.margin, doc.y);
  doc
    .moveTo(PAGE.margin, doc.y + 2)
    .lineTo(PAGE.margin + 72, doc.y + 2)
    .strokeColor(COLORS.accent)
    .lineWidth(1.5)
    .stroke();
  doc.moveDown(1);
}

function drawKeyValueGrid(
  doc: PDFKit.PDFDocument,
  rows: Array<[string, string]>
): void {
  const colWidth = contentWidth() / 2;
  let y = doc.y;

  for (let i = 0; i < rows.length; i += 2) {
    ensureSpace(doc, 36);
    y = doc.y;
    const left = rows[i];
    const right = rows[i + 1];

    for (let index = 0; index < 2; index++) {
      const pair = index === 0 ? left : right;
      if (!pair) continue;
      const x = PAGE.margin + index * colWidth;
      doc
        .fillColor(COLORS.muted)
        .font("Helvetica")
        .fontSize(8)
        .text(pair[0].toUpperCase(), x, y, { width: colWidth - 12 });
      doc
        .fillColor(COLORS.ink)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(pair[1], x, y + 12, { width: colWidth - 12 });
    }

    doc.y = y + 34;
  }
}

function drawItemsTable(doc: PDFKit.PDFDocument, order: AdminOrderDetail): void {
  drawSectionTitle(doc, "Itens do pedido");
  ensureSpace(doc, 48);

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

  const headerY = doc.y;
  doc.rect(PAGE.margin, headerY, contentWidth(), 22).fill(COLORS.soft);
  doc
    .fillColor(COLORS.forestDark)
    .font("Helvetica-Bold")
    .fontSize(8);
  doc.text("PRODUTO", cols.item + 8, headerY + 7, { width: widths.item - 8 });
  doc.text("QTD", cols.qty, headerY + 7, { width: widths.qty, align: "right" });
  doc.text("UNITÁRIO", cols.unit, headerY + 7, {
    width: widths.unit,
    align: "right",
  });
  doc.text("TOTAL", cols.total, headerY + 7, {
    width: widths.total - 8,
    align: "right",
  });
  doc.y = headerY + 28;

  for (const item of order.items) {
    const variant = [item.size, item.color].filter(Boolean).join(" · ");
    doc.font("Helvetica-Bold").fontSize(9);
    const nameHeight = doc.heightOfString(item.name, {
      width: widths.item - 8,
    });
    const rowHeight = Math.max(28, nameHeight + (variant ? 14 : 0) + 10);
    ensureSpace(doc, rowHeight + 4);

    const y = doc.y;
    doc
      .fillColor(COLORS.ink)
      .font("Helvetica-Bold")
      .fontSize(9)
      .text(item.name, cols.item + 8, y, { width: widths.item - 8 });

    if (variant) {
      doc
        .fillColor(COLORS.muted)
        .font("Helvetica")
        .fontSize(8)
        .text(variant, cols.item + 8, y + nameHeight + 2, {
          width: widths.item - 8,
        });
    }

    const valueY = y + 2;
    doc
      .fillColor(COLORS.ink)
      .font("Helvetica")
      .fontSize(9)
      .text(String(item.quantity), cols.qty, valueY, {
        width: widths.qty,
        align: "right",
      })
      .text(formatBrl(item.price), cols.unit, valueY, {
        width: widths.unit,
        align: "right",
      })
      .font("Helvetica-Bold")
      .text(formatBrl(item.price * item.quantity), cols.total, valueY, {
        width: widths.total - 8,
        align: "right",
      });

    doc.y = y + rowHeight;
    doc
      .moveTo(PAGE.margin, doc.y)
      .lineTo(PAGE.width - PAGE.margin, doc.y)
      .strokeColor(COLORS.line)
      .lineWidth(0.5)
      .stroke();
    doc.y += 6;
  }
}

function drawTotals(doc: PDFKit.PDFDocument, order: AdminOrderDetail): void {
  ensureSpace(doc, 90);
  const boxWidth = 210;
  const x = PAGE.width - PAGE.margin - boxWidth;
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const rows: Array<[string, string, boolean]> = [
    ["Subtotal", formatBrl(subtotal), false],
    ["Frete", formatBrl(order.shippingAmount), false],
  ];
  if (order.couponCode) {
    rows.push(["Cupom", order.couponCode, false]);
  }
  rows.push(["Total", formatBrl(order.totalAmount), true]);

  let y = doc.y + 8;
  for (const [label, value, emph] of rows) {
    if (emph) {
      doc.rect(x, y - 4, boxWidth, 26).fill(COLORS.forest);
      doc
        .fillColor(COLORS.white)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(label, x + 10, y + 3, { width: 80 })
        .text(value, x + 90, y + 3, { width: boxWidth - 100, align: "right" });
      y += 30;
    } else {
      doc
        .fillColor(COLORS.muted)
        .font("Helvetica")
        .fontSize(9)
        .text(label, x + 10, y, { width: 80 });
      doc
        .fillColor(COLORS.ink)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(value, x + 90, y, { width: boxWidth - 100, align: "right" });
      y += 18;
    }
  }
  doc.y = y + 8;
}

function drawOrderDetailPage(
  doc: PDFKit.PDFDocument,
  order: AdminOrderDetail,
  index: number,
  total: number
): void {
  drawBrandHeader(doc, `Pedido ${index + 1} de ${total}`);

  doc
    .fillColor(COLORS.forestDark)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(`Pedido #${formatOrderShortId(order.id)}`, PAGE.margin, doc.y);

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(9)
    .text(`ID completo: ${order.id}`, PAGE.margin, doc.y + 4);

  doc.moveDown(1.4);

  drawKeyValueGrid(doc, [
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
    [
      "Pago em",
      order.paidAt ? formatDateTime(order.paidAt) : "—",
    ],
  ]);

  drawSectionTitle(doc, "Entrega");
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
    ensureSpace(doc, 16);
    doc
      .fillColor(COLORS.ink)
      .font("Helvetica")
      .fontSize(9)
      .text(line, PAGE.margin, doc.y, { width: contentWidth() });
  }
  doc.moveDown(0.8);

  drawItemsTable(doc, order);
  drawTotals(doc, order);
}

function drawSummaryPage(
  doc: PDFKit.PDFDocument,
  orders: AdminOrderDetail[]
): void {
  drawBrandHeader(doc, "Relatório de pedidos");

  doc
    .fillColor(COLORS.forestDark)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Resumo da seleção", PAGE.margin, doc.y);

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(10)
    .text(
      `${orders.length} pedido(s) · Total consolidado ${formatBrl(
        orders.reduce((sum, order) => sum + order.totalAmount, 0)
      )}`,
      PAGE.margin,
      doc.y + 6
    );

  doc.moveDown(1.6);

  const cols = {
    id: PAGE.margin,
    customer: PAGE.margin + 70,
    date: PAGE.margin + 230,
    payment: PAGE.margin + 320,
    status: PAGE.margin + 400,
    total: PAGE.margin + 460,
  };

  const headerY = doc.y;
  doc.rect(PAGE.margin, headerY, contentWidth(), 22).fill(COLORS.soft);
  doc.fillColor(COLORS.forestDark).font("Helvetica-Bold").fontSize(8);
  doc.text("PEDIDO", cols.id + 6, headerY + 7);
  doc.text("CLIENTE", cols.customer, headerY + 7);
  doc.text("DATA", cols.date, headerY + 7);
  doc.text("PAGAMENTO", cols.payment, headerY + 7);
  doc.text("STATUS", cols.status, headerY + 7);
  doc.text("TOTAL", cols.total, headerY + 7, {
    width: PAGE.width - PAGE.margin - cols.total - 6,
    align: "right",
  });
  doc.y = headerY + 28;

  for (const order of orders) {
    ensureSpace(doc, 22);
    const y = doc.y;
    doc.fillColor(COLORS.ink).font("Helvetica").fontSize(8);
    doc.text(`#${formatOrderShortId(order.id)}`, cols.id + 6, y, {
      width: 60,
    });
    doc.text(order.customerName || "—", cols.customer, y, { width: 150 });
    doc.text(
      new Intl.DateTimeFormat("pt-BR").format(new Date(order.createdAt)),
      cols.date,
      y,
      { width: 80 }
    );
    doc.text(PAYMENT_METHOD_LABELS[order.paymentMethod], cols.payment, y, {
      width: 70,
    });
    doc.text(ORDER_STATUS_LABELS[order.status], cols.status, y, {
      width: 55,
    });
    doc
      .font("Helvetica-Bold")
      .text(formatBrl(order.totalAmount), cols.total, y, {
        width: PAGE.width - PAGE.margin - cols.total - 6,
        align: "right",
      });
    doc.y = y + 18;
  }

  doc.moveDown(1.2);
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica-Oblique")
    .fontSize(8)
    .text(
      "Nas páginas seguintes, cada pedido é detalhado com itens, frete e totais.",
      PAGE.margin,
      doc.y,
      { width: contentWidth() }
    );
}

export async function buildOrdersPdfBuffer(
  orders: AdminOrderDetail[]
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: PAGE.margin,
        bottom: PAGE.margin + 20,
        left: PAGE.margin,
        right: PAGE.margin,
      },
      info: {
        Title: `Pedidos — ${SITE_NAME}`,
        Author: SITE_NAME,
        Subject: "Exportação de pedidos do painel administrativo",
        Creator: `${SITE_NAME} Admin`,
      },
      autoFirstPage: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawSummaryPage(doc, orders);
    for (let index = 0; index < orders.length; index++) {
      doc.addPage();
      drawOrderDetailPage(doc, orders[index], index, orders.length);
    }

    doc.end();
  });
}
