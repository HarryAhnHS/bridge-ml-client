import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Forward the request to the backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/semantic/analyze`, {
      method: 'POST',
      body: formData,
    });
    
    // Get the response body as JSON
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in semantic proxy:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 