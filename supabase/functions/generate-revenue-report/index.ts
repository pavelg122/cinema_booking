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

    // Fetch revenue data
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        screenings (
          *,
          movies (*),
          halls (*)
        )
      `)
      .gte('booking_date', startDate || '1970-01-01')
      .lte('booking_date', endDate || new Date().toISOString())
      .order('booking_date', { ascending: false });

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
    page.drawText('Revenue Report', {
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

    // Calculate summary statistics
    const totalRevenue = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.total_price, 0);

    const revenueByMovie = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((acc, booking) => {
        const movieId = booking.screenings.movie_id;
        const movieTitle = booking.screenings.movies.title;
        if (!acc[movieId]) {
          acc[movieId] = { title: movieTitle, revenue: 0, bookings: 0 };
        }
        acc[movieId].revenue += booking.total_price;
        acc[movieId].bookings += 1;
        return acc;
      }, {});

    const revenueByHall = bookings
      .filter(b => b.status === 'confirmed')
      .reduce((acc, booking) => {
        const hallId = booking.screenings.hall_id;
        const hallName = booking.screenings.halls.name;
        if (!acc[hallId]) {
          acc[hallId] = { name: hallName, revenue: 0, bookings: 0 };
        }
        acc[hallId].revenue += booking.total_price;
        acc[hallId].bookings += 1;
        return acc;
      }, {});

    // Draw summary
    const summary = [
      `Total Revenue: $${totalRevenue.toFixed(2)}`,
      `Total Bookings: ${bookings.length}`,
      `Confirmed Bookings: ${bookings.filter(b => b.status === 'confirmed').length}`,
      `Average Booking Value: $${(totalRevenue / bookings.length).toFixed(2)}`,
    ];

    summary.forEach((line, index) => {
      page.drawText(line, {
        x: 50,
        y: height - 120 - (index * 20),
        size: 12,
        font: font,
      });
    });

    // Draw revenue by movie
    let yPos = height - 200;
    page.drawText('Revenue by Movie', {
      x: 50,
      y: yPos,
      size: 14,
      font: boldFont,
    });

    yPos -= 30;
    Object.values(revenueByMovie).forEach((movie: any) => {
      if (yPos < 50) {
        // Add new page if needed
        page = pdfDoc.addPage([841.890, 595.276]);
        yPos = height - 50;
      }

      page.drawText(`${movie.title}: $${movie.revenue.toFixed(2)} (${movie.bookings} bookings)`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 20;
    });

    // Draw revenue by hall
    yPos -= 20;
    page.drawText('Revenue by Hall', {
      x: 50,
      y: yPos,
      size: 14,
      font: boldFont,
    });

    yPos -= 30;
    Object.values(revenueByHall).forEach((hall: any) => {
      if (yPos < 50) {
        // Add new page if needed
        page = pdfDoc.addPage([841.890, 595.276]);
        yPos = height - 50;
      }

      page.drawText(`${hall.name}: $${hall.revenue.toFixed(2)} (${hall.bookings} bookings)`, {
        x: 50,
        y: yPos,
        size: 10,
        font: font,
      });
      yPos -= 20;
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="revenue-report.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating revenue report:', error);
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