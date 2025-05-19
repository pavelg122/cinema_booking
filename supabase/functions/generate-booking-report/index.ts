import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { PDFDocument, rgb, StandardFonts } from 'npm:pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { startDate, endDate } = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch bookings with related data
    let query = supabase
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
      .order('booking_date', { ascending: false });

    if (startDate) {
      query = query.gte('booking_date', startDate);
    }
    if (endDate) {
      query = query.lte('booking_date', endDate);
    }

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      throw bookingsError;
    }

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([841.890, 595.276]); // A4 landscape
    const { width, height } = page.getSize();

    // Get fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Draw report header
    page.drawText('Booking Report', {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
    });

    // Draw date range
    const dateRange = startDate && endDate
      ? `${startDate} to ${endDate}`
      : 'All time';
    page.drawText(`Period: ${dateRange}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font: font,
    });

    // Draw summary
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.total_price, 0);

    const summary = [
      `Total Bookings: ${totalBookings}`,
      `Confirmed Bookings: ${confirmedBookings}`,
      `Total Revenue: $${totalRevenue.toFixed(2)}`,
    ];

    summary.forEach((line, index) => {
      page.drawText(line, {
        x: 50,
        y: height - 120 - (index * 20),
        size: 12,
        font: font,
      });
    });

    // Draw bookings table
    const headers = ['Date', 'Movie', 'Customer', 'Seats', 'Status', 'Amount'];
    const columnWidths = [100, 200, 150, 100, 80, 80];
    let yPos = height - 180;

    // Draw table headers
    let xPos = 50;
    headers.forEach((header, index) => {
      page.drawText(header, {
        x: xPos,
        y: yPos,
        size: 10,
        font: boldFont,
      });
      xPos += columnWidths[index];
    });

    // Draw table rows
    yPos -= 20;
    bookings.forEach((booking) => {
      if (yPos < 50) {
        // Add new page if needed
        page = pdfDoc.addPage([841.890, 595.276]);
        yPos = height - 50;
      }

      xPos = 50;
      const rowData = [
        new Date(booking.booking_date).toLocaleDateString(),
        booking.screenings.movies.title,
        booking.user_id,
        booking.booked_seats.map(bs => 
          `${bs.seats.seat_rows.row_letter}${bs.seats.seat_number}`
        ).join(', '),
        booking.status,
        `$${booking.total_price.toFixed(2)}`,
      ];

      rowData.forEach((data, index) => {
        page.drawText(String(data), {
          x: xPos,
          y: yPos,
          size: 10,
          font: font,
        });
        xPos += columnWidths[index];
      });

      yPos -= 20;
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="booking-report.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating booking report:', error);
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