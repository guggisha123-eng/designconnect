import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const formData = await req.formData()
    const userId = formData.get('userId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const subcategory = formData.get('subcategory') as string
    const isFree = formData.get('isFree') === 'true'
    const price = parseFloat(formData.get('price') as string) || 0
    const sourceFiles = formData.get('sourceFiles') as string

    const files = formData.getAll('images') as File[]

    if (!userId || !title || !category) {
      return NextResponse.json({ error: 'userId, title, and category are required' }, { status: 400 })
    }

    // Upload images to Supabase Storage
    const uploadedUrls: string[] = []

    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file || file.size === 0) continue

        const ext = file.name.split('.').pop() || 'png'
        const fileName = `${userId}/${Date.now()}_${i}.${ext}`

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = new Uint8Array(arrayBuffer)

        const { error: uploadError } = await supabase.storage
          .from('design-images')
          .upload(fileName, buffer, {
            contentType: file.type || 'image/png',
            upsert: true,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          // Continue with other files even if one fails
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('design-images')
          .getPublicUrl(fileName)

        if (urlData?.publicUrl) {
          uploadedUrls.push(urlData.publicUrl)
        }
      }
    }

    // Insert design record into database
    const { data: design, error: dbError } = await supabase
      .from('designs')
      .insert({
        designer_id: userId,
        title,
        description: description || '',
        category,
        subcategory: subcategory || null,
        is_free: isFree,
        price,
        source_files: sourceFiles || null,
        image_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
        thumbnail_url: uploadedUrls[0] || null,
        view_count: 0,
        like_count: 0,
        download_count: 0,
        status: 'published',
      })
      .select('id')
      .single()

    if (dbError) {
      console.error('DB insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save design: ' + dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      designId: design?.id,
      message: 'Design published successfully!',
      imageCount: uploadedUrls.length,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}
