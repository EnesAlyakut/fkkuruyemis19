export interface NormalizedCard {
  holderName: string;
  number: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
}

const BLOCKED_TEST_CARD_NUMBERS = new Set([
  "2223003122003222",
  "371449635398431",
  "378282246310005",
  "4000000000000002",
  "4000000000000069",
  "4000000000000119",
  "4000000000000127",
  "4000000000000341",
  "4000000000009995",
  "4111111111111111",
  "4242424242424242",
  "5105105105105100",
  "5200828282828210",
  "5555555555554444",
  "6011111111111117",
  "6500000000000002",
]);

function luhnCheck(cardNumber: string) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = cardNumber.length - 1; i >= 0; i -= 1) {
    let digit = Number(cardNumber[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum > 0 && sum % 10 === 0;
}

function isExpired(expireMonth: string, expireYear: string) {
  const month = Number(expireMonth);
  const year = 2000 + Number(expireYear);

  if (month < 1 || month > 12) return true;

  const now = new Date();
  const expiry = new Date(year, month, 0, 23, 59, 59, 999);
  return expiry < now;
}

function detectCardBrand(cardNumber: string) {
  const firstTwo = Number(cardNumber.slice(0, 2));
  const firstFour = Number(cardNumber.slice(0, 4));
  const firstSix = Number(cardNumber.slice(0, 6));

  if (/^3[47]/.test(cardNumber)) return "amex";
  if (/^4/.test(cardNumber)) return "visa";
  if (firstTwo >= 51 && firstTwo <= 55) return "mastercard";
  if (firstFour >= 2221 && firstFour <= 2720) return "mastercard";
  if (/^6(?:011|5)/.test(cardNumber)) return "discover";
  if (firstSix >= 979200 && firstSix <= 979289) return "troy";
  return "unknown";
}

function hasValidBrandLength(cardNumber: string) {
  const brand = detectCardBrand(cardNumber);

  if (brand === "amex") return cardNumber.length === 15;
  if (brand === "visa") return [13, 16, 19].includes(cardNumber.length);
  if (brand === "mastercard") return cardNumber.length === 16;
  if (brand === "discover") return [16, 19].includes(cardNumber.length);
  if (brand === "troy") return cardNumber.length === 16;

  return cardNumber.length >= 13 && cardNumber.length <= 19;
}

function isObviouslyFakeCardNumber(cardNumber: string) {
  if (BLOCKED_TEST_CARD_NUMBERS.has(cardNumber)) return true;
  if (/^(\d)\1+$/.test(cardNumber)) return true;
  if (/^(1234|0123|9876|4321)/.test(cardNumber)) return true;
  return false;
}

export function normalizeAndValidateCard(input: {
  cardHolder: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}): { ok: true; card: NormalizedCard } | { ok: false; message: string } {
  const holderName = input.cardHolder.trim().replace(/\s+/g, " ");
  const number = input.cardNumber.replace(/\D/g, "");
  const cvc = input.cardCvv.replace(/\D/g, "");
  const [expireMonth = "", expireYear = ""] = input.cardExpiry.split("/");

  if (holderName.length < 3) {
    return { ok: false, message: "Kart üzerindeki isim geçerli değil." };
  }

  if (
    !/^\d{13,19}$/.test(number) ||
    isObviouslyFakeCardNumber(number) ||
    !hasValidBrandLength(number) ||
    !luhnCheck(number)
  ) {
    return { ok: false, message: "Kart numarası geçerli değil." };
  }

  const brand = detectCardBrand(number);
  const expectedCvcLength = brand === "amex" ? 4 : 3;

  if (!new RegExp(`^\\d{${expectedCvcLength}}$`).test(cvc)) {
    return { ok: false, message: "CVV geçerli değil." };
  }

  if (!/^\d{2}$/.test(expireMonth) || !/^\d{2}$/.test(expireYear) || isExpired(expireMonth, expireYear)) {
    return { ok: false, message: "Kart son kullanma tarihi geçerli değil." };
  }

  return {
    ok: true,
    card: {
      holderName,
      number,
      expireMonth,
      expireYear: `20${expireYear}`,
      cvc,
    },
  };
}
