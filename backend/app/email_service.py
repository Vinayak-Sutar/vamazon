"""
Email Service for Order Notifications
======================================

Uses Gmail SMTP to send order confirmation emails.
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# Email Configuration - Use environment variables in production
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.getenv("SMTP_EMAIL", "hilariousheisenberg@gmail.com")
SENDER_PASSWORD = os.getenv("SMTP_PASSWORD", "zrqv fwgr sopb rbsj")
SENDER_NAME = "Vamazon"


def send_order_confirmation_email(
    to_email: str,
    customer_name: str,
    order_number: str,
    order_items: list,
    total_amount: float,
    shipping_address: dict
) -> bool:
    """
    Send order confirmation email to customer.

    Args:
        to_email: Customer's email address
        customer_name: Customer's name
        order_number: Order number/ID
        order_items: List of items [{name, quantity, price}, ...]
        total_amount: Total order amount
        shipping_address: Dict with address details

    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Order Confirmed - {order_number} | Vamazon"
        msg['From'] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        msg['To'] = to_email

        # Build items HTML
        items_html = ""
        for item in order_items:
            image_url = item.get('image_url', '')
            image_html = ""
            if image_url:
                image_html = f'<img src="{image_url}" alt="{item["name"][:30]}" style="width: 60px; height: 60px; object-fit: contain; border-radius: 4px; background: #fff;">'
            else:
                image_html = '<div style="width: 60px; height: 60px; background: #f0f0f0; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10px;">No image</div>'

            items_html += f"""
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee; width: 70px;">
                    {image_html}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">{item['name'][:50]}...</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">{item['quantity']}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹{item['price']:,.2f}</td>
            </tr>
            """

        # Format address
        address_line = f"{shipping_address.get('address_line1', '')}"
        if shipping_address.get('address_line2'):
            address_line += f", {shipping_address['address_line2']}"
        address_line += f"<br>{shipping_address.get('city', '')}, {shipping_address.get('state', '')} - {shipping_address.get('pincode', '')}"

        # HTML Email Template (Amazon-style)
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #eaeded;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                <!-- Header -->
                <div style="background-color: #131921; padding: 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                        V<span style="color: #febd69;">amazon</span>
                    </h1>
                </div>
                
                <!-- Success Banner -->
                <div style="background-color: #067d62; padding: 20px; text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 10px;">✓</div>
                    <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Order Confirmed!</h2>
                    <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">
                        Thank you for your order, {customer_name}!
                    </p>
                </div>
                
                <!-- Order Details -->
                <div style="padding: 30px;">
                    <div style="background-color: #f7f7f7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #565959; font-size: 14px;">Order Number</p>
                        <p style="margin: 5px 0 0 0; color: #0f1111; font-size: 18px; font-weight: bold;">
                            {order_number}
                        </p>
                    </div>
                    
                    <!-- Items Table -->
                    <h3 style="color: #0f1111; font-size: 16px; margin-bottom: 15px;">Order Summary</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #f7f7f7;">
                                <th style="padding: 12px; text-align: left; font-size: 14px; color: #565959; width: 70px;">Image</th>
                                <th style="padding: 12px; text-align: left; font-size: 14px; color: #565959;">Item</th>
                                <th style="padding: 12px; text-align: center; font-size: 14px; color: #565959;">Qty</th>
                                <th style="padding: 12px; text-align: right; font-size: 14px; color: #565959;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html}
                        </tbody>
                    </table>
                    
                    <!-- Total -->
                    <div style="text-align: right; padding: 15px; background-color: #f7f7f7; border-radius: 8px;">
                        <span style="font-size: 18px; color: #0f1111;">
                            <strong>Total: ₹{total_amount:,.2f}</strong>
                        </span>
                    </div>
                    
                    <!-- Shipping Address -->
                    <div style="margin-top: 25px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                        <h4 style="margin: 0 0 10px 0; color: #0f1111; font-size: 14px;">Shipping Address</h4>
                        <p style="margin: 0; color: #565959; font-size: 14px; line-height: 1.6;">
                            <strong>{customer_name}</strong><br>
                            {address_line}
                        </p>
                    </div>
                    
                    <!-- CTA Button -->
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="http://localhost:3000/orders" 
                           style="display: inline-block; background-color: #ffd814; color: #0f1111; 
                                  padding: 12px 30px; text-decoration: none; border-radius: 20px; 
                                  font-weight: bold; font-size: 14px;">
                            View Your Orders
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #f7f7f7; padding: 20px; text-align: center; border-top: 1px solid #ddd;">
                    <p style="margin: 0; color: #565959; font-size: 12px;">
                        This email was sent by Vamazon<br>
                        © 2026 Vamazon. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        # Plain text version
        text_content = f"""
        Order Confirmed - {order_number}
        
        Thank you for your order, {customer_name}!
        
        Order Number: {order_number}
        Total: ₹{total_amount:,.2f}
        
        Shipping to:
        {customer_name}
        {shipping_address.get('address_line1', '')}
        {shipping_address.get('city', '')}, {shipping_address.get('state', '')} - {shipping_address.get('pincode', '')}
        
        Thank you for shopping with Vamazon!
        """

        # Attach both versions
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))

        # Send email with timeout
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)

        print(f"✓ Order confirmation email sent to {to_email}")
        return True

    except Exception as e:
        print(f"✗ Failed to send email: {str(e)}")
        return False
