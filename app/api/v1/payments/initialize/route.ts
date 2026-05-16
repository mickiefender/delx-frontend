import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Forward to the real proxy route
    const initRes = await fetch(`${request.nextUrl.origin}/api/payments/initialize/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: await request.text(),
    })

    const text = await initRes.text()
    const looksJson = text.trim().startsWith('{') || text.trim().startsWith('[')

    if (looksJson) {
      return new NextResponse(JSON.parse(text), { status: initRes.status })
    }

    return NextResponse.json(
      { error: 'Unexpected non-JSON response from payment initialize proxy', raw: text.slice(0, 500) },
      { status: 502 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
