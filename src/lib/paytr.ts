import crypto from "crypto";

const MERCHANT_ID   = process.env.PAYTR_MERCHANT_ID!;
const MERCHANT_KEY  = process.env.PAYTR_MERCHANT_KEY!;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;
const TEST_MODE     = process.env.PAYTR_TEST_MODE === "true";
const PAYTR_API_URL = "https://www.paytr.com/odeme/api/get-token";

export interface PayTRBasketItem {
  name: string;
  price: number; // kuruş cinsinden (×100)
  quantity: number;
}

export interface PayTRTokenParams {
  orderId: string;        // sipariş numarası
  email: string;
  phone: string;
  fullName: string;
  address: string;
  ip: string;
  totalAmount: number;   // kuruş (TL × 100)
  basketItems: PayTRBasketItem[];
  currency?: string;     // default "TL"
  installmentCount?: number; // 0 = taksit yok
  lang?: string;         // default "tr"
  testMode?: boolean;    // default false (canlı)
  callbackUrl?: string;
  okUrl?: string;
  failUrl?: string;
}

export interface PayTRTokenResult {
  ok: boolean;
  iframeToken?: string;
  message?: string;
}

export async function getPayTRIframeToken(params: PayTRTokenParams): Promise<PayTRTokenResult> {
  try {
    const {
      orderId,
      email,
      phone,
      fullName,
      address,
      ip,
      totalAmount,
      basketItems,
      currency = "TL",
      installmentCount = 0,
      lang = "tr",
      testMode = TEST_MODE,  // env'den otomatik okur
      callbackUrl,
      okUrl,
      failUrl,
    } = params;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fkkuruyemis.com";
    const resolvedCallback = callbackUrl || `${siteUrl}/api/paytr/callback`;
    const resolvedOk = okUrl || `${siteUrl}/siparis-basarili`;
    const resolvedFail = failUrl || `${siteUrl}/odeme?error=1`;

    // Basket: JSON array of [name, price_kuruş_str, qty]
    const basketJson = JSON.stringify(
      basketItems.map((item) => [item.name, String(item.price), item.quantity])
    );
    const basketEncoded = Buffer.from(basketJson).toString("base64");

    // HMAC hash string
    const hashStr =
      MERCHANT_ID +
      ip +
      orderId +
      email +
      String(totalAmount) +
      basketEncoded +
      String(installmentCount) +
      String(testMode ? 1 : 0) +
      currency +
      MERCHANT_SALT;

    const paytrToken = crypto
      .createHmac("sha256", MERCHANT_KEY)
      .update(hashStr)
      .digest("base64");

    const body = new URLSearchParams({
      merchant_id: MERCHANT_ID,
      user_ip: ip,
      merchant_oid: orderId,
      email,
      payment_amount: String(totalAmount),
      paytr_token: paytrToken,
      user_basket: basketEncoded,
      debug_on: "0",
      no_installment: installmentCount === 0 ? "1" : "0",
      max_installment: String(installmentCount || 0),
      user_name: fullName,
      user_address: address,
      user_phone: phone,
      merchant_ok_url: resolvedOk,
      merchant_fail_url: resolvedFail,
      merchant_notif_url: resolvedCallback,
      currency,
      test_mode: testMode ? "1" : "0",
      debug_on: testMode ? "1" : "0",  // test modunda hata loglarını aç
      lang,
    });

    const response = await fetch(PAYTR_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const result = await response.json();

    if (result.status === "success") {
      return { ok: true, iframeToken: result.token };
    } else {
      console.error("[PayTR] Token error:", result);
      return { ok: false, message: result.reason || "PayTR token alınamadı." };
    }
  } catch (err) {
    console.error("[PayTR] Exception:", err);
    return { ok: false, message: "PayTR bağlantı hatası." };
  }
}

/** PayTR callback'inden gelen hash'i doğrula */
export function verifyPayTRCallback(params: {
  merchantOid: string;
  status: string;
  totalAmount: string;
  hash: string;
}): boolean {
  const { merchantOid, status, totalAmount, hash } = params;

  const hashStr = MERCHANT_ID + MERCHANT_SALT + merchantOid + status + totalAmount;
  const expected = crypto
    .createHmac("sha256", MERCHANT_KEY)
    .update(hashStr)
    .digest("base64");

  return expected === hash;
}
