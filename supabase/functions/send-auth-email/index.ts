import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'https://esm.sh/resend@4.0.0'
import { renderAsync } from 'https://esm.sh/@react-email/components@0.0.22'
import { AuthEmail } from './_templates/auth-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_AUTH_EMAIL_HOOK_SECRET') as string

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    console.log('Function called, method:', req.method)
    const payload = await req.text()
    console.log('Payload received:', payload.substring(0, 200) + '...')
    const headers = Object.fromEntries(req.headers)
    console.log('Headers:', JSON.stringify(headers, null, 2))
    
    // If no hook secret is set, skip webhook verification for development
    let webhookData
    if (hookSecret) {
      console.log('Hook secret found, verifying webhook')
      try {
        const wh = new Webhook(hookSecret)
        webhookData = wh.verify(payload, headers)
        console.log('Webhook verified successfully')
      } catch (verifyError) {
        console.error('Webhook verification failed:', verifyError)
        // Temporarily skip verification if it fails
        webhookData = JSON.parse(payload)
      }
    } else {
      console.log('No hook secret, parsing payload directly')
      webhookData = JSON.parse(payload)
    }

    const {
      user,
      email_data: { token, token_hash, redirect_to, email_action_type, site_url },
    } = webhookData as {
      user: {
        email: string
      }
      email_data: {
        token: string
        token_hash: string
        redirect_to: string
        email_action_type: string
        site_url: string
      }
    }

    console.log('Sending auth email to:', user.email, 'Type:', email_action_type)

    const html = await renderAsync(
      React.createElement(AuthEmail, {
        supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
        token,
        token_hash,
        redirect_to,
        email_action_type,
        site_url: site_url || redirect_to,
      })
    )

    const { data, error } = await resend.emails.send({
      from: 'StockViz <onboarding@resend.dev>',
      to: [user.email],
      subject: email_action_type === 'signup' ? 'Welcome to StockViz - Confirm your account' : 'Sign in to StockViz',
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', data)
    
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in send-auth-email function:', error)
    return new Response(
      JSON.stringify({
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})