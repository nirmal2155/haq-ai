export interface MailOptions {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export interface SendResult {
  success: boolean;
  messageId: string;
  provider: string;
  timestamp: string;
  error?: string;
}

export interface IMailer {
  sendEmail(options: MailOptions): Promise<SendResult>;
}

export class InMemoryMailer implements IMailer {
  public sentMails: (MailOptions & { sentAt: string; messageId: string })[] = [];

  async sendEmail(options: MailOptions): Promise<SendResult> {
    const messageId = `msg_test_${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();
    this.sentMails.push({
      ...options,
      sentAt: timestamp,
      messageId,
    });

    return {
      success: true,
      messageId,
      provider: 'in-memory-test',
      timestamp,
    };
  }

  clear(): void {
    this.sentMails = [];
  }
}

export class ConsoleLoggerMailer implements IMailer {
  async sendEmail(options: MailOptions): Promise<SendResult> {
    const messageId = `msg_${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();
    console.info(`[MAILER_DISPATCH] to=${options.to} subject="${options.subject}" id=${messageId}`);

    return {
      success: true,
      messageId,
      provider: 'console-logger',
      timestamp,
    };
  }
}

// WhatsApp stub interface for future WhatsApp Business API integration
export interface IWhatsAppService {
  sendTemplateMessage(params: {
    toPhoneNumber: string;
    templateId: string;
    variables: Record<string, string>;
  }): Promise<{ success: boolean; messageId: string; status: 'queued' | 'delivered' }>;
}

export class StubWhatsAppService implements IWhatsAppService {
  async sendTemplateMessage(params: {
    toPhoneNumber: string;
    templateId: string;
    variables: Record<string, string>;
  }): Promise<{ success: boolean; messageId: string; status: 'queued' | 'delivered' }> {
    console.info(`[WHATSAPP_STUB_DISPATCH] to=${params.toPhoneNumber} template=${params.templateId}`);
    return {
      success: true,
      messageId: `wa_${crypto.randomUUID()}`,
      status: 'queued',
    };
  }
}

export const defaultMailer: IMailer =
  process.env.NODE_ENV === 'test' ? new InMemoryMailer() : new ConsoleLoggerMailer();
