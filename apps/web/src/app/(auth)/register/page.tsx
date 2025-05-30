'use client';
import {
  emailValidationSchema,
  registerValidationSchema,
} from '@/features/schemas/auth.schema/authSchema';
import useAuthStore from '@/lib/store/auth-store';
import apiInstance from '@/utils/axiosInstance';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import Link from 'next/link';
import * as React from 'react';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const { setLogin, setToken, setMember } = useAuthStore();
  const [isEmailAvailable, setIsEmailAvailable] = React.useState(false);
  const [tempEmail, setTempEmail] = React.useState('');
  const [isRegisterSuccess, setIsRegisterSuccess] = React.useState(false);
  const [isEmailVerified, setIsEmailVerified] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const handleEmailCheck = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await apiInstance.post('/auth/register-check', {
        email: email,
      });
      toast.success(response.data.message);
      setIsEmailAvailable(true);
      setTempEmail(email);
    } catch (error: any) {
      console.error(error);
      if (!error.response.data.isVerified) {
        toast.error(error.response.data.message);
        setIsEmailAvailable(false);
        setIsRegisterSuccess(true);
        setTempEmail(error.response.data.email);
      } else {
        toast.error(error.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterNewMember = async (values: any) => {
    try {
      setIsLoading(true);
      const response = await apiInstance.post('/auth/register', {
        email: tempEmail,
        countryPhoneId: values.countryPhoneId,
        phoneNumber: values.phoneNumber,
        firstName: values.firstName,
        lastName: values.lastName,
        birthDate: values.birthDate,
        sex: values.sex,
        termsPrivacyAccepted: values.termsPrivacyAccepted,
        personalDataConsentAccepted: values.personalDataConsentAccepted,
        eventPromoAccepted: values.eventPromoAccepted,
        type: 'REGISTRATION',
      });
      if (values.referralNumber !== '') {
        const referralResponse = await apiInstance.post('/referral/use', {
          referralNumber: values.referralNumber,
          email: tempEmail,
        });
        toast.success(referralResponse.data.message);
      }
      toast.success(response.data.message);

      setIsEmailAvailable(false);
      setIsRegisterSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = async (email: string) => {
    try {
      if (!email) {
        toast.error('Email is required');
        return;
      }

      const response = await apiInstance.post('/auth/send-otp', {
        email,
        type: 'REGISTRATION',
      });
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(
          error.response.data.message || 'Failed to send verification code',
        );
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response from server. Please try again.');
      } else {
        // Something happened in setting up the request
        toast.error('Error sending request. Please try again.');
      }
      console.error('Error details:', error);
    }
  };
  const handleMemberRegisterVerifyCode = async (code: string) => {
    try {
      const response = await apiInstance.post('/auth/verify-new-member', {
        email: tempEmail,
        code: code,
        type: 'REGISTRATION',
      });
      toast.success(response.data.message);
      setIsEmailVerified(true);
      setLogin(true);
      setToken(response.data.data.token); // Assuming your API returns a token
      setMember(response.data.data.member);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const handlePostRegister = async () => {
    try {
      if (isEmailVerified) {
        // Assuming your API returns user data
        setTimeout(() => {
          window.location.href = '/';
        }, 2500);
      }
    } catch (error) {
      console.error(error); // Add error logging
    }
  };

  React.useEffect(() => {
    if (isEmailVerified) {
      // Only call when true
      handlePostRegister();
    }
  }, [isEmailVerified]);

  const LoadingScreen = () => {
    return (
      <div
        className={`flex items-center absolute top-0 z-[999] justify-center min-w-full min-h-screen bg-gray-700/50 ${isLoading ? 'block' : 'hidden'}`}
      >
        <div className="flex size-32 items-center justify-center border border-gray-400 rounded-lg bg-white">
          <div role="status">
            <svg
              aria-hidden="true"
              className="size-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {!isEmailAvailable && !isRegisterSuccess && !isEmailVerified && (
        <div>
          <LoadingScreen />
          <div className="auth-container">
            <div className="auth-title pre-sign-up">
              <h3>Buat akun Loket kamu</h3>
              <label>
                Sudah punya akun?
                <Link href="/login">
                  <span className="font-bold cursor-pointer !text-[#0049cc]">
                    {' '}
                    Masuk
                  </span>
                </Link>
              </label>
            </div>
            <div className="auth-content">
              <div className="auth-form">
                <Formik
                  initialValues={{ email: '' }}
                  validationSchema={emailValidationSchema}
                  onSubmit={(values) => {
                    handleEmailCheck(values.email);
                  }}
                >
                  <Form>
                    <div className="!mb-2.5">
                      <label className="auth-label block">Email</label>
                    </div>

                    <div className="auth-form-control">
                      <Field
                        name="email"
                        type="email"
                        placeholder=""
                        className="auth-form-input"
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="error-message text-xs mt-1 text-red-500"
                    />
                    <div className="!mb-0 !mt-5 w-full max-w-full">
                      <button
                        type="submit"
                        className="w-full max-w-full c-button c-button-primary c-button-1"
                      >
                        <span className="">Daftar</span>
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            </div>
          </div>
          <div className="auth-bg"></div>
        </div>
      )}
      {isEmailAvailable && !isRegisterSuccess && (
        <div>
          <LoadingScreen />
          <div className="auth-container">
            <div className="auth-title pre-sign-up">
              <h3>Lengkapi Profilmu</h3>
            </div>

            <div className="auth-content">
              <div className="auth-form">
                <Formik
                  initialValues={{
                    countryPhoneId: 106,
                    phoneNumber: '',
                    email: '',
                    firstName: '',
                    lastName: '',
                    birthDate: '',
                    referralNumber: '',
                    sex: '',
                    termsPrivacyAccepted: false,
                    personalDataConsentAccepted: false,
                    eventPromoAccepted: true,
                  }}
                  // validationSchema={registerValidationSchema}
                  onSubmit={(values) => {
                    handleRegisterNewMember(values);
                  }}
                >
                  <Form>
                    {/* no ponsel */}
                    <div className="!mb-2.5">
                      <label className="auth-label block">No. Ponsel</label>
                    </div>
                    <div className="auth-form-control">
                      <Field
                        name="phoneNumber"
                        type="text"
                        placeholder="Contoh: 0814123456789"
                        className="auth-form-input"
                      />
                    </div>
                    <ErrorMessage
                      name="phoneNumber"
                      component="div"
                      className="error-message"
                    />
                    {/* nama depan */}
                    <div className="!mt-2.5">
                      <label className="auth-label block">Nama Depan</label>
                    </div>
                    <div className="!mb-2.5">
                      <label className="auth-label block text-xs text-gray-500">
                        Sesuai di KTP/Paspor/SIM
                      </label>
                    </div>
                    <div className="auth-form-control">
                      <Field
                        name="firstName"
                        type="text"
                        placeholder=""
                        className="auth-form-input"
                      />
                    </div>
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="error-message"
                    />
                    {/* nama belakang */}
                    <div className="!mb-2.5">
                      <label className="auth-label block">Nama Belakang</label>
                    </div>
                    <div className="auth-form-control">
                      <Field
                        name="lastName"
                        type="text"
                        placeholder=""
                        className="auth-form-input"
                      />
                    </div>
                    <ErrorMessage
                      name="lastName"
                      component="div"
                      className="error-message"
                    />
                    {/* tanggal lahir */}
                    <div className="!mb-2.5">
                      <label className="auth-label block">Tanggal Lahir</label>
                    </div>
                    <div className="auth-form-control">
                      <Field
                        name="birthDate"
                        type="text"
                        placeholder="Masukkan tanggal lahirmu"
                        className="auth-form-input"
                      />
                    </div>
                    <ErrorMessage
                      name="birthDate"
                      component="div"
                      className="error-message"
                    />
                    {/* referral */}
                    <div className="!mb-2.5">
                      <label className="auth-label block">{`(Optional) Punya Referral?`}</label>
                    </div>
                    <div className="auth-form-control">
                      <Field
                        name="referralNumber"
                        type="text"
                        placeholder="Masukkan nomor referral member lain"
                        className="auth-form-input"
                      />
                    </div>
                    <ErrorMessage
                      name="referralNumber"
                      component="div"
                      className="error-message"
                    />
                    {/* jenis kelamin */}
                    <div className="!mb-2.5">
                      <label className="auth-label block">Jenis Kelamin</label>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex gap-2">
                        <Field
                          name="sex"
                          id="male"
                          type="radio"
                          value="MALE"
                          className=""
                        />
                        <label className="whitespace-nowrap">Laki laki</label>
                      </div>
                      <div className="flex gap-2">
                        <Field
                          name="sex"
                          id="female"
                          type="radio"
                          value="FEMALE"
                          className=""
                        />
                        <label className="whitespace-nowrap">Perempuan</label>
                      </div>
                    </div>
                    <ErrorMessage
                      name="sex"
                      component="div"
                      className="error-message"
                    />
                    {/* syarat dan ketentuan check */}
                    <div className="flex gap-3 items-start">
                      <Field
                        name="termsPrivacyAccepted"
                        type="checkbox"
                        className=""
                      />
                      <label className="inline-block">
                        Saya telah membaca dan menyetujui Syarat dan Ketentuan
                        dan Kebijakan Privasi di LOKÉT
                      </label>
                    </div>
                    <ErrorMessage
                      name="termsPrivacyAccepted"
                      component="div"
                      className="error-message"
                    />
                    {/* persetujuan data check */}
                    <div className="flex gap-3 items-start">
                      <Field
                        name="personalDataConsentAccepted"
                        type="checkbox"
                        className=""
                      />
                      <label className="inline-block">
                        Saya telah membaca dan memberikan persetujuan kepada
                        LOKET untuk memproses data pribadi saya sesuai dengan
                        Pemrosesan Data Pribadi
                      </label>
                    </div>
                    <ErrorMessage
                      name="personalDataConsentAccepted"
                      component="div"
                      className="error-message"
                    />
                    {/* promo check */}
                    <div className="flex gap-3 items-start">
                      <Field
                        name="eventPromoAccepted"
                        type="checkbox"
                        className=""
                      />
                      <label className="inline-block">
                        Saya bersedia menerima informasi terkini terkait event
                        dan promosi di Loket.com
                      </label>
                    </div>
                    <ErrorMessage
                      name="eventPromoAccepted"
                      component="div"
                      className="error-message"
                    />
                    <div className="!mb-0 !mt-5 w-full max-w-full">
                      <button
                        type="submit"
                        className="w-full max-w-full c-button c-button-primary c-button-1"
                      >
                        <span className="">Simpan</span>
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            </div>
          </div>
          <div className="auth-bg"></div>
        </div>
      )}

      {!isEmailAvailable && isRegisterSuccess && (
        <div>
          <LoadingScreen />
          <div className="auth-container">
            <div className="auth-title pre-sign-up">
              <h3>Masukkan Kode OTP untuk Verifikasi Registrasi</h3>
            </div>
            <div className="auth-content">
              <div className="auth-form">
                <Formik
                  initialValues={{ code: '' }}
                  onSubmit={(values) => {
                    handleMemberRegisterVerifyCode(values.code);
                  }}
                >
                  <Form>
                    <div className="!mb-2.5">
                      <label className="auth-label block">Kode OTP</label>
                    </div>

                    <div className="auth-form-control">
                      <Field
                        name="code"
                        type="text"
                        placeholder=""
                        className="auth-form-input"
                      />
                    </div>
                    <ErrorMessage
                      name="code"
                      component="div"
                      className="error-message"
                    />
                    <label className="block mt-2">
                      <span className="block">
                        Belum terkirim / kadaluarsa?
                      </span>
                      Kirim kode baru
                      <span
                        onClick={() => {
                          console.log('email:', tempEmail);
                          handleGenerateCode(tempEmail);
                        }}
                      >
                        <span className="font-bold cursor-pointer !text-[#0049cc]">
                          {' '}
                          disini.
                        </span>
                      </span>
                    </label>
                    <div className="!mb-0 !mt-5 w-full max-w-full">
                      <button
                        type="submit"
                        className="w-full max-w-full c-button c-button-primary c-button-1"
                      >
                        <span className="">Verifikasi Email</span>
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            </div>
          </div>
          <div className="auth-bg"></div>
        </div>
      )}

      {isRegisterSuccess && !isEmailAvailable && isEmailVerified && (
        <center>
          Pendaftaran Akun Kamu sudah selesai, kamu akan dialihkan ke halaman
          utama.
        </center>
      )}
    </>
  );
}
