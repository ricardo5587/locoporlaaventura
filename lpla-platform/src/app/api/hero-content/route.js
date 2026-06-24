import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    return NextResponse.json({
      welcome_en: 'WELCOME TO', welcome_es: 'BIENVENIDOS A',
      title_line1: 'LOCO POR', title_line2: 'LA AVENTURA',
      subtitle_en: 'Outdoor adventure events for the Latino community and beyond · Portland, Oregon',
      subtitle_es: 'Eventos de aventura al aire libre para la comunidad latina y más allá · Portland, Oregón',
    }, { headers: CORS });
  }

  return NextResponse.json(data, { headers: CORS });
}
