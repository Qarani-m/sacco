<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Complete Payment'
  },
  amount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'success', 'error'])

const phoneOption = ref('registered')
const customPhone = ref('')
const processing = ref(false)
const statusMessage = ref('')
const statusType = ref('') // 'success' or 'error'

const showCustomPhoneInput = computed(() => phoneOption.value === 'different')

const selectedPhone = computed(() => {
  return phoneOption.value === 'registered' ? props.userPhone : customPhone.value
})

const close = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  phoneOption.value = 'registered'
  customPhone.value = ''
  processing.value = false
  statusMessage.value = ''
  statusType.value = ''
}

const sendSTKPush = async () => {
  if (phoneOption.value === 'different' && !customPhone.value) {
    statusMessage.value = 'Please enter a phone number'
    statusType.value = 'error'
    return
  }

  if (phoneOption.value === 'different' && !/^254[0-9]{9}$/.test(customPhone.value)) {
    statusMessage.value = 'Invalid phone number format. Use 254XXXXXXXXX'
    statusType.value = 'error'
    return
  }

  processing.value = true
  statusMessage.value = 'Sending STK push...'
  statusType.value = ''

  try {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        amount: props.amount,
        phoneNumber: selectedPhone.value,
        category: props.category,
        userId: props.userId
      })
    })

    const data = await response.json()

    if (response.ok && data.success) {
      statusMessage.value = 'STK push sent! Please check your phone and enter your M-PESA PIN.'
      statusType.value = 'success'
      
      // Poll for payment status
      pollPaymentStatus(data.checkoutRequestId || data.transactionId)
    } else {
      statusMessage.value = data.message || 'Failed to initiate payment'
      statusType.value = 'error'
      processing.value = false
    }
  } catch (error) {
    console.error('Payment error:', error)
    statusMessage.value = 'An error occurred. Please try again.'
    statusType.value = 'error'
    processing.value = false
  }
}

const pollPaymentStatus = async (transactionId) => {
  let attempts = 0
  const maxAttempts = 20 // Poll for up to 60 seconds (20 * 3s)
  
  const poll = setInterval(async () => {
    attempts++
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/payments/status/${transactionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      
      if (data.status === 'completed' || data.status === 'success') {
        clearInterval(poll)
        statusMessage.value = 'Payment successful!'
        statusType.value = 'success'
        processing.value = false
        
        setTimeout(() => {
          emit('success', data)
          close()
        }, 2000)
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        clearInterval(poll)
        statusMessage.value = data.message || 'Payment failed or was cancelled'
        statusType.value = 'error'
        processing.value = false
      } else if (attempts >= maxAttempts) {
        clearInterval(poll)
        statusMessage.value = 'Payment status check timed out. Please check your transaction history.'
        statusType.value = 'error'
        processing.value = false
      }
    } catch (error) {
      console.error('Status check error:', error)
      if (attempts >= maxAttempts) {
        clearInterval(poll)
        statusMessage.value = 'Could not verify payment status'
        statusType.value = 'error'
        processing.value = false
      }
    }
  }, 3000) // Poll every 3 seconds
}
</script>

<template>
  <div v-if="show" class="modal" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button class="modal-close" @click="close">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="alert-inline">
          <p style="margin: 0; font-weight: 600;">Amount: <span>KSh {{ amount.toLocaleString() }}</span></p>
        </div>

        <p class="instruction-text">
          Choose a phone number to receive the M-PESA STK push prompt:
        </p>

        <!-- Registered Phone Option -->
        <div 
          :class="['phone-option', { selected: phoneOption === 'registered' }]"
          @click="phoneOption = 'registered'"
        >
          <input type="radio" name="phone_option" value="registered" v-model="phoneOption">
          <label class="phone-option-label">
            <div class="radio-custom"></div>
            <div style="flex: 1;">
              <p class="option-title">Use Registered Number</p>
              <p class="option-subtitle">{{ userPhone }}</p>
            </div>
          </label>
        </div>

        <!-- Different Phone Option -->
        <div 
          :class="['phone-option', { selected: phoneOption === 'different' }]"
          @click="phoneOption = 'different'"
        >
          <input type="radio" name="phone_option" value="different" v-model="phoneOption">
          <label class="phone-option-label">
            <div class="radio-custom"></div>
            <div style="flex: 1;">
              <p class="option-title">Use Different Number</p>
              <p class="option-subtitle">Enter a different M-PESA number</p>
            </div>
          </label>
          
          <!-- Custom Phone Input -->
          <div v-if="showCustomPhoneInput" class="custom-phone-input active">
            <div class="form-group">
              <label for="custom_phone">Phone Number</label>
              <input 
                type="tel" 
                id="custom_phone"
                v-model="customPhone"
                placeholder="254XXXXXXXXX"
                pattern="254[0-9]{9}"
                maxlength="12"
                class="phone-input"
              >
            </div>
            <p class="input-hint">
              Format: 254XXXXXXXXX (12 digits starting with 254)
            </p>
          </div>
        </div>

        <!-- Status Messages -->
        <div v-if="statusMessage" class="status-message" :class="statusType">
          {{ statusMessage }}
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" @click="close" :disabled="processing">Cancel</button>
        <button class="btn-primary" @click="sendSTKPush" :disabled="processing">
          {{ processing ? 'Processing...' : 'Send STK Push' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  display: flex;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 480px;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #F3F4F6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #000;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: #9CA3AF;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1;
}

.modal-close:hover {
  background: #F3F4F6;
  color: #000;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #F3F4F6;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: #FAFAFA;
}

.alert-inline {
  padding: 0.875rem 1rem;
  border-left: 3px solid #000;
  background: #F9FAFB;
  font-size: 0.875rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.instruction-text {
  margin-bottom: 1.5rem;
  color: #4B5563;
  font-size: 0.875rem;
}

.phone-option {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background: white;
}

.phone-option:hover {
  border-color: #D1D5DB;
  background: #FAFAFA;
}

.phone-option.selected {
  border-color: #000;
  background: #FAFAFA;
}

.phone-option input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.phone-option-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.radio-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #D1D5DB;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.phone-option.selected .radio-custom {
  border-color: #000;
}

.phone-option.selected .radio-custom::after {
  content: '';
  width: 8px;
  height: 8px;
  background: #000;
  border-radius: 50%;
}

.option-title {
  font-weight: 600;
  color: #000;
  margin-bottom: 0.25rem;
  margin: 0;
}

.option-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.custom-phone-input {
  display: none;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #F3F4F6;
}

.custom-phone-input.active {
  display: block;
}

.form-group {
  margin-bottom: 0.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #374151;
}

.phone-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.phone-input:focus {
  outline: none;
  border-color: #000;
}

.input-hint {
  font-size: 0.75rem;
  color: #9CA3AF;
  margin: 0;
}

.status-message {
  margin-top: 1.5rem;
  padding: 0.875rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.status-message.success {
  background: #F0FDF4;
  border-left: 3px solid #10B981;
  color: #065F46;
}

.status-message.error {
  background: #FEF2F2;
  border-left: 3px solid #EF4444;
  color: #991B1B;
}

.btn-primary, .btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-primary {
  background: #000;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1F2937;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.btn-secondary:hover:not(:disabled) {
  background: #F9FAFB;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
