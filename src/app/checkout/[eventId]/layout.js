import { createClient } from '@supabase/supabase-js';

export async function generateMetadata({ params }) {
  const { eventId } = params;
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: event } = await supabase
        .from('events')
        .select('event_title')
        .eq('id', eventId)
        .single();

      if (event) {
        return {
          title: `Checkout - ${event.event_title} | Cicada Music Society`,
          description: `Purchase tickets for ${event.event_title} at Cicada Music Society.`,
          robots: {
            index: false,
            follow: false,
          },
        };
      }
    }
  } catch (error) {
    console.error('Error fetching event for metadata:', error);
  }

  return {
    title: "Checkout | Cicada Music Society",
    description: "Complete your ticket purchase for this event.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CheckoutLayout({ children }) {
  return <>{children}</>;
}

