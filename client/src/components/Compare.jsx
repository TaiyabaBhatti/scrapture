import { useState } from "react";

// Before / after slider. Drag anywhere on the picture.
export default function Compare({ before, after, labelBefore, labelAfter }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="compare">
      <img src={before} alt={labelBefore} className="h-96 w-96" />
      <img
        className=" h-96 w-96"
        src={after}
        alt={labelAfter}
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      />
    </div>
  );
}
