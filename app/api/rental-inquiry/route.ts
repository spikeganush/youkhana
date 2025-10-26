import { NextRequest, NextResponse } from "next/server";
import { createRentalInquiry } from "@/lib/rental-inquiries";
import { getProduct } from "@/lib/rental-products";
import { sendRentalInquiryEmail } from "@/actions/sendEmail";
import { z } from "zod";

// Validation schema for rental inquiry
const rentalInquirySchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string().optional(),
  selectedVariant: z
    .object({
      id: z.string(),
      title: z.string(),
      options: z.array(
        z.object({
          name: z.string(),
          value: z.string(),
        })
      ),
    })
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  rentalDays: z.number().optional(),
  message: z.string().max(1000, "Message is too long").optional(),
});

/**
 * POST /api/rental-inquiry
 *
 * Create a new rental inquiry and send notification email
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = rentalInquirySchema.parse(body);

    // Fetch product details
    const product = await getProduct(validatedData.productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product is available
    if (product.status !== "active" || product.availableQuantity <= 0) {
      return NextResponse.json(
        { error: "Product is not available for rent" },
        { status: 400 }
      );
    }

    // Calculate estimated total if dates are provided
    let estimatedTotal: number | undefined;
    if (validatedData.rentalDays) {
      estimatedTotal = product.rentalPrice.daily * validatedData.rentalDays;
      if (product.deposit) {
        estimatedTotal += product.deposit;
      }
    }

    // Create rental inquiry in Redis
    const inquiry = await createRentalInquiry({
      productId: product.id,
      productHandle: product.handle,
      productTitle: product.title,
      customerName: validatedData.customerName,
      customerEmail: validatedData.customerEmail,
      customerPhone: validatedData.customerPhone,
      selectedVariant: validatedData.selectedVariant,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate,
      rentalDays: validatedData.rentalDays,
      message: validatedData.message,
      dailyRate: product.rentalPrice.daily,
      weeklyRate: product.rentalPrice.weekly,
      monthlyRate: product.rentalPrice.monthly,
      deposit: product.deposit,
      estimatedTotal,
    });

    // Send notification email to owner
    try {
      await sendRentalInquiryEmail({
        customerName: inquiry.customerName,
        customerEmail: inquiry.customerEmail,
        customerPhone: inquiry.customerPhone,
        productTitle: inquiry.productTitle,
        productHandle: inquiry.productHandle,
        selectedVariant: inquiry.selectedVariant,
        startDate: inquiry.startDate,
        endDate: inquiry.endDate,
        rentalDays: inquiry.rentalDays,
        message: inquiry.message,
        dailyRate: inquiry.dailyRate,
        weeklyRate: inquiry.weeklyRate,
        monthlyRate: inquiry.monthlyRate,
        deposit: inquiry.deposit,
        estimatedTotal: inquiry.estimatedTotal,
      });
    } catch (emailError) {
      console.error("Failed to send inquiry email:", emailError);
      // Don't fail the request if email fails - inquiry is still stored
    }

    return NextResponse.json({
      success: true,
      inquiry: {
        id: inquiry.id,
        productTitle: inquiry.productTitle,
        status: inquiry.status,
      },
      message:
        "Your rental inquiry has been submitted successfully! We will contact you soon.",
    });
  } catch (error) {
    console.error("Rental inquiry error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit rental inquiry" },
      { status: 500 }
    );
  }
}
