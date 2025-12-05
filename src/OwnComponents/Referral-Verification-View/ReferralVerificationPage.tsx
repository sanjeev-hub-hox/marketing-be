"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGlobalContext } from "src/@core/global/GlobalContext";
import ReferralCard from "./ReferralCard";
import { getRequest, postRequest } from 'src/services/apiService';

const ReferralVerificationPage = () => {
  const { setPagePaths } = useGlobalContext();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract URL parameters
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const action = searchParams.get("action");

  // State management
  const [studentName, setStudentName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [enquiryId, setEnquiryId] = useState('');
  const [schoolLocation, setSchoolLocation] = useState('');
  const [grade, setGrade] = useState('');
  const [stream, setBoard] = useState('');
  const [referred_parent_name, setReferredParentName] = useState('');
  const [referring_parent_name, setReferrerParentName] = useState('');
  const [referring_employee_name, setReferrerEmployeeName] = useState('');
  const [referring_school_name, setReferrerSchoolName] = useState('');
  const [referring_corporate_name, setReferrerCorporateName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [wrongSubmitted, setWrongSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setPagePaths([
      { title: "Referral Verification", path: "/referral-view" },
    ]);

    if(id) fetchReferralDetails();
  }, [id]);

  const fetchReferralDetails = async () => {
      try {
        const params = { url: `marketing/enquiry/referrals/${id}` };
        const response = await getRequest(params);

        if (response.status !== 200) throw new Error('Failed to fetch referral');
        const { data } = response;
        if (!data?.length) throw new Error('No referral found');

        const enquiry = data[0];

        // Check if already verified
        if (
          (action === 'referrer' && enquiry.other_details?.referrer?.verified == true) ||
          (action === 'referral' && enquiry.other_details?.referral?.verified == true)
        ) {
          setAlreadySubmitted(true);

          return;
        }
        // Check if max attempts reached
        else if (
          (action === 'referrer' && enquiry.other_details?.referrer?.failedAttempts == 3) ||
          (action === 'referral' && enquiry.other_details?.referral?.failedAttempts == 3)
        ) {
          setWrongSubmitted(true);

          return;
        }

        // Extract and set data
        const {
          _id,
          student_details = {},
          academic_year,
          school_location,
          board,
          referred_parent_name,
          referring_employee_name,
          referring_parent_name,
          referring_corporate_name,
          referring_school_name,
          enquiry_number,
        } = enquiry;

        const { first_name, last_name, grade } = student_details;

        setEnquiryId(enquiry_number ?? '');
        setStudentName(first_name + ' ' + last_name);
        setAcademicYear(academic_year.value ?? '');
        setSchoolLocation(school_location.value ?? '');
        setGrade(grade?.value ?? '');
        setBoard(board?.value ?? '');
        setReferredParentName(referred_parent_name ?? '');
        setReferrerParentName(referring_parent_name ?? '');
        setReferrerEmployeeName(referring_employee_name ?? '');
        setReferrerCorporateName(referring_corporate_name ?? '');
        setReferrerSchoolName(referring_school_name ?? '');
      } catch (error) {
        console.error('error_msg___', error);
        setErrorMessage('Error fetching referral details.');
      } finally {
        setLoading(false);
      }
    };

  const handleSubmit = async () => {
    if (!phoneNumber.trim() || phoneNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number');

      return;
    }

    try {
      const params = {
        url: `marketing/enquiry/referrals/${id}`,
        data: {
          phoneNumber: phoneNumber,
          type: type ?? 'NA',
          action: action ?? 'NA',
        },
      };

      const response = await postRequest(params);

      if (response.status === 200) {
        setSubmitted(true);
        setErrorMessage('');
      } else {
        const message = JSON.stringify(response.error.errorMessage).slice(1, -1) || 'Error! Contact Your SPOC';
        if (message.includes('locked')) {
          location.reload();
        }
        setErrorMessage(message);
      }
    } catch (error) {
      console.error(error);
      const errMsg = 'Unexpected Error Occurred! Contact Your SPOC';
      setErrorMessage(errMsg);
    }
  };

  const handleCancel = () => router.push('/');

  // Get referrer name based on action and type
  const getReferrerName = () => {
    if (action === 'referral') {
      return referring_employee_name ||
        referring_parent_name ||
        referring_school_name ||
        referring_corporate_name ||
        'Unknown';
    } else if (action === 'referrer') {
      return referred_parent_name;
    }

    return 'Unknown';
  };

  // Get input label based on type
  const getInputLabel = () => {
    if (type === 'employee') return "Parent Name:";
    if (type === 'parent') return "Referrer's Name:";
    if (type === 'referringparent') return "Referred Parent Name:";
    if (type === 'referringcorporate') return "Referred Parent Name:";
    if (type === 'referringschool') return "Referred Parent Name:";

    return '';
  };

  // Get phone number helper text
  const getPhoneNumberHelperText = () => {
    if (type === 'employee') return "parent's";
    if (type === 'parent') return "referrer's";
    if (type === 'referringparent') return "referred parent's";
    if (type === 'referringschool') return "referred parent's";
    if (type === 'referringcorporate') return "referred parent's";

    return '';
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;

  if (alreadySubmitted) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#b0f89cff',
        borderRadius: '12px',
        margin: '50px auto',
        color: '#1e8003ff',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px'
      }}>
        <h2>Referral Details Already Submitted Successfully!</h2>
        <p>In case of any query, raise a concern with your assigned SPOC.</p>
      </div>
    );
  }

  if (wrongSubmitted) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#ffe6e6',
        borderRadius: '12px',
        margin: '50px auto',
        color: '#f55353ff',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px'
      }}>
        <h2>Incorrect Referral Details Submitted!</h2>
        <p>Please reach out to your assigned SPOC for assistance.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        backgroundColor: '#f0f4f8',
        borderRadius: '12px',
        margin: '50px auto',
        color: '#333',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px'
      }}>
        <h2>Thank You!</h2>
        <p>Thanks for taking out time to confirm the referral details.</p>
        <p>Your response has been recorded successfully.</p>
      </div>
    );
  }

  return (
    <ReferralCard
      studentName={studentName}
      academicYear={academicYear}
      enquiryId={enquiryId}
      schoolLocation={schoolLocation}
      grade={grade}
      stream={stream}
      referrerName={getReferrerName()}
      inputLabel={getInputLabel()}
      phoneNumberHelperText={getPhoneNumberHelperText()}
      phoneNumber={phoneNumber}
      onPhoneChange={(value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 10) setPhoneNumber(cleaned);
      }}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default ReferralVerificationPage;