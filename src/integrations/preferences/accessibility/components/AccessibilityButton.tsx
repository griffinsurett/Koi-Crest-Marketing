// src/components/accessibility/AccessibilityButton.tsx
import { useState, lazy, Suspense, memo } from "react";
import Button from "@/components/Button/Button";

const AccessibilityModal = lazy(() => import("./AccessibilityModal"));

function AccessibilityButton() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="nounderlink"
        size="sm"
        onClick={() => setShowModal(true)}
        aria-label="Manage reading preferences"
        aria-expanded={showModal}
        rightIcon="lucide:book-open"
      >
        Reading Preferences
      </Button>

      {showModal && (
        <Suspense fallback={null}>
          <AccessibilityModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </Suspense>
      )}
    </>
  );
}

export default memo(AccessibilityButton);
