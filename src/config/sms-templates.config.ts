// src/config/sms-templates.config.ts

export enum SmsTemplateType {
  REFERRAL_VERIFICATION = 'referral_verification',
  ADMISSION_CONFIRMATION = 'admission_confirmation',
}

export interface SmsTemplate {
  type: SmsTemplateType;
  template: string;
  variables: string[];
}

export const SMS_TEMPLATES: Record<SmsTemplateType, SmsTemplate> = {
  [SmsTemplateType.REFERRAL_VERIFICATION]: {
    type: SmsTemplateType.REFERRAL_VERIFICATION,
    template: 'Dear {recipientName}, please take a moment to check your referral details by clicking the link provided {verificationUrl} -VIBGYOR',
    variables: ['recipientName', 'verificationUrl'],
  },
  [SmsTemplateType.ADMISSION_CONFIRMATION]: {
    type: SmsTemplateType.ADMISSION_CONFIRMATION,
    template: 'Congratulations {parentName}! {studentName} has been admitted to {schoolName} for {academicYear}. Welcome to VIBGYOR family! -VIBGYOR',
    variables: ['parentName', 'studentName', 'schoolName', 'academicYear'],
  },
};

/**
 * Build SMS message from template
 */
export function buildSmsMessage(
  templateType: SmsTemplateType,
  params: Record<string, string>
): string {
  const template = SMS_TEMPLATES[templateType];
  
  if (!template) {
    throw new Error(`SMS template not found: ${templateType}`);
  }

  let message = template.template;
  
  // Replace all variables in template
  template.variables.forEach(variable => {
    const value = params[variable] || '';
    message = message.replace(`{${variable}}`, value);
  });

  return message;
}