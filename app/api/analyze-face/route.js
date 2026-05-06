import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const PROMPT = `Kamu adalah konsultan gaya rambut profesional di barbershop.
Analisis wajah dalam foto ini dan berikan rekomendasi gaya rambut yang cocok.

Balas HANYA dengan JSON valid berikut, tanpa teks lain, tanpa markdown:
{
  "bentukWajah": "nama bentuk wajah",
  "deskripsi": "penjelasan singkat bentuk wajah tersebut",
  "rekomendasi": [
    {
      "nama": "nama gaya rambut",
      "alasan": "kenapa cocok untuk wajah ini",
      "cocokUntuk": "deskripsi singkat"
    }
  ],
  "tips": "satu tips perawatan rambut"
}

Berikan tepat 3 rekomendasi. Gunakan Bahasa Indonesia.`

// 🔥 helper: bersihin response jadi JSON valid
function extractJSON(text) {
  let s = text.trim()

  if (s.startsWith('```')) {
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  }

  const match = s.match(/\{[\s\S]*\}/)
  return match ? match[0] : s
}

export async function POST(request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: 'Gambar tidak ditemukan.' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key belum ada.' }, { status: 500 })
    }

    // 🔥 ambil base64 & mime
    const mimeType = image.startsWith('data:')
      ? image.split(';')[0].replace('data:', '')
      : 'image/jpeg'

    const base64 = image.includes(',') ? image.split(',')[1] : image

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // 🔥 FIX UTAMA DI SINI (MODEL)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash'
    })

    const geminiResponse = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: PROMPT },
            {
              inlineData: {
                mimeType,
                data: base64
              }
            }
          ]
        }
      ]
    })

    const candidate = geminiResponse.response.candidates?.[0]

    console.log('Gemini finishReason:', candidate?.finishReason)

    if (!candidate) {
      return NextResponse.json(
        { error: 'AI tidak memberikan respon.' },
        { status: 422 }
      )
    }

    if (candidate.finishReason === 'SAFETY') {
      return NextResponse.json(
        { error: 'Gambar diblokir oleh sistem keamanan AI.' },
        { status: 422 }
      )
    }

    const raw = geminiResponse.response.text().trim()
    console.log('Gemini raw:', raw)

    const clean = extractJSON(raw)

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch (e) {
      console.error('JSON parse error:', e)
      return NextResponse.json(
        { error: 'Format AI tidak valid' },
        { status: 500 }
      )
    }

    return NextResponse.json(parsed)

  } catch (err) {
    console.error('SERVER ERROR:', err)

    if (err.status === 404) {
      return NextResponse.json(
        { error: 'Model Gemini tidak ditemukan.' },
        { status: 500 }
      )
    }

    if (err.status === 403) {
      return NextResponse.json(
        { error: 'API key tidak valid.' },
        { status: 500 }
      )
    }

    if (err.status === 429) {
      return NextResponse.json(
        { error: 'Terlalu banyak request.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: err.message || 'Server error' },
      { status: 500 }
    )
  }
}