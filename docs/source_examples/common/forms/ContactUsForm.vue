<script setup lang="ts">
import GlowButton from "../GlowButton.vue";
import InputText from "../InputText.vue";
import Checkbox from "../Checkbox.vue";
import Radio from "../Radio.vue";
import TextField from "../TextField.vue";
import { onMounted, ref, watch } from "vue";
import SuccessIcon from "../../../assets/icons/success-icon.vue";
import CloseIcon from "../../../assets/icons/close-icon.vue";
import gsap from "gsap";
import { getCollection, getEntry } from 'astro:content';
import { hubspotSubmitForm, getHubspotutk, type HubspotFormData } from "../../../lib/hubspot/hubspot.ts";
import { isCorrectEmailFormat, isCorrectLinkedInFormat } from "../../../helpers/form-validator.ts";

const props = defineProps<{
  contactUsForm: HubspotFormData
}>()

const hubspotFields = props.contactUsForm.fieldGroups.flatMap(group => group.fields)

const getHubspotField = (name: string): HubspotFormDataField => {
  const field = hubspotFields.find(field => field.name === name)

  if (!field) {
    throw new Error(`HubSpot field "${name}" not found`)
  }

  return field
}

const createFormField = (field: HubspotFormDataField, value: T): FormField<T> => ({
  value,
  error: '',
  label: field.label,
  placeholder: field.placeholder,
  required: field.required
})

const formData = ref({
  email: createFormField(getHubspotField('email'), ''),
  firstname: createFormField(getHubspotField('firstname'), ''),
  lastname: createFormField(getHubspotField('lastname'), ''),
  companyName: createFormField(getHubspotField('name'), ''),
  linkedinCompanyPage: createFormField(getHubspotField('linkedin_company_page'), ''),
  services: createFormField(getHubspotField('buying_intent'), ''),
  description: {
    ...createFormField(getHubspotField('description'), ''),
    maxLength: 1000
  },
  privacyPolicy: {
    value: false,
    error: '',
    label: 'I agree with the privacy policy',
    required: true
  }
})

interface FormField<T = string> {
  value: T
  error: string
  label: string
  placeholder?: string
  required: boolean
  maxLength?: number;
}

const services = getHubspotField('buying_intent')
  .options?.sort(o => o.displayOrder)
  .map(o => {
    return {
      id: o.value,
      label: o.label.replaceAll("&amp;", "&").replaceAll("&quot;", "\"")
    }
  });

const validateForm = () => {
  resetErrorMessages();
  let isValid = validateRequiredFields();
  
  let description = formData.value.description;
  let email = formData.value.email;
  let linkedInPage = formData.value.linkedinCompanyPage;

  if (email.value !== '' && !isCorrectEmailFormat(email.value)) {
    email.error = 'Please enter valid email'
    isValid = false
  }
  if (linkedInPage.value !== '' && !isCorrectLinkedInFormat(linkedInPage.value)) {
    linkedInPage.error = 'Please enter valid LinkedIn page link'
    isValid = false
  }
  if (description.value.length > description.maxLength) {
    description.error = `You faced characters limits. Max length is ${description.maxLength}`
    isValid = false
  }

  return isValid
}

const resetErrorMessages = () => Object.values(formData.value).forEach(field => field.error = '');

const validateRequiredFields = () => {
  let isValid = true

  Object.values(formData.value).forEach(field => {
    const isEmpty = field.value === '' || field.value === false

    if (field.required && isEmpty) {
      field.error = 'This field is required'
      isValid = false
    } else {
      field.error = ''
    }
  })

  return isValid
}

const resetForm = () => {
  formData.value.email.value = '';
  formData.value.firstname.value = '';
  formData.value.lastname.value = '';
  formData.value.companyName.value = '';
  formData.value.linkedinCompanyPage.value = '';
  formData.value.description.value = '';
  formData.value.services.value = '';
  formData.value.privacyPolicy.value = false;
}

const formFieldMapping = {
  email: 'email',
  firstname: 'firstname',
  lastname: 'lastname',
  companyName: 'name',
  linkedinCompanyPage: 'linkedin_company_page',
  services: 'buying_intent',
  description: 'description'
} as const

const submitContactsForm = async () => {
  if (!validateForm()) {
    return
  }

  const hutk = getHubspotutk()

  const formFields = Object.entries(formData.value)
    .filter(([formKey]) => formKey in formFieldMapping)
    .map(([formKey, field]) => ({
      name: formFieldMapping[
        formKey as keyof typeof formFieldMapping
      ],
      value: field.value
    }))

  const body = {
    fields: hubspotFields.map(field => ({
      objectTypeId: field.objectTypeId,
      name: field.name,
      value: formFields.find(
        formField => formField.name === field.name
      )?.value
    })),
    context: {
      hutk: hutk,
    }
  }

  try {
    const response = await hubspotSubmitForm.post(`/${import.meta.env.PUBLIC_HUBSPOT_CONTACTUS_FORM_ID}`, body)

    if (response.status === 200) {
      resetForm()
      showAlert()
    }
  } catch (error: any) {
    console.log('request err>>', error)
  }
}

