<script setup lang="ts">
import { ref } from 'vue'
import InputText from '../InputText.vue'
import Button from '../Button.vue'
import { isCorrectEmailFormat } from "../../../helpers/form-validator.ts";

const email = ref('')

const hasError = ref(false)
const emailErrorMessage = ref('')

const submitForm = () => {
    hasError.value = false
    emailErrorMessage.value = ''

    if (!email.value.trim()) {
        hasError.value = true
        emailErrorMessage.value = 'This field is required'
        return
    }

    if (!isCorrectEmailFormat(email.value)) {
        hasError.value = true
        emailErrorMessage.value = 'Please enter valid email'
        return
    }
}
</script>

<template>
    <form
        novalidate
        class="flex flex-col gap-4 md:flex-row md:items-center"
        @submit.prevent="submitForm"
    >
        <div class="md:w-64 xl:w-80">
            <InputText
                id="file-email"
                v-model="email"
                is-required
                :isError="hasError"
                :errorMessage="emailErrorMessage"
                label="E-mail"
                type="email"
                placeholder="Where should we send it?"
                autocomplete="email"
            />
        </div>

        <Button
            title="Grab research"
            variant="tertiary"
            class="w-40 flex-shrink-0"
        />
    </form>
</template>