import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json();
    
    console.log("Question:", question);
    console.log("Context length:", context?.length || 0);
    
    // Simple response first - no Groq call for now
    return NextResponse.json({ 
      answer: `You asked: "${question}". I have ${context?.length || 0} characters of document content. The API is working!`
    });
  } catch (err) {
    const error = err as Error;
    console.error("Error:", error.message);
    return NextResponse.json({ answer: "Error: " + error.message }, { status: 500 });
  }
}
