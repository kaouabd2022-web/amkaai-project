import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image" }, { status: 400 });
    }

    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        image,
        prompt: "Enhance this image, make it high quality, sharp, detailed",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.log(data);
      return NextResponse.json({ error: "Enhance error" }, { status: 500 });
    }

    return NextResponse.json({
      image: data.data[0].url,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}