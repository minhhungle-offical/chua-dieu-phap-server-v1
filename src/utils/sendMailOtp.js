import { transporter } from '../configs/mailer.js'

export async function sendOtpByEmail(to, otp) {
  const mailOptions = {
    from: `"Chùa Diệu Pháp" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Your OTP Code',
    html: `
      <div style="font-family: sans-serif; padding: 16px">
        <h2>Nam Mô A Di Đà Phật 🙏</h2>
        <p>Mã xác thực của quý Phật tử là:</p>
        <h1 style="font-size: 32px; letter-spacing: 4px;">${otp}</h1>
        <p>Mã này sẽ hết hạn sau 5 phút.</p>
        <br/>
        <p>Chúc quý vị an lạc và hạnh phúc.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
}
