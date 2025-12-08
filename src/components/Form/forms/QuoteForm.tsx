// src/components/Form/forms/QuoteForm.tsx
/**
 * Quote Form - React Version
 * Uses FormWrapper with HTML5 validation
 * Submits to Formspree with source page tracking
 */

import FormWrapper from "@/components/Form/FormWrapper";
import Input from "@/components/Form/inputs/Input";
import Checkbox from "@/components/Form/inputs/Checkbox";
import Button from "@/components/Button/Button";

const FORMSPREE_QUOTE_ID = "meoylorn";

interface QuoteFormProps {
  sourcePage?: string;
}

export default function QuoteForm({ sourcePage }: QuoteFormProps) {
  const handleSubmit = async (values: any) => {
    // Add source page to submission
    const submissionData = {
      ...values,
      _source: sourcePage || window.location.pathname,
    };

    const response = await fetch(`https://formspree.io/f/${FORMSPREE_QUOTE_ID}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      throw new Error("Failed to submit form");
    }
  };

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      successMessage="Thank you for your quote request! We'll get back to you soon."
      errorMessage="There was an error submitting your form. Please try again."
      resetOnSuccess={true}
      className="w-full gap-0"
    >
      {/* Name Fields Row */}
      <div className="flex flex-col lg:flex-row justify-between gap-2 mb-4">
        <Input
          name="firstName"
          label="First Name"
          type="text"
          required
          minLength={2}
          placeholder="First Name"
          containerClassName="mb-0 flex-1"
          inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-MainDark"
        />

        <Input
          name="lastName"
          label="Last Name"
          type="text"
          required
          minLength={2}
          placeholder="Last Name"
          containerClassName="mb-0 flex-1"
          inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-MainDark"
        />
      </div>

      {/* Email Field */}
      <Input
        name="email"
        label="Email"
        type="email"
        required
        placeholder="me@website.com"
        containerClassName="mb-4"
        inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-MainDark"
      />

      {/* Phone Field */}
      <Input
        name="phone"
        label="Phone Number"
        type="tel"
        required
        pattern="[0-9]{10,}"
        title="Please enter at least 10 digits"
        placeholder="012-345-6789"
        containerClassName="mb-4"
        inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-MainDark"
      />

      {/* Company Field (Optional) */}
      <Input
        name="company"
        label="Company Name"
        type="text"
        placeholder="LLC or whatever you trade as"
        containerClassName="mb-4"
        inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-MainDark"
      />

      {/* Privacy Policy Checkbox */}
      <Checkbox
        name="privacy"
        label={
          <>
            I have read and agree to the{" "}
            <a
              href="/privacy-policy"
              className="text-pink-500 hover:text-pink-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </>
        }
        required
        containerClassName="mb-6"
        checkboxClassName="w-4 h-4 text-MainDark border-gray-300 rounded focus:ring-2 focus:ring-MainDark"
      />

      {/* Submit Button */}
      <Button variant="primary" type="submit" className="w-full mx-auto">
        Get Your Quote
      </Button>
    </FormWrapper>
  );
}