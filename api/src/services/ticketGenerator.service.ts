import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';

interface TicketData {
  transactionId: number;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  eventAddress: string;
  ticketType: string;
  attendeeName: string;
  attendeeEmail: string;
  quantity: number;
  qrCodeData: string;
  eventImageUrl?: string;
}

class TicketGeneratorService {
  /**
   * Generate a beautiful ticket JPG image
   */
  async generateTicket(ticketData: TicketData): Promise<Buffer> {
    // Canvas dimensions
    const width = 1200;
    const height = 600;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // White ticket overlay with rounded corners
    this.roundRect(ctx, 40, 40, width - 80, height - 80, 20, '#ffffff');

    // Left section (gradient accent)
    const leftGradient = ctx.createLinearGradient(40, 0, 400, height);
    leftGradient.addColorStop(0, '#667eea');
    leftGradient.addColorStop(1, '#764ba2');
    this.roundRect(ctx, 40, 40, 360, height - 80, 20, leftGradient, true);

    // Generate and draw QR code
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(ticketData.qrCodeData, {
        width: 280,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      const qrImage = await loadImage(qrCodeDataUrl);
      ctx.drawImage(qrImage, 80, 180, 280, 280);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }

    // EventHub logo text on left section
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EventHub', 220, 100);

    // Decorative line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(80, 130);
    ctx.lineTo(360, 130);
    ctx.stroke();
    ctx.setLineDash([]);

    // Right section - Event details
    const rightX = 440;
    let currentY = 100;

    // Event name (main title)
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'left';
    const eventName = this.truncateText(ctx, ticketData.eventName, width - rightX - 100);
    ctx.fillText(eventName, rightX, currentY);
    currentY += 60;

    // Divider line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rightX, currentY);
    ctx.lineTo(width - 80, currentY);
    ctx.stroke();
    currentY += 40;

    // Event details
    const details = [
      { icon: '📅', label: 'Date & Time', value: this.formatDate(ticketData.eventDate) },
      { icon: '📍', label: 'Location', value: ticketData.eventLocation },
      { icon: '🎫', label: 'Ticket Type', value: ticketData.ticketType },
      { icon: '👤', label: 'Attendee', value: ticketData.attendeeName },
    ];

    details.forEach((detail) => {
      // Icon and label
      ctx.fillStyle = '#667eea';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`${detail.icon} ${detail.label}`, rightX, currentY);
      currentY += 28;

      // Value
      ctx.fillStyle = '#4a5568';
      ctx.font = '16px Arial';
      const value = this.truncateText(ctx, detail.value, width - rightX - 100);
      ctx.fillText(value, rightX, currentY);
      currentY += 40;
    });

    // Bottom section - Transaction ID and instructions
    ctx.fillStyle = '#f7fafc';
    ctx.fillRect(440, height - 120, width - 480, 80);

    ctx.fillStyle = '#718096';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Transaction #${ticketData.transactionId}`, rightX + 20, height - 80);

    ctx.fillStyle = '#a0aec0';
    ctx.font = '12px Arial';
    ctx.fillText('Scan QR code at entrance for check-in', rightX + 20, height - 55);

    // Perforated edge effect
    ctx.strokeStyle = '#cbd5e0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(400, 60);
    ctx.lineTo(400, height - 60);
    ctx.stroke();
    ctx.setLineDash([]);

    // Circle cutouts for perforated effect
    for (let y = 80; y < height - 80; y += 40) {
      ctx.fillStyle = '#667eea';
      ctx.beginPath();
      ctx.arc(400, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Decorative corner elements
    this.drawCornerDecoration(ctx, 440, 40);
    this.drawCornerDecoration(ctx, width - 80, 40);
    this.drawCornerDecoration(ctx, 440, height - 40);
    this.drawCornerDecoration(ctx, width - 80, height - 40);

    // Convert canvas to buffer
    return canvas.toBuffer('image/jpeg', { quality: 0.95 });
  }

  /**
   * Draw rounded rectangle
   */
  private roundRect(
    ctx: any,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string | CanvasGradient,
    leftOnly: boolean = false
  ) {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    
    if (leftOnly) {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Draw decorative corner element
   */
  private drawCornerDecoration(ctx: any, x: number, y: number) {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(x - 20, y);
    ctx.lineTo(x + 20, y);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x, y + 20);
    ctx.stroke();
  }

  /**
   * Format date to readable string
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Truncate text to fit within max width
   */
  private truncateText(ctx: any, text: string, maxWidth: number): string {
    const width = ctx.measureText(text).width;
    if (width <= maxWidth) return text;

    let truncated = text;
    while (ctx.measureText(truncated + '...').width > maxWidth && truncated.length > 0) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '...';
  }

  /**
   * Generate QR code data string (can be customized with encryption/signature)
   */
  generateQRCodeData(transactionId: number, attendeeEmail: string): string {
    // This should ideally include a signature or encrypted data for security
    const data = {
      tid: transactionId,
      email: attendeeEmail,
      timestamp: Date.now(),
    };
    return JSON.stringify(data);
  }
}

export default new TicketGeneratorService();
