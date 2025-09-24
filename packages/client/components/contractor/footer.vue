<template>
  <footer class="footer relative max-w-4xl mx-auto mt-20 aspect-video flex justify-center items-center border-1 border-gray-200 rounded-3xl">
    
    <form class="w-full max-w-md mx-auto p-6 space-y-4" @submit.prevent="handleSubmit">
      
      <!-- Name Field -->
      <div class="space-y-2">
        <Label for="name" :class="labelClasses">
          Name <span class="text-red-500">*</span>
        </Label>
        <Primitive
          id="name"
          v-model="formData.name"
          name="name"
          as="input"
          type="text"
          placeholder="Enter your name"
          :class="[fieldClasses,{ 'border-red-500': errors.name }]"
          @input="updateName" />
        <p v-if="errors.name" class="text-sm text-red-500">
          {{ errors.name }}
        </p>
      </div>

      <!-- Email Field -->
      <div class="space-y-2">
        <Label for="email" :class="labelClasses">
          Email Address <span class="text-red-500">*</span>
        </Label>
        <Primitive
          id="email"
          v-model="formData.email"
          name="email"
          as="input"
          type="text"
          placeholder="Enter your email"
          :class="[fieldClasses,{ 'border-red-500': errors.email }]"
          @input="updateEmail" />
        <p v-if="errors.email" class="text-sm text-red-500">
          {{ errors.email }}
        </p>
      </div>

      <!-- Phone Number Field -->
      <div class="space-y-2">
        <Label for="phone" :class="labelClasses">
          Phone Number <span class="text-red-500">*</span>
        </Label>
        <Primitive
          id="phone"
          v-model="formData.phone"
          name="phone"
          as="input"
          type="tel"
          placeholder="Enter your phone number"
          :class="[fieldClasses,{ 'border-red-500': errors.phone }]"
          @input="updatePhone" />
        <p v-if="errors.phone" class="text-sm text-red-500">
          {{ errors.phone }}
        </p>
      </div>

      <!-- Message Field -->
      <div class="space-y-2">
        <Label for="message" :class="labelClasses">
          Project idea <span class="text-red-500">*</span>
        </Label>
        <Primitive
          id="message"
          v-model="formData.message"
          name="message"
          as="textarea"
          placeholder="Enter your message"
          rows="4"
          :class="[fieldClasses,{ 'border-red-500': errors.message }]"
          @input="updateMessage" />
        <p v-if="errors.message" class="text-sm text-red-500">
          {{ errors.message }}
        </p>
      </div>

      <!-- Submit Button -->
      <div class="pt-4">
        <UiButton
          type="submit"
          :disabled="isSubmitting"
          class="w-full">
          {{ isSubmitting ? 'Sending...' : 'Send Message' }}
        </UiButton>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="submitMessage" class="mt-4">
        <p :class="submitSuccess ? 'text-green-600' : 'text-red-600'" class="text-sm text-center">
          {{ submitMessage }}
        </p>
      </div>
      
    </form>
    
  </footer>
</template>

<script setup lang="ts">
import { Primitive, Label } from 'reka-ui'

/**
 * Form data interface
 */
interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

/**
 * Form errors interface
 */
interface FormErrors {
  name?: string
  email?: string
  phone?: string
  message?: string
}

// Form data reactive state
const formData = ref<FormData>({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const labelClasses = 'block font-medium text-gray-700 mb-1'
const fieldClasses = 'block w-full px-3 py-2 border border-gray-200 rounded-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors'

// Form validation errors
const errors = ref<FormErrors>({})

// Form submission state
const isSubmitting = ref(false)
const submitMessage = ref('')
const submitSuccess = ref(false)

/**
 * Validates the form data
 * @returns True if form is valid, false otherwise
 */
const validateForm = (): boolean => {
  const newErrors: FormErrors = {}
  
  // Validate name
  if (!formData.value.name.trim()) {
    newErrors.name = 'Name is required'
  }
  
  // Validate email
  if (!formData.value.email.trim()) {
    newErrors.email = 'Email address is required'
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.value.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
  }
  
  // Validate phone
  if (!formData.value.phone.trim()) {
    newErrors.phone = 'Phone number is required'
  } else {
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/
    if (!phoneRegex.test(formData.value.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number'
    }
  }
  
  // Validate message
  if (!formData.value.message.trim()) {
    newErrors.message = 'Message is required'
  } else if (formData.value.message.trim().length < 10) {
    newErrors.message = 'Message must be at least 10 characters long'
  }
  
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

/**
 * Handles form submission via fetch API
 */
const handleSubmit = async (): Promise<void> => {
  // Clear previous messages
  submitMessage.value = ''
  submitSuccess.value = false
  
  // Validate form
  if (!validateForm()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const response = await fetch('https://formsubmit.co/ajax/5b20b66ba8a635e80cd3dcb9d7777523', {
      method: 'POST',
      body: JSON.stringify({
        ...formData.value,
        '_subject': `❗️ GC Work Request - ${formData.value.name}`,
        '_replyto': formData.value.email
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Success
    submitSuccess.value = true
    submitMessage.value = 'Thank you! Your message has been sent successfully.'
    
    // Reset form
    formData.value = {
      name: '',
      email: '',
      phone: '',
      message: ''
    }
    errors.value = {}
    
  } catch (error) {
    submitSuccess.value = false
    submitMessage.value = 'Sorry, there was an error sending your message: ' + (error instanceof Error ? error.message : 'Unknown error') + '. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Update name field and clear its error
 * @param event - Input event
 */
const updateName = (event: Event): void => {
  const target = event.target as HTMLInputElement
  formData.value.name = target.value
  if (errors.value.name) {
    errors.value = { ...errors.value, name: undefined }
  }
}

/**
 * Update email field and clear its error
 * @param event - Input event
 */
const updateEmail = (event: Event): void => {
  const target = event.target as HTMLInputElement
  formData.value.email = target.value
  if (errors.value.email) {
    errors.value = { ...errors.value, email: undefined }
  }
}

/**
 * Update phone field and clear its error
 * @param event - Input event
 */
const updatePhone = (event: Event): void => {
  const target = event.target as HTMLInputElement
  formData.value.phone = target.value
  if (errors.value.phone) {
    errors.value = { ...errors.value, phone: undefined }
  }
}

/**
 * Update message field and clear its error
 * @param event - Input event
 */
const updateMessage = (event: Event): void => {
  const target = event.target as HTMLTextAreaElement
  formData.value.message = target.value
  if (errors.value.message) {
    errors.value = { ...errors.value, message: undefined }
  }
}
</script>
