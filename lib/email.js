// Email service using Resend
// Install: npm install resend

let resend = null

async function initResend() {
  if (resend) return resend

  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not found. Email sending will be skipped.')
    return null
  }

  try {
    const { Resend } = await import('resend')
    resend = new Resend(process.env.RESEND_API_KEY)
    console.log('Resend initialized successfully')
    return resend
  } catch (err) {
    console.error('Failed to initialize Resend:', err.message)
    return null
  }
}

export async function sendOrderConfirmationEmail(order) {
  const client = await initResend()
  if (!client) {
    console.log('Email skipped: Resend not configured')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const itemsList = order.items
      .map((item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
            ${item.name} x${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
            ₦${(parseFloat(item.price) * item.quantity).toLocaleString('en-NG')}
          </td>
        </tr>
      `)
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #b45309 0%, #78350f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">SCENTLUMUS</h1>
            <p style="color: #fef3c7; margin: 5px 0 0 0;">destination for luxury fragrances</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #10b981; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 15px;">
                ✓
              </div>
              <h2 style="color: #1f2937; margin: 0;">Order Confirmed!</h2>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Thank you for your order</p>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order.id?.slice(0, 12)}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 12px; font-size: 14px;">${order.status || 'Processing'}</span></p>
            </div>

            <h3 style="color: #1f2937; margin: 0 0 15px 0;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${itemsList}
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                  <strong>Shipping</strong>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                  ₦2,000
                </td>
              </tr>
              <tr>
                <td style="padding: 12px; font-size: 18px;">
                  <strong>Total</strong>
                </td>
                <td style="padding: 12px; text-align: right; font-size: 20px; color: #b45309;">
                  <strong>₦${parseFloat(order.total).toLocaleString('en-NG')}</strong>
                </td>
              </tr>
            </table>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Shipping Address</h3>
              <p style="margin: 5px 0;">${order.customer?.firstName} ${order.customer?.lastName}</p>
              <p style="margin: 5px 0;">${order.shipping?.address}</p>
              <p style="margin: 5px 0;">${order.shipping?.city}, ${order.shipping?.state} ${order.shipping?.zipCode}</p>
              <p style="margin: 5px 0;">${order.customer?.phone}</p>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1f2937; margin: 0 0 10px 0;">What's Next?</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #6b7280;">
                <li>We will process your order within 24 hours</li>
                <li>You'll receive a shipping notification with tracking details</li>
                <li>Estimated delivery: 3-5 business days</li>
              </ul>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <a href="https://scentlumus.com/order/${order.id}" style="display: inline-block; background: #b45309; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">View Order</a>
              <a href="https://scentlumus.com/contact" style="display: inline-block; background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Us</a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} SCENTLUMUS. All rights reserved.</p>
            <p style="margin: 5px 0;">Questions? Contact us at <a href="mailto:support@scentlumus.com" style="color: #b45309;">support@scentlumus.com</a></p>
          </div>
        </body>
      </html>
    `

    const result = await client.emails.send({
      from: 'ScentLumus <onboarding@resend.dev>',
      to: order.customer?.email,
      subject: `Order Confirmation #${order.id?.slice(0, 8)} - ScentLumus`,
      html
    })

    console.log('Order confirmation email sent:', result)
    return { success: true, messageId: result.id }
  } catch (err) {
    console.error('Failed to send order confirmation email:', err)
    return { success: false, message: err.message }
  }
}

export async function sendOrderStatusUpdateEmail(order, oldStatus, newStatus) {
  const client = await initResend()
  if (!client) {
    console.log('Email skipped: Resend not configured')
    return { success: false, message: 'Email service not configured' }
  }

  const statusMessages = {
    Processing: {
      title: 'Order is Being Processed',
      message: 'Great news! Your order is being prepared by our team.',
      icon: '📦',
      color: '#3b82f6'
    },
    Shipped: {
      title: 'Order Has Been Shipped',
      message: 'Your order is on its way! Track your package using the details below.',
      icon: '🚚',
      color: '#8b5cf6'
    },
    Delivered: {
      title: 'Order Delivered',
      message: 'Your order has been delivered. We hope you love your new fragrances!',
      icon: '✅',
      color: '#10b981'
    },
    Cancelled: {
      title: 'Order Cancelled',
      message: 'Your order has been cancelled. If this was a mistake, please contact us.',
      icon: '❌',
      color: '#ef4444'
    }
  }

  const status = statusMessages[newStatus] || statusMessages.Processing

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #b45309 0%, #78350f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">SCENTLUMUS</h1>
            <p style="color: #fef3c7; margin: 5px 0 0 0;">destination for luxury fragrances</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: ${status.color}; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 15px;">
                ${status.icon}
              </div>
              <h2 style="color: #1f2937; margin: 0;">${status.title}</h2>
              <p style="color: #6b7280; margin: 10px 0 0 0;">${status.message}</p>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #1f2937; margin: 0 0 15px 0;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order ID:</strong> #${order.id?.slice(0, 12)}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="background: ${status.color}20; color: ${status.color}; padding: 3px 10px; border-radius: 12px; font-size: 14px;">${newStatus}</span></p>
              <p style="margin: 5px 0;"><strong>Total:</strong> ₦${parseFloat(order.total).toLocaleString('en-NG')}</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <a href="https://scentlumus.com/order/${order.id}" style="display: inline-block; background: #b45309; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Track Order</a>
              <a href="https://scentlumus.com/contact" style="display: inline-block; background: #6b7280; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Contact Us</a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} SCENTLUMUS. All rights reserved.</p>
            <p style="margin: 5px 0;">Questions? Contact us at <a href="mailto:support@scentlumus.com" style="color: #b45309;">support@scentlumus.com</a></p>
          </div>
        </body>
      </html>
    `

    const result = await client.emails.send({
      from: 'ScentLumus <onboarding@resend.dev>',
      to: order.customer?.email,
      subject: `Order Update: ${status.title} #${order.id?.slice(0, 8)}`,
      html
    })

    console.log('Order status update email sent:', result)
    return { success: true, messageId: result.id }
  } catch (err) {
    console.error('Failed to send order status update email:', err)
    return { success: false, message: err.message }
  }
}