const isAlertVisible = ref(false)

const showAlert = () => {
  if (isAlertVisible.value) return

  isAlertVisible.value = true
  setTimeout(() => {
    isAlertVisible.value = false
  }, 10000)
}

watch(isAlertVisible, () => {
  gsap.timeline()
    .from('.form-alert', {
      x: 120,
      duration: 0.5,
    })
})

</script>

<template>
  <form ref="" class="flex flex-col gap-14 relative" novalidate>
    <div class="space-y-5">
      <fieldset class="space-y-2">
        <InputText id="email" v-model="formData.email.value" :isRequired=formData.email.required :label=formData.email.label type="email" :isError="!!formData.email.error" :errorMessage="formData.email.error" :placeholder="formData.email.placeholder ?? ''" autocomplete="email" />
        <div class="flex flex-col xl:flex-row gap-2">
          <InputText id="firstname" v-model="formData.firstname.value" :isRequired=formData.firstname.required :label=formData.firstname.label type="text" :isError="!!formData.firstname.error" :errorMessage="formData.firstname.error" :placeholder="formData.firstname.placeholder ?? ''" autocomplete="given-name" />
          <InputText id="lastname" v-model="formData.lastname.value" :isRequired=formData.lastname.required :label=formData.lastname.label type="text" :isError="!!formData.lastname.error" :errorMessage="formData.lastname.error" :placeholder="formData.lastname.placeholder ?? ''" autocomplete="family-name" />
        </div>
        <div class="flex flex-col xl:flex-row gap-2">
          <InputText id="companyName" v-model="formData.companyName.value" :isRequired=formData.companyName.required :label=formData.companyName.label type="text" :isError="!!formData.companyName.error" :errorMessage="formData.companyName.error" :placeholder="formData.companyName.placeholder ?? ''" />
          <InputText id="linkedinCompanyPage" v-model="formData.linkedinCompanyPage.value" :isRequired=formData.linkedinCompanyPage.required :label=formData.linkedinCompanyPage.label type="text" :isError="!!formData.linkedinCompanyPage.error" :errorMessage="formData.linkedinCompanyPage.error" :placeholder="formData.linkedinCompanyPage.placeholder ?? ''" />
        </div>
      </fieldset>
      <fieldset class="space-y-3">
        <legend class="pl-3 text-sm text-heading font-bold">{{ formData.services.label }}</legend>
        <div class="flex flex-wrap gap-2">
          <Radio v-for="item in services" :key="item.id" :id="item.id" :label="item.label" v-model="formData.services.value" name="services" />
        </div>
      </fieldset>
      <fieldset class="space-y-3">
        <TextField id="project" v-model="formData.description.value" :isRequired=formData.description.required :label=formData.description.label :isError="!!formData.description.error" :errorMessage="formData.description.error" :placeholder="formData.description.placeholder ?? ''" />
      </fieldset>
      <div class="space-y-2">
        <Checkbox id="privacy" v-model="formData.privacyPolicy.value" :label="formData.privacyPolicy.label" :isRequired="formData.privacyPolicy.required" :isError="!!formData.privacyPolicy.error" />
        <Checkbox id="promotions" label="I agree to receive promotional materials" />
      </div>
    </div>
    <GlowButton @click="submitContactsForm" title="Leave consultation request" class="self-center lg:self-start" />
    <div v-show="isAlertVisible" class="border border-action group absolute bottom-19.25 md:fixed z-50 left-1/2 -translate-x-1/2 md:top-24 form-alert flex gap-2 md:gap-8 items-center justify-between w-full h-fit max-w-139 bg-surface-secondary p-4 md:px-6 md:py-2.5 rounded-3xl">
      <div class="w-8 h-8">
        <component :is="SuccessIcon" class="w-8 h-8" />
      </div>
      <p class="text-sm md:text-lg font-bold text-heading md:max-w-sm">
        Sent! We will contact you within next 1-3 business days.
      </p>
      <button @click="isAlertVisible = false" class="group-hover:text-action text-heading transition-colors cursor-pointer">
        <component :is="CloseIcon" />
      </button>
    </div>
  </form>
</template>

<style scoped>
.form-alert {
  box-shadow: 0 -34px 40px 0 #2814701A,
    0 -10px 24px 0 #2814701A,
    0 -6px 6px 0 #28147014;
}
</style>
