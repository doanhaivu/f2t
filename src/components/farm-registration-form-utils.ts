import type { FarmRegistrationFormType } from './farm-registration-form';
import type { FarmRegisterRequest } from '@/api/auth';
import { USER_ROLE } from '@/types/constants';

/**
 * Transform farm registration form data to API request format
 */
export const transformFormDataToApiRequest = (
  formData: FarmRegistrationFormType
): FarmRegisterRequest => {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    farmName,
    farmDescription,
    farmContactEmail,
    farmContactPhone,
    street,
    streetNumber,
    city,
    state,
    zipCode,
    country,
    deliveryMethods,
    deliveryRadius,
    deliveryFee,
    businessLicense,
    farmingArea,
    isOrganic,
    acceptTerms,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    confirmPassword, // We don't need this in the API request
  } = formData;

  return {
    // User registration data
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role: USER_ROLE.FARM,
    location: {
      coordinates: {
        latitude: 0, // Will be filled by geolocation later
        longitude: 0, // Will be filled by geolocation later
      },
      address: {
        street,
        streetNumber,
        city,
        state,
        zipCode,
        country,
        formattedAddress: `${streetNumber ? streetNumber + ' ' : ''}${street}, ${city}, ${state} ${zipCode}, ${country}`,
      },
    },

    // Farm-specific data
    farmInfo: {
      name: farmName,
      description: farmDescription,
      location: {
        coordinates: {
          latitude: 0, // Will be filled by geolocation later
          longitude: 0, // Will be filled by geolocation later
        },
        address: {
          street,
          streetNumber,
          city,
          state,
          zipCode,
          country,
          formattedAddress: `${streetNumber ? streetNumber + ' ' : ''}${street}, ${city}, ${state} ${zipCode}, ${country}`,
        },
      },
      contactEmail: farmContactEmail,
      contactPhone: farmContactPhone,
      deliveryMethods: deliveryMethods as ('pickup' | 'farm_delivery' | 'both')[],
      deliveryRadius,
      deliveryFee,
    },

    // Business information
    acceptTerms,
    businessLicense,
  };
};

/**
 * Validate required fields before submission
 */
export const validateFormData = (formData: FarmRegistrationFormType): string[] => {
  const errors: string[] = [];

  // Check required personal fields
  if (!formData.firstName?.trim()) errors.push('First name is required');
  if (!formData.lastName?.trim()) errors.push('Last name is required');
  if (!formData.email?.trim()) errors.push('Email is required');
  if (!formData.password?.trim()) errors.push('Password is required');
  if (!formData.phoneNumber?.trim()) errors.push('Phone number is required');

  // Check required farm fields
  if (!formData.farmName?.trim()) errors.push('Farm name is required');
  if (!formData.farmDescription?.trim()) errors.push('Farm description is required');
  if (!formData.farmContactEmail?.trim()) errors.push('Farm contact email is required');
  if (!formData.farmContactPhone?.trim()) errors.push('Farm contact phone is required');

  // Check required location fields
  if (!formData.street?.trim()) errors.push('Street address is required');
  if (!formData.city?.trim()) errors.push('City is required');
  if (!formData.state?.trim()) errors.push('State is required');
  if (!formData.zipCode?.trim()) errors.push('ZIP code is required');
  if (!formData.country?.trim()) errors.push('Country is required');

  // Check business fields
  if (!formData.deliveryMethods?.length) errors.push('At least one delivery method is required');
  if (!formData.deliveryRadius || formData.deliveryRadius <= 0) errors.push('Valid delivery radius is required');
  if (formData.deliveryFee === undefined || formData.deliveryFee < 0) errors.push('Valid delivery fee is required');

  // Check terms acceptance
  if (!formData.acceptTerms) errors.push('You must accept the terms and conditions');

  // Check password confirmation
  if (formData.password !== formData.confirmPassword) {
    errors.push('Passwords do not match');
  }

  return errors;
};

/**
 * Get default form values
 */
export const getDefaultFormValues = (): Partial<FarmRegistrationFormType> => ({
  deliveryMethods: [],
  deliveryRadius: 10,
  deliveryFee: 0,
  isOrganic: false,
  acceptTerms: false,
  country: 'United States',
});
