'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { sendEmail } from '@/actions/sendEmail';
import toast from 'react-hot-toast';
import SectionHeading from '@/components/General/section-heading';
import SubmitBtn from '@/components/General/submit-btn';

const Contact = () => {
  return (
    <motion.section
      id="contact"
      className="mx-auto pb-20 sm:pb-28 px-6 md:max-w-2xl text-center"
      initial={{
        opacity: 0,
      }}
      whileInView={{
        opacity: 1,
      }}
      transition={{
        duration: 1,
      }}
      viewport={{
        once: true,
      }}
    >
      <SectionHeading>Contact me</SectionHeading>

      <p className="text-gray-700">
        Please contact me directly at{' '}
        <a className="underline" href="mailto:yyoukhanaa@gmail.com">
          yyoukhanaa@gmail.com
        </a>{' '}
        or through this form.
      </p>

      <form
        className="mt-10 flex flex-col"
        action={async (formData) => {
          const { data, error } = await sendEmail(formData);

          if (error) {
            toast.error(error);
            return;
          }

          toast.success('Email sent successfully!');
          // clear the form
          const allInputs = document.querySelectorAll('input, textarea');
          allInputs.forEach((input) => {
            if (
              input instanceof HTMLInputElement ||
              input instanceof HTMLTextAreaElement
            ) {
              input.value = '';
            }
          });
        }}
      >
        <input
          className="h-14 px-4 rounded-lg borderBlack transition-all"
          name="senderEmail"
          type="email"
          required
          maxLength={500}
          placeholder="Your email"
        />
        <textarea
          className="h-52 my-3 rounded-lg borderBlack p-4 transition-all"
          name="message"
          placeholder="Your message"
          required
          maxLength={5000}
        />
        <SubmitBtn />
      </form>
    </motion.section>
  );
};

export default Contact;
