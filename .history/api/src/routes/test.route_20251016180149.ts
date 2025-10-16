import { Router, Request, Response } from 'express';
import emailService from '../services/email.service';

const router = Router();

// Test email endpoint
router.post('/email', async (req: Request, res: Response) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, message'
      });
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">EventHub Test Email</h2>
        <p>Hello!</p>
        <p>${message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 14px;">
          This is a test email from EventHub API.<br>
          Sent at: ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    await emailService.sendEmail({
      to,
      subject,
      html: htmlContent
    });

    res.json({
      success: true,
      message: 'Test email sent successfully',
      data: {
        to,
        subject,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

export default router;
