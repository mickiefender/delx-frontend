import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const res = await fetch(`${request.nextUrl.origin}/api/payments/verify/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await request.text(),
    })

    const text = await res.text()
    const looksJson = text.trim().startsWith('{') || text.trim().startsWith('[')

    if (looksJson) {
      // Pass the JSON string directly, not the parsed object
      return new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return NextResponse.json(
      { error: 'Unexpected non-JSON response from payment verify proxy', raw: text.slice(0, 500) },
      { status: 502 },
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
