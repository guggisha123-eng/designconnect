import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const STYLE_PRESETS: Record<string, string> = {
  minimal: 'minimalist design, clean lines, whitespace, simple shapes, modern',
  bold: 'bold design, strong contrast, vibrant colors, dramatic composition, impactful',
  playful: 'playful design, fun colors, rounded shapes, whimsical, creative',
  corporate: 'professional corporate design, clean layout, business aesthetic, polished',
  artistic: 'artistic design, creative expression, unique style, painterly, expressive',
  retro: 'retro vintage design, nostalgic feel, classic typography, aged texture, vintage colors',
}

const COLOR_MOODS: Record<string, string> = {
  warm: 'warm color palette, reds oranges yellows, cozy inviting',
  cool: 'cool color palette, blues teals purples, calm serene',
  earthy: 'earthy color palette, browns greens tans, natural organic',
  vibrant: 'vibrant color palette, saturated colors, energetic vivid',
  monochrome: 'monochrome color palette, black white grayscale, elegant',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, style, colorMood } = body as {
      prompt: string
      style?: string
      colorMood?: string
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Build enhanced prompt
    const stylePart = style && STYLE_PRESETS[style] ? STYLE_PRESETS[style] : ''
    const colorPart = colorMood && COLOR_MOODS[colorMood] ? COLOR_MOODS[colorMood] : ''

    const enhancedPrompt = [
      prompt.trim(),
      stylePart,
      colorPart,
      'high quality, professional design, detailed',
    ]
      .filter(Boolean)
      .join(', ')

    // Dynamically import z-ai-web-dev-sdk (backend only)
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: '1024x1024',
    })

    if (!response.data || !response.data[0] || !response.data[0].base64) {
      throw new Error('Invalid response from image generation API')
    }

    const imageBase64 = response.data[0].base64
    const buffer = Buffer.from(imageBase64, 'base64')

    // Save to public/generated/ directory
    const outputDir = path.join(process.cwd(), 'public', 'generated')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const hash = crypto.createHash('md5').update(`${enhancedPrompt}-${Date.now()}`).digest('hex').slice(0, 12)
    const filename = `inspiration_${hash}.png`
    const filepath = path.join(outputDir, filename)
    fs.writeFileSync(filepath, buffer)

    return NextResponse.json({
      success: true,
      imageUrl: `/generated/${filename}`,
      prompt: prompt.trim(),
      enhancedPrompt,
      style: style || null,
      colorMood: colorMood || null,
    })
  } catch (error: unknown) {
    console.error('Image generation error:', error)
    const message = error instanceof Error ? error.message : 'Failed to generate image'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
