import { useEffect } from "react";

export function TestError() {
  useEffect(() => {
    throw new Error("Test error to verify error boundary");
  }, []);

  return <div>This should not be visible</div>;
}
