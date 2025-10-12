import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import { Button, Text, View, Input } from '@/components/ui';
import type { PaymentMethodOption, PaymentError } from './types';

// Payment method configuration
const PAYMENT_METHODS: PaymentMethodOption[] = [
  { label: 'Cash on Delivery', value: 'cash_on_delivery' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Debit Card', value: 'debit_card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Digital Wallet', value: 'digital_wallet' },
];

// Credit card form data
type CreditCardData = {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  billingZip: string;
};

// Bank transfer data
type BankTransferData = {
  accountNumber: string;
  routingNumber: string;
  accountHolderName: string;
};

// Digital wallet data
type DigitalWalletData = {
  walletType: 'paypal' | 'apple_pay' | 'google_pay' | 'venmo';
  email: string;
};

// Payment integration props
type PaymentIntegrationProps = {
  paymentMethod: string;
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentId: string, transactionId: string) => void;
  onPaymentError: (error: PaymentError) => void;
  isLoading: boolean;
  disabled?: boolean;
};

// Credit card form component
const CreditCardForm = ({ 
  onDataChange, 
  errors 
}: { 
  onDataChange: (data: CreditCardData) => void;
  errors: Partial<CreditCardData>;
}) => {
  const [cardData, setCardData] = useState<CreditCardData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingZip: '',
  });

  const updateCardData = (field: keyof CreditCardData, value: string) => {
    const newData = { ...cardData, [field]: value };
    setCardData(newData);
    onDataChange(newData);
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add spaces every 4 digits
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Add slash after 2 digits
    if (digits.length >= 2) {
      return digits.substring(0, 2) + '/' + digits.substring(2, 4);
    }
    return digits;
  };

  return (
    <View className="space-y-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Credit Card Information
      </Text>
      
      <Input
        label="Card Number *"
        placeholder="1234 5678 9012 3456"
        value={cardData.cardNumber}
        onChangeText={(value) => updateCardData('cardNumber', formatCardNumber(value))}
        keyboardType="numeric"
        maxLength={19}
        error={errors.cardNumber}
      />
      
      <View className="flex-row space-x-3">
        <View className="flex-1">
          <Input
            label="Expiry Date *"
            placeholder="MM/YY"
            value={cardData.expiryDate}
            onChangeText={(value) => updateCardData('expiryDate', formatExpiryDate(value))}
            keyboardType="numeric"
            maxLength={5}
            error={errors.expiryDate}
          />
        </View>
        <View className="flex-1">
          <Input
            label="CVV *"
            placeholder="123"
            value={cardData.cvv}
            onChangeText={(value) => updateCardData('cvv', value.replace(/\D/g, ''))}
            keyboardType="numeric"
            maxLength={4}
            secureTextEntry
            error={errors.cvv}
          />
        </View>
      </View>
      
      <Input
        label="Cardholder Name *"
        placeholder="John Doe"
        value={cardData.cardholderName}
        onChangeText={(value) => updateCardData('cardholderName', value)}
        error={errors.cardholderName}
      />
      
      <Input
        label="Billing ZIP Code *"
        placeholder="12345"
        value={cardData.billingZip}
        onChangeText={(value) => updateCardData('billingZip', value.replace(/\D/g, ''))}
        keyboardType="numeric"
        maxLength={10}
        error={errors.billingZip}
      />
    </View>
  );
};

// Bank transfer form component
const BankTransferForm = ({ 
  onDataChange, 
  errors 
}: { 
  onDataChange: (data: BankTransferData) => void;
  errors: Partial<BankTransferData>;
}) => {
  const [bankData, setBankData] = useState<BankTransferData>({
    accountNumber: '',
    routingNumber: '',
    accountHolderName: '',
  });

  const updateBankData = (field: keyof BankTransferData, value: string) => {
    const newData = { ...bankData, [field]: value };
    setBankData(newData);
    onDataChange(newData);
  };

  return (
    <View className="space-y-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Bank Transfer Information
      </Text>
      
      <Input
        label="Account Number *"
        placeholder="Enter account number"
        value={bankData.accountNumber}
        onChangeText={(value) => updateBankData('accountNumber', value.replace(/\D/g, ''))}
        keyboardType="numeric"
        error={errors.accountNumber}
      />
      
      <Input
        label="Routing Number *"
        placeholder="Enter routing number"
        value={bankData.routingNumber}
        onChangeText={(value) => updateBankData('routingNumber', value.replace(/\D/g, ''))}
        keyboardType="numeric"
        maxLength={9}
        error={errors.routingNumber}
      />
      
      <Input
        label="Account Holder Name *"
        placeholder="Enter account holder name"
        value={bankData.accountHolderName}
        onChangeText={(value) => updateBankData('accountHolderName', value)}
        error={errors.accountHolderName}
      />
      
      <View className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
        <Text className="text-sm text-yellow-800 dark:text-yellow-200">
          Bank transfers may take 1-3 business days to process
        </Text>
      </View>
    </View>
  );
};

