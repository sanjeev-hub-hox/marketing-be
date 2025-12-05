import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { EEnquiryType } from './enquiry.type';

const enquiryTypeFields = {
    [EEnquiryType.NEW_ADMISSION]: [
        'board', 'course', 'stream', 'shift'
    ],
    [EEnquiryType.PSA]: [
        'co_curricular', 'performing_arts', 'sports'
    ],
    [EEnquiryType.IVT]: [
        'board', 'course', 'stream', 'shift'
    ],
}
@Injectable()
export class CheckRequiredFieldsGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        try {
            const request = context.switchToHttp().getRequest();
            const { data } = request.body as any;
            const { enquiry_type } = data;
            console.log(request.body)
            if (![EEnquiryType.NEW_ADMISSION, EEnquiryType.PSA, EEnquiryType.IVT].includes(enquiry_type.value)) {
                throw new HttpException('Incorrect enquiry type value passed', HttpStatus.BAD_REQUEST);
            }
    
            const requestBodyKeys = Object.keys(data);
            const missingKeys = []; 
            switch (enquiry_type.value) {
                case EEnquiryType.NEW_ADMISSION:
                    for (const requiredKey of enquiryTypeFields[EEnquiryType.NEW_ADMISSION]) {
                        if (!requestBodyKeys.includes(requiredKey)) {
                            missingKeys.push(requiredKey);
                        }
                    }
                    break;
                case EEnquiryType.PSA:
                    for (const requiredKey of enquiryTypeFields[EEnquiryType.PSA]) {
                        if (!requestBodyKeys.includes(requiredKey)) {
                            missingKeys.push(requiredKey);
                        }
                    }
                    break;
                case EEnquiryType.IVT:
                    for (const requiredKey of enquiryTypeFields[EEnquiryType.IVT]) {
                        if (!requestBodyKeys.includes(requiredKey)) {
                            missingKeys.push(requiredKey);
                        }
                    }
                    break;
            }
            if (missingKeys.length) {
                throw new HttpException({ message : `Fields ${missingKeys.toString()} missing for enquiry type ${enquiry_type.value}`}, HttpStatus.BAD_REQUEST);
            }
            return true
        } catch (err: Error | unknown) {
            throw err;
        }
    }
}