export async function sendVerificationEmail(email, code) {
  const client = await initResend()
  if (!client) {
    console.log('Email skipped: Resend not configured')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #b45309 0%, #78350f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">SCENTLUMUS</h1>
            <p style="color: #fef3c7; margin: 5px 0 0 0;">destination for luxury fragrances</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0;">Verify Your Email</h2>
              <p style="color: #6b7280; margin: 0;">Please use the code below to verify your email address</p>
            </div>

            <div style="text-align: center; background: #f9fafb; padding: 30px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">Your verification code is:</p>
              <div style="background: white; display: inline-block; padding: 20px 40px; border-radius: 8px; border: 2px dashed #b45309;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #b45309;">${code}</span>
              </div>
              <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">This code will expire in 10 minutes</p>
            </div>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0; color: #1f2937;"><strong>⚠️ Security Note:</strong></p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">Never share this code with anyone. Our team will never ask for your verification code.</p>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 5px 0;">If you didn't request this code, please ignore this email.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} SCENTLUMUS. All rights reserved.</p>
          </div>
        </body>
      </html>
    `

    const result = await client.emails.send({
      from: 'ScentLumus <onboarding@resend.dev>',
      to: email,
      subject: `Verify Your Email - ScentLumus`,
      html
    })

    console.log('Verification email sent:', result)
    return { success: true, messageId: result.id }
  } catch (err) {
    console.error('Failed to send verification email:', err)
    return { success: false, message: err.message }
  }
}

export async function sendPasswordResetEmail(email, resetCode) {
  const client = await initResend()
  if (!client) {
    console.log('Email skipped: Resend not configured')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #b45309 0%, #78350f 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">SCENTLUMUS</h1>
            <p style="color: #fef3c7; margin: 5px 0 0 0;">destination for luxury fragrances</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: #ef4444; color: white; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 30px; margin-bottom: 15px;">
                🔒
              </div>
              <h2 style="color: #1f2937; margin: 0 0 10px 0;">Reset Your Password</h2>
              <p style="color: #6b7280; margin: 0;">We received a request to reset your password</p>
            </div>

            <div style="text-align: center; background: #f9fafb; padding: 30px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #6b7280; margin: 0 0 15px 0; font-size: 14px;">Your password reset code is:</p>
              <div style="background: white; display: inline-block; padding: 20px 40px; border-radius: 8px; border: 2px dashed #b45309;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #b45309;">${resetCode}</span>
              </div>
              <p style="color: #6b7280; margin: 15px 0 0 0; font-size: 14px;">This code will expire in 15 minutes</p>
            </div>

            <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
              <p style="margin: 0; color: #1f2937;"><strong>⚠️ Security Alert:</strong></p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">If you didn't request a password reset, please ignore this email and ensure your account is secure. Consider changing your password if you suspect unauthorized access.</p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
              <a href="https://scentlumus.com/reset-password" style="display: inline-block; background: #b45309; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
          </div>

          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 5px 0;">If you didn't request this reset, please ignore this email.</p>
            <p style="margin: 5px 0;">© ${new Date().getFullYear()} SCENTLUMUS. All rights reserved.</p>
          </div>
        </body>
      </html>
    `

    const result = await client.emails.send({
      from: 'ScentLumus <onboarding@resend.dev>',
      to: email,
      subject: `Reset Your Password - ScentLumus`,
      html
    })

    console.log('Password reset email sent:', result)
    return { success: true, messageId: result.id }
  } catch (err) {
    console.error('Failed to send password reset email:', err)
    return { success: false, message: err.message }
  }
}
