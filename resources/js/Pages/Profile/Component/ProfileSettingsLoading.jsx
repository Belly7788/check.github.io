import React from 'react';
import ShimmerLoading from '../../../Component/Loading/ShimmerLoading/ShimmerLoading'; // Adjust the import path as needed
import { getDarkModeClass } from "../../../utils/darkModeUtils";
import './style.css';

const ProfileSettingsLoading = ({ darkMode }) => {
  return (
    <div className={`w-full rounded-2xl overflow-hidden transition-all duration-300`}>
      {/* Cover Photo Section */}
      <div className="relative h-72 w-full">
        <ShimmerLoading
          darkMode={darkMode}
          width="100%"
          height="288px"
          borderRadius="16px"
        />

        {/* Profile Picture Section */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative w-36 h-36">
            <ShimmerLoading
              darkMode={darkMode}
              width="144px"
              height="144px"
              borderRadius="9999px"
            />
            {/* Camera Icon Placeholder */}
            <div className="absolute bottom-2 right-2">
              <ShimmerLoading
                darkMode={darkMode}
                width="40px"
                height="40px"
                borderRadius="9999px"
              />
            </div>
          </div>
          {/* Username Placeholder */}
          <div className="mt-2 w-32 h-5">
            <ShimmerLoading
              darkMode={darkMode}
              width="128px"
              height="20px"
              borderRadius="4px"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 pt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Profile Information Form Placeholder */}
          <div
            className={`p-8 rounded-2xl border-2 border-[#ff8800] ${getDarkModeClass(
              darkMode,
              "bg-[#1d1c1c] shadow-[0_0_15px_3px_rgba(255,136,0,0.4)]",
              "bg-white/90 shadow-[0_0_15px_3px_rgba(255,136,0,0.3)]"
            )} backdrop-blur-md transition-all duration-300`}
          >
            {/* Title Placeholder */}
            <div className="mb-6 w-48 h-6">
              <ShimmerLoading
                darkMode={darkMode}
                width="192px"
                height="24px"
                borderRadius="4px"
              />
            </div>
            {/* Form Inputs Placeholder */}
            <div className="space-y-6">
              {/* Username Input */}
              <div>
                <div className="mb-2 w-24 h-4">
                  <ShimmerLoading
                    darkMode={darkMode}
                    width="96px"
                    height="16px"
                    borderRadius="4px"
                  />
                </div>
                <ShimmerLoading
                  darkMode={darkMode}
                  width="100%"
                  height="48px"
                  borderRadius="12px"
                />
              </div>
              {/* Email Input */}
              <div>
                <div className="mb-2 w-24 h-4">
                  <ShimmerLoading
                    darkMode={darkMode}
                    width="96px"
                    height="16px"
                    borderRadius="4px"
                  />
                </div>
                <ShimmerLoading
                  darkMode={darkMode}
                  width="100%"
                  height="48px"
                  borderRadius="12px"
                />
              </div>
              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <div className="w-24 h-12">
                  <ShimmerLoading
                    darkMode={darkMode}
                    width="96px"
                    height="48px"
                    borderRadius="12px"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Password Form Placeholder */}
          <div
            className={`p-8 rounded-2xl border-2 border-[#ff8800] ${getDarkModeClass(
              darkMode,
              "bg-[#1d1c1c] shadow-[0_0_15px_3px_rgba(255,136,0,0.4)]",
              "bg-white/90 shadow-[0_0_15px_3px_rgba(255,136,0,0.3)]"
            )} backdrop-blur-md transition-all duration-300`}
          >
            {/* Title Placeholder */}
            <div className="mb-6 w-48 h-6">
              <ShimmerLoading
                darkMode={darkMode}
                width="192px"
                height="24px"
                borderRadius="4px"
              />
            </div>
            {/* Form Inputs Placeholder */}
            <div className="space-y-6">
              {/* Old Password Input */}
              <div>
                <div className="mb-2 w-24 h-4">
                  <ShimmerLoading
                    darkMode={darkMode}
                    width="96px"
                    height="16px"
                    borderRadius="4px"
                  />
                </div>
                <ShimmerLoading
                  darkMode={darkMode}
                  width="100%"
                  height="48px"
                  borderRadius="12px"
                />
              </div>
              {/* New Password Input */}
              <div>
                <div className="mb-2 w-24 h-4">
                  <ShimmerLoading
                    darkMode={darkMode}
                    width="96px"
                    height="16px"
                    borderRadius="4px"
                  />
                </div>
                <ShimmerLoading
                  darkMode={darkMode}
                  width="100%"
                  height="48px"
                  borderRadius="12px"
                />
              </div>
              {/* Confirm Password Input */}
              <div>
                <div className="mb-2 w-24 h-4">
                  <ShimmerLoading
                    darkMode={darkMode}
                    width="96px"
                    height="16px"
                    borderRadius="4px"
                  />
                </div>
                <ShimmerLoading
                  darkMode={darkMode}
                  width="100%"
                  height="48px"
                  borderRadius="12px"
                />
              </div>
              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <div className="w-24 h-12">
                  <ShimmerLoading
                    darkMode={darkMode}
                    width="96px"
                    height="48px"
                    borderRadius="12px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsLoading;
