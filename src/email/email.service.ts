import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    // Resend 초기화
    this.resend = new Resend(process.env.RESEND_API_KEY);
    console.log('Resend email service initialized');
  }

  /**
   * 인증 코드 이메일 발송
   * @param to 수신자 이메일
   * @param code 6자리 인증 코드
   * @param type 인증 타입
   */
  async sendVerificationCode(
    to: string,
    code: string,
    type: 'password-setup' | 'password-reset',
  ): Promise<void> {
    const subject =
      type === 'password-setup'
        ? '[판다마켓] 비밀번호 설정 인증 코드'
        : '[판다마켓] 비밀번호 변경 인증 코드';

    const message =
      type === 'password-setup'
        ? '비밀번호를 설정하시려면 아래 인증 코드를 입력해주세요.'
        : '비밀번호를 변경하시려면 아래 인증 코드를 입력해주세요.';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
          }
          .content {
            margin-bottom: 30px;
          }
          .code-box {
            background-color: #f3f4f6;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .code {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            letter-spacing: 8px;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin-top: 20px;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🐼 판다마켓</div>
          </div>

          <div class="content">
            <h2>안녕하세요!</h2>
            <p>${message}</p>

            <div class="code-box">
              <div class="code">${code}</div>
            </div>

            <p>이 인증 코드는 <strong>10분간</strong> 유효합니다.</p>

            <div class="warning">
              ⚠️ <strong>주의:</strong> 본인이 요청하지 않은 경우, 이 이메일을 무시해주세요.
            </div>
          </div>

          <div class="footer">
            <p>이 메일은 발신 전용입니다. 문의사항은 고객센터를 이용해주세요.</p>
            <p>&copy; 2025 판다마켓. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.resend.emails.send({
      from: 'Panda Market <no-reply@genys.kr>',
      to,
      subject,
      html,
    });
  }

  /**
   * 비밀번호 변경 완료 알림 이메일
   * @param to 수신자 이메일
   * @param type 인증 타입
   */
  async sendPasswordChangeNotification(
    to: string,
    type: 'setup' | 'change',
  ): Promise<void> {
    const subject =
      type === 'setup'
        ? '[판다마켓] 비밀번호 설정 완료'
        : '[판다마켓] 비밀번호 변경 완료';

    const message =
      type === 'setup'
        ? '판다마켓 계정의 비밀번호가 성공적으로 설정되었습니다.'
        : '판다마켓 계정의 비밀번호가 성공적으로 변경되었습니다.';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
          }
          .success-box {
            background-color: #d1fae5;
            border-left: 4px solid #10b981;
            padding: 16px;
            margin: 20px 0;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 12px;
            margin-top: 20px;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🐼 판다마켓</div>
          </div>

          <div class="content">
            <h2>비밀번호가 ${type === 'setup' ? '설정' : '변경'}되었습니다</h2>

            <div class="success-box">
              ✅ ${message}
            </div>

            <p>이제 새 비밀번호로 로그인하실 수 있습니다.</p>

            <div class="warning">
              ⚠️ <strong>본인이 변경하지 않은 경우:</strong><br>
              즉시 고객센터로 연락하여 계정 보안을 확인해주세요.
            </div>
          </div>

          <div class="footer">
            <p>이 메일은 발신 전용입니다. 문의사항은 고객센터를 이용해주세요.</p>
            <p>&copy; 2025 판다마켓. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.resend.emails.send({
      from: 'Panda Market <no-reply@genys.kr>',
      to,
      subject,
      html,
    });
  }
}