// Digital wallet form component
const DigitalWalletForm = ({ 
  onDataChange, 
  errors 
}: { 
  onDataChange: (data: DigitalWalletData) => void;
  errors: Partial<DigitalWalletData>;
}) => {
  const [walletData, setWalletData] = useState<DigitalWalletData>({
    walletType: 'paypal',
    email: '',
  });

  const updateWalletData = (field: keyof DigitalWalletData, value: string) => {
    const newData = { ...walletData, [field]: value };
    setWalletData(newData);
    onDataChange(newData);
  };

  return (
    <View className="space-y-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Digital Wallet Information
      </Text>
      
      <Input
        label="Email Address *"
        placeholder="Enter email address"
        value={walletData.email}
        onChangeText={(value) => updateWalletData('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />
      
      <View className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
        <Text className="text-sm text-blue-800 dark:text-blue-200">
          You will be redirected to your digital wallet to complete the payment
        </Text>
      </View>
    </View>
  );
};

// Main payment integration component
export const PaymentIntegration = ({
  paymentMethod,
  amount,
  currency,
  onPaymentSuccess,
  onPaymentError,
  isLoading,
  disabled = false,
}: PaymentIntegrationProps) => {
  const [paymentData, setPaymentData] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Validate payment data based on method
  const validatePaymentData = (data: any): boolean => {
    const errors: any = {};
    
    switch (paymentMethod) {
      case 'credit_card':
        if (!data.cardNumber || data.cardNumber.replace(/\s/g, '').length < 16) {
          errors.cardNumber = 'Please enter a valid card number';
        }
        if (!data.expiryDate || data.expiryDate.length < 5) {
          errors.expiryDate = 'Please enter a valid expiry date';
        }
        if (!data.cvv || data.cvv.length < 3) {
          errors.cvv = 'Please enter a valid CVV';
        }
        if (!data.cardholderName) {
          errors.cardholderName = 'Please enter cardholder name';
        }
        if (!data.billingZip) {
          errors.billingZip = 'Please enter billing ZIP code';
        }
        break;
        
      case 'debit_card':
        // Same validation as credit card
        if (!data.cardNumber || data.cardNumber.replace(/\s/g, '').length < 16) {
          errors.cardNumber = 'Please enter a valid card number';
        }
        if (!data.expiryDate || data.expiryDate.length < 5) {
          errors.expiryDate = 'Please enter a valid expiry date';
        }
        if (!data.cvv || data.cvv.length < 3) {
          errors.cvv = 'Please enter a valid CVV';
        }
        if (!data.cardholderName) {
          errors.cardholderName = 'Please enter cardholder name';
        }
        if (!data.billingZip) {
          errors.billingZip = 'Please enter billing ZIP code';
        }
        break;
        
      case 'bank_transfer':
        if (!data.accountNumber || data.accountNumber.length < 8) {
          errors.accountNumber = 'Please enter a valid account number';
        }
        if (!data.routingNumber || data.routingNumber.length !== 9) {
          errors.routingNumber = 'Please enter a valid routing number';
        }
        if (!data.accountHolderName) {
          errors.accountHolderName = 'Please enter account holder name';
        }
        break;
        
      case 'digital_wallet':
        if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
        
      case 'cash_on_delivery':
        // No validation needed for cash on delivery
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Process payment
  const processPayment = async () => {
    if (paymentMethod === 'cash_on_delivery') {
      // Cash on delivery doesn't require payment processing
      onPaymentSuccess('cash_on_delivery', `cod_${Date.now()}`);
      return;
    }

    if (!validatePaymentData(paymentData)) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      if (Math.random() > 0.1) { // 90% success rate
        const paymentId = `pay_${Date.now()}`;
        const transactionId = `txn_${Date.now()}`;
        onPaymentSuccess(paymentId, transactionId);
      } else {
        throw new Error('Payment processing failed');
      }
    } catch (error) {
      onPaymentError({
        code: 'PAYMENT_FAILED',
        message: 'Payment processing failed. Please try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle payment data change
  const handlePaymentDataChange = (data: any) => {
    setPaymentData(data);
    setValidationErrors({});
  };

  // Render payment form based on method
  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'credit_card':
      case 'debit_card':
        return (
          <CreditCardForm
            onDataChange={handlePaymentDataChange}
            errors={validationErrors}
          />
        );
        
      case 'bank_transfer':
        return (
          <BankTransferForm
            onDataChange={handlePaymentDataChange}
            errors={validationErrors}
          />
        );
        
      case 'digital_wallet':
        return (
          <DigitalWalletForm
            onDataChange={handlePaymentDataChange}
            errors={validationErrors}
          />
        );
        
      case 'cash_on_delivery':
        return (
          <View className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <Text className="text-sm font-medium text-green-800 dark:text-green-200">
              Cash on Delivery
            </Text>
            <Text className="text-sm text-green-700 dark:text-green-300 mt-1">
              You will pay in cash when your order is delivered
            </Text>
          </View>
        );
        
      default:
        return null;
    }
  };

  return (
    <View className="space-y-4">
      {/* Payment Amount */}
      <View className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Payment Amount
          </Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {currency} {amount.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Payment Form */}
      {renderPaymentForm()}

      {/* Process Payment Button */}
      <Button
        label={isProcessing ? "Processing Payment..." : "Process Payment"}
        onPress={processPayment}
        disabled={disabled || isLoading || isProcessing}
        className="w-full"
      />
    </View>
  );
};

export default PaymentIntegration;
