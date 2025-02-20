
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TestError() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error("Test error to verify error boundary");
  }

  return (
    <div className="p-4">
      <Button onClick={() => setShouldError(true)}>
        Test Error Boundary
      </Button>
    </div>
  );
}
