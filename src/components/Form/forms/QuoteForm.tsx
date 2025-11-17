// src/components/Form/forms/QuoteForm.tsx
/**
 * Quote Form - Reduced Spacing
 * 
 * Quote form with tighter spacing between fields.
 * Changed containerClassName from mb-4 to mb-0 for all inputs.
 */

import { z } from "zod";
import Form from "@/components/Form/Form";
import Input from "@/components/Form/inputs/Input";
import Checkbox from "@/components/Form/inputs/Checkbox";
import FormMessages from "@/components/Form/FormMessages";

const contactSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  company: z.string().optional(),
  privacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Privacy Policy",
  }),
});

export default function ContactForm() {
  const handleSubmit = async (values: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Form submitted:", values);
  };

  return (
    <Form
      onSubmit={handleSubmit}
      validationSchema={contactSchema}
      successMessage="Thank you for contacting us! We'll get back to you soon."
      resetOnSuccess={true}
      className="w-full gap-0"
    >
      <FormMessages />

      {/* Name Fields Row */}
      <div className="flex flex-col lg:flex-row justify-between gap-2 mb-0">
        <Input
          name="firstName"
          label="First Name"
          type="text"
          required
          placeholder="First Name"
          containerClassName="mb-0 flex-1"
          inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none"
        />

        <Input
          name="lastName"
          label="Last Name"
          type="text"
          required
          placeholder="Last Name"
          containerClassName="mb-0 flex-1"
          inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none"
        />
      </div>

      {/* Email Field */}
      <Input
        name="email"
        label="Email"
        type="email"
        required
        placeholder="me@website.com"
        containerClassName="mb-0"
        inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none"
      />

      {/* Phone Field */}
      <Input
        name="phone"
        label="Phone Number"
        type="tel"
        required
        placeholder="012-345-6789"
        containerClassName="mb-0"
        inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none"
      />

      {/* Company Field (Optional) */}
      <Input
        name="company"
        label="Company Name"
        type="text"
        placeholder="LLC or whatever you trade as"
        containerClassName="mb-0"
        inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none"
      />

      {/* Privacy Policy Checkbox */}
      <Checkbox
        name="privacy"
        label={
          <>
            I have read and agree to the{" "}
            <a
              href="/privacy-policy"
              className="text-pink-500 hover:text-pink-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
          </>
        }
        required
        containerClassName="mb-4"
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-MainDark text-MainLight py-4 px-6 rounded-md font-medium hover:bg-gray-800 transition duration-200"
      >
        Submit Form
      </button>
    </Form>
  );
}