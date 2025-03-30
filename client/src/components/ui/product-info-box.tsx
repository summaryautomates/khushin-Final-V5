import { ReactNode } from "react";

interface ProductInfoBoxProps {
  children: ReactNode;
}

export default function ProductInfoBox({ children }: ProductInfoBoxProps) {
  return (
    <div className="bg-[#0A0A0A] rounded-lg p-4 border border-gray-800">
      {children}
    </div>
  );
}
