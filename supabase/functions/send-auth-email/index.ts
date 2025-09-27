import { Resend } from 'https://esm.sh/resend@4.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    console.log('Auth email function called')
    console.log('Resend API key exists:', !!Deno.env.get('RESEND_API_KEY'))
    
    const payload = await req.text()
    console.log('Payload received, length:', payload.length)
    
    // Parse the webhook data
    let webhookData
    try {
      webhookData = JSON.parse(payload)
      console.log('Webhook data parsed successfully')
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Validate required data
    if (!webhookData.user?.email) {
      console.error('Missing user email in webhook data')
      return new Response(JSON.stringify({ error: 'Missing user email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (!webhookData.email_data) {
      console.error('Missing email_data in webhook')
      return new Response(JSON.stringify({ error: 'Missing email_data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url },
    } = webhookData

    console.log('Sending auth email to:', user.email, 'Type:', email_action_type)

    // Create simple HTML email
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${email_action_type === 'signup' ? 'Welcome to StockViz!' : 'Sign in to StockViz'}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
            <h1 style="color: #333; text-align: center;">
              ${email_action_type === 'signup' ? 'Welcome to StockViz!' : 'Sign in to StockViz'}
            </h1>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              ${email_action_type === 'signup' 
                ? 'Thank you for signing up! Please click the button below to confirm your email address and complete your registration.' 
                : 'Click the button below to sign in to your StockViz account.'}
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                ${email_action_type === 'signup' ? 'Confirm Email' : 'Sign In'}
              </a>
            </div>
            
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              If the button doesn't work, you can also copy and paste this code: <strong>${token}</strong>
            </p>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              If you didn't request this email, you can safely ignore it.
            </p>
          </div>
        </body>
      </html>
    `

    console.log('HTML template created')

    // Send the email
    try {
      console.log('Attempting to send email via Resend')
      const { data, error } = await resend.emails.send({
        from: 'StockViz <onboarding@resend.dev>',
        to: [user.email],
        subject: email_action_type === 'signup' ? 'Welcome to StockViz - Confirm your account' : 'Sign in to StockViz',
        html,
      })

      if (error) {
        console.error('Resend API error details:', JSON.stringify(error, null, 2))
        throw new Error(`Resend error: ${JSON.stringify(error)}`)
      }

      console.log('Email sent successfully:', data)
      
      return new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      throw emailError
    }
  } catch (error) {
    console.error('Error in send-auth-email function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error instanceof Error ? error.stack : 'No stack trace available'
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
})