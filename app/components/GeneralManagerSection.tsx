"use client";

import React from "react";
import Image from "next/image";

const GeneralManagerSection = () => {
  return (
    <section className="py-20 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Manager Image - Left Side */}
        <div className="relative">
          <div className="bg-green-100 rounded-3xl p-4 flex justify-center items-center">
            <Image
              src="/generalmanager.jpg" // Make sure this image is in the public folder
              alt="General Manager"
              width={300} // adjust width as needed
              height={400} // adjust height as needed
              className="rounded-3xl object-cover"
            />
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-green-200 rounded-full opacity-20" />
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-green-300 rounded-full opacity-15" />
        </div>

        {/* Manager Message - Right Side */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-2 bg-green-50 rounded-full">
              <span className="text-green-600 text-sm font-medium">💼 Leadership Message</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              From Our
              <span className="block text-green-600">General Manager</span>
            </h2>
          </div>

          <div className="relative">
            <div className="absolute -left-4 -top-2 text-6xl text-green-100 opacity-20">"</div>
            <blockquote className="text-lg text-gray-700 leading-relaxed pl-8 italic">
              It is a great pleasure for me to welcome you to TGDC website. I am glad you are here and I encourage you to browse through and explore and get insight on who we are, what we do, how we do it and the value we create to our stakeholders – government, shareholders, communities, society, customers, suppliers, and the entire humanity and the planet earth at large. This website is an official TGDC platform of communication with our stakeholders.

Thank you for taking the time to visit our website. I am sure you will see why we love what we do and you will join us on our journey towards a better and more rewarding future.
            </blockquote>
            <div className="absolute -right-4 -bottom-2 text-6xl text-green-100 opacity-20">"</div>
          </div>

          <div className="pt-4">
            <div className="flex items-center space-x-4 mb-6">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">Eng. Mathew Mwangomban</h4>
                <p className="text-green-600 font-medium">General Manager </p>
                <p className="text-gray-600 text-sm">M.Eng Geothermal Systems</p>
              </div>
            </div>

            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300">
              Connect With Our Team
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeneralManagerSection;
