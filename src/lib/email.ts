import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const brandName = "Lazoğlu Kuruyemiş";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "";


interface OrderEmailData {
  to: string;
  customerName: string;
  orderNumber: string;
  total: number;
  items: Array<{
    productName: string;
    variant?: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface AdminOrderNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  paymentMethod: string;
  city: string;
  district: string;
  address: string;
  items: Array<{
    productName: string;
    variant?: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface WelcomeCouponEmailData {
  to: string;
  couponCode: string;
  discountText: string;
}

interface DiscountProduct {
  name: string;
  slug: string;
  basePrice: number;
  discountPrice: number;
}

interface DiscountAnnouncementEmailData {
  recipients: string[];
  product: DiscountProduct;
}

function canSendEmail() {
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  return Boolean(
    user &&
      pass &&
      !user.includes("your-") &&
      !pass.includes("your-") &&
      !user.includes("example") &&
      !pass.includes("password")
  );
}

function sender() {
  return process.env.SMTP_FROM || `${brandName} <noreply@fkkuruyemis.com>`;
}

function formatPrice(value: number) {
  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function layout(title: string, subtitle: string, body: string) {
  return `
    <!DOCTYPE html>
    <html lang="tr">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background: #fdf8ed; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.10);">
        <div style="background: linear-gradient(135deg, #3d1708, #bc6513); padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${title}</h1>
          <p style="color: rgba(255,255,255,0.84); margin: 8px 0 0;">${subtitle}</p>
        </div>
        <div style="padding: 30px;">
          ${body}
          <p style="color: #999; font-size: 12px; text-align: center; margin: 30px 0 0;">
            ${brandName} | Çorum, Türkiye<br>
            <a href="mailto:info@lazoglukuruyemis.com" style="color: #d4841a;">info@lazoglukuruyemis.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!canSendEmail()) {
    console.warn("SMTP bilgileri tanımlı değil, sipariş e-postası gönderilmedi.");
    return;
  }

  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #f0e6d3;">${item.productName}${item.variant ? ` (${item.variant})` : ""}</td>
          <td style="padding: 10px; border-bottom: 1px solid #f0e6d3; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #f0e6d3; text-align: right;">${formatPrice(item.total)}</td>
        </tr>
      `
    )
    .join("");

  const html = layout(
    brandName,
    "Siparişiniz alındı",
    `
      <p style="color: #333; font-size: 16px;">Merhaba <strong>${data.customerName}</strong>,</p>
      <p style="color: #666; line-height: 1.6;">Siparişiniz başarıyla alındı. Sipariş numaranız: <strong style="color: #d4841a;">${data.orderNumber}</strong></p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #fdf8ed;">
            <th style="padding: 10px; text-align: left; color: #333;">Ürün</th>
            <th style="padding: 10px; text-align: center; color: #333;">Adet</th>
            <th style="padding: 10px; text-align: right; color: #333;">Tutar</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 15px 10px; font-weight: bold; font-size: 16px;">Toplam</td>
            <td style="padding: 15px 10px; font-weight: bold; font-size: 18px; text-align: right; color: #d4841a;">${formatPrice(data.total)}</td>
          </tr>
        </tfoot>
      </table>
      <div style="background: #fdf8ed; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <p style="margin: 0; color: #666; font-size: 14px;">Siparişiniz 1-3 iş günü içinde kargoya verilecektir.</p>
      </div>
    `
  );

  try {
    await transporter.sendMail({
      from: sender(),
      to: data.to,
      subject: `Siparişiniz Alındı - #${data.orderNumber} | ${brandName}`,
      html,
    });
  } catch (error) {
    console.error("Order email send error:", error);
  }
}

export async function sendAdminOrderNotificationEmail(data: AdminOrderNotificationData) {
  if (!canSendEmail() || !adminEmail) {
    console.warn("Admin e-posta adresi veya SMTP bilgileri tanımlı değil, sipariş bildirimi gönderilmedi.");
    return;
  }

  const paymentMethodLabels: Record<string, string> = {
    CREDIT_CARD: "Kredi Kartı",
    BANK_TRANSFER: "Havale/EFT",
    CASH_ON_DELIVERY: "Kapıda Ödeme",
  };

  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #f0e6d3;">${item.productName}${item.variant ? ` (${item.variant})` : ""}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #f0e6d3; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #f0e6d3; text-align: right;">${formatPrice(item.price)}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #f0e6d3; text-align: right; font-weight: bold;">${formatPrice(item.total)}</td>
        </tr>
      `
    )
    .join("");

  const adminPanelUrl = `${siteUrl}/admin/siparisler`;

  const html = layout(
    "🛒 Yeni Sipariş!",
    `Sipariş No: #${data.orderNumber}`,
    `
      <div style="background: #fff8eb; border-left: 4px solid #d4841a; padding: 14px 16px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; color: #7c4a0a; font-weight: 600;">Yeni bir sipariş alındı! Lütfen kontrol edin.</p>
      </div>

      <h3 style="margin: 0 0 10px; color: #3d1708; font-size: 15px;">👤 Müşteri Bilgileri</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr><td style="padding: 5px 0; color: #666; width: 130px;">Ad Soyad:</td><td style="padding: 5px 0; font-weight: 600; color: #333;">${data.customerName}</td></tr>
        <tr><td style="padding: 5px 0; color: #666;">E-posta:</td><td style="padding: 5px 0; color: #333;">${data.customerEmail}</td></tr>
        <tr><td style="padding: 5px 0; color: #666;">Telefon:</td><td style="padding: 5px 0; color: #333;">${data.customerPhone}</td></tr>
        <tr><td style="padding: 5px 0; color: #666;">Şehir:</td><td style="padding: 5px 0; color: #333;">${data.city} / ${data.district}</td></tr>
        <tr><td style="padding: 5px 0; color: #666;">Adres:</td><td style="padding: 5px 0; color: #333;">${data.address}</td></tr>
        <tr><td style="padding: 5px 0; color: #666;">Ödeme:</td><td style="padding: 5px 0; color: #333;">${paymentMethodLabels[data.paymentMethod] || data.paymentMethod}</td></tr>
      </table>

      <h3 style="margin: 0 0 10px; color: #3d1708; font-size: 15px;">📦 Sipariş Detayı</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #fdf8ed;">
            <th style="padding: 8px 10px; text-align: left; color: #555; font-size: 13px;">Ürün</th>
            <th style="padding: 8px 10px; text-align: center; color: #555; font-size: 13px;">Adet</th>
            <th style="padding: 8px 10px; text-align: right; color: #555; font-size: 13px;">Birim</th>
            <th style="padding: 8px 10px; text-align: right; color: #555; font-size: 13px;">Toplam</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 12px 10px; font-weight: bold; font-size: 15px;">Genel Toplam</td>
            <td style="padding: 12px 10px; font-weight: bold; font-size: 18px; text-align: right; color: #d4841a;">${formatPrice(data.total)}</td>
          </tr>
        </tfoot>
      </table>

      <p style="text-align: center; margin: 24px 0;">
        <a href="${adminPanelUrl}" style="display: inline-block; background: #3d1708; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700;">Admin Panelini Aç →</a>
      </p>
    `
  );

  try {
    await transporter.sendMail({
      from: sender(),
      to: adminEmail,
      subject: `🛒 Yeni Sipariş: #${data.orderNumber} — ${data.customerName} (${formatPrice(data.total)})`,
      html,
    });
  } catch (error) {
    console.error("Admin order notification email error:", error);
  }
}

export async function sendWelcomeCouponEmail(data: WelcomeCouponEmailData) {
  if (!canSendEmail()) {
    console.warn("SMTP bilgileri tanımlı değil, hoş geldin kuponu e-postası gönderilmedi.");
    return;
  }

  const html = layout(
    brandName,
    "E-bültene hoş geldiniz",
    `
      <h2 style="margin: 0 0 12px; color: #3d1708;">Hediye kuponunuz hazır</h2>
      <p style="line-height: 1.6; color: #666;">Aboneliğiniz için teşekkür ederiz. İlk alışverişinizde kullanabileceğiniz hediye kuponunuz:</p>
      <div style="margin: 24px 0; padding: 18px; border: 2px dashed #d4841a; border-radius: 14px; text-align: center; background: #fff8eb;">
        <div style="font-size: 13px; color: #8a5a16; margin-bottom: 6px;">${data.discountText}</div>
        <div style="font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #3d1708;">${data.couponCode}</div>
      </div>
      <p style="text-align: center; margin: 28px 0;">
        <a href="${siteUrl}/urunler" style="display: inline-block; background: #d4841a; color: #fff; text-decoration: none; padding: 13px 22px; border-radius: 12px; font-weight: 700;">Alışverişe Başla</a>
      </p>
    `
  );

  try {
    await transporter.sendMail({
      from: sender(),
      to: data.to,
      subject: `Hediye kuponunuz hazır: ${data.couponCode} | ${brandName}`,
      html,
    });
  } catch (error) {
    console.error("Welcome coupon email send error:", error);
  }
}

export async function sendDiscountAnnouncementEmail(data: DiscountAnnouncementEmailData) {
  if (!canSendEmail() || data.recipients.length === 0) {
    if (!canSendEmail()) console.warn("SMTP bilgileri tanımlı değil, indirim duyurusu gönderilmedi.");
    return;
  }

  const discountRate = Math.max(
    1,
    Math.round(((data.product.basePrice - data.product.discountPrice) / data.product.basePrice) * 100)
  );
  const productUrl = `${siteUrl}/urunler/${data.product.slug}`;
  const html = layout(
    "Yeni İndirim",
    brandName,
    `
      <p style="margin: 0 0 10px; color: #d4841a; font-weight: 700;">%${discountRate} indirim</p>
      <h2 style="margin: 0 0 14px; color: #3d1708;">${data.product.name}</h2>
      <p style="color: #666; line-height: 1.6;">Sevdiğiniz ürünlerden biri indirime girdi. Stok bitmeden inceleyebilirsiniz.</p>
      <div style="margin: 22px 0; padding: 18px; background: #fff8eb; border-radius: 14px;">
        <span style="color: #999; text-decoration: line-through; margin-right: 10px;">${formatPrice(data.product.basePrice)}</span>
        <strong style="font-size: 24px; color: #3d1708;">${formatPrice(data.product.discountPrice)}</strong>
      </div>
      <p style="text-align: center; margin: 28px 0;">
        <a href="${productUrl}" style="display: inline-block; background: #d4841a; color: #fff; text-decoration: none; padding: 13px 22px; border-radius: 12px; font-weight: 700;">Ürünü İncele</a>
      </p>
      <p style="font-size: 12px; color: #999; text-align: center;">Bu e-posta, ${brandName} e-bülten abonelerine gönderilmiştir.</p>
    `
  );

  const batches = Array.from({ length: Math.ceil(data.recipients.length / 40) }, (_, index) =>
    data.recipients.slice(index * 40, index * 40 + 40)
  );

  try {
    await Promise.all(
      batches.map((batch) =>
        transporter.sendMail({
          from: sender(),
          bcc: batch,
          subject: `%${discountRate} indirim başladı: ${data.product.name} | ${brandName}`,
          html,
        })
      )
    );
  } catch (error) {
    console.error("Discount announcement email send error:", error);
  }
}
