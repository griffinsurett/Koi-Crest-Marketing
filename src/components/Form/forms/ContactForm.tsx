// src/components/Form/forms/ContactForm.tsx
/**
 * Contact Form - React Version
 * Uses FormWrapper with HTML5 validation
 */

import FormWrapper from "@/components/Form/FormWrapper";
import Input from "@/components/Form/inputs/Input";
import Checkbox from "@/components/Form/inputs/Checkbox";
import Textarea from "@/components/Form/inputs/Textarea";
import Button from "@/components/Button/Button";

export default function ContactForm() {
  const handleSubmit = async (values: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted:", values);
    
    // Here you would make your actual API call
    // const response = await fetch('/api/contact', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(values)
    // });
  };

  return (
    <FormWrapper
      onSubmit={handleSubmit}
      successMessage="Thank you for contacting us! We'll get back to you soon."
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

      {/* Message Field */}
      <Textarea
        name="message"
        label="Your Message"
        required
        minLength={10}
        placeholder="Write your message here..."
        rows={5}
        containerClassName="mb-4"
        textareaClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-MainDark resize-vertical"
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
      />

      {/* Submit Button */}
      <Button variant="primary" type="submit" className="w-full mx-auto">
        Submit Form
      </Button>
    </FormWrapper>
  );
}