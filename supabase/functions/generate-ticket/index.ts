import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1';
import QRCode from 'npm:qrcode@1.5.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bookingId } = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch booking details with related data
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        screenings (
          *,
          movies (*),
          halls (*)
        ),
        booked_seats (
          seats (
            *,
            seat_rows (*)
          )
        )
      `)
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.276, 841.890]); // A4 size
    const { width, height } = page.getSize();

    // Get fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(bookingId);
    const qrImage = await pdfDoc.embedPng(qrCode);
    const qrDims = qrImage.scale(0.5);

    // Draw ticket content
    page.drawText('MOVIE TICKET', {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
    });

    page.drawText(booking.screenings.movies.title, {
      x: 50,
      y: height - 100,
      size: 18,
      font: boldFont,
    });

    const details = [
      `Date: ${booking.screenings.screening_date}`,
      `Time: ${booking.screenings.start_time}`,
      `Hall: ${booking.screenings.halls.name}`,
      `Seats: ${booking.booked_seats.map(bs => 
        `${bs.seats.seat_rows.row_letter}${bs.seats.seat_number}`
      ).join(', ')}`,
      `Booking ID: ${booking.id}`,
      `Total Price: $${booking.total_price.toFixed(2)}`,
    ];

    details.forEach((detail, index) => {
      page.drawText(detail, {
        x: 50,
        y: height - 150 - (index * 30),
        size: 12,
        font: font,
      });
    });

    // Draw QR code
    page.drawImage(qrImage, {
      x: width - qrDims.width - 50,
      y: height - qrDims.height - 50,
      width: qrDims.width,
      height: qrDims.height,
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${bookingId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating ticket:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});