import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json();
    
    console.log("Question:", question);
    console.log("Context length:", context?.length || 0);
    
    return NextResponse.json({ 
      answer: `You asked: "${question}". I found ${context?.length || 0} characters in your documents. The API is working!`
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ answer: "Error: " + error.message }, { status: 500 });
  }
}
