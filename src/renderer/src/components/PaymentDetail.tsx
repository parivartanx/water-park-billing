import React, { useState, useEffect } from 'react'
import { FaUser, FaGlobe } from 'react-icons/fa'

interface PaymentDetailProps {
  subtotal: number | null
  discount: number | null
  discountType: 'flat' | 'percentage'
  total: number | null
  isSubmitting: boolean
  onDiscountTypeChange: (type: 'flat' | 'percentage') => void
  onDiscountChange: (amount: number | null) => void
  onPaymentChange: (mode: string, amount: number | null) => void
}

const PaymentDetail: React.FC<PaymentDetailProps> = ({
  subtotal,
  discount,
  discountType,
  total,
  isSubmitting,
  onDiscountTypeChange,
  onDiscountChange,
  onPaymentChange
}) => {
  const [selectedPaymentModes, setSelectedPaymentModes] = useState<string[]>(['cash'])
  const [cashAmount, setCashAmount] = useState<number | null>(0)
  const [onlineAmount, setOnlineAmount] = useState<number | null>(0)
  const [totalPaymentAmount, setTotalPaymentAmount] = useState<number>(0)
  const [isPaymentValid, setIsPaymentValid] = useState<boolean>(false)
  const [discountAmount, setDiscountAmount] = useState<number>(0)

  // Calculate discount amount
  useEffect(() => {
    const safeSubtotal = subtotal || 0;
    const safeDiscount = discount || 0;
    const calculatedDiscount = discountType === 'percentage' 
      ? (safeDiscount / 100) * safeSubtotal 
      : safeDiscount;
    setDiscountAmount(calculatedDiscount);
  }, [subtotal, discount, discountType]);

  // Update total payment amount and validate
  useEffect(() => {
    const safeCashAmount = cashAmount || 0;
    const safeOnlineAmount = onlineAmount || 0;
    const safeTotal = total || 0;
    
    const newTotalPayment = safeCashAmount + safeOnlineAmount;
    setTotalPaymentAmount(newTotalPayment);
    setIsPaymentValid(Math.abs(newTotalPayment - safeTotal) < 0.01);
  }, [cashAmount, onlineAmount, total]);

  // Initialize cash amount to total when component mounts or total changes
  useEffect(() => {
    if (total !== null && totalPaymentAmount === 0) {
      setCashAmount(total);
      setOnlineAmount(0);
      // Ensure cash is selected as the default payment mode
      if (!selectedPaymentModes.includes('cash')) {
        setSelectedPaymentModes(prev => [...prev, 'cash']);
      }
      // Notify parent component about the payment change
      onPaymentChange('cash', total);
      onPaymentChange('online', 0);
    }
  }, [total, totalPaymentAmount, selectedPaymentModes, onPaymentChange]);

  // Toggle payment mode selection
  const togglePaymentMode = (mode: string) => {
    setSelectedPaymentModes(prev => {
      if (prev.includes(mode)) {
        // Don't remove the mode if it's the only one selected
        if (prev.length === 1) {
          return prev;
        }
        
        // Remove mode if it's already selected and not the only one
        const newModes = prev.filter(m => m !== mode);
        
        // Reset the amount for the removed mode
        if (mode === 'cash') {
          setCashAmount(0);
          onPaymentChange('cash', 0);
        }
        if (mode === 'online') {
          setOnlineAmount(0);
          onPaymentChange('online', 0);
        }
        
        return newModes;
      } else {
        // Add the mode without affecting existing modes
        return [...prev, mode];
      }
    });
  };

  // Set full amount to a specific payment mode
  const setFullAmount = (mode: string) => {
    const safeTotal = total || 0;
    
    if (mode === 'cash') {
      setCashAmount(safeTotal);
      setOnlineAmount(0);
      onPaymentChange('cash', safeTotal);
      onPaymentChange('online', 0);
      
      // Make sure cash is in the selected modes
      if (!selectedPaymentModes.includes('cash')) {
        setSelectedPaymentModes(prev => [...prev, 'cash']);
      }
    } else if (mode === 'online') {
      setOnlineAmount(safeTotal);
      setCashAmount(0);
      onPaymentChange('cash', 0);
      onPaymentChange('online', safeTotal);
      
      // Make sure online is in the selected modes
      if (!selectedPaymentModes.includes('online')) {
        setSelectedPaymentModes(prev => [...prev, 'online']);
      }
    }
  };

  // Distribute total amount evenly between selected payment modes
  const distributeEvenly = () => {
    const safeTotal = total || 0;
    const modes = selectedPaymentModes;
    
    if (modes.length === 0) return;
    
    const amountPerMode = Math.floor((safeTotal / modes.length) * 100) / 100;
    let remainder = Math.round((safeTotal - (amountPerMode * modes.length)) * 100) / 100;
    
    // Distribute evenly
    if (modes.includes('cash')) {
      const newCashAmount = amountPerMode;
      setCashAmount(newCashAmount);
      onPaymentChange('cash', newCashAmount);
    } else {
      setCashAmount(0);
      onPaymentChange('cash', 0);
    }
    
    if (modes.includes('online')) {
      const newOnlineAmount = amountPerMode;
      setOnlineAmount(newOnlineAmount);
      // For backward compatibility, we'll use 'card' as the primary online payment method
      onPaymentChange('card', newOnlineAmount);
      onPaymentChange('upi', 0);
    } else {
      setOnlineAmount(0);
      onPaymentChange('card', 0);
      onPaymentChange('upi', 0);
    }
    
    // Add remainder to the first selected mode
    if (remainder > 0) {
      if (modes.includes('cash')) {
        const adjustedCashAmount = (cashAmount || 0) + remainder;
        setCashAmount(adjustedCashAmount);
        onPaymentChange('cash', adjustedCashAmount);
      } else if (modes.includes('online')) {
        const adjustedOnlineAmount = (onlineAmount || 0) + remainder;
        setOnlineAmount(adjustedOnlineAmount);
        onPaymentChange('card', adjustedOnlineAmount);
      }
    }
  };

  // Auto-balance payment amounts to match the total
  const autoBalance = () => {
    const safeTotal = total || 0;
    const safeCashAmount = cashAmount || 0;
    const safeOnlineAmount = onlineAmount || 0;
    const currentTotal = safeCashAmount + safeOnlineAmount;
    
    if (currentTotal < safeTotal) {
      // Find which payment method to add the remaining to
      const modes = selectedPaymentModes;
      if (modes.length === 0) return;
      
      const remaining = safeTotal - currentTotal;
      
      if (modes.includes('cash')) {
        const newCashAmount = safeCashAmount + remaining;
        setCashAmount(newCashAmount);
        onPaymentChange('cash', newCashAmount);
      } else if (modes.includes('online')) {
        const newOnlineAmount = safeOnlineAmount + remaining;
        setOnlineAmount(newOnlineAmount);
        onPaymentChange('card', newOnlineAmount);
      }
    } else if (currentTotal > safeTotal) {
      // Proportionally reduce payment methods
      const ratio = safeTotal / currentTotal;
      
      if (selectedPaymentModes.includes('cash') && selectedPaymentModes.includes('online')) {
        // If both payment methods are selected, distribute proportionally
        const newCashAmount = Math.floor(safeCashAmount * ratio * 100) / 100;
        const tempOnlineAmount = Math.floor(safeTotal - newCashAmount);
        
        setCashAmount(newCashAmount);
        setOnlineAmount(tempOnlineAmount);
        onPaymentChange('cash', newCashAmount);
        onPaymentChange('card', tempOnlineAmount);
      } else if (selectedPaymentModes.includes('cash')) {
        // If only cash is selected
        setCashAmount(safeTotal);
        onPaymentChange('cash', safeTotal);
      } else if (selectedPaymentModes.includes('online')) {
        // If only online is selected
        setOnlineAmount(safeTotal);
        onPaymentChange('card', safeTotal);
      }
    }
  };

  // Distribute remaining amount to a specific payment mode
  const distributeRemainingAmount = (mode: string) => {
    const safeTotal = total || 0;
    const safeCashAmount = cashAmount || 0;
    const safeOnlineAmount = onlineAmount || 0;
    const currentTotal = safeCashAmount + safeOnlineAmount;
    const remaining = safeTotal - currentTotal;
    
    if (remaining <= 0) return;
    
    if (mode === 'cash') {
      const newCashAmount = safeCashAmount + remaining;
      setCashAmount(newCashAmount);
      onPaymentChange('cash', newCashAmount);
    } else if (mode === 'online') {
      const newOnlineAmount = safeOnlineAmount + remaining;
      setOnlineAmount(newOnlineAmount);
      onPaymentChange('card', newOnlineAmount);
      onPaymentChange('upi', 0);
    }
  };

  // Handle input changes
  const handleCashAmountChange = (value: number | null) => {
    setCashAmount(value);
    onPaymentChange('cash', value);
  };
  
  const handleOnlineAmountChange = (value: number | null) => {
    setOnlineAmount(value);
    // For backward compatibility, we'll use 'card' as the primary online payment method
    onPaymentChange('card', value);
    onPaymentChange('upi', 0);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-[#DC004E]">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Billing Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Payment Mode Selection */}
        <div>
          {/* Discount Section */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-3">Discount</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">Type</label>
                <select
                  value={discountType}
                  onChange={(e) => onDiscountTypeChange(e.target.value as 'flat' | 'percentage')}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#DC004E] focus:border-[#DC004E] text-sm"
                  disabled={isSubmitting}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div className="flex-1 relative">
                <label className="block text-sm text-gray-600 mb-1">Amount</label>
                <input
                  type="number"
                  value={discount === null ? '' : discount}
                  onChange={(e) => onDiscountChange(e.target.value === '' ? null : Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-[#DC004E] focus:border-[#DC004E] pl-6 text-sm"
                  min="0"
                  disabled={isSubmitting}
                />
                <span className="absolute left-3 bottom-2.5 text-gray-500 text-sm">
                  {discountType === 'percentage' ? '%' : '₹'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Payment Mode Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Payment Mode(s)</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => togglePaymentMode('cash')}
                className={`flex items-center px-3 py-2 rounded-lg border ${
                  selectedPaymentModes.includes('cash') 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <FaUser className={`h-4 w-4 mr-2 ${selectedPaymentModes.includes('cash') ? 'text-blue-600' : 'text-gray-400'}`} />
                Cash
              </button>
              
              <button
                type="button"
                onClick={() => togglePaymentMode('online')}
                className={`flex items-center px-3 py-2 rounded-lg border ${
                  selectedPaymentModes.includes('online') 
                    ? 'bg-green-50 border-green-300 text-green-700' 
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <FaGlobe className={`h-4 w-4 mr-2 ${selectedPaymentModes.includes('online') ? 'text-green-600' : 'text-gray-400'}`} />
                Online
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Actions</label>
            <div className="grid grid-cols-2 gap-2">
              {selectedPaymentModes.includes('cash') && (
                <button
                  type="button"
                  onClick={() => setFullAmount('cash')}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-sm"
                  disabled={isSubmitting}
                >
                  <span>Full in Cash</span>
                  <FaUser className="h-4 w-4 text-blue-600" />
                </button>
              )}
              
              {selectedPaymentModes.includes('online') && (
                <button
                  type="button"
                  onClick={() => setFullAmount('online')}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors text-sm"
                  disabled={isSubmitting}
                >
                  <span>Full Online</span>
                  <FaGlobe className="h-4 w-4 text-green-600" />
                </button>
              )}
              
              {selectedPaymentModes.length > 1 && (
                <button
                  type="button"
                  onClick={distributeEvenly}
                  className="flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-200 transition-colors text-sm"
                  disabled={isSubmitting}
                >
                  <span>Split Evenly</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Payment Amounts */}
        <div>
          {/* Payment Amounts */}
          <div className="space-y-3">
            {selectedPaymentModes.includes('cash') && (
              <div className="flex items-center">
                <div className="bg-blue-50 p-2 rounded-l-lg">
                  <FaUser className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-grow relative">
                  <input
                    type="number"
                    value={cashAmount === null ? '' : cashAmount}
                    onChange={(e) => handleCashAmountChange(e.target.value === '' ? null : Number(e.target.value))}
                    className="w-full px-4 py-3 border-y border-r rounded-r-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] pl-10"
                    min="0"
                    step="1"
                    disabled={isSubmitting}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                </div>
                <span className="ml-3 text-gray-700 font-medium w-16">Cash</span>
              </div>
            )}
            
            {selectedPaymentModes.includes('online') && (
              <div className="flex items-center">
                <div className="bg-green-50 p-2 rounded-l-lg">
                  <FaGlobe className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-grow relative">
                  <input
                    type="number"
                    value={onlineAmount === null ? '' : onlineAmount}
                    onChange={(e) => handleOnlineAmountChange(e.target.value === '' ? null : Number(e.target.value))}
                    className="w-full px-4 py-3 border-y border-r rounded-r-lg focus:ring-2 focus:ring-[#DC004E] focus:border-[#DC004E] pl-10"
                    min="0"
                    step="1"
                    disabled={isSubmitting}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                </div>
                <span className="ml-3 text-gray-700 font-medium w-16">Online</span>
              </div>
            )}
          </div>
          
          {/* Payment Summary */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{(subtotal || 0).toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-[#DC004E]">
                -₹{(discountAmount).toFixed(2)}
              </span>
            </div>
            
            <div className="h-px bg-gray-200 my-2"></div>
            
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>₹{(total || 0).toFixed(2)}</span>
            </div>
            
            <div className="h-px bg-gray-200 my-2"></div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Payment</span>
              <span className={`font-medium ${isPaymentValid ? 'text-green-600' : 'text-red-600'}`}>
                ₹{totalPaymentAmount.toFixed(2)}
                {!isPaymentValid && (
                  <button 
                    type="button" 
                    onClick={autoBalance}
                    className="ml-2 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
                    disabled={isSubmitting}
                  >
                    Auto-Balance
                  </button>
                )}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status</span>
              <span className={`font-medium ${isPaymentValid ? 'text-green-600' : 'text-red-600'}`}>
                {isPaymentValid ? 'Valid ✓' : 'Invalid ✗'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetail