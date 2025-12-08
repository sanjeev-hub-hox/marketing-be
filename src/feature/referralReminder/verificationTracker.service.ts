import { Injectable } from '@nestjs/common';

@Injectable()
export class VerificationTrackerService {
  private verifiedEnquiries: Map<string, Set<string>> = new Map();

  isVerified(enquiryId: string, recipientType: 'parent' | 'referrer'): boolean {
    const verified = this.verifiedEnquiries.get(enquiryId);
    const result = verified ? verified.has(recipientType) : false;
    
    if (result) {
      console.log(`[VERIFICATION] ✅ Enquiry ${enquiryId} is verified by ${recipientType}`);
    }
    
    return result;
  }

  markAsVerified(enquiryId: string, recipientType: 'parent' | 'referrer'): void {
    if (!this.verifiedEnquiries.has(enquiryId)) {
      this.verifiedEnquiries.set(enquiryId, new Set());
    }
    this.verifiedEnquiries.get(enquiryId).add(recipientType);
    console.log(`[VERIFICATION] ✅ Marked enquiry ${enquiryId} as verified by ${recipientType}`);
  }

  clearVerification(enquiryId: string): void {
    this.verifiedEnquiries.delete(enquiryId);
    console.log(`[VERIFICATION] 🗑️ Cleared verification for enquiry ${enquiryId}`);
  }

  getVerificationStatus(enquiryId: string): { parent: boolean; referrer: boolean } {
    const verified = this.verifiedEnquiries.get(enquiryId);
    return {
      parent: verified ? verified.has('parent') : false,
      referrer: verified ? verified.has('referrer') : false,
    };
  }
}