// src/components/Form/forms/KoiCrestContactForm.tsx
/**
 * Koi Crest Contact Form
 * 
 * Contact form using the built-in Form system with validation.
 * Fields: First name, last name, email, phone, company, privacy checkbox
 */

import { z } from "zod";
import Form from "@/components/Form/Form";
import Input from "@/components/Form/inputs/Input";
import Checkbox from "@/components/Form/inputs/Checkbox";
import FormMessages from "@/components/Form/FormMessages";

const koiCrestContactSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  company: z.string().optional(),
  privacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Privacy Policy",
  }),
});

export default function KoiCrestContactForm() {
  const handleSubmit = async (values: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log("Form submitted:", values);
    
    // TODO: Replace with actual form submission logic
    // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(values) })
  };

  return (
    <Form
      onSubmit={handleSubmit}
      validationSchema={koiCrestContactSchema}
      successMessage="Thank you for contacting us! We'll get back to you soon."
      resetOnSuccess={true}
      className="w-full gap-0"
    >
      <FormMessages />

      {/* Name Fields Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        <Input
          name="firstName"
          label="First Name"
          type="text"
          required
          placeholder="First Name"
          inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <Input
          name="lastName"
          label="Last Name"
          type="text"
          required
          placeholder="Last Name"
          inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Email Field */}
      <Input
        name="email"
        label="Email"
        type="email"
        required
        placeholder="me@website.com"
        inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Phone Field */}
      <Input
        name="phone"
        label="Phone Number"
        type="tel"
        required
        placeholder="012-345-6789"
        inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Company Field (Optional) */}
      <Input
        name="company"
        label="Company Name"
        type="text"
        placeholder="LLC or whatever you trade as"
        inputClassName="w-full px-4 py-3 bg-gray-100 border-0 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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