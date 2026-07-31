import { z } from "zod";

export const loginSchema = z.object({
  email: z.string({ required_error: "Kullan\u0131c\u0131 ad\u0131 veya e-posta zorunludur." }),
  password: z
    .string({ required_error: "\u015eifre zorunludur." })
    .min(6, "\u015eifre en az 6 karakter olmal\u0131d\u0131r."),
});

export const siparisSchema = z.object({
  customerName: z
    .string({ required_error: "Ad soyad zorunludur." })
    .min(2, "Ad soyad en az 2 karakter olmal\u0131d\u0131r.")
    .max(100, "Ad soyad 100 karakteri ge\u00e7emez."),
  customerEmail: z
    .string({ required_error: "E-posta zorunludur." })
    .email("Ge\u00e7erli bir e-posta giriniz."),
  customerPhone: z
    .string({ required_error: "Telefon zorunludur." })
    .min(10, "Ge\u00e7erli bir telefon numaras\u0131 giriniz.")
    .max(20, "Telefon numaras\u0131 20 karakteri ge\u00e7emez."),
  address: z
    .string({ required_error: "Adres zorunludur." })
    .min(10, "Adres en az 10 karakter olmal\u0131d\u0131r.")
    .max(500, "Adres 500 karakteri ge\u00e7emez."),
  city: z
    .string({ required_error: "\u015eehir zorunludur." })
    .min(2, "\u015eehir en az 2 karakter olmal\u0131d\u0131r.")
    .max(100, "\u015eehir 100 karakteri ge\u00e7emez."),
  district: z
    .string({ required_error: "\u0130l\u00e7e zorunludur." })
    .min(2, "\u0130l\u00e7e en az 2 karakter olmal\u0131d\u0131r.")
    .max(100, "\u0130l\u00e7e 100 karakteri ge\u00e7emez."),
  postalCode: z.string().max(10, "Posta kodu 10 karakteri ge\u00e7emez.").optional(),
  notes: z.string().max(1000, "Sipari\u015f notu 1000 karakteri ge\u00e7emez.").optional(),
  paymentMethod: z.enum(["CREDIT_CARD"]),
  cardHolder: z
    .string({ required_error: "Kart \u00fczerindeki isim zorunludur." })
    .trim()
    .min(3, "Kart \u00fczerindeki isim ge\u00e7erli de\u011fil.")
    .max(100, "Kart \u00fczerindeki isim 100 karakteri ge\u00e7emez."),
  cardNumber: z
    .string({ required_error: "Kart numaras\u0131 zorunludur." })
    .min(12, "Kart numaras\u0131 ge\u00e7erli de\u011fil.")
    .max(23, "Kart numaras\u0131 ge\u00e7erli de\u011fil."),
  cardExpiry: z
    .string({ required_error: "Son kullanma tarihi zorunludur." })
    .regex(/^\d{2}\/\d{2}$/, "Son kullanma tarihi AA/YY format\u0131nda olmal\u0131d\u0131r."),
  cardCvv: z
    .string({ required_error: "CVV zorunludur." })
    .regex(/^\d{3,4}$/, "CVV ge\u00e7erli de\u011fil."),
  couponCode: z.string().max(50, "Kupon kodu 50 karakteri ge\u00e7emez.").optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string(),
        variantId: z.string().optional(),
        variant: z.string().optional(),
        price: z.number().positive(),
        quantity: z.number().int().positive(),
        total: z.number().positive(),
      })
    )
    .min(1, "Sepet bo\u015f olamaz."),
  subtotal: z.number().nonnegative(),
  shippingCost: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().positive(),
});

export const newsletterSchema = z.object({
  email: z
    .string({ required_error: "E-posta zorunludur." })
    .email("Ge\u00e7erli bir e-posta giriniz."),
});

export const kuponDogrulaSchema = z.object({
  code: z.string().min(1).max(50),
  cartTotal: z.number().nonnegative(),
});

export const urunSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(5000),
  shortDesc: z.string().max(500).optional(),
  origin: z.string().max(200).optional(),
  production: z.string().max(200).optional(),
  freshness: z.string().max(200).optional(),
  images: z.array(z.string().url()).min(1, "En az 1 g\u00f6rsel gerekli."),
  basePrice: z.number().positive(),
  discountPrice: z.number().positive().optional().nullable(),
  isNatural: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isActive: z.boolean().default(true),
  totalStock: z.number().int().nonnegative().default(0),
  categoryId: z.string().min(1, "Kategori se\u00e7iniz."),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(5).max(300),
  slug: z.string().min(5).max(300).optional(),
  content: z.string().min(50),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional().nullable(),
  isPublished: z.boolean().default(false),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(500).optional(),
  tags: z.array(z.string()).default([]),
  authorName: z.string().default("FK KURUYEM\u0130\u015e"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SiparisInput = z.infer<typeof siparisSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type UrunInput = z.infer<typeof urunSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
