/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import AdmissionForm from "@/components/AdmissionForm";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <AdmissionForm />
      <Toaster position="top-center" />
    </div>
  );
}
